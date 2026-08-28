import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Certificate } from "@/components/Certificate";
import { SiteChrome } from "@/components/SiteChrome";
import { verifyCertificate, type VerifyResult } from "@/lib/blockchainStubs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verify a Certificate - SwabiCert" },
      {
        name: "description",
        content:
          "Verify University of Swabi certificates directly against the blockchain. Tamper-proof academic credential verification.",
      },
      { property: "og:title", content: "Verify a Certificate - SwabiCert" },
      {
        property: "og:description",
        content:
          "Verify University of Swabi certificates directly against the blockchain.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      setCertId(id);
      void runVerify(id);
    }
  }, []);

  async function runVerify(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await verifyCertificate(id);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    await runVerify(certId);
  }

  return (
    <SiteChrome>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Verify a Certificate
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Enter a certificate ID to confirm its authenticity against the
            blockchain record.
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Certificate ID (0x...)"
            className="h-11 flex-1 rounded-lg border border-input bg-card px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify
          </button>
        </form>

        {error && (
          <p className="mx-auto mt-4 max-w-md text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <div className="mx-auto mt-12 max-w-3xl">
            {result.found && result.certificate ? (
              <div>
                <div className="mx-auto max-w-md rounded-xl border border-success/30 bg-card p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-sm font-semibold text-success">
                      Verified
                    </span>
                  </div>
                  <dl className="mt-5 space-y-3">
                    {(
                      [
                        ["Student", result.certificate.studentName],
                        ["Degree", result.certificate.degree],
                        ["Roll Number", result.certificate.rollNumber],
                        ["Year", result.certificate.year],
                        [
                          "Issued",
                          result.certificate.issuedAt ?? "Recorded on chain",
                        ],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="text-right text-sm font-medium text-foreground">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 text-xs text-muted-foreground">
                    Issued by{" "}
                    {result.certificate.issuingUniversity ??
                      "University of Swabi"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Read directly from the blockchain - cannot be altered.
                  </p>
                </div>

                <div className="mt-10 rounded-xl border border-border/70 bg-card/60 p-4">
                  <Certificate
                    data={result.certificate}
                    certificateId={certId}
                  />
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-card p-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">
                    Not Found
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  No certificate with this ID exists on the blockchain. Please
                  check the ID and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SiteChrome>
  );
}
