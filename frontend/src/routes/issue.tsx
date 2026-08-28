import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import {
  connectWallet,
  issueCertificate,
  type CertificateData,
  type IssueResult,
} from "@/lib/blockchainStubs";
import { Certificate } from "@/components/Certificate";
import { SiteChrome } from "@/components/SiteChrome";
import { downloadCertificatePdf } from "@/lib/certificatePdf";

export const Route = createFileRoute("/issue")({
  head: () => ({
    meta: [
      { title: "Issue a Certificate — SwabiCert" },
      {
        name: "description",
        content:
          "Issue blockchain-verified academic certificates for University of Swabi graduates.",
      },
      { property: "og:title", content: "Issue a Certificate — SwabiCert" },
      {
        property: "og:description",
        content:
          "Issue blockchain-verified academic certificates for University of Swabi graduates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IssuePage,
});

const emptyForm: CertificateData = {
  studentName: "",
  degree: "",
  rollNumber: "",
  year: "",
};

function IssuePage() {
  const [form, setForm] = useState<CertificateData>(emptyForm);
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [issued, setIssued] = useState<IssueResult | null>(null);
  const [error, setError] = useState("");

  function update(field: keyof CertificateData) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleConnect() {
    setConnecting(true);
    setError("");
    try {
      const address = await connectWallet();
      setWallet(address);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssuing(true);
    setError("");
    try {
      const res = await issueCertificate(form);
      setIssued(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Certificate issuance failed.");
    } finally {
      setIssuing(false);
    }
  }

  async function handleDownload() {
    if (!issued) return;
    setDownloading(true);
    setError("");
    try {
      await downloadCertificatePdf(
        "certificate-template",
        `${form.rollNumber || "certificate"}.pdf`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <SiteChrome>
      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Issue a Certificate
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            Record a new certificate on the blockchain. This action is
            permanent.
          </p>
        </div>

        {!issued ? (
          <form onSubmit={handleIssue} className="mx-auto mt-12 max-w-md">
            <div className="space-y-5">
              {(
                [
                  ["studentName", "Student Full Name", "e.g. Ayesha Khan"],
                  ["degree", "Degree / Program", "e.g. BS Computer Science"],
                  ["rollNumber", "Roll Number", "e.g. UOS-2022-0147"],
                  ["year", "Graduation Year", "e.g. 2026"],
                ] as const
              ).map(([field, label, placeholder]) => (
                <div key={field}>
                  <label
                    htmlFor={field}
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    {label}
                  </label>
                  <input
                    id={field}
                    type="text"
                    required
                    value={form[field]}
                    onChange={update(field)}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-lg border border-input bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting || !!wallet}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-input bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                {wallet ? `Connected · ${wallet}` : "Connect Wallet"}
              </button>
              <button
                type="submit"
                disabled={issuing || !wallet}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {issuing && <Loader2 className="h-4 w-4 animate-spin" />}
                {issuing ? "Issuing…" : "Issue Certificate"}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </form>
        ) : (
          <div className="mx-auto mt-12 max-w-3xl">
            <div className="mx-auto max-w-md rounded-xl border border-success/30 bg-card p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-sm font-semibold text-success">
                  Certificate Issued
                </span>
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
                Certificate ID
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground">
                {issued.certificateId}
              </p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {downloading ? "Preparing PDF..." : "Download Certificate PDF"}
              </button>
              <p className="mt-3 break-all font-mono text-xs text-muted-foreground">
                Tx: {issued.transactionHash}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Record status:{" "}
                {issued.databaseSaved
                  ? "Record saved"
                  : issued.databaseError ?? "Not saved"}
              </p>
            </div>

            {error && (
              <p className="mx-auto mt-4 max-w-md text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-10 rounded-xl border border-border/70 bg-card/60 p-4">
              <Certificate data={form} certificateId={issued.certificateId} />
            </div>
          </div>
        )}
      </div>
    </SiteChrome>
  );
}
