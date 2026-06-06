"use client";

import { useState } from "react";

// Prompt vágólapra másolása a lecke-oldalon. A prompt szövegét közvetlenül kapja
// (nem DOM-ból olvas), hogy a sanitizálatlan, pontos szöveg kerüljön a vágólapra.
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={copy} className={className} aria-live="polite">
      {copied ? "Másolva ✓" : "Másol"}
    </button>
  );
}
