import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Github,
  Radar,
  Binary,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  BookOpen,
  Twitter,
  Package,
  GitCommit,
  FileCode2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentFlightLogo } from "@/components/AgentFlightLogo";
import {
  AGENTFLIGHT_REPO,
  AGENTFLIGHT_DOCS,
  AGENTFLIGHT_PYPI,
  AGENTFLIGHT_VERSION,
  INSTALL_COMMAND,
  USAGE_COMMAND,
  copyAgentFlightCommand,
} from "@/lib/agentflight";

const REPO = AGENTFLIGHT_REPO;

function Tilt({ children, className = "", max = 12 }: { children: ReactNode; className?: string; max?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 18 });
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

function GlassButton({ href, children, primary }: { href: string; children: ReactNode; primary?: boolean }) {
  return (
    <Tilt max={18} className="inline-block">
      <Button
        asChild
        variant="ghost"
        className={`af-glass h-auto rounded-lg px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors ${
          primary
            ? "border-[hsl(var(--af-fg)/0.3)] bg-[hsl(var(--af-fg)/0.08)] text-[hsl(var(--af-fg))] hover:bg-[hsl(var(--af-fg)/0.16)] hover:text-[hsl(var(--af-fg))]"
            : "hover:bg-[hsl(var(--af-fg)/0.1)] hover:text-[hsl(var(--af-fg))]"
        }`}
      >
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
          {children}
        </a>
      </Button>
    </Tilt>
  );
}

const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

type Line = { t: string; c?: "dim" | "bold" | "alert" | "del" };
const SCRIPT: Line[] = [
  { t: "$ agentflight pytest" },
  { t: "Target test files: ['tests/test_auth.py', 'tests/test_math.py']", c: "dim" },
  { t: "State Before: 4b825dc642cb6eb9a060e54bf8d69288fbee4904", c: "dim" },
  { t: "[2026-10-12 21:15:00] Executing: pytest", c: "dim" },
  { t: "--- Integrity Audit Report ---", c: "bold" },
  { t: "File: tests/test_math.py  |  Status: FLAGGED_SUSPICIOUS", c: "bold" },
  { t: "  [ALERT] Critical assertions removed during execution!", c: "alert" },
  { t: "  [DELETED] -> assert calculate_total(items) == 100", c: "del" },
  { t: "  [DELETED] -> with pytest.raises(ValueError)", c: "del" },
  { t: "[FAIL] Audit failed: Test tampering detected. (Exit Code: 2)", c: "bold" },
];

export function TypingTerminal() {
  const [shown, setShown] = useState<string[]>([]);
  const [start, setStart] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const copy = async () => {
    try {
      await copyAgentFlightCommand(USAGE_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setStart(true), { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!start) return;
    let line = 0,
      ch = 0,
      cancelled = false;
    const out: string[] = [];
    const tick = () => {
      if (cancelled) return;
      if (line >= SCRIPT.length) {
        setTimeout(() => {
          if (!cancelled) {
            out.length = 0;
            line = 0;
            ch = 0;
            setShown([]);
            tick();
          }
        }, 4500);
        return;
      }
      const full = SCRIPT[line].t;
      ch++;
      out[line] = full.slice(0, ch);
      setShown([...out]);
      if (ch >= full.length) {
        line++;
        ch = 0;
        setTimeout(tick, line === 1 ? 500 : 260);
      } else setTimeout(tick, line === 0 ? 55 : 14);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [start]);

  const cls = (c?: Line["c"]) =>
    c === "dim"
      ? "text-[hsl(var(--af-muted))]"
      : c === "bold"
        ? "font-bold"
        : c === "del"
          ? "line-through text-[hsl(var(--af-muted))]"
          : c === "alert"
            ? "inline-block bg-[hsl(var(--af-fg))] text-[hsl(var(--af-bg))] font-bold px-2 tracking-widest animate-pulse"
            : "";

  return (
    <div ref={ref} style={{ perspective: 1600 }} className="mx-auto max-w-3xl">
      <motion.div
        initial={{ rotateX: 25, rotateY: -18, opacity: 0 }}
        whileInView={{ rotateX: 12, rotateY: -10, opacity: 1 }}
        whileHover={{ rotateX: 0, rotateY: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="af-glass overflow-hidden rounded-xl shadow-[0_40px_120px_-20px_hsl(var(--af-fg)/0.15)]"
      >
        <div className="flex items-center gap-2 border-b border-[hsl(var(--af-fg)/0.1)] px-4 py-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-3 w-3 rounded-full border border-[hsl(var(--af-fg)/0.3)]" />
          ))}
          <span className="ml-3 font-mono text-xs text-[hsl(var(--af-muted))]">~/project — agentflight</span>
          <Button
            variant="ghost"
            onClick={copy}
            aria-label="Copy the command shown in this terminal"
            title={`Copy ${USAGE_COMMAND}`}
            className="af-glass ml-auto h-8 shrink-0 gap-2 rounded-md px-3 font-mono text-[11px] uppercase tracking-wider hover:bg-[hsl(var(--af-fg)/0.1)] hover:text-[hsl(var(--af-fg))]"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>

        <div className="min-h-[320px] p-5 font-mono text-[13px] leading-7 sm:text-sm">
          {shown.map((s, i) => (
            <div key={i} className={cls(SCRIPT[i].c)}>
              {s || "\u00a0"}
            </div>
          ))}
          <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[hsl(var(--af-fg))]" />
        </div>
      </motion.div>
    </div>
  );
}

const FEATURES = [
  {
    icon: Radar,
    title: "Auto-discovery",
    body: "Automatically discovers all test_*.py and *_test.py files in your workspace while ignoring virtual environments and hidden directories.",
  },
  {
    icon: Binary,
    title: "AST Tamper Detection",
    body: "Parses Python Abstract Syntax Trees (ast.Assert & pytest.raises context managers) before and after execution to catch deleted assertions.",
  },
  {
    icon: ShieldCheck,
    title: "CI/CD Blocking",
    body: "Snapshots git write-tree hashes and exits with status code 2 when assertion tampering is detected, halting compromised pipelines.",
  },
];

const PIPELINE_STEPS = [
  {
    icon: FileCode2,
    step: "Step 01",
    title: "Baseline AST Snapshot",
    detail: "Extracts every `assert` statement and `with pytest.raises(...)` block across discovered test files.",
  },
  {
    icon: GitCommit,
    step: "Step 02",
    title: "Git Tree & Command Execution",
    detail: "Records `git write-tree` state before and after running your test suite or autonomous agent command.",
  },
  {
    icon: Terminal,
    step: "Step 03",
    title: "Post-Execution Integrity Audit",
    detail: "Diffs assertion sets (`old_asserts - new_asserts`) and flags `FLAGGED_SUSPICIOUS` with exit code 2 if any test was weakened.",
  },
];

function CopyBox({ command, label }: { command: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const copy = async () => {
    try {
      await copyAgentFlightCommand(command);
      setError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
    }
  };
  return (
    <div>
      <p className="mb-3 font-mono text-xs uppercase tracking-wider text-[hsl(var(--af-muted))]">{label}</p>
      <div className="af-glass flex items-center justify-between gap-3 rounded-xl px-4 py-4 font-mono sm:px-5">
        <code className="min-w-0 break-words text-sm sm:text-base">
          <span aria-hidden="true" className="text-[hsl(var(--af-muted))]">
            ${" "}
          </span>
          <span className="font-semibold">{command.split(" ")[0]}</span> {command.split(" ").slice(1).join(" ")}
        </code>
        <Button
          variant="ghost"
          onClick={copy}
          aria-label={`Copy ${command}`}
          title={`Copy ${command}`}
          className="af-glass h-9 w-9 shrink-0 rounded-md p-0 hover:bg-[hsl(var(--af-fg)/0.1)] hover:text-[hsl(var(--af-fg))]"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p role="status" className="mt-2 min-h-4 font-mono text-xs text-[hsl(var(--af-muted))]">
        {error ? "Couldn’t copy. Select and copy the command above." : copied ? "Copied to clipboard." : ""}
      </p>
    </div>
  );
}

const SHAPES = [
  { s: 120, top: "12%", left: "8%", d: 0, r: 45 },
  { s: 70, top: "22%", left: "82%", d: 1.5, r: 0 },
  { s: 160, top: "62%", left: "88%", d: 0.8, r: 30 },
  { s: 50, top: "70%", left: "12%", d: 2.2, r: 15 },
];

export default function AgentFlight() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    document.title = "AgentFlight CLI — Stop AI Agents From Deleting Your Tests";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <div className="af min-h-screen overflow-x-hidden bg-[hsl(var(--af-bg))] font-af-body text-[hsl(var(--af-fg))]">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[hsl(var(--af-fg)/0.1)] bg-[hsl(var(--af-bg)/0.6)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <AgentFlightLogo variant="lockup" size={34} />
          </a>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="af-glass hover:bg-[hsl(var(--af-fg)/0.1)] hover:text-[hsl(var(--af-fg))]"
            >
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("AgentFlight CLI — Stop AI agents from deleting your tests.")}&url=${encodeURIComponent(REPO)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share AgentFlight on Twitter"
                title="Share on Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="af-glass hidden rounded-lg px-3.5 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[hsl(var(--af-fg)/0.1)] hover:text-[hsl(var(--af-fg))] md:inline-flex"
            >
              <a href={AGENTFLIGHT_PYPI} target="_blank" rel="noopener noreferrer">
                <Package className="h-4 w-4" /> <span>PyPI v{AGENTFLIGHT_VERSION}</span>
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="af-glass rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-[hsl(var(--af-fg)/0.1)] hover:text-[hsl(var(--af-fg))]"
            >
              <a href={REPO} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" /> <span className="hidden sm:inline">View on GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-screen items-center justify-center px-5 pt-24 pb-16">
        <div className="af-grid pointer-events-none absolute inset-0" />
        {SHAPES.map((sh, i) => (
          <motion.div
            key={i}
            className="af-glass pointer-events-none absolute hidden rounded-xl sm:block"
            style={{ width: sh.s, height: sh.s, top: sh.top, left: sh.left }}
            animate={{ y: [0, -25, 0], rotateX: [sh.r, sh.r + 40, sh.r], rotateY: [0, 50, 0] }}
            transition={{ duration: 9, repeat: Infinity, delay: sh.d, ease: "easeInOut" }}
          />
        ))}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex justify-center"
          >
            <Tilt max={15}>
              <AgentFlightLogo variant="badge" size={116} />
            </Tilt>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="af-glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-[hsl(var(--af-muted))]"
          >
            <Terminal className="h-3.5 w-3.5" /> v{AGENTFLIGHT_VERSION} · Open-source · Python AST Auditor
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-af-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Stop AI Agents From Deleting Your Tests.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mx-auto mt-6 max-w-2xl font-mono text-sm text-[hsl(var(--af-muted))] sm:text-base"
          >
            An open-source CLI auditor that monitors autonomous AI coding agents and prevents them from artificially
            passing CI/CD pipelines by deleting or commenting out failing assertions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <GlassButton href={REPO} primary>
              <Github className="h-4 w-4" /> View on GitHub
            </GlassButton>
            <GlassButton href={AGENTFLIGHT_DOCS}>
              <BookOpen className="h-4 w-4" /> Documentation
            </GlassButton>
            <GlassButton href={AGENTFLIGHT_PYPI}>
              <Package className="h-4 w-4" /> PyPI Package
            </GlassButton>
          </motion.div>
          <a
            href="#quickstart"
            className="mt-6 inline-block font-mono text-xs text-[hsl(var(--af-muted))] underline underline-offset-4 transition-colors hover:text-[hsl(var(--af-fg))]"
          >
            Quick Start ↓
          </a>
        </div>
      </section>

      {/* Terminal */}
      <section className="px-5 py-24">
        <Reveal>
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--af-muted))]">
            // live interception
          </p>
          <h2 className="mb-14 text-center font-af-display text-3xl font-bold sm:text-5xl">Caught in the act.</h2>
        </Reveal>
        <TypingTerminal />
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--af-muted))]">
            // core systems
          </p>
          <h2 className="mb-14 text-center font-af-display text-3xl font-bold sm:text-5xl">Three layers of defense.</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.12}>
              <Tilt className="h-full">
                <div className="af-glass h-full rounded-2xl p-8">
                  <div style={{ transform: "translateZ(40px)" }}>
                    <div className="af-glass mb-6 inline-flex rounded-lg p-3">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <p className="mb-1 font-mono text-xs text-[hsl(var(--af-muted))]">0{i + 1}</p>
                    <h3 className="mb-3 font-af-display text-xl font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-[hsl(var(--af-muted))]">{f.body}</p>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How TestIntegrityAuditor works */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <Reveal>
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--af-muted))]">
            // under the hood
          </p>
          <h2 className="mb-12 text-center font-af-display text-3xl font-bold sm:text-4xl">
            How TestIntegrityAuditor Works
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {PIPELINE_STEPS.map((item, idx) => (
              <div key={item.step} className="af-glass rounded-xl p-6">
                <div className="mb-4 flex items-center justify-between font-mono text-xs text-[hsl(var(--af-muted))]">
                  <span>{item.step}</span>
                  <item.icon className="h-4 w-4 text-[hsl(var(--af-fg))]" />
                </div>
                <h3 className="mb-2 font-af-display text-lg font-bold">{item.title}</h3>
                <p className="font-mono text-xs leading-relaxed text-[hsl(var(--af-muted))]">{item.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Quick start */}
      <section id="quickstart" className="mx-auto max-w-2xl px-5 py-24">
        <Reveal>
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-[0.3em] text-[hsl(var(--af-muted))]">
            // quick start
          </p>
          <h2 className="mb-10 text-center font-af-display text-3xl font-bold sm:text-5xl">Install in seconds.</h2>
          <div className="space-y-5">
            <CopyBox command={INSTALL_COMMAND} label="01 / Install from PyPI" />
            <CopyBox command={USAGE_COMMAND} label="02 / Audit your test suite or agent command" />
          </div>
          <p className="mt-6 text-center font-mono text-sm text-[hsl(var(--af-muted))]">
            Run <span className="text-[hsl(var(--af-fg))]">agentflight</span> (defaults to{" "}
            <span className="text-[hsl(var(--af-fg))]">python -m pytest</span>) or wrap any agent command like{" "}
            <span className="text-[hsl(var(--af-fg))]">agentflight pytest</span>.
          </p>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--af-fg)/0.1)] px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 font-mono text-xs text-[hsl(var(--af-muted))] sm:flex-row">
          <a href="#top" className="flex items-center gap-2.5">
            <AgentFlightLogo variant="lockup" size={28} />
          </a>
          <span>© {new Date().getFullYear()} · MIT License · By Astel Antony (Viperhawks)</span>
          <div className="flex items-center gap-4">
            <a
              href={AGENTFLIGHT_PYPI}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[hsl(var(--af-fg))]"
            >
              <Package className="h-4 w-4" /> PyPI
            </a>
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[hsl(var(--af-fg))]"
            >
              <Github className="h-4 w-4" /> Viperhawks/AgentFlight
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
