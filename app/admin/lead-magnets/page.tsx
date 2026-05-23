import { redirect } from "next/navigation";
import { Footer, Header, SectionLabel } from "@/components/site-chrome";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isAdminSession } from "@/lib/admin";

export const metadata = { title: "Admin — Lead magnetek" };
export const dynamic = "force-dynamic";

type LMRow = {
  id: string;
  lead_magnet_slug: string;
  name: string;
  email: string;
  attila_review_status: string;
  generated_at: string | null;
  delivered_at: string | null;
  paid_at: string | null;
  payment_amount_huf: number | null;
  lead_score: number | null;
  recommendation: string | null;
  giveaway_total_score: number | null;
  giveaway_category: string | null;
  created_at: string;
};

export default async function AdminLeadMagnetsPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; status?: string }>;
}) {
  if (!(await isAdminSession())) {
    redirect("/login?next=/admin/lead-magnets");
  }

  const params = await searchParams;
  const slugFilter = params?.slug ?? null;
  const statusFilter = params?.status ?? null;

  let query = supabaseAdmin
    .from("lead_magnet_submissions")
    .select(
      "id, lead_magnet_slug, name, email, attila_review_status, generated_at, delivered_at, paid_at, payment_amount_huf, lead_score, recommendation, giveaway_total_score, giveaway_category, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (slugFilter) query = query.eq("lead_magnet_slug", slugFilter);
  if (statusFilter) query = query.eq("attila_review_status", statusFilter);

  const { data: rows } = await query;

  // Aggregate stats
  const { data: stats } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("lead_magnet_slug, attila_review_status, paid_at, generation_cost_huf");

  const byslug: Record<string, { total: number; pending: number; approved: number; paid: number; cost: number }> = {};
  for (const row of stats ?? []) {
    const s = row.lead_magnet_slug as string;
    if (!byslug[s]) byslug[s] = { total: 0, pending: 0, approved: 0, paid: 0, cost: 0 };
    byslug[s].total++;
    if (row.attila_review_status === "pending") byslug[s].pending++;
    if (row.attila_review_status === "approved") byslug[s].approved++;
    if (row.paid_at) byslug[s].paid++;
    byslug[s].cost += Number(row.generation_cost_huf ?? 0);
  }

  return (
    <>
      <Header active="" />
      <main id="main" className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Admin · Lead magnetek</SectionLabel>
          <h1 className="mt-6 font-display text-4xl tracking-tight">Lead magnet submissionok</h1>

          {/* Aggregate stats */}
          <section className="mt-12">
            <h2 className="font-display text-2xl">Statisztika per slug</h2>
            <table className="mt-6 w-full border border-border text-left">
              <thead className="bg-surface">
                <tr>
                  <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Slug</th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Total</th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Pending</th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Approved</th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">Paid</th>
                  <th className="border-b border-border px-4 py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground-soft">AI költség Ft</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byslug)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([slug, s]) => (
                    <tr key={slug} className="border-b border-border text-sm">
                      <td className="px-4 py-3 font-mono text-foreground">{slug}</td>
                      <td className="px-4 py-3 text-foreground-soft">{s.total}</td>
                      <td className="px-4 py-3 text-foreground-soft">{s.pending}</td>
                      <td className="px-4 py-3 text-foreground-soft">{s.approved}</td>
                      <td className="px-4 py-3 text-foreground-soft">{s.paid}</td>
                      <td className="px-4 py-3 text-foreground-soft">{Math.round(s.cost)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>

          {/* Filters */}
          <section className="mt-12">
            <h2 className="font-display text-2xl">Submissionok (utolsó 100)</h2>
            <div className="mt-4 flex flex-wrap gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em]">
              <a href="/admin/lead-magnets" className="border border-border-strong px-3 py-2 text-foreground-soft hover:border-foreground hover:text-foreground">
                Mind
              </a>
              {Object.keys(byslug).map((s) => (
                <a
                  key={s}
                  href={`/admin/lead-magnets?slug=${s}`}
                  className={`border px-3 py-2 ${slugFilter === s ? "border-foreground bg-foreground text-background" : "border-border-strong text-foreground-soft hover:border-foreground hover:text-foreground"}`}
                >
                  {s}
                </a>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 font-mono text-[0.65rem] uppercase tracking-[0.22em]">
              {["pending", "approved", "edited", "auto-released", "rejected"].map((st) => (
                <a
                  key={st}
                  href={`/admin/lead-magnets?status=${st}${slugFilter ? `&slug=${slugFilter}` : ""}`}
                  className={`border px-3 py-2 ${statusFilter === st ? "border-foreground bg-foreground text-background" : "border-border-strong text-foreground-soft hover:border-foreground hover:text-foreground"}`}
                >
                  {st}
                </a>
              ))}
            </div>

            <table className="mt-6 w-full border border-border text-left text-xs">
              <thead className="bg-surface">
                <tr>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Idő</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Slug</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Név / Email</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Status</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Score / Reco</th>
                  <th className="border-b border-border px-3 py-2 font-mono uppercase tracking-[0.18em] text-foreground-soft">Action</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).map((r: LMRow) => (
                  <tr key={r.id} className="border-b border-border align-top">
                    <td className="px-3 py-3 font-mono text-foreground-muted">
                      {new Date(r.created_at).toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-3 py-3 font-mono text-[0.65rem] text-foreground">{r.lead_magnet_slug}</td>
                    <td className="px-3 py-3 text-foreground-soft">
                      <div>{r.name}</div>
                      <div className="text-foreground-muted">{r.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.attila_review_status} />
                      {r.paid_at && (
                        <div className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--color-accent-violet,#c8b9e0)]">
                          PAID {r.payment_amount_huf} Ft
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-foreground-soft">
                      {r.lead_score != null && <div>Score: {r.lead_score}</div>}
                      {r.recommendation && <div className="font-mono text-[0.55rem]">→ {r.recommendation}</div>}
                      {r.giveaway_total_score != null && <div>Giveaway: {r.giveaway_total_score} ({r.giveaway_category})</div>}
                    </td>
                    <td className="px-3 py-3">
                      <a href={`/admin/lead-magnets/${r.id}`} className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-foreground hover:text-foreground-soft">
                        Megnyit →
                      </a>
                    </td>
                  </tr>
                ))}
                {(rows ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-foreground-muted">
                      Nincs adat a szűrésre.
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

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "approved"
      ? "var(--color-accent-violet, #c8b9e0)"
      : status === "rejected"
      ? "var(--color-accent-rose, #e8a4b5)"
      : status === "pending"
      ? "#a4a299"
      : "#7e7c74";
  return (
    <span
      className="font-mono text-[0.55rem] uppercase tracking-[0.18em]"
      style={{ color }}
    >
      {status}
    </span>
  );
}
