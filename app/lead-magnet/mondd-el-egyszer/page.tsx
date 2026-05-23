import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ConsentFields,
  ErrorBox,
  FormField,
  FormTextarea,
  GdprFooter,
  SubmitButton,
} from "../_components/lm-form";

export const metadata = {
  title: "Mondd el egyszer — Solo Business",
  description:
    "Mondd el egyszer hangban, szövegben vagy Loom-link formájában, hogyan működik most a vállalkozásod. Visszakapsz egy egyszerű, magyarul leírt rendszer-térképet azzal hogy hol érdemes először AI-folyamatot bevezetned.",
};

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB — OpenAI Whisper limit
const ALLOWED_AUDIO_MIMES = ["audio/mpeg", "audio/mp4", "audio/webm", "audio/wav", "audio/x-m4a", "audio/aac"];

export default async function LMSayItOncePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; utm_source?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const utmSource = params?.utm_source;

  async function submitForm(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const inputType = String(formData.get("input_type") ?? "text").trim();
    const textInput = String(formData.get("text_input") ?? "").trim();
    const loomUrl = String(formData.get("loom_url") ?? "").trim();
    const audioFile = formData.get("audio_file");
    const marketingConsent = formData.get("marketing_consent") === "on";
    const shareAnonymized = formData.get("share_anonymized") !== "off";
    const utm = String(formData.get("utm_source") ?? "").trim() || null;

    if (!name || name.length < 2) redirect("/lead-magnet/mondd-el-egyszer?error=name");
    if (!email || !email.includes("@")) redirect("/lead-magnet/mondd-el-egyszer?error=email");
    if (!["text", "audio", "loom"].includes(inputType)) redirect("/lead-magnet/mondd-el-egyszer?error=type");

    // Validate the selected input
    if (inputType === "text" && textInput.length < 200) {
      redirect("/lead-magnet/mondd-el-egyszer?error=text-short");
    }
    if (inputType === "loom") {
      if (!loomUrl || !loomUrl.startsWith("https://")) {
        redirect("/lead-magnet/mondd-el-egyszer?error=loom-url");
      }
      if (!loomUrl.includes("loom.com") && !loomUrl.includes("zoom.us") && !loomUrl.includes("vimeo.com")) {
        redirect("/lead-magnet/mondd-el-egyszer?error=loom-url");
      }
    }
    if (inputType === "audio") {
      if (!(audioFile instanceof File)) redirect("/lead-magnet/mondd-el-egyszer?error=no-audio");
      if (audioFile.size > MAX_AUDIO_BYTES) redirect("/lead-magnet/mondd-el-egyszer?error=audio-too-large");
      if (audioFile.size < 1024) redirect("/lead-magnet/mondd-el-egyszer?error=audio-too-small");
      if (!ALLOWED_AUDIO_MIMES.includes(audioFile.type)) {
        redirect("/lead-magnet/mondd-el-egyszer?error=audio-format");
      }
    }

    const hdrs = await headers();
    const ip = getClientIp(hdrs);
    const userAgent = hdrs.get("user-agent") ?? null;

    const ipCheck = await checkRateLimit(`lm-ip:${ip}`, 3, 60 * 60);
    const emailCheck = await checkRateLimit(`lm-email:${email}`, 2, 60 * 60);
    if (!ipCheck.allowed || !emailCheck.allowed) {
      redirect("/lead-magnet/mondd-el-egyszer?error=too-many");
    }

    // Upload audio to Supabase Storage if present
    let rawInputStorageUrl: string | null = null;
    if (inputType === "audio" && audioFile instanceof File) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const ext = audioFile.name.split(".").pop()?.toLowerCase() ?? "webm";
      const fileName = `lm3/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadErr } = await supabaseAdmin.storage
        .from("lead-magnet-audio")
        .upload(fileName, audioBuffer, {
          contentType: audioFile.type,
          upsert: false,
        });

      if (uploadErr) {
        console.error("[lm/mondd-el-egyszer] storage upload error", uploadErr);
        redirect("/lead-magnet/mondd-el-egyszer?error=upload");
      }
      rawInputStorageUrl = fileName; // bucket-relative path, signed URL-lel olvasható később
    }

    const { data, error: dbErr } = await supabaseAdmin
      .from("lead_magnet_submissions")
      .insert({
        lead_magnet_slug: "mondd-el-egyszer",
        name,
        email,
        marketing_consent: marketingConsent,
        share_anonymized: shareAnonymized,
        payload: inputType === "text" ? { transcript: textInput, source: "text-direct" } : {},
        raw_input_type: inputType,
        raw_input_storage_url: inputType === "audio" ? rawInputStorageUrl : inputType === "loom" ? loomUrl : null,
        raw_input_transcript: inputType === "text" ? textInput : null,
        attila_review_status: "pending",
        client_ip: ip,
        user_agent: userAgent,
        utm_source: utm,
      })
      .select("id")
      .single();

    if (dbErr || !data) {
      console.error("[lm/mondd-el-egyszer] insert error", dbErr);
      redirect("/lead-magnet/mondd-el-egyszer?error=server");
    }

    // Az audio/loom esetén a process-pending cron először lefuttatja a Whisper-t,
    // majd onnan ugyanaz a folyamat mint a text esetében.
    redirect(`/lead-magnet/mondd-el-egyszer/koszonom?id=${data.id}&type=${inputType}`);
  }

  return (
    <>
      <Header active="" />
      <main id="main">
        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SectionLabel>Lead Magnet · A legkisebb energia</SectionLabel>
            <h1 className="mt-6 font-display text-5xl tracking-tight md:text-6xl">
              Mondd el <em className="italic em-violet">egyszer</em> — én rendszerré alakítom.
            </h1>
            <p className="mt-8 font-sans text-base leading-relaxed text-foreground-soft md:text-lg">
              Hangban, szövegben vagy egy Loom-linkben mesélj el 2-3 percben hogyan dolgozol most. Visszakapsz egy egyszerű, magyarul leírt rendszer-térképet — hogy így működsz most, itt nehéz neked, ezeket lehetne egyszerűsíteni, és melyik az első javasolt lépés.
            </p>
            <p className="mt-6 font-sans text-sm leading-relaxed text-foreground-muted">
              Nincs űrlap-tölögetés. Nincs gondolkodási teher. Te elmondod egyszer, én lefordítom.
            </p>

            <ul className="mt-10 space-y-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
              <li>→ Audio: 2-3 perc felvétel (mp3, m4a, webm — max 25 MB)</li>
              <li>→ Vagy szöveg: 200-4000 karakter (kb. 5-10 mondat)</li>
              <li>→ Vagy Loom: oszd meg a videód linkjét</li>
              <li>→ 3 munkanapon belül kapsz egy strukturált rendszer-térképet</li>
              <li>→ ZERO technikai szó a kimenetben</li>
            </ul>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Válassz módot</SectionLabel>

            {error === "name" && <ErrorBox>A neved 2 karakter feletti legyen.</ErrorBox>}
            {error === "email" && <ErrorBox>Add meg az e-mail címed.</ErrorBox>}
            {error === "type" && <ErrorBox>Válassz egy input-módot (audio / szöveg / Loom).</ErrorBox>}
            {error === "text-short" && <ErrorBox>A szöveg legalább 200 karakter legyen (kb. 5 mondat).</ErrorBox>}
            {error === "no-audio" && <ErrorBox>Tölts fel egy audio fájlt vagy válassz másik módot.</ErrorBox>}
            {error === "audio-too-large" && <ErrorBox>Az audio fájl max 25 MB lehet. Tömörítsd vagy vágd rövidebbre.</ErrorBox>}
            {error === "audio-too-small" && <ErrorBox>Az audio fájl üres vagy túl kicsi.</ErrorBox>}
            {error === "audio-format" && <ErrorBox>Csak mp3, m4a, wav, webm formátum elfogadott.</ErrorBox>}
            {error === "loom-url" && <ErrorBox>Adj meg egy Loom, Vimeo vagy Zoom link-et.</ErrorBox>}
            {error === "upload" && <ErrorBox>Hiba a fájl feltöltésnél. Próbáld újra.</ErrorBox>}
            {error === "too-many" && <ErrorBox>Túl sok kitöltés. Próbáld meg 1 óra múlva.</ErrorBox>}
            {error === "server" && <ErrorBox>Szerver hiba — pár perc múlva próbáld újra.</ErrorBox>}

            <form action={submitForm} encType="multipart/form-data" className="mt-10 space-y-8">
              <FormField label="Mi a neved?" name="name" type="text" autoComplete="name" required minLength={2} />
              <FormField label="E-mail címed" name="email" type="email" autoComplete="email" required />

              <div>
                <span className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">
                  Milyen módon mesélsz el?
                </span>
                <div className="mt-4 space-y-4">
                  <label className="flex cursor-pointer items-start gap-3 border border-border-strong p-4">
                    <input type="radio" name="input_type" value="text" defaultChecked className="mt-1 h-4 w-4" />
                    <div>
                      <span className="font-sans text-base text-foreground">Szöveg (legegyszerűbb)</span>
                      <p className="mt-1 font-sans text-sm text-foreground-muted">
                        5-10 mondat: honnan jönnek az érdeklődők, mi az első dolog amit csinálsz, mit utálsz benne.
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 border border-border-strong p-4">
                    <input type="radio" name="input_type" value="audio" className="mt-1 h-4 w-4" />
                    <div>
                      <span className="font-sans text-base text-foreground">Hangfelvétel (preferált — legkisebb energia)</span>
                      <p className="mt-1 font-sans text-sm text-foreground-muted">
                        Vedd fel telefonnal vagy laptoppal, 2-3 perc. mp3/m4a/wav/webm, max 25 MB.
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 border border-border-strong p-4">
                    <input type="radio" name="input_type" value="loom" className="mt-1 h-4 w-4" />
                    <div>
                      <span className="font-sans text-base text-foreground">Loom / Vimeo / Zoom link</span>
                      <p className="mt-1 font-sans text-sm text-foreground-muted">
                        Ha már van egy meglévő bemutatkozó videód, oszd meg a publikus linket.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <FormTextarea
                label="Szöveg (ha szöveg módot választottál)"
                hint="Mesélj el 5-10 mondatban: honnan jön egy érdeklődő, mit csinálsz először, mi a következő lépés, mit utálsz a folyamatban. Nincs jó vagy rossz válasz, csak meséld el."
                name="text_input"
                rows={8}
                minLength={0}
                maxLength={4000}
              />

              <div>
                <label
                  htmlFor="audio_file"
                  className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
                >
                  Hangfájl (ha audio módot választottál)
                </label>
                <p className="mt-2 font-sans text-sm text-foreground-muted">
                  Vedd fel a telefonod hangrögzítőjével vagy a QuickTime Player-rel. mp3, m4a, wav, webm. Max 25 MB.
                </p>
                <input
                  type="file"
                  name="audio_file"
                  id="audio_file"
                  accept="audio/mpeg,audio/mp4,audio/webm,audio/wav,audio/x-m4a,audio/aac"
                  className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-sm text-foreground"
                />
              </div>

              <FormField
                label="Loom / Vimeo / Zoom link (ha link módot választottál)"
                name="loom_url"
                type="url"
                placeholder="https://www.loom.com/share/..."
              />

              <input type="hidden" name="utm_source" value={utmSource ?? ""} />

              <ConsentFields />
              <SubmitButton label="Küldöm — rendszerré alakítod" />
              <GdprFooter />
            </form>
          </div>
        </section>

        <section className="border-b border-border py-24 md:py-32">
          <div className="mx-auto max-w-2xl px-6 lg:px-10">
            <SectionLabel>Mit kapsz</SectionLabel>
            <ul className="mt-8 space-y-4 font-sans text-base leading-relaxed text-foreground-soft">
              <li>1 — „Így működsz most" — strukturált összefoglaló a saját szavaiddal</li>
              <li>2 — „Itt nehéz most neked" — 3 fájdalompont idézettel</li>
              <li>3 — „Ezeket lehetne egyszerűsíteni" — 2-3 konkrét javaslat</li>
              <li>4 — „Az első javasolt lépés" — egyetlen dolog amit elsőre érdemes</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
