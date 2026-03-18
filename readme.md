# @kszongic/tabulate-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/tabulate-cli)](https://www.npmjs.com/package/@kszongic/tabulate-cli)
[![license](https://img.shields.io/npm/l/@kszongic/tabulate-cli)](./LICENSE)

Format stdin into beautifully aligned columns. Supports custom delimiters, headers, right-alignment, and multiple border styles. **Zero dependencies.**

## Install

```bash
npm install -g @kszongic/tabulate-cli
```

## Usage

```bash
# Basic whitespace-delimited alignment
ps aux | head -5 | tabulate

# CSV with headers and grid borders
cat data.csv | tabulate -d "," -H -s grid

# Markdown table output
echo -e "Name,Age,City\nAlice,30,NYC\nBob,25,LA" | tabulate -d "," -s markdown

# Right-align numeric columns
echo -e "Item Price Qty\nApples 1.50 10\nBananas 0.75 25" | tabulate -H -r 1,2
```

## Options

| Flag | Description |
|------|-------------|
| `-d, --delimiter <str>` | Input delimiter (default: whitespace) |
| `-s, --style <name>` | Border style: `plain`, `grid`, `markdown`, `compact` |
| `-H, --header` | Treat first row as a header |
| `-p, --padding <n>` | Column padding (default: 1) |
| `-r, --right <cols>` | Right-align columns (0-indexed, comma-separated) |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Styles

### plain (default)
```
Alice  30  NYC
Bob    25  LA
```

### grid
```
┌───────┬─────┬─────┐
│ Alice │  30 │ NYC │
├───────┼─────┼─────┤
│ Bob   │  25 │ LA  │
└───────┴─────┴─────┘
```

### markdown
```
| Name  | Age | City |
| ----- | --- | ---- |
| Alice | 30  | NYC  |
| Bob   | 25  | LA   |
```

### compact
```
Name   Age  City
-----  ---  ----
Alice  30   NYC
Bob    25   LA
```

## License

MIT © 2026 kszongic
