import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminSession } from "@/lib/admin";

export const metadata = { title: "Admin — 9 900 Ft Audit állapot" };
export const dynamic = "force-dynamic";

const LAUNCH_DATE = "2026-05-23";
const LIMIT = 30;

export default async function Audit9900StatusPage() {
  if (!(await isAdminSession())) {
    redirect("/login?next=/admin/audit-9900-status");
  }

  const { data: paid } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, email, paid_at, payment_amount_huf, attila_review_status, generated_at, delivered_at, post_payment_questionnaire_completed_at, redemption_used, redemption_eligible_until, lead_source")
    .eq("lead_magnet_slug", "auditprogram-9900")
    .not("paid_at", "is", null)
    .order("paid_at", { ascending: false });

  const rows = paid ?? [];
  const sold = rows.length;
  const remaining = Math.max(0, LIMIT - sold);

  const waitingForQuestionnaire = rows.filter((r) => !r.post_payment_questionnaire_completed_at).length;
  const waitingForAuditGeneration = rows.filter((r) => r.post_payment_questionnaire_completed_at && !r.generated_at).length;
  const pendingReview = rows.filter((r) => r.generated_at && r.attila_review_status === "pending").length;
  const delivered = rows.filter((r) => r.delivered_at).length;
  const totalRevenue = rows.reduce((sum, r) => sum + (r.payment_amount_huf ?? 0), 0);
  const redemptions = rows.filter((r) => r.redemption_used).length;

  return (
    <>
      <Header active="" />
      <main id="main" className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>Admin · 9 900 Ft Belépő Audit</SectionLabel>
          <h1 className="mt-6 font-display text-4xl tracking-tight">Audit állapot</h1>

          <section className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <Stat label="Elkelt" value={`${sold} / ${LIMIT}`} sub={`${remaining} hely még`} />
            <Stat label="Bevétel" value={`${totalRevenue.toLocaleString("hu-HU")} Ft`} sub="kampánystart óta" />
            <Stat label="Beszámítások" value={`${redemptions}`} sub="→ 359k továbblépés" />
            <Stat label="Heti átlag" value="0" sub="utolsó 7 nap" />
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl">Pipeline állapot</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <PipelineCard label="Kérdőív kitöltésre vár" value={waitingForQuestionnaire} />
              <PipelineCard label="AI-audit készítésre vár" value={waitingForAuditGeneration} />
              <PipelineCard label="Reviewra vár" value={pendingReview} highlight />
              <PipelineCard label="Kiküldve" value={delivered} />
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl">Vásárlók</h2>
            <table className="mt-6 w-full border border-border text-left text-xs">
              <thead className="bg-surface">
                <tr>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Fizetés</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Név / Email</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Variáns</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Kérdőív</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">AI audit</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Kézbesítve</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Redeem</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="px-3 py-3 font-mono text-foreground-muted">
                      {r.paid_at && new Date(r.paid_at).toLocaleString("hu-HU", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-3 py-3 text-foreground-soft">
                      <div>{r.name}</div>
                      <div className="text-foreground-muted">{r.email}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[0.55rem] text-foreground">{r.lead_source ?? "—"}</td>
                    <td className="px-3 py-3 text-foreground-soft">{r.post_payment_questionnaire_completed_at ? "✓" : "—"}</td>
                    <td className="px-3 py-3 text-foreground-soft">{r.generated_at ? "✓" : "—"}</td>
                    <td className="px-3 py-3 text-foreground-soft">{r.delivered_at ? "✓" : "—"}</td>
                    <td className="px-3 py-3 text-foreground-soft">
                      {r.redemption_used ? "✓" : r.redemption_eligible_until && new Date(r.redemption_eligible_until) > new Date() ? "vár" : "lejárt"}
                    </td>
                    <td className="px-3 py-3">
                      <a href={`/admin/lead-magnets/${r.id}`} className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground hover:text-foreground-soft">
                        Megnyit →
                      </a>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-foreground-muted">
                      Még senki nem vette meg.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border p-6">
      <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">{label}</div>
      <div className="mt-2 font-display text-3xl tracking-tight">{value}</div>
      <div className="mt-1 font-sans text-xs text-foreground-soft">{sub}</div>
    </div>
  );
}

function PipelineCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`border p-6 ${highlight && value > 0 ? "border-foreground bg-surface" : "border-border-strong"}`}>
      <div className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-foreground-muted">{label}</div>
      <div className="mt-2 font-display text-3xl tracking-tight">{value}</div>
    </div>
  );
}
