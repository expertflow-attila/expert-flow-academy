import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { markdownToInlineHtml } from "@/lib/pdf";

export const metadata = { title: "Audit dokumentum — Expert Flow" };
export const dynamic = "force-dynamic";

export default async function AuditDocumentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: submission } = await supabaseAdmin
    .from("lead_magnet_submissions")
    .select("id, name, generated_markdown, attila_edits, attila_review_status, delivered_at")
    .eq("notion_page_id", `doc-token:${token}`)
    .maybeSingle();

  if (!submission) notFound();

  const finalContent = submission.attila_edits || submission.generated_markdown;
  if (!finalContent) {
    return (
      <html lang="hu">
        <body
          style={{
            margin: 0,
            background: "#1a1a1f",
            color: "#a4a299",
            fontFamily: "Georgia, serif",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontFamily: "Georgia, serif", color: "#e2e0d8" }}>Az audit készül</h1>
          <p>A dokumentumod még nem készült el. 3 munkanapon belül itt lesz. Frissítsd az oldalt később.</p>
        </body>
      </html>
    );
  }

  const contentHtml = markdownToInlineHtml(finalContent);

  return (
    <html lang="hu">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>AI-Működési Audit — {submission.name}</title>
        <style>
          {`
            @media print {
              body { background: #fff !important; color: #000 !important; }
              .no-print { display: none !important; }
              h1, h2, h3 { color: #000 !important; page-break-after: avoid; }
              p, li { color: #333 !important; }
              .doc-card { box-shadow: none !important; border: none !important; }
            }
            * { box-sizing: border-box; }
            body { margin: 0; background: #1a1a1f; color: #a4a299; font-family: Georgia, serif; }
            .doc-wrap { max-width: 760px; margin: 0 auto; padding: 64px 32px; }
            .doc-card { background: #1a1a1f; border: 1px solid #303035; padding: 56px 48px; }
            .doc-header { border-bottom: 1px solid #303035; padding-bottom: 24px; margin-bottom: 32px; }
            .doc-brand { font-family: Georgia, serif; font-style: italic; font-size: 24px; color: #e2e0d8; }
            .doc-subtitle { margin-top: 8px; font-family: "SF Mono", Menlo, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; color: #7e7c74; }
            h1 { font-family: Georgia, serif; font-size: 36px; color: #e2e0d8; margin: 32px 0 16px 0; line-height: 1.2; }
            h2 { font-family: Georgia, serif; font-style: italic; font-size: 24px; color: #c8b9e0; margin: 28px 0 12px 0; }
            h3 { font-family: Helvetica, sans-serif; font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; color: #a4a299; margin: 20px 0 8px 0; }
            p { font-family: Georgia, serif; font-size: 16px; line-height: 1.7; color: #a4a299; margin: 12px 0; }
            ul { margin: 12px 0 12px 24px; padding: 0; }
            li { font-family: Georgia, serif; font-size: 16px; line-height: 1.7; color: #a4a299; margin: 8px 0; }
            blockquote { margin: 16px 0; padding: 12px 20px; border-left: 3px solid #c8b9e0; color: #a4a299; font-style: italic; }
            strong { color: #e2e0d8; }
            em { font-style: italic; color: #c8b9e0; }
            .print-button { display: inline-block; padding: 14px 24px; background: #e2e0d8; color: #1a1a1f; font-family: "SF Mono", monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.22em; text-decoration: none; }
            .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #303035; font-family: "SF Mono", monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.22em; color: #7e7c74; text-align: center; }
          `}
        </style>
      </head>
      <body>
        <div className="doc-wrap">
          <div className="no-print" style={{ marginBottom: 24, textAlign: "right" }}>
            <button
              className="print-button"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              suppressHydrationWarning
            >
              {/* JS-mentes fallback: a böngésző Ctrl+P-vel mindenképp tud nyomtatni. */}
              Nyomtatás → PDF
            </button>
          </div>
          <div className="doc-card">
            <div className="doc-header">
              <div className="doc-brand">Expert Flow</div>
              <div className="doc-subtitle">9 900 Ft Belépő Audit · {submission.name}</div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
            <div className="footer">expertflow.hu · Expert Flow · belépő audit</div>
          </div>
        </div>
      </body>
    </html>
  );
}
