const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
        AlignmentType, PageNumber, BorderStyle, WidthType, ShadingType,
        VerticalAlign, HeadingLevel } = require('docx');
const fs = require('fs');

// Read the markdown file
const mdContent = fs.readFileSync('C:/Users/gmmou/Desktop/VERSOTECH/Versotech/docs/COMPLETE_DATA_MODEL_REFERENCE.md', 'utf8');

// Border style for tables
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

// Parse markdown content into structured elements
function parseMarkdown(content) {
  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBlockContent = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        elements.push({ type: 'code', content: codeBlockContent.join('\n') });
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle tables - check if line starts with | (trimmed)
    if (trimmedLine.startsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      // Skip separator lines (|---|---|)
      if (trimmedLine.match(/^\|[\s\-:|]+\|?$/)) {
        continue;
      }
      const cells = trimmedLine.split('|').filter((c, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
      if (cells.length > 0) {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      // End table
      if (tableRows.length > 0) {
        elements.push({ type: 'table', rows: tableRows });
      }
      inTable = false;
      tableRows = [];
    }

    // Handle headings
    if (trimmedLine.startsWith('# ')) {
      elements.push({ type: 'h1', content: trimmedLine.substring(2).trim() });
    } else if (trimmedLine.startsWith('## ')) {
      elements.push({ type: 'h2', content: trimmedLine.substring(3).trim() });
    } else if (trimmedLine.startsWith('### ')) {
      elements.push({ type: 'h3', content: trimmedLine.substring(4).trim() });
    } else if (trimmedLine.startsWith('#### ')) {
      elements.push({ type: 'h4', content: trimmedLine.substring(5).trim() });
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      elements.push({ type: 'bullet', content: trimmedLine.substring(2).trim() });
    } else if (trimmedLine.match(/^\d+\.\s/)) {
      elements.push({ type: 'numbered', content: trimmedLine.replace(/^\d+\.\s/, '').trim() });
    } else if (trimmedLine === '---') {
      elements.push({ type: 'hr' });
    } else if (trimmedLine === '') {
      if (elements.length > 0 && elements[elements.length - 1].type !== 'break') {
        elements.push({ type: 'break' });
      }
    } else {
      elements.push({ type: 'paragraph', content: trimmedLine });
    }
  }

  // Handle any remaining table
  if (inTable && tableRows.length > 0) {
    elements.push({ type: 'table', rows: tableRows });
  }

  return elements;
}

// Convert parsed elements to docx children
function elementsToDocx(elements) {
  const children = [];
  let bulletNumber = 0;

  for (const el of elements) {
    switch (el.type) {
      case 'h1':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          children: [new TextRun({ text: el.content, bold: true, size: 36, color: "1a365d" })]
        }));
        break;

      case 'h2':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: el.content, bold: true, size: 28, color: "2c5282" })]
        }));
        break;

      case 'h3':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: el.content, bold: true, size: 24, color: "2b6cb0" })]
        }));
        break;

      case 'h4':
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 150, after: 80 },
          children: [new TextRun({ text: el.content, bold: true, size: 22, color: "3182ce" })]
        }));
        break;

      case 'paragraph':
        children.push(new Paragraph({
          spacing: { after: 120 },
          children: parseInlineFormatting(el.content)
        }));
        break;

      case 'bullet':
        children.push(new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: parseInlineFormatting(el.content)
        }));
        break;

      case 'numbered':
        bulletNumber++;
        children.push(new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${bulletNumber}. `, bold: true }),
            ...parseInlineFormatting(el.content)
          ]
        }));
        break;

      case 'code':
        const codeLines = el.content.split('\n');
        for (const codeLine of codeLines) {
          children.push(new Paragraph({
            spacing: { after: 0 },
            shading: { fill: "f5f5f5" },
            indent: { left: 360 },
            children: [new TextRun({ text: codeLine || ' ', font: "Consolas", size: 18, color: "333333" })]
          }));
        }
        children.push(new Paragraph({ spacing: { after: 120 } }));
        break;

      case 'table':
        if (el.rows.length > 0) {
          const numCols = Math.max(...el.rows.map(r => r.length));
          const colWidth = Math.floor(9360 / numCols);

          const tableRows = el.rows.map((row, rowIndex) => {
            // Pad row if needed
            while (row.length < numCols) row.push('');

            return new TableRow({
              tableHeader: rowIndex === 0,
              children: row.map(cell => {
                const isHeader = rowIndex === 0;
                return new TableCell({
                  borders: cellBorders,
                  shading: isHeader ? { fill: "2c5282", type: ShadingType.CLEAR } : undefined,
                  verticalAlign: VerticalAlign.CENTER,
                  width: { size: colWidth, type: WidthType.DXA },
                  children: [new Paragraph({
                    spacing: { before: 40, after: 40 },
                    children: parseInlineFormatting(cell, isHeader)
                  })]
                });
              })
            });
          });

          children.push(new Table({
            columnWidths: Array(numCols).fill(colWidth),
            rows: tableRows
          }));
          children.push(new Paragraph({ spacing: { after: 200 } }));
        }
        break;

      case 'hr':
        children.push(new Paragraph({
          spacing: { before: 100, after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } }
        }));
        break;

      case 'break':
        break;
    }
  }

  return children;
}

// Parse inline formatting like **bold**, `code`, etc.
function parseInlineFormatting(text, isTableHeader = false) {
  const runs = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      runs.push(new TextRun({ text: boldMatch[1], bold: true, size: isTableHeader ? 18 : 22, color: isTableHeader ? "FFFFFF" : undefined }));
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }

    // Check for inline code `text`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      runs.push(new TextRun({ text: codeMatch[1], font: "Consolas", size: isTableHeader ? 16 : 20, color: isTableHeader ? "FFFFFF" : "c7254e" }));
      remaining = remaining.substring(codeMatch[0].length);
      continue;
    }

    // Check for italic *text* or _text_
    const italicMatch = remaining.match(/^[*_]([^*_]+)[*_]/);
    if (italicMatch) {
      runs.push(new TextRun({ text: italicMatch[1], italics: true, size: isTableHeader ? 18 : 22, color: isTableHeader ? "FFFFFF" : undefined }));
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }

    // Find next special character
    const nextSpecial = remaining.search(/[*`_]/);
    if (nextSpecial === -1) {
      runs.push(new TextRun({ text: remaining, size: isTableHeader ? 18 : 22, bold: isTableHeader, color: isTableHeader ? "FFFFFF" : undefined }));
      break;
    } else if (nextSpecial === 0) {
      runs.push(new TextRun({ text: remaining[0], size: isTableHeader ? 18 : 22, bold: isTableHeader, color: isTableHeader ? "FFFFFF" : undefined }));
      remaining = remaining.substring(1);
    } else {
      runs.push(new TextRun({ text: remaining.substring(0, nextSpecial), size: isTableHeader ? 18 : 22, bold: isTableHeader, color: isTableHeader ? "FFFFFF" : undefined }));
      remaining = remaining.substring(nextSpecial);
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: text, size: isTableHeader ? 18 : 22, bold: isTableHeader, color: isTableHeader ? "FFFFFF" : undefined })];
}

// Create the document
const elements = parseMarkdown(mdContent);
const contentChildren = elementsToDocx(elements);

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 }
      }
    }
  },
  sections: [{
    properties: {
      page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "VERSO Holdings - Data Model Reference", size: 18, color: "666666" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", size: 18 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
            new TextRun({ text: " of ", size: 18 }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
            new TextRun({ text: "  |  Confidential", size: 18, color: "666666" })
          ]
        })]
      })
    },
    children: contentChildren
  }]
});

// Generate the document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:/Users/gmmou/Desktop/VERSOTECH/Versotech/docs/VERSO_Data_Model_Reference.docx', buffer);
  console.log('Document created successfully!');
  console.log(`Parsed ${elements.length} elements from markdown`);
  console.log(`Generated ${contentChildren.length} DOCX elements`);

  // Count by type
  const counts = {};
  elements.forEach(el => { counts[el.type] = (counts[el.type] || 0) + 1; });
  console.log('Element breakdown:', counts);
}).catch(err => {
  console.error('Error generating document:', err);
});
