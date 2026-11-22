import { transaction } from "@/ippan/server/store";
import { applyAction, viewer, HttpError } from "@/ippan/server/service";
import {
  token,
  errorResponse,
  checkOrigin,
  readJson,
} from "@/ippan/server/http";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (Number(request.headers.get("content-length") || 0) > 8500000)
      throw new HttpError("Request is too large.", 413);
    const input = await readJson(request);
    const session = await token();
    const result = await transaction((s) =>
      applyAction(s, viewer(s, session), input),
    );
    return Response.json({ result });
  } catch (e) {
    return errorResponse(e);
  }
}
