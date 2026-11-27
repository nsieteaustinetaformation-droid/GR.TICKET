import { requireApiAuth } from "@/lib/api/guard";
import { json } from "@/lib/api/respond";
import { createChallenge } from "@/lib/domain/qr";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireApiAuth();
  if (guard instanceof Response) return guard;

  const { id } = await params;
  const scannerId = _request.headers.get("x-scanner-id") ?? "scanner-demo";
  return json({ ok: true, ...createChallenge(id, scannerId) });
}
