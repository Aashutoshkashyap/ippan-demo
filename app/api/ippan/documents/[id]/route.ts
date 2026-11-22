import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { readState } from "@/ippan/server/store";
import { viewer, HttpError } from "@/ippan/server/service";
import { token, errorResponse, privateHeaders } from "@/ippan/server/http";
import { can as allowed } from "@/ippan/model";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await token();
    const url = new URL(request.url);
    const s = await readState();
    const result = (() => {
      const u = viewer(s, session);
      const admin = !!u && u.role !== "Member";
      const pub = [...s.publications, ...s.resources].find(
        (x) => x.id === id && x.status === "Published",
      );
      if (pub) {
        if (
          pub.access === "Members" &&
          (!u ||
            (!allowed(u.role, "resources") &&
              !s.members.some(
                (m) =>
                  m.id === u.memberId &&
                  m.status === "Active" &&
                  m.expiry >= new Date().toISOString().slice(0, 10),
              )))
        )
          throw new HttpError("Active membership is required.", 403);
        if (pub.pdf)
          return {
            bytes: Buffer.from(pub.pdf.data, "base64"),
            title: pub.pdf.name,
          };
        return {
          title: pub.title,
          lines: [
            pub.category,
            "Sample publication - demonstration edition",
            ...pub.body.split("\n"),
          ],
          qr: undefined,
        };
      }
      const docIndex = Number(url.searchParams.get("attachment") || -1);
      if (docIndex >= 0) {
        if (!u || !allowed(u.role, "members"))
          throw new HttpError("Membership officer access is required.", 403);
        const a = s.applications.find((a) => a.id === id);
        const doc = a?.documents[docIndex];
        if (!doc) throw new HttpError("Document not found.", 404);
        return { bytes: Buffer.from(doc.data, "base64"), title: doc.name };
      }
      if (!u) throw new HttpError("Sign in to access this document.", 401);
      const m = s.members.find((m) => m.id === id);
      if (m) {
        if (
          (!admin && u.memberId !== m.id) ||
          (admin && !allowed(u.role, "members"))
        )
          throw new HttpError("Access denied.", 403);
        if (
          m.status !== "Active" ||
          m.expiry < new Date().toISOString().slice(0, 10)
        )
          throw new HttpError(
            "Only active members can download a certificate.",
            403,
          );
        return {
          title: "Membership Certificate",
          lines: [
            "Independent Power Producers Association, Nepal",
            m.name,
            `${m.category} membership | ${m.id}`,
            `Valid until ${m.expiry}`,
            "DEMONSTRATION CERTIFICATE - not an official credential",
          ],
          qr: undefined,
        };
      }
      const p = s.payments.find((p) => p.id === id);
      if (p) {
        if (
          (!admin && u.memberId !== p.memberId) ||
          (admin && !allowed(u.role, "finance"))
        )
          throw new HttpError("Access denied.", 403);
        return {
          title:
            p.status === "Simulated successful"
              ? "Simulated Payment Receipt"
              : "Membership Invoice",
          lines: [
            p.id,
            s.members.find((m) => m.id === p.memberId)?.name || "",
            p.purpose,
            `NPR ${p.amount.toLocaleString()}`,
            `Status: ${p.status}`,
            `Date: ${p.date}`,
            "No real funds have been transferred.",
          ],
          qr: undefined,
        };
      }
      const r = s.registrations.find((r) => r.id === id);
      if (r) {
        if (
          (!admin && u.memberId !== r.memberId) ||
          (admin && !allowed(u.role, "events"))
        )
          throw new HttpError("Access denied.", 403);
        return {
          title: "Event Entry Pass",
          lines: [
            s.events.find((e) => e.id === r.eventId)?.title || "",
            r.name,
            r.id,
            r.paymentStatus,
            "Demonstration event ticket",
          ],
          qr: r.id,
        };
      }
      throw new HttpError("Document not found.", 404);
    })();
    if ("bytes" in result && result.bytes)
      return new Response(new Uint8Array(result.bytes), {
        headers: {
          ...privateHeaders,
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="supporting-document.pdf"',
        },
      });
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([595, 842]);
    page.drawRectangle({
      x: 0,
      y: 740,
      width: 595,
      height: 102,
      color: rgb(0.025, 0.16, 0.22),
    });
    page.drawText("IPPAN", {
      x: 45,
      y: 786,
      size: 30,
      font: bold,
      color: rgb(1, 1, 1),
    });
    const ascii = (s: string) => s.replace(/[^\x20-\x7E]/g, " ");
    page.drawText(ascii(result.title), {
      x: 45,
      y: 700,
      size: 21,
      font: bold,
      color: rgb(0.025, 0.16, 0.22),
    });
    let y = 655;
    for (const line of ("lines" in result ? result.lines : []) || []) {
      const words = ascii(line).split(" ");
      let row = "";
      for (const word of words) {
        if (font.widthOfTextAtSize(row + " " + word, 11) > 500) {
          if (y < 70) {
            page = pdf.addPage([595, 842]);
            y = 770;
          }
          page.drawText(row, { x: 45, y, size: 11, font });
          y -= 20;
          row = word;
        } else row += (row ? " " : "") + word;
      }
      if (y < 70) {
        page = pdf.addPage([595, 842]);
        y = 770;
      }
      page.drawText(row, { x: 45, y, size: 11, font });
      y -= 28;
    }
    if ("qr" in result && result.qr) {
      const qr = await pdf.embedPng(await QRCode.toBuffer(result.qr));
      page.drawImage(qr, {
        x: 45,
        y: Math.max(80, y - 150),
        width: 135,
        height: 135,
      });
    }
    return new Response(new Uint8Array(await pdf.save()), {
      headers: {
        ...privateHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ippan-${id.replace(/[^a-zA-Z0-9-]/g, "")}.pdf"`,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
