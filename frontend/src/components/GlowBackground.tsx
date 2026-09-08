// Shared dark backdrop for the marketing homepage and the auth pages --
// fixed so it stays put under scrollable content, layered blurred color
// blobs plus a faint dot grid for texture. Extracted from Home.tsx so
// Login/Register (and anywhere else adopting the same look) don't
// duplicate it and drift out of sync.
export default function GlowBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div className="absolute left-1/2 top-[-10%] h-[36rem] w-[52rem] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
      <div className="absolute right-[-10%] top-[20%] h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute left-[-10%] top-[55%] h-[26rem] w-[26rem] rounded-full bg-indigo-600/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}
