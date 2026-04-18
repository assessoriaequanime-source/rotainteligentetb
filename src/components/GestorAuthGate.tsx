import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Navigation, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const SESSION_KEY = "ra_gestor_authed_v1";
const VALID_USER = "tpbus";
const VALID_PASS = "gestor1234";

export default function GestorAuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (user.trim() === VALID_USER && pass === VALID_PASS) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setAuthed(true);
      setError(null);
    } else {
      setError("Credenciais inválidas. Verifique usuário e senha.");
    }
  }

  if (!ready) return null;
  if (authed) return <>{children}</>;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface/80 p-6 shadow-[var(--shadow-elevated)] backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
            <Lock className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">
              Acesso restrito
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Painel de operação
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Usuário
            </span>
            <input
              type="text"
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/60 focus:bg-background"
              placeholder="usuário"
              autoFocus
              maxLength={50}
            />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Senha
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/60 focus:bg-background"
              placeholder="••••••••"
              maxLength={100}
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full">
            Entrar no painel
          </Button>
        </form>

        <Link
          to="/motorista"
          className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Navigation className="h-3.5 w-3.5" strokeWidth={1.5} />
          Voltar para a cabine
        </Link>
      </motion.div>
    </div>
  );
}

export function clearGestorSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
