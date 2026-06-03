import { useState } from "react"

const DEFAULT = `# Video Script\n\n## Hook (0-5s)\nOpen with your most compelling hook...\n\n## Main Content\n### Point 1\n### Point 2\n### Point 3\n\n## CTA\nLike, subscribe, and comment below!`

export default function Editor() {
  const [script, setScript] = useState(DEFAULT)
  const words = script.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold">Script Editor</h1>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs text-primary">Draft</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-white/30">{words} words · ~{Math.round(words/130)} min</span>
          <button className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold transition-opacity hover:opacity-80">Save</button>
          <button className="rounded-lg border border-accent/40 px-4 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10">AI Improve</button>
        </div>
      </div>
      <textarea
        className="flex-1 resize-none bg-bg p-8 font-mono text-sm leading-relaxed text-white/80 outline-none"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        spellCheck={false}
      />
    </div>
  )
}
