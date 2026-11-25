/**
 * Safe RFC-4180 CSV exporter with spreadsheet formula-injection neutralization.
 */
function sanitizeCsvCell(raw: unknown): string {
  if (raw === null || raw === undefined) {
    return '';
  }
  let value = String(raw);
  // Neutralize spreadsheet formula triggers (=, +, -, @, tab, carriage return)
  if (/^[=+\-@\t\r]/.test(value)) {
    value = `'${value}`;
  }
  const escaped = value.replace(/"/g, '""');
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

export function buildCsvContent<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headerLine = columns.map((col) => sanitizeCsvCell(col.header)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((col) => sanitizeCsvCell(row[col.key])).join(',')
  );
  // UTF-8 BOM helps Excel open Unicode cleanly
  return `\uFEFF${[headerLine, ...dataLines].join('\r\n')}`;
}

export function downloadCsvFile<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; header: string }[]
): number {
  const csv = buildCsvContent(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', safeName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return rows.length;
}

export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
