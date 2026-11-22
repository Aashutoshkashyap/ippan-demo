import "regenerator-runtime/runtime.js";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { readFile } from "node:fs/promises";
import path from "node:path";
export async function documentFonts(pdf: PDFDocument, text: string) {
  const nepali = /[\u0900-\u097f]/.test(text);
  if (nepali) pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    nepali
      ? await readFile(
          path.join(process.cwd(), "public/ippan/noto-devanagari.ttf"),
        )
      : StandardFonts.Helvetica,
    { subset: nepali },
  );
  const bold = nepali ? font : await pdf.embedFont(StandardFonts.HelveticaBold);
  const clean = (s: string) =>
    nepali
      ? s.replace(/[^\x20-\xff\u0900-\u097f\u2000-\u206f]/g, " ")
      : s.replace(/[^\x20-\x7e]/g, " ");
  return { font, bold, clean };
}
