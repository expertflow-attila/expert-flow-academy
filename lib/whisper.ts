// OpenAI Whisper API wrapper — LM3 "mondd-el-egyszer" voice/loom input.
//
// Bemenet: audio fájl (Buffer, .mp3/.m4a/.webm/.wav)
// Kimenet: magyar nyelvű transzkript + cost
//
// Ha az ANTHROPIC stack-en belül akarjuk tartani: később lecserélhető magyar
// Whisper-large-v3 önhostolt verzióra a Hostinger VPS-en. Most az OpenAI API
// használata a gyorsabb út.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Whisper-1 ár (2026-05): $0.006 / perc. 1 USD ≈ 360 Ft.
const COST_PER_MINUTE_HUF = 0.006 * 360; // ~2.16 Ft / perc

export type TranscribeResult = {
  text: string;
  durationSeconds: number;
  costHuf: number;
};

export async function transcribeAudio(params: {
  audio: Buffer;
  filename: string;
  mimeType: string;
}): Promise<TranscribeResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY nincs beállítva — a Whisper transzkripció nem fut");
  }

  const form = new FormData();
  const blob = new Blob([params.audio as unknown as BlobPart], { type: params.mimeType });
  form.append("file", blob, params.filename);
  form.append("model", "whisper-1");
  form.append("language", "hu");
  form.append("response_format", "verbose_json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Whisper API HTTP ${response.status}: ${detail.slice(0, 200)}`);
  }

  const json = (await response.json()) as { text: string; duration?: number };
  const durationSeconds = json.duration ?? 0;
  const costHuf = (durationSeconds / 60) * COST_PER_MINUTE_HUF;

  return {
    text: json.text ?? "",
    durationSeconds,
    costHuf: Math.round(costHuf * 10000) / 10000,
  };
}

// Loom URL → audio download → transcript.
// A Loom publikus URL-jéből egy yt-dlp-szerű hívással tudjuk az audiót kiszedni,
// de mivel a Vercel function-ben yt-dlp nehézkes, EHELYETT a Loom oEmbed API-jából
// kérjük le a video_url-t, majd közvetlenül fetch-elés. Ez csak public Loom-okra
// működik.
//
// MEGJEGYZÉS: A Loom esetén EGYELŐRE manuálisan kell az ügyfélnek megosztania a videót,
// és Attila kézzel készít transzkriptet. Ez egy V2 feladat — most a Whisper csak
// audio file upload-ra működik. A Loom URL-t csak rögzítjük.

export async function transcribeLoomUrl(_loomUrl: string): Promise<TranscribeResult> {
  // Placeholder — Loom audio kinyerés a Vercel-en bonyolult (yt-dlp natív).
  // Megoldás: a Hostinger VPS-en futó hermes-reception egy /transcribe-loom
  // endpoint-tal, ami yt-dlp + Whisper-rel feldolgozza.
  // Most a submission rögzíti a URL-t, Attila kézzel transzkripti.
  throw new Error(
    "Loom URL transzkripció jelenleg manuális — a hostinger VPS-en futó hermes-reception bővítése szükséges.",
  );
}
