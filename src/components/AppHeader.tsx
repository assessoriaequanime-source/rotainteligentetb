import { Link, useLocation } from "@tanstack/react-router";
import { Navigation, Settings2 } from "lucide-react";

export default function AppHeader() {
  const location = useLocation();
  const path = location.pathname;
  const isGestor = path.startsWith("/gestor");

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-glow)] sm:h-10 sm:w-10 sm:rounded-xl">
            <Navigation className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide sm:text-base">
              RA Routes
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Cabine de condução
            </span>
          </div>
        </Link>

        {/* Discrete management access */}
        <Link
          to={isGestor ? "/motorista" : "/gestor"}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label={isGestor ? "Voltar para cabine" : "Acesso restrito ao painel de operação"}
        >
          {isGestor ? (
            <>
              <Navigation className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="font-mono uppercase tracking-[0.18em]">
                Cabine
              </span>
            </>
          ) : (
            <>
              <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="font-mono uppercase tracking-[0.18em]">
                Operação
              </span>
            </>
          )}
        </Link>
      </div>
    </header>
  );
}
