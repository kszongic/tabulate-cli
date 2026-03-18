#!/usr/bin/env node
'use strict';

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-d' || args[i] === '--delimiter') { flags.delimiter = args[++i]; }
  else if (args[i] === '-s' || args[i] === '--style') { flags.style = args[++i]; }
  else if (args[i] === '-H' || args[i] === '--header') { flags.header = true; }
  else if (args[i] === '-p' || args[i] === '--padding') { flags.padding = parseInt(args[++i], 10); }
  else if (args[i] === '-r' || args[i] === '--right') { flags.right = (args[++i] || '').split(',').map(Number); }
  else if (args[i] === '-h' || args[i] === '--help') { flags.help = true; }
  else if (args[i] === '-v' || args[i] === '--version') { flags.version = true; }
  else { positional.push(args[i]); }
}

if (flags.version) {
  console.log(require('./package.json').version);
  process.exit(0);
}

if (flags.help) {
  console.log(`tabulate - Format stdin into aligned columns

Usage:
  cat data.txt | tabulate [options]
  echo "a,b,c\\n1,2,3" | tabulate -d ","

Options:
  -d, --delimiter <str>   Input delimiter (default: whitespace)
  -s, --style <name>      Border style: plain, grid, markdown, compact (default: plain)
  -H, --header            Treat first row as header
  -p, --padding <n>       Column padding (default: 1)
  -r, --right <cols>      Right-align columns (0-indexed, comma-separated)
  -h, --help              Show help
  -v, --version           Show version`);
  process.exit(0);
}

const delimiter = flags.delimiter || null;
const style = flags.style || 'plain';
const hasHeader = flags.header || false;
const padding = flags.padding != null ? flags.padding : 1;
const rightAlign = new Set(flags.right || []);

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  const lines = input.replace(/\r\n/g, '\n').split('\n').filter(l => l.length > 0);
  if (lines.length === 0) process.exit(0);

  const rows = lines.map(line => {
    if (delimiter) return line.split(delimiter);
    return line.trim().split(/\s+/);
  });

  const numCols = Math.max(...rows.map(r => r.length));
  // Normalize row lengths
  for (const row of rows) {
    while (row.length < numCols) row.push('');
  }

  // Calculate column widths
  const widths = Array(numCols).fill(0);
  for (const row of rows) {
    for (let c = 0; c < numCols; c++) {
      widths[c] = Math.max(widths[c], row[c].length);
    }
  }

  const pad = ' '.repeat(padding);

  function formatRow(row, left, sep, right) {
    const cells = row.map((cell, i) => {
      const w = widths[i];
      return rightAlign.has(i) ? cell.padStart(w) : cell.padEnd(w);
    });
    return left + cells.join(sep) + right;
  }

  function hrLine(left, fill, cross, right) {
    const segs = widths.map(w => fill.repeat(w + padding * 2));
    return left + segs.join(cross) + right;
  }

  const out = [];

  if (style === 'grid') {
    out.push(hrLine('┌', '─', '┬', '┐'));
    rows.forEach((row, i) => {
      out.push(formatRow(row, '│' + pad, pad + '│' + pad, pad + '│'));
      if (i === 0 && hasHeader) out.push(hrLine('├', '─', '┼', '┤'));
      else if (i < rows.length - 1) out.push(hrLine('├', '─', '┼', '┤'));
    });
    out.push(hrLine('└', '─', '┴', '┘'));
  } else if (style === 'markdown') {
    rows.forEach((row, i) => {
      out.push(formatRow(row, '| ' , ' | ', ' |'));
      if (i === 0) {
        const sep = widths.map((w, c) => {
          const dash = '-'.repeat(w);
          return rightAlign.has(c) ? dash.slice(0, -1) + ':' : dash;
        });
        out.push('| ' + sep.join(' | ') + ' |');
      }
    });
  } else if (style === 'compact') {
    rows.forEach((row, i) => {
      out.push(formatRow(row, '', pad + ' ' + pad, ''));
      if (i === 0 && hasHeader) {
        out.push(widths.map(w => '-'.repeat(w)).join(pad + ' ' + pad));
      }
    });
  } else {
    // plain
    rows.forEach(row => {
      out.push(formatRow(row, '', pad + pad, ''));
    });
  }

  console.log(out.join('\n'));
});
