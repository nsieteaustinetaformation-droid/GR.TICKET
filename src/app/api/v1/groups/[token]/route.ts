import { fail, json } from "@/lib/api/respond";
import { getGroup } from "@/lib/domain/groups";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = getGroup(token);
  if (!data) return fail("GROUP_NOT_FOUND", 404);
  return json({ ok: true, ...data });
}
