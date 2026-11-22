import { cookies } from "next/headers";
import { ZodError } from "zod";
import { HttpError } from "./service";
export async function token() {
  return (await cookies()).get("ippan_session")?.value;
}
export async function readJson(
  request: Request,
  limit = 8500000,
): Promise<unknown> {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new HttpError("Request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError("A JSON request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new HttpError("Request is too large.", 413);
    }
    chunks.push(part.value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError("Request body must contain valid JSON.");
  }
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const expected = process.env.IPPAN_SITE_URL;
  const host = request.headers.get("host") || new URL(request.url).host;
  if (
    (expected && origin !== new URL(expected).origin) ||
    (!expected && new URL(origin).host !== host)
  )
    throw new HttpError("Cross-origin requests are not allowed.", 403);
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError)
    return Response.json(
      {
        error: error.issues
          .map((x) => x.path.join(".") + ": " + x.message)
          .join("; "),
      },
      { status: 400 },
    );
  console.error(
    "IPPAN request failed:",
    error instanceof Error ? error.name : "unknown",
  );
  return Response.json(
    {
      error:
        "The request could not be completed. Please retry or check the server configuration.",
    },
    { status: 500 },
  );
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
