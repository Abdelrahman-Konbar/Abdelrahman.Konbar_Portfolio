import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRef, useState } from "react";
import type { Decision } from "../data/projects";
import { Arrow, EASE, MonoLabel } from "./ui";

const steps = ["Challenge", "Alternatives", "Constraints", "Decision", "Result"] as const;

/**
 * Reusable pattern for explaining a real UX decision step by step.
 * Pass verified decisions from case-study data; `isSample` renders a clear notice.
 */
export function DecisionExplorer({
  decision,
  instanceId,
}: {
  decision: Decision;
  instanceId: string;
}) {
  const [step, setStep] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (i: number) => setStep(Math.max(0, Math.min(steps.length - 1, i)));

  const onKey = (e: React.KeyboardEvent) => {
    let next = step;
    if (e.key === "ArrowRight") next = (step + 1) % steps.length;
    else if (e.key === "ArrowLeft") next = (step - 1 + steps.length) % steps.length;
    else return;
    e.preventDefault();
    setStep(next);
    tabs.current[next]?.focus();
  };

  const showOptions = step === 1 || step === 3;

  return (
    <div className="overflow-hidden rounded-3xl border border-canvas/10 bg-graphite text-canvas">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-canvas/10 px-6 py-4 sm:px-8">
        <MonoLabel className="text-iris">Decision explorer</MonoLabel>
        {decision.isSample && (
          <span className="rounded-full border border-lime/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-lime">
            Sample content · demonstrates the format
          </span>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Decision steps"
        onKeyDown={onKey}
        className="flex overflow-x-auto border-b border-canvas/10"
      >
        {steps.map((s, i) => (
          <button
            key={s}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            aria-selected={i === step}
            id={`${instanceId}-tab-${i}`}
            aria-controls={`${instanceId}-panel`}
            tabIndex={i === step ? 0 : -1}
            onClick={() => go(i)}
            className={`relative flex min-w-[8.5rem] flex-1 items-center gap-2.5 px-5 py-4 text-left text-[14px] transition-colors sm:px-6 ${
              i === step ? "text-canvas" : "text-steel/60 hover:text-canvas"
            }`}
          >
            <span className={`font-mono text-[11px] ${i <= step ? "text-iris" : ""}`}>
              0{i + 1}
            </span>
            {s}
            {i === step && (
              <motion.span
                layoutId={`${instanceId}-decision-underline`}
                className="absolute inset-x-0 bottom-0 h-[2px] bg-iris"
                transition={{ duration: 0.5, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      <div
        id={`${instanceId}-panel`}
        role="tabpanel"
        aria-labelledby={`${instanceId}-tab-${step}`}
        className="grid min-h-[380px] gap-8 p-6 sm:p-10 lg:grid-cols-12"
      >
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <MonoLabel className="text-steel/70">{steps[step]}</MonoLabel>
              {step === 0 && (
                <>
                  <p className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-medium leading-[1.12] tracking-[-0.02em]">
                    {decision.challenge}
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-steel">{decision.context}</p>
                </>
              )}
              {step === 1 && (
                <p className="mt-4 text-lg leading-relaxed text-steel">
                  The directions genuinely considered, each with its own cost. Choosing is easier
                  once the trade-offs are visible side by side.
                </p>
              )}
              {step === 2 && (
                <ul className="mt-5 space-y-4">
                  {decision.constraints.map((c, i) => (
                    <li key={c} className="flex gap-4 text-[17px] leading-snug">
                      <span className="font-mono text-[12px] text-iris">C{i + 1}</span>
                      {c}
                    </li>
                  ))}
                </ul>
              )}
              {step === 3 && (
                <>
                  <p className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] font-medium leading-[1.12] tracking-[-0.02em]">
                    {decision.alternatives[decision.chosenIndex].label}
                  </p>
                  <p className="mt-4 text-[15px] leading-relaxed text-steel">
                    {decision.rationale}
                  </p>
                </>
              )}
              {step === 4 && (
                <p className="mt-4 text-lg leading-relaxed text-steel">{decision.result}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-7">
          <LayoutGroup>
            {showOptions ? (
              <ul className="grid gap-3">
                {decision.alternatives.map((a, i) => {
                  const chosen = step === 3 && i === decision.chosenIndex;
                  const dimmed = step === 3 && !chosen;
                  return (
                    <motion.li
                      layout
                      key={a.label}
                      transition={{ duration: 0.5, ease: EASE }}
                      className={`rounded-2xl border p-5 transition-[opacity,border-color,background-color] duration-500 ${
                        chosen ? "border-iris bg-iris/10" : "border-canvas/10 bg-obsidian/50"
                      } ${dimmed ? "opacity-35" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-display text-[19px] font-medium">
                          <span className="mr-3 font-mono text-[12px] text-steel">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {a.label}
                        </span>
                        {chosen && (
                          <MonoLabel className="rounded-full bg-lime px-2.5 py-1 text-obsidian">
                            Chosen
                          </MonoLabel>
                        )}
                      </div>
                      <p className="mt-2 text-[14px] leading-relaxed text-steel">{a.note}</p>
                    </motion.li>
                  );
                })}
              </ul>
            ) : (
              <motion.div
                layout
                className="placeholder-hatch relative grid h-full min-h-[240px] place-items-center rounded-2xl border border-canvas/10 bg-obsidian/50 text-steel/10"
              >
                <MonoLabel className="text-steel">
                  {step === 4
                    ? "Resulting experience — visual to be added"
                    : "Supporting visual — to be added"}
                </MonoLabel>
              </motion.div>
            )}
          </LayoutGroup>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-canvas/10 px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => go(step - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-2 text-[14px] text-steel transition-colors hover:text-canvas disabled:opacity-30"
        >
          <Arrow className="size-4 rotate-180" /> Previous
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${i === step ? "w-6 bg-iris" : "w-1.5 bg-steel/30"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(step + 1)}
          disabled={step === steps.length - 1}
          className="inline-flex items-center gap-2 text-[14px] text-canvas transition-colors hover:text-iris disabled:opacity-30"
        >
          Next <Arrow className="size-4" />
        </button>
      </div>
    </div>
  );
}
