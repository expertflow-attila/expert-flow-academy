// Megosztott form komponensek a lead magnet oldalakhoz.
// A Wave 4 oldalakon (ai-mukodesi-terkep, ai-folyamatvazlat-48h, ugyfelut-audit)
// még inline FormField/FormTextarea van — azokat nem migráljuk át, de minden új
// LM oldal (Wave 5) innen importálja.

import type React from "react";

export function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 border border-[var(--color-accent-rose)] bg-surface px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-[var(--color-accent-rose)]">
      {children}
    </div>
  );
}

export function FormField({
  label,
  name,
  type,
  autoComplete,
  required,
  minLength,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
      />
    </div>
  );
}

export function FormTextarea({
  label,
  hint,
  name,
  rows,
  required,
  minLength,
  maxLength,
  defaultValue,
}: {
  label: string;
  hint?: string;
  name: string;
  rows: number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft"
      >
        {label}
      </label>
      {hint && <p className="mt-2 font-sans text-sm leading-relaxed text-foreground-muted">{hint}</p>}
      <textarea
        name={name}
        id={name}
        rows={rows}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        defaultValue={defaultValue}
        className="mt-3 w-full border border-border-strong bg-background px-4 py-4 font-sans text-base leading-relaxed text-foreground placeholder:text-foreground-dim focus:border-foreground focus:outline-none"
      />
    </div>
  );
}

export function FormRadioGroup({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">{label}</span>
      <div className="mt-3 space-y-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-start gap-3">
            <input
              type="radio"
              name={name}
              value={opt.value}
              required={required}
              defaultChecked={defaultValue === opt.value}
              className="mt-1 h-4 w-4 border border-border-strong"
            />
            <span className="font-sans text-sm leading-relaxed text-foreground-soft">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function FormCheckboxGroup({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">{label}</span>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              className="mt-1 h-4 w-4 border border-border-strong"
            />
            <span className="font-sans text-sm leading-relaxed text-foreground-soft">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ConsentFields() {
  return (
    <fieldset className="space-y-3 border-t border-border pt-8">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="marketing_consent"
          defaultChecked
          className="mt-1 h-4 w-4 border border-border-strong"
        />
        <span className="font-sans text-sm leading-relaxed text-foreground-soft">
          Iratkozz fel a 41 leveles ingyenes Solo Business hírlevélre — heti 1-2 e-mail, semmi kemény eladás. Bármikor leiratkozhatsz.
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="share_anonymized"
          defaultChecked
          className="mt-1 h-4 w-4 border border-border-strong"
        />
        <span className="font-sans text-sm leading-relaxed text-foreground-soft">
          A térképedből anonimizálva tanulhatok és megoszthatok mintázatokat. Nincs név vagy e-mail az anyagban.
        </span>
      </label>
    </fieldset>
  );
}

export function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="hover-arrow group w-full border border-foreground bg-foreground px-6 py-4 font-mono text-xs uppercase tracking-[0.22em] text-background transition-colors hover:bg-transparent hover:text-foreground"
    >
      {label} <span className="arrow">→</span>
    </button>
  );
}

export function GdprFooter() {
  return (
    <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-muted">
      Az adataidat csak a kért anyag elkészítéséhez és (ha bejelölted) a hírlevélhez használjuk. 30 napon belül törölhető, írj a hello@solobusiness.hu-ra.
    </p>
  );
}
