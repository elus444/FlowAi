import { Link } from 'react-router-dom'
import {
  Workflow,
  Zap,
  ShieldCheck,
  Database,
  GitBranch,
  Code2,
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import GlowBackground from '@/components/GlowBackground'

const FEATURES = [
  {
    icon: Workflow,
    title: 'Visual workflow builder',
    description:
      'Drag, drop, and connect nodes on an infinite canvas. Build multi-step AI agent pipelines without writing orchestration code.',
  },
  {
    icon: Zap,
    title: 'Multi-model LLM nodes',
    description:
      'Call Gemini, GPT, or Claude from the same canvas. Swap providers and models per node without touching your workflow logic.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure sandboxed execution',
    description:
      'Every run executes in an isolated E2B sandbox, so generated and user code never touches your own infrastructure.',
  },
  {
    icon: GitBranch,
    title: 'Conditional branching',
    description:
      'Route execution based on model output or custom expressions. Build agents that make real decisions, not just linear chains.',
  },
  {
    icon: Database,
    title: 'Dataset integration',
    description:
      'Upload and reference datasets directly inside your workflows for retrieval, evaluation, or batch processing.',
  },
  {
    icon: Code2,
    title: 'Export to real code',
    description:
      'Compile any workflow to standalone LangGraph Python you can run, version, and deploy independently of FlowAI.',
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Drag nodes onto the canvas',
    description: 'Start with a trigger, then add LLM, API, conditional, or dataset nodes to shape your pipeline.',
  },
  {
    step: '02',
    title: 'Configure and connect',
    description: 'Wire nodes together, set prompts and models per step, and define the state your workflow tracks.',
  },
  {
    step: '03',
    title: 'Run and iterate',
    description: 'Execute in a secure sandbox, inspect logs and output in real time, and refine until it works.',
  },
]

// Built on real technology rather than fabricated customer logos -- FlowAI
// doesn't have named customers to show off, and a "trusted by" row of
// logos that aren't actually using the product would be misleading.
const POWERED_BY = ['LangGraph', 'E2B Sandboxes', 'Google Gemini', 'OpenAI', 'Anthropic']

function MiniCanvasPreview() {
  return (
    <div className="relative w-full aspect-[16/10] rounded-2xl border border-white/10 bg-gradient-to-br from-gray-50 to-white shadow-[0_0_120px_-20px_rgba(16,185,129,0.35)] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path
          d="M 110 90 C 180 90, 180 60, 250 60"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
        />
        <path
          d="M 110 90 C 180 90, 180 140, 250 140"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
        />
        <path
          d="M 370 60 C 430 60, 430 100, 490 100"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
        />
        <path
          d="M 370 140 C 430 140, 430 100, 490 100"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute left-[6%] top-[32%] w-28 rounded-lg border-2 border-green-500 bg-green-50 px-3 py-2 shadow-md">
        <p className="text-[10px] font-semibold text-green-700">Trigger</p>
        <p className="text-[9px] text-green-600">Start</p>
      </div>
      <div className="absolute left-[34%] top-[14%] w-28 rounded-lg border-2 border-blue-500 bg-blue-50 px-3 py-2 shadow-md">
        <p className="text-[10px] font-semibold text-blue-700">LLM</p>
        <p className="text-[9px] text-blue-600">Gemini 3.6</p>
      </div>
      <div className="absolute left-[34%] top-[54%] w-28 rounded-lg border-2 border-yellow-500 bg-yellow-50 px-3 py-2 shadow-md">
        <p className="text-[10px] font-semibold text-yellow-700">Conditional</p>
        <p className="text-[9px] text-yellow-600">Branch logic</p>
      </div>
      <div className="absolute left-[62%] top-[14%] w-28 rounded-lg border-2 border-purple-500 bg-purple-50 px-3 py-2 shadow-md">
        <p className="text-[10px] font-semibold text-purple-700">API Call</p>
        <p className="text-[9px] text-purple-600">HTTP request</p>
      </div>
      <div className="absolute left-[86%] top-[34%] w-24 rounded-lg border-2 border-red-500 bg-red-50 px-3 py-2 shadow-md">
        <p className="text-[10px] font-semibold text-red-700">Output</p>
        <p className="text-[9px] text-red-600">Final result</p>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-gray-500 shadow-sm border border-gray-200">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Live preview
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen text-slate-100">
      <GlowBackground />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold text-slate-950">
              FA
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">FlowAI</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-400/30 transition-all hover:bg-emerald-300 hover:shadow-md hover:shadow-emerald-400/40"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Visual agentic workflow builder
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Build{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-blue-400 bg-clip-text text-transparent">
              AI agents
            </span>
            <br />
            without writing orchestration code
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Drag, drop, and connect nodes to build multi-step LLM pipelines. Run them
            in secure sandboxes, inspect every step, and export to real Python whenever
            you outgrow the canvas.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-400/25 transition-all hover:bg-emerald-300 hover:shadow-xl hover:shadow-emerald-400/30"
            >
              Start building free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-base font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:bg-white/5"
            >
              <Play className="h-4 w-4" />
              See how it works
            </a>
          </div>

          <div className="mx-auto mt-14 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <span>Built on</span>
            {POWERED_BY.map((name) => (
              <span key={name} className="text-slate-400">{name}</span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <MiniCanvasPreview />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-white/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to ship an agent
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              From prototyping on a canvas to running production workflows in isolated sandboxes.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.06]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400 transition-colors group-hover:bg-emerald-400 group-hover:text-slate-950">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From idea to running agent in minutes
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold text-slate-950">
                    {s.step}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className="hidden h-px flex-1 bg-white/10 md:block" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 px-8 py-16 text-center shadow-xl backdrop-blur-sm">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Start building your first workflow
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              No credit card required. Create an account and drop your first node in
              under a minute.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Link
                to="/register"
                className="rounded-lg bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-400/25 transition-transform hover:scale-[1.02]"
              >
                Get started free
              </Link>
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Free to start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-emerald-400 to-blue-500 text-[10px] font-bold text-slate-950">
              FA
            </div>
            <span className="text-sm font-medium text-slate-300">FlowAI</span>
          </div>
          <p className="text-sm text-slate-500">Visual agentic workflow builder</p>
        </div>
      </footer>
    </div>
  )
}
