"use client";
import { useEffect, type RefObject } from "react";

type Example = {
  title: string;
  idea: string;
  overview: string;
  problem: string;
  scope: string;
  criteria: string;
};
type Section = "overview" | "problem" | "scope" | "criteria";

export function useLandingExample(
  ref: RefObject<HTMLDivElement>,
  examples: Record<string, Example>,
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const controller = new AbortController();
    let current = "coffee",
      section: Section = "overview";
    let timer: ReturnType<typeof setTimeout>;
    const find = <T extends HTMLElement = HTMLElement>(selector: string) =>
      root.querySelector<T>(selector)!;
    function status(message: string) {
      const node = find("#status");
      node.textContent = message;
      node.hidden = false;
      clearTimeout(timer);
      timer = setTimeout(() => (node.hidden = true), 4000);
    }
    function tab(id: string) {
      root!
        .querySelectorAll<HTMLButtonElement>("[role=tab]")
        .forEach((button) => {
          const active = button.id === id;
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
          find("#" + button.getAttribute("aria-controls")).hidden = !active;
        });
    }
    function render() {
      const ex = examples[current];
      find("#doc-title").textContent = ex.title;
      find("#crumb-title").textContent = ex.title;
      find(".docmeta").textContent =
        (
          {
            coffee: "Customers & baristas",
            study: "University students",
            report: "Project leads & team members",
          } as Record<string, string>
        )[current] + " · Focused first release";
      find("#changes-panel .removed").textContent =
        "− " +
        (
          {
            coffee: "Include checkout and card payments.",
            study: "Include calendar integration and grade predictions.",
            report: "Include scheduled emails and automated reminders.",
          } as Record<string, string>
        )[current];
      find("#changes-panel .added").textContent = "+ " + ex.scope;
      const content = find("#section-content");
      content.replaceChildren();
      const heading = document.createElement("h3");
      heading.textContent = {
        overview: "The idea, with boundaries.",
        problem: "A problem worth solving.",
        scope: "What belongs in the first release.",
        criteria: "Make the result testable.",
      }[section];
      const paragraph = document.createElement("p");
      paragraph.textContent = ex[section];
      content.append(heading, paragraph);
      if (section === "overview") {
        const check = document.createElement("div");
        check.className = "check";
        const icon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("class", "icon");
        icon.setAttribute("aria-hidden", "true");
        icon.setAttribute("fill", "none");
        icon.setAttribute("stroke", "currentColor");
        icon.setAttribute("stroke-width", "1.75");
        const path = document.createElementNS(icon.namespaceURI, "path");
        path.setAttribute("d", "m5 12 4 4L19 6");
        icon.append(path);
        const text = document.createElement("p");
        text.textContent = "Definition of done: " + ex.criteria;
        check.append(icon, text);
        content.append(check);
      }
      root!
        .querySelectorAll<HTMLButtonElement>("[data-section]")
        .forEach((button) =>
          button.setAttribute(
            "aria-current",
            String(button.dataset.section === section),
          ),
        );
    }
    root.addEventListener(
      "click",
      (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>(
          "button",
        );
        if (!button) return;
        if (button.dataset.example) {
          current = button.dataset.example;
          find<HTMLTextAreaElement>("#idea").value = examples[current].idea;
          render();
          status("Example changed to " + examples[current].title);
        }
        if (button.dataset.section) {
          section = button.dataset.section as Section;
          render();
          tab("draft-tab");
        }
        if (button.getAttribute("role") === "tab") tab(button.id);
        if (button.dataset.mode) {
          find<HTMLSelectElement>(".composer select").value =
            button.dataset.mode;
          root!
            .querySelectorAll(".mode")
            .forEach((card) =>
              card.classList.toggle("selected", card.contains(button)),
            );
          find("#composer").scrollIntoView?.({ block: "center" });
          find("#idea").focus();
          status(
            button.dataset.mode +
              " selected. Sign in to generate your own PRD.",
          );
        }
        if (button.id === "scope-action") {
          section = "scope";
          render();
          tab("draft-tab");
        }
        if (button.id === "review-action") {
          const checklist = find("#review-checklist");
          checklist.hidden = !checklist.hidden;
          button.querySelector("[data-review-label]")!.textContent =
            checklist.hidden
              ? "View review checklist"
              : "Hide review checklist";
        }
        if (button.dataset.export) {
          const ex = examples[current],
            prompt = button.dataset.export === "prompt";
          const text =
            (prompt
              ? "Build a product using this example specification.\n\n"
              : "") +
            "# " +
            ex.title +
            "\n\n> Example document\n\n## Problem\n" +
            ex.problem +
            "\n\n## Scope\n" +
            ex.scope +
            "\n\n## Acceptance criteria\n" +
            ex.criteria +
            "\n";
          const url = URL.createObjectURL(
            new Blob([text], { type: "text/markdown;charset=utf-8" }),
          );
          const link = document.createElement("a");
          link.href = url;
          link.download = prompt ? "example-ai-prompt.md" : "example-prd.md";
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          find<HTMLDetailsElement>(".exportbox").open = false;
          status("Example download prepared.");
        }
      },
      { signal: controller.signal },
    );
    root.addEventListener(
      "submit",
      (event) => {
        if ((event.target as HTMLElement).id !== "composer") return;
        event.preventDefault();
        render();
        tab("draft-tab");
        find("#product").scrollIntoView?.({ block: "center" });
        status(
          "Showing a local example. Sign in to generate a PRD from your own idea.",
        );
      },
      { signal: controller.signal },
    );
    root.addEventListener(
      "change",
      (event) => {
        const input = event.target as HTMLSelectElement;
        if (input.id !== "revision-select") return;
        const scope = input.value === "scope";
        find("#revision-title").textContent = scope
          ? "A boundary for the first release"
          : "Criteria you can verify";
        find("#revision-old").textContent = scope
          ? "− Include checkout and card payments."
          : "− Orders should be easy to find.";
        find("#revision-new").textContent = scope
          ? "+ Order ahead and track status. Payments are out of scope."
          : "+ A submitted order appears in the barista queue with its items and status.";
      },
      { signal: controller.signal },
    );
    root.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape")
          find<HTMLDetailsElement>(".exportbox").open = false;
        const target = event.target as HTMLElement;
        if (
          target.getAttribute("role") === "tab" &&
          ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
        ) {
          event.preventDefault();
          const id =
            event.key === "Home"
              ? "draft-tab"
              : event.key === "End"
                ? "changes-tab"
                : target.id === "draft-tab"
                  ? "changes-tab"
                  : "draft-tab";
          tab(id);
          find("#" + id).focus();
        }
      },
      { signal: controller.signal },
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [ref, examples]);
}
