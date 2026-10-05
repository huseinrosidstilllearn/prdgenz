"use client";

import { useState } from "react";
import { AIChatBubble, Button, WizardStepper } from "@prdgenz/ui";
import { useGenerationSetup } from "./use-generation-setup";
import { useWizardConfig } from "./use-wizard-config";
import { usePRDGeneration } from "./use-prd-generation";
import {
  EMPTY_WIZARD_VALUES,
  WizardStepFields,
  type WizardValues,
} from "./wizard-step-fields";

export interface WizardProps {
  /** Cloud-only project picker, rendered on the last step. */
  projectId?: string;
  onProjectIdChange?: (id: string) => void;
  title?: string;
}

/** Human labels for the raw step identifiers persisted in localStorage. */
const STEP_LABELS: Record<string, string> = {
  idea: "Idea",
  targetUser: "Target user",
  features: "Features",
  userStories: "User stories",
  acceptanceCriteria: "Acceptance criteria",
  techStack: "Tech stack",
  timeline: "Timeline",
  outputFormat: "Output format",
};

function label(step: string) {
  return STEP_LABELS[step] ?? step;
}

/**
 * Create from Scratch: the guided form that asks for one clause at a time.
 *
 * The clause list is a form, so it is presented as a numbered spec sheet with
 * the active clause in the margin, not as a card wizard with a progress bar.
 */
export function Wizard({
  projectId = "",
  onProjectIdChange,
  title = "Create from Scratch",
}: WizardProps) {
  const setup = useGenerationSetup();
  const [currentStepName, setCurrentStepName] = useState("idea");
  const [configuring, setConfiguring] = useState(false);
  const [values, setValues] = useState<WizardValues>(EMPTY_WIZARD_VALUES);
  const { stepOrder, hiddenSteps, visibleSteps, moveStep, toggleStep } =
    useWizardConfig(currentStepName);
  const { generating, streamText, result, error, generate, cancel } =
    usePRDGeneration();

  function onChange<K extends keyof WizardValues>(
    key: K,
    value: WizardValues[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  const lastStep = visibleSteps[visibleSteps.length - 1] === currentStepName;
  // The idea clause is the only required one, so only it can gate Next.
  const canNext = currentStepName !== "idea" || values.idea.trim().length >= 3;

  function go(offset: 1 | -1) {
    const i = visibleSteps.indexOf(currentStepName);
    const target =
      visibleSteps[Math.min(visibleSteps.length - 1, Math.max(0, i + offset))];
    if (target) setCurrentStepName(target);
  }

  function onToggleStep(step: string) {
    const next = toggleStep(step);
    if (next) setCurrentStepName(next);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
          Clause {visibleSteps.indexOf(currentStepName) + 1} of{" "}
          {visibleSteps.length}
        </p>
        <h1 className="font-display text-3xl leading-tight">{title}</h1>
      </header>

      <WizardStepper
        steps={stepOrder}
        currentStep={stepOrder.indexOf(currentStepName)}
        onStepClick={(i) => setCurrentStepName(stepOrder[i])}
        canConfigure={configuring}
        onMoveStep={moveStep}
        onToggleStep={onToggleStep}
        hiddenSteps={hiddenSteps}
      />

      <div className="generation-panel mt-8">
        <h2 className="mb-5 text-lg font-medium">{label(currentStepName)}</h2>

        <div className="space-y-6">
          {setup.config}

          <WizardStepFields
            step={currentStepName}
            values={values}
            onChange={onChange}
            projectField={
              onProjectIdChange ? (
                <div className="space-y-2">
                  <label htmlFor="project" className="text-sm font-medium">
                    Save into project (optional)
                  </label>
                  <input
                    id="project"
                    value={projectId}
                    onChange={(e) => onProjectIdChange(e.target.value)}
                    placeholder="Paste a project ID from the dashboard"
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              ) : undefined
            }
          />

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {generating ? (
            <div className="space-y-3 border p-4">
              <p
                role="status"
                className="font-mono text-xs text-muted-foreground"
              >
                Generating… {streamText.length} chars streamed
              </p>
              <AIChatBubble
                role="assistant"
                content={streamText || "Contacting the model…"}
                streaming
              />
              <Button variant="outline" size="sm" onClick={cancel}>
                Cancel
              </Button>
            </div>
          ) : null}

          {result ? (
            <p className="text-sm text-primary">PRD generated. Opening it…</p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t pt-6">
        {configuring ? (
          <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
            Reorder clauses with the arrows, or hide optional ones. Hidden
            clauses are skipped during navigation and left out of the model
            input. The idea clause stays first and is always required.
          </p>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => go(-1)}
              disabled={currentStepName === "idea" || generating}
            >
              Back
            </Button>
            {lastStep ? (
              <Button
                onClick={() =>
                  generate({
                    language: setup.language,
                    provider: setup.provider,
                    model: setup.model,
                    projectId,
                    idea: values.idea,
                    // The story and criteria notes used to overwrite the known
                    // problem; they are now appended instead of replacing it.
                    problem: [
                      values.problem,
                      values.userStories,
                      values.acceptanceCriteria,
                    ]
                      .filter(Boolean)
                      .join("\n\n"),
                    targetUser: values.targetUser,
                    features: values.features,
                    techStack: values.techStack,
                    timeline: values.timeline,
                    constraints: values.outputFormat,
                    hiddenSteps,
                  })
                }
                disabled={generating || values.idea.trim().length < 3}
              >
                {generating ? "Generating…" : "Generate PRD"}
              </Button>
            ) : (
              <Button onClick={() => go(1)} disabled={!canNext || generating}>
                Next
              </Button>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfiguring((c) => !c)}
          disabled={generating}
        >
          {configuring ? "Done" : "Reorder clauses"}
        </Button>
      </div>
    </div>
  );
}
