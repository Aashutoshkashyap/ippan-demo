export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || !cell) quoted = !quoted;
      else throw new Error("Unexpected quote in CSV value.");
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (quoted) throw new Error("A quoted CSV value is not closed.");
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
export function projectImportRows(rows: unknown[][]) {
  if (rows.length < 2 || rows.length > 101)
    throw new Error("Import 1–100 project records per file.");
  const keys = rows[0].map((v) =>
    String(v ?? "")
      .replace(/^\uFEFF/, "")
      .trim(),
  );
  const required = [
    "name",
    "developer",
    "memberId",
    "province",
    "district",
    "municipality",
    "capacity",
    "river",
    "status",
    "lat",
    "lng",
    "licence",
    "cod",
  ];
  if (
    new Set(keys).size !== keys.length ||
    !required.every((k) => keys.includes(k))
  )
    throw new Error("Required project headers are missing or duplicated.");
  const allowed = new Set([...required, "surveyLicence", "contact"]);
  return rows
    .slice(1)
    .filter((r) => r.some((v) => v !== null && v !== ""))
    .map((row, index) => {
      if (row.length > keys.length)
        throw new Error(`Row ${index + 2} has too many columns.`);
      return Object.fromEntries(
        keys
          .filter((k) => allowed.has(k))
          .map((k) => {
            const v = row[keys.indexOf(k)];
            return [
              k,
              v instanceof Date
                ? v.toISOString().slice(0, 10)
                : String(v ?? "").trim(),
            ];
          }),
      );
    });
}
