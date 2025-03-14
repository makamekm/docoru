import { MarkedExtension, Tokens } from "marked";

export default function table(endRegex = []): MarkedExtension {
  return {
    renderer: {
      table(token: Tokens.Table): string {
        let header = '';

        // header
        let cell = '';
        for (let j = 0; j < token.header.length; j++) {
          cell += this.tablecell(token.header[j]);
        }
        header += this.tablerow({ text: cell });

        let body = '';
        for (let j = 0; j < token.rows.length; j++) {
          const row = token.rows[j];

          cell = '';
          for (let k = 0; k < row.length; k++) {
            cell += this.tablecell(row[k]);
          }

          body += this.tablerow({ text: cell });
        }
        if (body) body = `<tbody>${body}</tbody>`;

        return '<div class="overflow-x-auto max-w-full border border-black/10 rounded-lg my-3"><table class="table-auto overflow-scroll w-full my-0">\n'
          + '<thead class="bg-gray-50">\n'
          + header
          + '</thead>\n'
          + body
          + '</table></div>\n';
      },
      tablerow({ text }: Tokens.TableRow): string {
        return `<tr class="even:bg-gray-50 odd:bg-transparent border-black/10">\n${text}</tr>\n`;
      },
      tablecell(token: Tokens.TableCell): string {
        const content = this.parser.parseInline(token.tokens);
        const type = token.header ? 'th' : 'td';
        const tag = token.align
          ? `<${type} align="${token.align}" class="px-5 py-3">`
          : `<${type} class="px-5 py-3">`;
        return tag + content + `</${type}>\n`;
      },
    },
    // extensions: [
    //   {
    //     name: 'spanTable',
    //     level: 'block', // Is this a block-level or inline-level tokenizer?
    //     start(src) { return src.match(/^\n *([^\n ].*\|.*)\n/)?.index; }, // Hint to Marked.js to stop and check for a match
    //     tokenizer(src, tokens): any {
    //       // const regex = this.tokenizer.rules.block.table;
    //       let regexString = '^ *([^\\n ].*\\|.*\\n(?: *[^\\s].*\\n)*?)' // Header
    //         + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
    //         + '(?:\\n((?:(?! *\\n| {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})' // Cells
    //         + '(?:\\n+|$)| {0,3}#{1,6} | {0,3}>| {4}[^\\n]| {0,3}(?:`{3,}'
    //         + '(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n| {0,3}(?:[*+-]|1[.)]) |'
    //         + '<\\/?(?:address|article|aside|base|basefont|blockquote|body'
    //         + '|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt'
    //         + '|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]'
    //         + '|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem'
    //         + '|meta|nav|noframes|ol|optgroup|option|p|param|section|source'
    //         + '|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)'
    //         + '(?: +|\\n|\\/?>)|<(?:script|pre|style|textarea|!--)endRegex).*(?:\\n|$))*)\\n*|$)'; // Cells

    //       regexString = regexString.replace('endRegex', endRegex.map(str => `|(?:${str})`).join(''));
    //       const regex = new RegExp(regexString);
    //       const cap = regex.exec(src);

    //       if (cap) {
    //         const item: any = {
    //           type: 'spanTable',
    //           header: cap[1].replace(/\n$/, '').split('\n'),
    //           align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
    //           rows: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
    //         };

    //         // Get first header row to determine how many columns
    //         item.header[0] = splitCells(item.header[0]);

    //         const colCount = item.header[0].reduce((length: number, header: any) => {
    //           return length + header.colspan;
    //         }, 0);

    //         if (colCount === item.align.length) {
    //           item.raw = cap[0];

    //           let i, j, k, row;

    //           // Get alignment row (:---:)
    //           let l = item.align.length;

    //           for (i = 0; i < l; i++) {
    //             if (/^ *-+: *$/.test(item.align[i])) {
    //               item.align[i] = 'right';
    //             } else if (/^ *:-+: *$/.test(item.align[i])) {
    //               item.align[i] = 'center';
    //             } else if (/^ *:-+ *$/.test(item.align[i])) {
    //               item.align[i] = 'left';
    //             } else {
    //               item.align[i] = null;
    //             }
    //           }

    //           // Get any remaining header rows
    //           l = item.header.length;
    //           for (i = 1; i < l; i++) {
    //             item.header[i] = splitCells(item.header[i], colCount, item.header[i - 1]);
    //           }

    //           // Get main table cells
    //           l = item.rows.length;
    //           for (i = 0; i < l; i++) {
    //             item.rows[i] = splitCells(item.rows[i], colCount, item.rows[i - 1]);
    //           }

    //           // header child tokens
    //           l = item.header.length;
    //           for (j = 0; j < l; j++) {
    //             row = item.header[j];
    //             for (k = 0; k < row.length; k++) {
    //               row[k].tokens = [];
    //               this.lexer.inline(row[k].text, row[k].tokens);
    //             }
    //           }

    //           // cell child tokens
    //           l = item.rows.length;
    //           for (j = 0; j < l; j++) {
    //             row = item.rows[j];
    //             for (k = 0; k < row.length; k++) {
    //               row[k].tokens = [];
    //               this.lexer.inline(row[k].text, row[k].tokens);
    //             }
    //           }
    //           return item;
    //         }
    //       }
    //     },
    //     renderer(token) {
    //       let i, j, row, cell, col, text;
    //       let output = '<div class="overflow-x"><table class="table-auto overflow-scroll w-full">';
    //       output += '<thead>';
    //       for (i = 0; i < token.header.length; i++) {
    //         row = token.header[i];
    //         let col = 0;
    //         output += '<tr>';
    //         for (j = 0; j < row.length; j++) {
    //           cell = row[j];
    //           text = this.parser.parseInline(cell.tokens);
    //           output += getTableCell(text, cell, 'th', token.align[col]);
    //           col += cell.colspan;
    //         }
    //         output += '</tr>';
    //       }
    //       output += '</thead>';
    //       if (token.rows.length) {
    //         output += '<tbody>';
    //         for (i = 0; i < token.rows.length; i++) {
    //           row = token.rows[i];
    //           col = 0;
    //           output += '<tr>';
    //           for (j = 0; j < row.length; j++) {
    //             cell = row[j];
    //             text = this.parser.parseInline(cell.tokens);
    //             output += getTableCell(text, cell, 'td', token.align[col]);
    //             col += cell.colspan;
    //           }
    //           output += '</tr>';
    //         }
    //         output += '</tbody>';
    //       }
    //       output += '</table></div>';
    //       return output;
    //     }
    //   }
    // ]
  };
}

// const getTableCell = (text: string, cell: any, type: string, align: string) => {
//   if (!cell.rowspan) {
//     return '';
//   }
//   const tag = `<${type}`
//     + `${cell.colspan > 1 ? ` colspan=${cell.colspan}` : ''}`
//     + `${cell.rowspan > 1 ? ` rowspan=${cell.rowspan}` : ''}`
//     + `${align ? ` align=${align}` : ''}>`;
//   return `${tag + text}</${type}>\n`;
// };

// const splitCells = (tableRow: any, count: number = 0, prevRow = []) => {
//   const cells = [...tableRow.matchAll(/(?:[^|\\]|\\.?)+(?:\|+|$)/g)].map((x) => x[0]);

//   // Remove first/last cell in a row if whitespace only and no leading/trailing pipe
//   if (!cells[0]?.trim()) { cells.shift(); }
//   if (!cells[cells.length - 1]?.trim()) { cells.pop(); }

//   let numCols = 0;
//   let i, j, trimmedCell, prevCell: any, prevCols: any;

//   for (i = 0; i < cells.length; i++) {
//     trimmedCell = cells[i].split(/\|+$/)[0];
//     cells[i] = {
//       rowspan: 1,
//       colspan: Math.max(cells[i].length - trimmedCell.length, 1),
//       text: trimmedCell.trim().replace(/\\\|/g, '|')
//       // display escaped pipes as normal character
//     };

//     // Handle Rowspan
//     if (trimmedCell.slice(-1) === '^' && prevRow.length) {
//       // Find matching cell in previous row
//       prevCols = 0;
//       for (j = 0; j < prevRow.length; j++) {
//         prevCell = prevRow[j];
//         if ((prevCols === numCols) && (prevCell.colspan === cells[i].colspan)) {
//           // merge into matching cell in previous row (the "target")
//           cells[i].rowSpanTarget = prevCell.rowSpanTarget ?? prevCell;
//           cells[i].rowSpanTarget.text += ` ${cells[i].text.slice(0, -1)}`;
//           cells[i].rowSpanTarget.rowspan += 1;
//           cells[i].rowspan = 0;
//           break;
//         }
//         prevCols += prevCell.colspan;
//         if (prevCols > numCols) { break; }
//       }
//     }

//     numCols += cells[i].colspan;
//   }

//   // Force main cell rows to match header column count
//   if (numCols > count) {
//     cells.splice(count);
//   } else {
//     while (numCols < count) {
//       cells.push({
//         colspan: 1,
//         text: ''
//       });
//       numCols += 1;
//     }
//   }
//   return cells;
// };