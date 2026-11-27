"use client";

import NextImage from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type DragEvent,
  type FocusEvent,
  type JSX,
  type KeyboardEvent,
} from "react";
import Cropper, { type Area } from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Camera, ImagePlus, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { isAcceptedImageType } from "@/lib/storage/images";
import { cn } from "@/lib/utils";

export type CropShape = "cover" | "square" | "ticket" | "avatar";

export interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  shape?: CropShape;
  label?: string;
  hint?: string;
  maxMb?: number;
  className?: string;
  compact?: boolean;
}

export interface ImageGalleryUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}

const DEFAULT_MAX_MB = 5;
const COMPRESSION_MAX_MB = 0.6;
const COMPRESSION_MAX_DIM = 1920;
const COMPRESSION_QUALITY = 0.82;
const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,image/heic,image/heif";

const ASPECTS: Record<CropShape, number> = {
  cover: 16 / 9,
  square: 1,
  avatar: 1,
  ticket: 1.875,
};

const PRESETS = [
  { id: "wide", label: "16:9", aspect: 16 / 9 },
  { id: "square", label: "1:1", aspect: 1 },
  { id: "ticket", label: "Billet", aspect: 1.875 },
] as const;

interface CropSource {
  file: File;
  src: string;
  name: string;
}

interface UploadSuccess {
  ok: true;
  url: string;
  demo?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

function validateImageFile(file: File, maxMb: number): string | null {
  const isHeic = /\.(heic|heif)$/i.test(file.name);
  if (!isAcceptedImageType(file.type.toLowerCase()) && !isHeic) {
    return `Format non pris en charge (${file.type || "inconnu"}). Utilisez JPG, PNG, WebP, HEIC ou HEIF.`;
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Fichier trop lourd (${formatBytes(file.size)}). Taille maximale : ${maxMb} Mo.`;
  }
  return null;
}

/** HEIC/HEIF → JPEG, puis compression navigateur. */
async function prepareImageFile(file: File): Promise<{ file: File; dataUrl: string }> {
  let source = file;
  if (file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name)) {
    // heic2any lit window au chargement : import dynamique côté navigateur uniquement.
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    if (!blob) throw new Error("Conversion HEIC impossible.");
    source = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      { type: "image/jpeg", lastModified: Date.now() }
    );
  }

  const compressed = await imageCompression(source, {
    maxSizeMB: COMPRESSION_MAX_MB,
    maxWidthOrHeight: COMPRESSION_MAX_DIM,
    initialQuality: COMPRESSION_QUALITY,
    fileType: "image/jpeg",
    useWebWorker: true,
  });
  const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
  return { file: compressed, dataUrl };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible."));
    image.src = src;
  });
}

/** Dessine la zone recadrée sur un canvas et exporte un blob JPEG. */
async function cropToBlob(src: string, area: Area): Promise<Blob> {
  const image = await loadImage(src);
  const scale = Math.min(1, COMPRESSION_MAX_DIM / Math.max(area.width, area.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width * scale));
  canvas.height = Math.max(1, Math.round(area.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Recadrage impossible sur ce navigateur.");
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export de l'image impossible."))),
      "image/jpeg",
      0.92
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Lecture de l'image impossible."));
    reader.readAsDataURL(blob);
  });
}

function toJpegFile(blob: Blob, sourceName: string): File {
  const base = sourceName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, {
    type: blob.type || "image/jpeg",
    lastModified: Date.now(),
  });
}

function parseUploadResponse(text: string): UploadSuccess | { ok: false; error: string } | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Record<string, unknown>;
    if (record.ok === true && typeof record.url === "string") {
      return { ok: true, url: record.url, demo: record.demo === true };
    }
    if (record.ok === false && typeof record.error === "string") {
      return { ok: false, error: record.error };
    }
    return null;
  } catch {
    return null;
  }
}

/** XHR plutôt que fetch : seule la progression du corps uploadé est exposée. */
function uploadWithProgress(
  file: File,
  dataUrl: string,
  kind: CropShape,
  onProgress: (percent: number) => void
): Promise<UploadSuccess> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/uploads");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onerror = () => reject(new Error("Réseau indisponible : envoi de l'image impossible."));
    xhr.onload = () => {
      const payload = parseUploadResponse(xhr.responseText);
      if (!payload) {
        reject(new Error("Réponse du serveur invalide."));
        return;
      }
      if (!payload.ok) {
        reject(new Error(payload.error));
        return;
      }
      onProgress(100);
      resolve(payload);
    };

    const form = new FormData();
    form.append("file", file, file.name);
    form.append("dataUrl", dataUrl);
    form.append("kind", kind);
    xhr.send(form);
  });
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] text-[var(--grtk-violet-600)] shadow-[var(--shadow-1)] transition-colors hover:border-[var(--grtk-violet-600)] hover:bg-[var(--grtk-violet-50)] disabled:opacity-50"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }): JSX.Element {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] px-3 py-2 text-xs text-[var(--grtk-text)]"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-[var(--radius-pill)] border border-[var(--grtk-violet-600)] px-4 text-xs font-semibold text-[var(--grtk-violet-700)] transition-colors hover:bg-[var(--grtk-violet-50)]"
      >
        Réessayer
      </button>
    </div>
  );
}

function ProgressOverlay({ progress, size }: { progress: number; size: number | null }): JSX.Element {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-[var(--grtk-surface)] px-4 text-center">
      <span className="text-xs font-bold text-[var(--grtk-violet-700)]">
        {progress > 0 ? `Envoi ${progress} %` : "Traitement de l'image…"}
      </span>
      <div className="h-1.5 w-3/4 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--grtk-violet-100)]">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--grtk-violet-600)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {size !== null && (
        <span className="text-[11px] text-[var(--grtk-text-3)]">
          Taille compressée : {formatBytes(size)}
        </span>
      )}
    </div>
  );
}

interface CropDialogProps {
  source: CropSource | null;
  shape: CropShape;
  busy: boolean;
  onCancel: () => void;
  onApply: (area: Area) => void;
}

function CropDialog({ source, shape, busy, onCancel, onApply }: CropDialogProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const zoomId = useId();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(ASPECTS[shape]);
  const [area, setArea] = useState<Area | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const areaRef = useRef<Area | null>(null);

  // Le composant est remonté avec une `key` par source : nul besoin de
  // réinitialiser les états ici (React Compiler interdit setState dans un effet).
  useEffect(() => {
    let active = true;
    if (source) {
      loadImage(source.src)
        .then((image) => {
          if (active) imageRef.current = image;
        })
        .catch(() => {
          if (active) imageRef.current = null;
        });
    }
    return () => {
      active = false;
      imageRef.current = null;
    };
  }, [source]);

  const drawPreview = useCallback(
    (next: Area | null) => {
      const canvas = previewRef.current;
      const image = imageRef.current;
      if (!canvas || !image || !next) return;
      const width = 240;
      const height = Math.max(1, Math.round(width / aspect));
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, next.x, next.y, next.width, next.height, 0, 0, width, height);
    },
    [aspect]
  );

  useEffect(() => {
    drawPreview(areaRef.current);
  }, [drawPreview]);

  const handleAreaChange = useCallback(
    (_percentage: Area, pixels: Area) => {
      areaRef.current = pixels;
      setArea(pixels);
      drawPreview(pixels);
    },
    [drawPreview]
  );

  const instant = reduceMotion === true;

  return (
    <AnimatePresence>
      {source && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Recadrer l'image"
          initial={instant ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: instant ? 0 : 0.18, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={busy ? undefined : onCancel}
          />
          <motion.div
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-auto rounded-[var(--radius-xl)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] p-5 shadow-[var(--shadow-3)]"
            initial={instant ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: instant ? 0 : 0.2, ease: "easeOut" }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[var(--grtk-border)] pb-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-[var(--grtk-text)]">
                  Recadrer l&apos;image
                </h2>
                <p className="text-xs text-[var(--grtk-text-3)]">
                  Glissez pour déplacer, zoomez, puis appliquez.
                </p>
              </div>
              <button
                type="button"
                aria-label="Annuler le recadrage"
                onClick={onCancel}
                disabled={busy}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--grtk-text-3)] transition-colors hover:bg-[var(--grtk-violet-50)] hover:text-[var(--grtk-violet-700)]"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--grtk-surface-2)] sm:h-80">
              <Cropper
                image={source.src}
                crop={crop}
                zoom={zoom}
                rotation={0}
                aspect={aspect}
                cropShape={shape === "avatar" ? "round" : "rect"}
                objectFit="cover"
                showGrid
                minZoom={1}
                maxZoom={3}
                zoomSpeed={0.15}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropAreaChange={handleAreaChange}
                style={{ containerStyle: { background: "var(--grtk-surface-2)" } }}
                classes={{}}
                mediaProps={{ alt: "Image à recadrer" }}
                cropperProps={{ role: "application" }}
                restrictPosition
                keyboardStep={10}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--grtk-text-2)]">Format</span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={aspect === preset.aspect}
                  onClick={() => setAspect(preset.aspect)}
                  className={cn(
                    "min-h-11 rounded-[var(--radius-pill)] border px-3 text-xs font-semibold transition-colors",
                    aspect === preset.aspect
                      ? "border-[var(--grtk-violet-600)] bg-[var(--grtk-violet-600)] text-white"
                      : "border-[var(--grtk-border)] bg-[var(--grtk-surface)] text-[var(--grtk-text-2)] hover:border-[var(--grtk-violet-600)]"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <label htmlFor={zoomId} className="text-xs font-semibold text-[var(--grtk-text-2)]">
                Zoom
              </label>
              <input
                id={zoomId}
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="h-11 flex-1 accent-[var(--grtk-violet-600)]"
              />
              <span className="font-mono text-xs text-[var(--grtk-text-3)]">{zoom.toFixed(2)}x</span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-[var(--grtk-text-2)]">Aperçu</span>
              <canvas
                ref={previewRef}
                aria-label="Aperçu du recadrage"
                className="h-16 w-auto rounded-[var(--radius-sm)] border border-[var(--grtk-border)]"
              />
            </div>

            <footer className="mt-5 flex justify-end gap-3 border-t border-[var(--grtk-border)] pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="min-h-11 rounded-[var(--radius-pill)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] px-5 text-sm font-semibold text-[var(--grtk-text-2)] transition-colors hover:border-[var(--grtk-violet-600)]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => area && onApply(area)}
                disabled={!area || busy}
                className="btn-neon-purple min-h-11 px-5 text-sm"
              >
                Appliquer
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ImageUploader({
  value,
  onChange,
  shape = "cover",
  label = "Image",
  hint,
  maxMb = DEFAULT_MAX_MB,
  className,
  compact = false,
}: ImageUploaderProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const lastUploadRef = useRef<{ file: File; dataUrl: string } | null>(null);
  const isActiveRef = useRef(false);

  const upload = useCallback(
    async (file: File, dataUrl: string) => {
      setBusy(true);
      setError(null);
      lastUploadRef.current = { file, dataUrl };
      try {
        const result = await uploadWithProgress(file, dataUrl, shape, setProgress);
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Échec de l'envoi.");
      } finally {
        setBusy(false);
        setProgress(0);
      }
    },
    [shape, onChange]
  );

  const processFile = useCallback(
    async (file: File) => {
      lastFileRef.current = file;
      lastUploadRef.current = null;
      setError(null);
      setCompressedSize(null);
      const validation = validateImageFile(file, maxMb);
      if (validation) {
        setError(validation);
        return;
      }
      setBusy(true);
      try {
        const prepared = await prepareImageFile(file);
        setCompressedSize(prepared.file.size);
        setCropSource({ file: prepared.file, src: prepared.dataUrl, name: prepared.file.name });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de traiter cette image.");
      } finally {
        setBusy(false);
      }
    },
    [maxMb]
  );

  const applyCrop = useCallback(
    async (area: Area) => {
      if (!cropSource) return;
      const source = cropSource;
      setBusy(true);
      setError(null);
      try {
        const blob = await cropToBlob(source.src, area);
        const cropped = toJpegFile(blob, source.name);
        const dataUrl = await blobToDataUrl(blob);
        setCompressedSize(blob.size);
        setCropSource(null);
        await upload(cropped, dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de recadrer cette image.");
        setCropSource(null);
      } finally {
        setBusy(false);
      }
    },
    [cropSource, upload]
  );

  const remove = useCallback(() => {
    onChange(null);
    setError(null);
    setCompressedSize(null);
    lastFileRef.current = null;
    lastUploadRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  const retry = useCallback(() => {
    const lastUpload = lastUploadRef.current;
    if (lastUpload) {
      void upload(lastUpload.file, lastUpload.dataUrl);
      return;
    }
    const lastFile = lastFileRef.current;
    if (lastFile) {
      void processFile(lastFile);
      return;
    }
    inputRef.current?.click();
  }, [upload, processFile]);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isActiveRef.current) return;
      const file = Array.from(event.clipboardData?.files ?? []).find((entry) =>
        entry.type.startsWith("image/")
      );
      if (!file) return;
      event.preventDefault();
      void processFile(file);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!busy) inputRef.current?.click();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      isActiveRef.current = false;
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void processFile(file);
  };

  const frameClass = compact
    ? "h-24 w-full sm:h-28"
    : shape === "avatar"
      ? "h-32 w-32"
      : shape === "ticket"
        ? "aspect-[1.875/1] w-full max-h-64"
        : shape === "square"
          ? "aspect-square w-full max-h-72"
          : "aspect-video w-full max-h-72";

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-semibold text-[var(--grtk-text)]">{label}</p>}

      <div className="flex items-start gap-2">
        <div
          role="button"
          tabIndex={0}
          aria-label={`${label} : déposer, coller ou choisir une image`}
          onClick={() => {
            if (!busy) inputRef.current?.click();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            isActiveRef.current = true;
          }}
          onBlur={handleBlur}
          onMouseEnter={() => {
            isActiveRef.current = true;
          }}
          onMouseLeave={() => {
            isActiveRef.current = false;
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            isActiveRef.current = true;
            setDragOver(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border-2 border-dashed outline-none transition-colors focus-visible:shadow-[var(--shadow-focus)]",
            frameClass,
            dragOver
              ? "border-[var(--grtk-violet-600)] bg-[var(--grtk-violet-50)]"
              : "border-[var(--grtk-border)] bg-[var(--grtk-surface)] hover:border-[var(--grtk-violet-600)]"
          )}
        >
          {value ? (
            <NextImage
              src={value}
              alt={`Aperçu : ${label}`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder
              icon={UploadCloud}
              label={compact ? "Ajouter" : "Déposer ou cliquer pour choisir une image"}
              compact={compact}
              className="h-full w-full border-0"
            />
          )}
          {busy && <ProgressOverlay progress={progress} size={compressedSize} />}
        </div>

        <div className="flex flex-col gap-2">
          <ActionButton
            label="Prendre une photo avec la caméra"
            icon={Camera}
            onClick={() => cameraRef.current?.click()}
            disabled={busy}
          />
          {value && (
            <ActionButton
              label="Remplacer l'image"
              icon={RefreshCw}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            />
          )}
          {value && <ActionButton label="Supprimer l'image" icon={Trash2} onClick={remove} />}
        </div>
      </div>

      <p className="text-xs text-[var(--grtk-text-3)]">
        {hint ?? `JPG, PNG, WebP, HEIC ou HEIF · ${maxMb} Mo max · collage possible`}
      </p>

      {compressedSize !== null && !busy && (
        <p className="text-[11px] text-[var(--grtk-text-3)]">
          Taille compressée : {formatBytes(compressedSize)}
        </p>
      )}

      {error && <ErrorNotice message={error} onRetry={retry} />}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      <CropDialog
        key={`${cropSource?.src ?? "vide"}-${shape}`}
        source={cropSource}
        shape={shape}
        busy={busy}
        onCancel={() => setCropSource(null)}
        onApply={(area) => void applyCrop(area)}
      />
    </div>
  );
}

export function ImageGalleryUploader({
  values,
  onChange,
  max = 8,
  label = "Galerie d'images",
}: ImageGalleryUploaderProps): JSX.Element {
  const [queue, setQueue] = useState<CropSource[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const lastFilesRef = useRef<File[]>([]);
  const lastCropRef = useRef<{ source: CropSource; area: Area } | null>(null);
  const replaceIndexRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const pushUrl = useCallback(
    (url: string) => {
      const index = replaceIndexRef.current;
      replaceIndexRef.current = null;
      if (index !== null && index < values.length) {
        const next = [...values];
        next[index] = url;
        onChange(next);
        return;
      }
      if (!values.includes(url)) onChange([...values, url]);
    },
    [values, onChange]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      lastFilesRef.current = files;
      lastCropRef.current = null;
      setError(null);
      setCompressedSize(null);

      const isReplace = replaceIndexRef.current !== null;
      const candidates = isReplace ? files.slice(0, 1) : files;
      const prepared: CropSource[] = [];
      setBusy(true);
      try {
        for (const file of candidates) {
          if (!isReplace && values.length + queue.length + prepared.length >= max) {
            setError(`Limite de ${max} images atteinte.`);
            break;
          }
          const validation = validateImageFile(file, DEFAULT_MAX_MB);
          if (validation) {
            setError(validation);
            continue;
          }
          const result = await prepareImageFile(file);
          setCompressedSize(result.file.size);
          prepared.push({ file: result.file, src: result.dataUrl, name: result.file.name });
        }
        if (prepared.length > 0) setQueue((previous) => [...previous, ...prepared]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de traiter ces images.");
      } finally {
        setBusy(false);
      }
    },
    [values.length, queue.length, max]
  );

  const uploadCrop = useCallback(
    async (source: CropSource, area: Area) => {
      setBusy(true);
      setError(null);
      try {
        const blob = await cropToBlob(source.src, area);
        const file = toJpegFile(blob, source.name);
        const dataUrl = await blobToDataUrl(blob);
        setCompressedSize(blob.size);
        const result = await uploadWithProgress(file, dataUrl, "cover", setProgress);
        pushUrl(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible d'envoyer cette image.");
      } finally {
        setBusy(false);
        setProgress(0);
      }
    },
    [pushUrl]
  );

  const applyCrop = useCallback(
    (area: Area) => {
      const source = queue[0];
      if (!source) return;
      lastCropRef.current = { source, area };
      setQueue((previous) => previous.slice(1));
      void uploadCrop(source, area);
    },
    [queue, uploadCrop]
  );

  const cancelCrop = () => {
    lastCropRef.current = null;
    setQueue((previous) => previous.slice(1));
  };

  const retry = () => {
    const lastCrop = lastCropRef.current;
    if (lastCrop) {
      void uploadCrop(lastCrop.source, lastCrop.area);
      return;
    }
    void handleFiles(lastFilesRef.current);
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!isActiveRef.current) return;
      const files = Array.from(event.clipboardData?.files ?? []).filter((entry) =>
        entry.type.startsWith("image/")
      );
      if (files.length === 0) return;
      event.preventDefault();
      void handleFiles(files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!busy) inputRef.current?.click();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void handleFiles(files);
  };

  const removeAt = (index: number) => {
    onChange(values.filter((_url, position) => position !== index));
  };

  const replaceAt = (index: number) => {
    replaceIndexRef.current = index;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--grtk-text)]">{label}</p>
        <span className="text-xs text-[var(--grtk-text-3)]">
          {values.length}/{max}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {values.map((url, index) => (
          <div
            key={`${url.slice(0, 40)}-${index}`}
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--grtk-border)] bg-[var(--grtk-surface)] shadow-[var(--shadow-1)]"
          >
            <div className="relative aspect-video w-full bg-[var(--grtk-violet-50)]">
              <NextImage
                src={url}
                alt={`${label} ${index + 1}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="flex gap-2 p-2">
              <ActionButton
                label={`Remplacer l'image ${index + 1}`}
                icon={RefreshCw}
                onClick={() => replaceAt(index)}
              />
              <ActionButton
                label={`Supprimer l'image ${index + 1}`}
                icon={Trash2}
                onClick={() => removeAt(index)}
              />
            </div>
          </div>
        ))}

        {values.length < max && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Déposer, coller ou choisir plusieurs images"
            onClick={() => {
              if (!busy) inputRef.current?.click();
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              isActiveRef.current = true;
            }}
            onBlur={() => {
              isActiveRef.current = false;
            }}
            onMouseEnter={() => {
              isActiveRef.current = true;
            }}
            onMouseLeave={() => {
              isActiveRef.current = false;
            }}
            onDragEnter={(event) => {
              event.preventDefault();
              isActiveRef.current = true;
              setDragOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border-2 border-dashed outline-none transition-colors focus-visible:shadow-[var(--shadow-focus)]",
              dragOver
                ? "border-[var(--grtk-violet-600)] bg-[var(--grtk-violet-50)]"
                : "border-[var(--grtk-border)] bg-[var(--grtk-surface)] hover:border-[var(--grtk-violet-600)]"
            )}
          >
            <ImagePlaceholder
              icon={ImagePlus}
              label="Ajouter des images"
              compact
              className="h-full w-full border-0"
            />
            {busy && <ProgressOverlay progress={progress} size={compressedSize} />}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ActionButton
          label="Prendre une photo avec la caméra"
          icon={Camera}
          onClick={() => cameraRef.current?.click()}
          disabled={busy || values.length >= max}
        />
        <p className="flex-1 text-xs text-[var(--grtk-text-3)]">
          JPG, PNG, WebP, HEIC ou HEIF · {DEFAULT_MAX_MB} Mo max · jusqu&apos;à {max} images ·
          collage possible
        </p>
      </div>

      {compressedSize !== null && !busy && (
        <p className="text-[11px] text-[var(--grtk-text-3)]">
          Dernière image compressée : {formatBytes(compressedSize)}
        </p>
      )}

      {error && <ErrorNotice message={error} onRetry={retry} />}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      <CropDialog
        key={queue[0]?.src ?? "vide"}
        source={queue[0] ?? null}
        shape="cover"
        busy={busy}
        onCancel={cancelCrop}
        onApply={applyCrop}
      />
    </div>
  );
}
