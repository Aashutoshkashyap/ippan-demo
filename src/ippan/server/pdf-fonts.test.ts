import { it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { documentFonts } from "./pdf-fonts";
it("embeds a shaping-capable Nepali font without stripping Devanagari names", async () => {
  const pdf = await PDFDocument.create();
  const text = "नेपाली प्रकाशन परीक्षण";
  const { font, clean } = await documentFonts(pdf, text);
  expect(clean(text)).toBe(text);
  expect(font.getCharacterSet()).toContain(0x0928);
  pdf.addPage().drawText(clean(text), { x: 40, y: 700, size: 20, font });
  const result = await PDFDocument.load(await pdf.save());
  expect(result.getPageCount()).toBe(1);
});
