import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { CertificateData } from "@/lib/blockchainStubs";

interface CertificateProps {
  data: CertificateData;
  certificateId: string;
}

export function Certificate({ data, certificateId }: CertificateProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const verificationPath = useMemo(
    () => `/?id=${encodeURIComponent(certificateId)}`,
    [certificateId],
  );

  useEffect(() => {
    const origin = window.location.origin;
    const verificationUrl = new URL(verificationPath, origin).toString();

    QRCode.toDataURL(verificationUrl, {
      margin: 1,
      scale: 4,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then(setQrCodeUrl);
  }, [verificationPath]);

  return (
    <div
      id="certificate-template"
      className="relative mx-auto aspect-[1.414/1] w-full max-w-3xl overflow-hidden border border-border bg-card p-3 shadow-sm"
    >
      <div className="grid h-full grid-rows-[auto_1fr_auto] border border-accent/40 px-6 py-5 text-center sm:px-10 sm:py-7">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/uoswabi-logo.png"
            alt="University of Swabi crest"
            className="h-12 w-12 object-contain sm:h-14 sm:w-14"
          />
          <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-muted-foreground sm:text-[10px]">
            University of Swabi
          </p>
        </div>

        <div className="flex min-h-0 flex-col items-center justify-center gap-3 py-3">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-semibold tracking-wide text-foreground sm:text-2xl">
              Certificate of Completion
            </h2>
            <p className="text-xs text-muted-foreground">
              This is to certify that
            </p>
          </div>

          <p className="max-w-full break-words px-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {data.studentName}
          </p>

          <div className="space-y-1">
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              has successfully completed the requirements for the degree of
            </p>
            <p className="break-words px-3 text-base font-semibold text-foreground sm:text-lg">
              {data.degree}
            </p>
          </div>

          <div className="grid w-full max-w-lg grid-cols-[1fr_auto_1fr] items-start gap-4 pt-2">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Roll Number
              </p>
              <p className="mt-1 break-words text-sm font-medium leading-snug text-foreground">
                {data.rollNumber}
              </p>
            </div>
            <div className="h-9 w-px bg-border" />
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                Year
              </p>
              <p className="mt-1 text-sm font-medium leading-snug text-foreground">
                {data.year}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-end gap-4 text-left">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Certificate ID
            </p>
            <p className="mt-1 break-all font-mono text-[9px] leading-relaxed text-muted-foreground sm:text-[10px]">
              {certificateId}
            </p>
          </div>
          <a
            href={verificationPath}
            className="flex h-12 w-12 shrink-0 items-center justify-center border border-border bg-white p-1 sm:h-14 sm:w-14"
            aria-label="Verify this certificate"
          >
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Certificate verification QR code"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                QR
              </span>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
