export type CsvValue = string | number | boolean | Date | null | undefined;

function escapeCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  const normalized = value instanceof Date ? value.toISOString() : String(value);
  const protectedValue = /^[=+\-@\t\r]/.test(normalized) ? `'${normalized}` : normalized;
  const escaped = protectedValue.replace(/"/g, '""');

  if (/[",\n]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}

export function toCsv<T extends Record<string, CsvValue>>(
  rows: T[],
  headers?: Array<keyof T>,
): string {
  if (rows.length === 0 && (!headers || headers.length === 0)) {
    return "";
  }

  const columns = headers && headers.length > 0 ? headers : (Object.keys(rows[0]) as Array<keyof T>);
  const headerLine = columns.join(",");

  if (rows.length === 0) {
    return `${headerLine}\n`;
  }

  const lines = rows.map((row) => columns.map((column) => escapeCsvValue(row[column])).join(","));

  return [headerLine, ...lines].join("\n");
}
