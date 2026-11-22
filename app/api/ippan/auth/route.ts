import { cookies } from "next/headers";
import { transaction } from "@/ippan/server/store";
import { signIn, digest, HttpError } from "@/ippan/server/service";
import {
  token,
  errorResponse,
  checkOrigin,
  readJson,
} from "@/ippan/server/http";
const attempts = new Map<string, { count: number; reset: number }>();
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const key =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    const entry = attempts.get(key);
    if (entry && entry.reset > Date.now() && entry.count >= 12)
      throw new HttpError(
        "Too many sign-in attempts. Try again in 15 minutes.",
        429,
      );
    attempts.set(key, {
      count: entry && entry.reset > Date.now() ? entry.count + 1 : 1,
      reset:
        entry && entry.reset > Date.now() ? entry.reset : Date.now() + 900000,
    });
    const input = await readJson(request, 16384);
    const result = await transaction((s) => signIn(s, input));
    attempts.delete(key);
    (await cookies()).set("ippan_session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 28800,
    });
    return Response.json({ user: result.user });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const session = await token();
    if (session)
      await transaction((s) => {
        s.sessions = s.sessions.filter((x) => x.hash !== digest(session));
      });
    (await cookies()).delete("ippan_session");
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
