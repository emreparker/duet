// Simple output formatting for CLI

export function table(rows: Record<string, unknown>[], columns?: string[]) {
  if (rows.length === 0) {
    console.log('  (no results)');
    return;
  }

  const cols = columns ?? Object.keys(rows[0]);

  // Calculate column widths
  const widths: Record<string, number> = {};
  for (const col of cols) {
    widths[col] = col.length;
    for (const row of rows) {
      const val = String(row[col] ?? '');
      widths[col] = Math.max(widths[col], val.length);
    }
    // Cap at 60 chars
    widths[col] = Math.min(widths[col], 60);
  }

  // Header
  const header = cols.map((c) => c.toUpperCase().padEnd(widths[c])).join('  ');
  console.log(`  ${header}`);
  console.log(`  ${cols.map((c) => '─'.repeat(widths[c])).join('  ')}`);

  // Rows
  for (const row of rows) {
    const line = cols.map((c) => {
      const val = String(row[c] ?? '');
      return val.substring(0, widths[c]).padEnd(widths[c]);
    }).join('  ');
    console.log(`  ${line}`);
  }
}

export function json(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

export function success(message: string) {
  console.log(`✓ ${message}`);
}

export function error(message: string) {
  console.error(`✗ ${message}`);
}

export function info(message: string) {
  console.log(`ℹ ${message}`);
}
