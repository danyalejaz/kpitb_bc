import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import {
  getCertificateRecords,
  type CertificateRecord,
} from "@/lib/supabase";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Certificate History - SwabiCert" },
      {
        name: "description",
        content:
          "Review issued University of Swabi certificates recorded in the database.",
      },
    ],
  }),
  component: HistoryPage,
});

function shortHash(value: string) {
  return value.length > 16 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString();
}

function HistoryPage() {
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function loadRecords() {
      setLoading(true);
      setError("");
      const result = await getCertificateRecords();
      setRecords(result.records);
      setError(result.error ?? "");
      setLoading(false);
    }

    void loadRecords();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return records;

    return records.filter((record) =>
      [
        record.student_name,
        record.roll_number,
        record.degree,
        record.certificate_id,
        record.transaction_hash,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [query, records]);

  return (
    <SiteChrome>
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-20 sm:pt-28">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Certificate History
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Review certificates that were issued on-chain and archived in the
              database.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search records"
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading certificate records
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-destructive">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No certificate records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Roll Number</th>
                    <th className="px-4 py-3 font-medium">Degree</th>
                    <th className="px-4 py-3 font-medium">Year</th>
                    <th className="px-4 py-3 font-medium">Certificate ID</th>
                    <th className="px-4 py-3 font-medium">Issued</th>
                    <th className="px-4 py-3 font-medium">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr
                      key={record.certificate_id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-4 font-medium text-foreground">
                        {record.student_name}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.roll_number}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.degree}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {record.graduation_year}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                        <a
                          href={`/?id=${encodeURIComponent(record.certificate_id)}`}
                          className="transition-colors hover:text-foreground"
                        >
                          {shortHash(record.certificate_id)}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {formatDate(record.created_at)}
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${record.transaction_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {shortHash(record.transaction_hash)}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SiteChrome>
  );
}
