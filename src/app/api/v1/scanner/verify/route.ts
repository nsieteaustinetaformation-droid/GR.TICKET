import { fail, json, readJson } from "@/lib/api/respond";
import { verifyScan } from "@/lib/domain/qr";

interface Body {
  token?: string;
  scannerId?: string;
}

export async function POST(request: Request) {
  const body = await readJson<Body>(request);
  if (!body?.token) return fail("TOKEN_REQUIRED");
  const result = verifyScan(body.token, body.scannerId ?? "scanner-demo");
  if (!result.ok) return fail(result.error, 403);
  return json({ ok: true, ticket: result.ticket, nonce: result.nonce });
}
