import React, { useMemo, useRef } from 'react';
import { ListPlus, Sparkles, CheckCircle2, ClipboardPaste, Wand2 } from 'lucide-react';

/**
 * Clean a single requirement line by removing leading list symbols
 * (bullets, hyphens, numbers with dots/brackets, letters with dots/brackets)
 * while safely preserving numerical ranges like "1-2 tahun pengalaman".
 */
export const cleanRequirementLine = (line) => {
  if (!line || typeof line !== 'string') return '';
  let cleaned = line.trim();

  // Strip common bullet characters: •, -, *, +, –, —, ·
  cleaned = cleaned.replace(/^[•\-\*\+–—·]\s*/, '');

  // Strip numbered prefixes like "1. ", "1) ", "1: ", "1 - " (requires whitespace or non-digit to avoid stripping "1-2")
  cleaned = cleaned.replace(/^\d+[\.\)\:]\s*/, '');
  cleaned = cleaned.replace(/^\d+\s*[-–]\s+(?!\d)/, '');

  // Strip lettered prefixes like "a. ", "a) ", "A. ", "A) "
  cleaned = cleaned.replace(/^[a-zA-Z][\.\)]\s*/, '');

  return cleaned.trim();
};

/**
 * Parse raw requirements input (string or array) into an array of clean requirement items.
 */
export const parseRequirements = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .map(item => cleanRequirementLine(typeof item === 'string' ? item : ''))
      .filter(line => line.length > 0);
  }
  if (typeof input !== 'string') return [];

  return input
    .split(/\r?\n/)
    .map(line => cleanRequirementLine(line))
    .filter(line => line.length > 0);
};

/**
 * Format an array or multiline string of requirements into neat bulleted lines.
 */
export const formatRequirementsToText = (reqs) => {
  if (!reqs) return '';
  const list = Array.isArray(reqs) ? reqs : parseRequirements(reqs);
  if (list.length === 0) return '';
  return list.map(item => (item.startsWith('•') ? item : `• ${item}`)).join('\n');
};

export default function RequirementsInput({
  value = '',
  onChange,
  label = 'Persyaratan / Kualifikasi',
  placeholder,
}) {
  const textareaRef = useRef(null);
  const parsedItems = useMemo(() => parseRequirements(value), [value]);

  /**
   * Smart Enter & Backspace behavior:
   * - Enter on empty bullet line (just '• '): exits the list mode (clears the bullet).
   * - Enter on line with content: automatically inserts a new line starting with '• '.
   * - Backspace immediately after empty '• ': deletes both the bullet and space.
   */
  const handleKeyDown = (e) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd } = textarea;

    if (e.key === 'Enter') {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);

      const lastNewLine = before.lastIndexOf('\n');
      const currentLine = lastNewLine === -1 ? before : before.substring(lastNewLine + 1);
      const trimmedLine = currentLine.trim();

      // If current line only contains a bullet symbol or dash, pressing enter exits list mode
      if (trimmedLine === '•' || trimmedLine === '-' || trimmedLine === '*' || trimmedLine === '') {
        const cleanedBefore = lastNewLine === -1 ? '' : before.substring(0, lastNewLine);
        const nextValue = cleanedBefore + (after ? '\n' + after.replace(/^\n/, '') : '');
        onChange(nextValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cleanedBefore.length;
          }
        }, 0);
        return;
      }

      // Automatically add new line with bullet point
      const insertStr = '\n• ';
      const nextValue = before + insertStr + after;
      onChange(nextValue);
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = selectionStart + insertStr.length;
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
        }
      }, 0);
      return;
    }

    // Smart Backspace: if cursor is right after '• ' on a line, delete the whole bullet prefix
    if (e.key === 'Backspace' && selectionStart === selectionEnd) {
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const lastNewLine = before.lastIndexOf('\n');
      const currentLine = lastNewLine === -1 ? before : before.substring(lastNewLine + 1);

      if (currentLine === '• ') {
        e.preventDefault();
        const cleanedBefore = lastNewLine === -1 ? '' : before.substring(0, lastNewLine);
        const nextValue = cleanedBefore + after;
        onChange(nextValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cleanedBefore.length;
          }
        }, 0);
      }
    }
  };

  /**
   * Smart Paste handler:
   * Detects multi-line text or copied bullet/numbered lists from Word, PDF, LinkedIn, Glints, etc.
   * Cleans any existing bullet/number symbols and splits into neatly formatted '• <requirement>' lines.
   */
  const handlePaste = (e) => {
    const pasteText = e.clipboardData?.getData('text/plain') || e.clipboardData?.getData('text');
    if (!pasteText) return;

    // Check if pasted text contains line breaks or looks like a list
    const rawLines = pasteText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const hasMultipleLines = rawLines.length > 1;
    const looksLikeList = rawLines.some(l => /^[•\-\*\+–—·\d\w][\.\)\:\s]/.test(l));

    if (hasMultipleLines || looksLikeList) {
      e.preventDefault();

      // Clean every line using our robust cleaner
      const cleanedLines = rawLines
        .map(line => cleanRequirementLine(line))
        .filter(line => line.length > 0);

      if (cleanedLines.length === 0) return;

      const formattedPaste = cleanedLines.map(line => `• ${line}`).join('\n');

      const textarea = e.target;
      const { selectionStart, selectionEnd } = textarea;
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);

      // Determine needed newlines to seamlessly blend into existing content
      let prefix = '';
      if (before.length > 0 && !before.endsWith('\n')) {
        prefix = '\n';
      }
      let suffix = '';
      if (after.length > 0 && !after.startsWith('\n')) {
        suffix = '\n';
      }

      const nextValue = before + prefix + formattedPaste + suffix + after;
      onChange(nextValue);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = before.length + prefix.length + formattedPaste.length;
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPos;
        }
      }, 0);
    }
  };

  const handleAddBullet = () => {
    if (!value.trim()) {
      onChange('• ');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = 2;
        }
      }, 0);
      return;
    }
    const endsWithNewLine = value.endsWith('\n');
    const nextVal = value + (endsWithNewLine ? '• ' : '\n• ');
    onChange(nextVal);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = nextVal.length;
      }
    }, 0);
  };

  const handleApplyPreset = () => {
    const preset = `• Pendidikan minimal D3 / S1 semua jurusan
• Pengalaman kerja minimal 1-2 tahun di bidang relevan
• Mampu berkomunikasi dengan baik, inisiatif, dan berorientasi hasil
• Mampu bekerja mandiri maupun kolaboratif dalam tim`;
    onChange(preset);
  };

  const handleFormatTidy = () => {
    if (!value.trim()) return;
    const formatted = formatRequirementsToText(value);
    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <label className="block font-semibold text-slate-700 text-xs sm:text-sm">
          {label}
        </label>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleAddBullet}
            className="text-[11px] font-semibold text-teal hover:text-navy bg-teal/10 hover:bg-teal/20 px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="Tambah baris poin baru"
          >
            <ListPlus className="h-3 w-3" />
            <span>+ Poin</span>
          </button>
          <button
            type="button"
            onClick={handleApplyPreset}
            className="text-[11px] font-medium text-slate-600 hover:text-navy bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="Gunakan contoh format persyaratan standar"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Contoh</span>
          </button>
          {parsedItems.length > 0 && (
            <button
              type="button"
              onClick={handleFormatTidy}
              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Rapikan tanda bullet pada setiap baris"
            >
              <Wand2 className="h-3 w-3 text-teal" />
              <span>Rapikan</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            placeholder ||
            `Ketik atau tempel (paste) kualifikasi dari Word/PDF/WhatsApp di sini:\n• Pendidikan minimal D3/S1\n• Pengalaman kerja 1-2 tahun\n• Disiplin dan berintegritas tinggi`
          }
          className="w-full border border-slate-300 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-teal focus:border-teal outline-none font-sans leading-relaxed text-slate-700 min-h-[110px]"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500">
          <ClipboardPaste className="h-3.5 w-3.5 text-teal shrink-0" />
          <span>
            Bisa <strong>paste teks panjang</strong> langsung dipecah otomatis, atau tekan <strong>Enter</strong> untuk poin baru.
          </span>
        </div>
        <span className="font-semibold text-teal inline-flex items-center gap-1 bg-teal/10 border border-teal/20 px-2.5 py-0.5 rounded-full text-[11px]">
          <CheckCircle2 className="h-3 w-3 text-teal" />
          <span>{parsedItems.length} butir kualifikasi</span>
        </span>
      </div>

      {parsedItems.length > 0 && (
        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Pratinjau Hasil Tampilan:</span>
            <span className="text-teal font-semibold capitalize">{parsedItems.length} poin terdeteksi</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 max-h-28 overflow-y-auto pr-1">
            {parsedItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
