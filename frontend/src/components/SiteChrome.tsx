import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/uoswabi-logo.png"
              alt="University of Swabi logo"
              className="h-9 w-9 object-contain"
            />
            <span className="text-base font-semibold tracking-tight text-foreground">
              SwabiCert
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              to="/issue"
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              Issue
            </Link>
            <Link
              to="/history"
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              History
            </Link>
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
            >
              Verify
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          <p className="text-center text-xs text-muted-foreground">
            University of Swabi · Blockchain-Verified Certificates
          </p>
        </div>
      </footer>
    </div>
  );
}
