import { readState, storageMode } from "@/ippan/server/store";
import { viewer, snapshot } from "@/ippan/server/service";
import { token, errorResponse, privateHeaders } from "@/ippan/server/http";
export async function GET() {
  try {
    const session = await token();
    const s = await readState();
    return Response.json(
      { ...snapshot(s, viewer(s, session)), storage: storageMode() },
      { headers: privateHeaders },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
