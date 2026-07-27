// ════════════════════════════════════════════════════════════════
// divorcerbot · ingest.mjs — accept ANY format, extract text, all on-device
//
// A messy divorce arrives as PDFs (court forms, solicitor letters, Form E), Word docs, screenshots of
// WhatsApp/messages, emails, spreadsheets, photos of documents. This turns all of it into text for the
// analyser — CLIENT-SIDE. The file bytes never leave the browser; only the extraction libraries are
// fetched from a CDN. (If the user then chooses a BYOK provider, the extracted text goes only there.)
//
// The heavy binary extractors (PDF, OCR, .docx) are INJECTED so the routing is testable with no libraries
// present — the browser wires the real ones. Pure helpers (kind detection, cleaning, HTML→text) are here.
// ════════════════════════════════════════════════════════════════

// Map a filename + MIME type to how we should read it. Pure.
export function detectKind(name = '', mime = '') {
  const n = String(name).toLowerCase();
  const m = String(mime).toLowerCase();
  const ext = n.includes('.') ? n.slice(n.lastIndexOf('.') + 1) : '';
  if (m === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (m.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'heic', 'heif'].includes(ext)) return 'image';
  if (m.includes('wordprocessingml') || ext === 'docx') return 'docx';
  if (m === 'text/html' || ['html', 'htm', 'xhtml'].includes(ext)) return 'html';
  if (m.startsWith('text/') || ['txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'eml', 'log', 'vtt', 'srt', 'rtf', 'ics', 'xml', 'yaml', 'yml'].includes(ext)) return 'text';
  if (['doc', 'xls', 'xlsx', 'ppt', 'pptx', 'pages', 'numbers', 'key'].includes(ext)) return 'unsupported-office';
  return 'unknown';
}

// Collapse control chars and runaway whitespace without destroying structure. Pure. Never throws.
export function cleanText(s) {
  if (s == null) return '';
  let t = String(s);
  t = t.replace(/\r\n?/g, '\n');                              // normalise newlines
  t = t.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ');    // strip control chars; keep \t (09) and \n (0A)
  t = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n'); // tidy blank runs
  t = t.replace(/[ \t]{2,}/g, ' ');
  return t.trim();
}

// Strip HTML/emails down to readable text. Pure. Removes script/style, keeps line structure.
export function htmlToText(html) {
  if (html == null) return '';
  let t = String(html);
  t = t.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ');
  t = t.replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*>/gi, '\n');
  t = t.replace(/<[^>]+>/g, ' ');
  t = t.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
       .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(+d); } catch { return ' '; } })
       .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
  return cleanText(t);
}

// Extract text from one file. `x` injects the real (async) extractors; any may be absent (→ helpful note).
// x: { readText(file)->Promise<string>, extractPdf(file)->Promise<string>, extractImage(file)->Promise<string>,
//      extractDocx(file)->Promise<string> }. Returns { name, kind, text, chars, error? } — never rejects.
export async function ingest(file, x = {}) {
  const name = file?.name || 'file';
  const kind = detectKind(name, file?.type);
  const guard = async (label, fn) => {
    if (typeof fn !== 'function') return { name, kind, text: '', chars: 0, error: `${label} extractor unavailable` };
    try {
      const raw = await fn(file);
      const text = kind === 'html' ? htmlToText(raw) : cleanText(raw);
      return { name, kind, text, chars: text.length, ...(text ? {} : { error: 'no text found (a scanned/image PDF may need OCR — save the page as an image and re-add it)' }) };
    } catch (e) { return { name, kind, text: '', chars: 0, error: `could not read ${name}: ${String(e && e.message || e).slice(0, 120)}` }; }
  };
  switch (kind) {
    case 'pdf': return guard('PDF', x.extractPdf);
    case 'image': return guard('image OCR', x.extractImage);
    case 'docx': return guard('Word', x.extractDocx);
    case 'text':
    case 'html': return guard('text', x.readText);
    case 'unsupported-office':
      return { name, kind, text: '', chars: 0, error: `${name}: legacy Office formats (.doc/.xls/.ppt) can't be read in-browser — save/export it as PDF, .docx, or CSV and re-add it.` };
    default:
      // last resort — try to read it as text; if it's binary this yields little, which we flag.
      { const r = await guard('text', x.readText);
        if (!r.error && r.chars < 8) return { ...r, error: `${name}: unrecognised format and no readable text — try exporting it as PDF or text.` };
        return r; }
  }
}

// Combine many ingested results into one labelled corpus for the analyser. Pure.
export function assembleCorpus(results) {
  return (Array.isArray(results) ? results : [])
    .filter(r => r && r.text)
    .map(r => `===== ${r.name} (${r.kind}, ${r.chars} chars) =====\n${r.text}`)
    .join('\n\n');
}

export default { detectKind, cleanText, htmlToText, ingest, assembleCorpus };
