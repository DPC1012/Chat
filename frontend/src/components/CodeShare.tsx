import { useState } from "react";

export const CodeShare = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-4 rounded bg-zinc-900 p-4 text-center font-mono">
      <div className="mb-2 text-sm font-normal tracking-wider text-slate-300">
        {"Share this code with your friend"}
      </div>
      <div className="text-xl font-bold tracking-widest">{code}</div>
      <button
        type="button"
        onClick={copyCode}
        className="mt-3 rounded border border-stone-700 px-3 py-1 text-xs text-slate-200 transition-colors hover:border-stone-500 hover:text-white"
      >
        {copied ? "Copied" : "Copy Code"}
      </button>
    </div>
  );
};
