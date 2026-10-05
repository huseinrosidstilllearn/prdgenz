"use client";
import Link from "next/link";
import { useRef } from "react";
import { FREE_PLAN_LIMIT, PRO_PRICE } from "@prdgenz/shared";
import { Icon, ThemeToggle } from "@prdgenz/ui";
import { Wordmark } from "../shell/wordmark";
import { useLandingExample } from "./use-landing-example";
export const EXAMPLES = {
  coffee: {
    title: "Coffee shop ordering",
    idea: "An ordering app for a small coffee shop. Customers order ahead, and baristas see a shared queue.",
    overview:
      "Let customers browse the menu and order ahead. Give baristas a single queue to prepare and complete orders.",
    problem:
      "Customers wait in line while staff track orders on paper. Baristas need one reliable view of pending orders.",
    scope:
      "Browse the menu, place an order, and follow its status. Payments and loyalty programs stay outside the first release.",
    criteria:
      "A submitted order appears in the barista queue with its items and status.",
  },
  study: {
    title: "Study planner",
    idea: "A study planner for university students. Split subjects into weekly tasks and keep track of what is finished.",
    overview:
      "Give students a weekly plan with subjects, tasks, and completion status.",
    problem:
      "Students keep assignments in separate notes and lose track of the work due this week.",
    scope:
      "Create subjects, set weekly tasks, and mark work complete. Calendar integration stays outside the first release.",
    criteria:
      "A completed task stays marked complete when the student returns to the weekly plan.",
  },
  report: {
    title: "Team reporting",
    idea: "A weekly reporting tool for small teams. Collect updates and export one summary for the project lead.",
    overview:
      "Collect project updates in one place and hand off a weekly summary.",
    problem:
      "Project leads chase updates across messages and cannot tell which reports are missing.",
    scope:
      "Submit weekly updates and export a summary. Automated email delivery stays outside the first release.",
    criteria:
      "The summary contains each submitted update with its author and reporting week.",
  },
};
export function Landing({
  signedIn,
  isSelfHost,
}: {
  signedIn: boolean;
  isSelfHost?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  useLandingExample(root, EXAMPLES);
  const primaryHref = signedIn ? "/prd/new" : "/register";
  const primaryLabel = signedIn ? "New PRD" : "Create an account";
  const header = (
    <header className="nav">
      <Wordmark />
      <nav className="navlinks" aria-label="Main">
        <a href="#modes">Writing modes</a>
        <a href="#revisions">Version history</a>
        <Link href="/pricing">Pricing</Link>
      </nav>
      <div className="navtools">
        <ThemeToggle />
        <Link href={signedIn ? "/dashboard" : "/login"}>
          {signedIn ? "Dashboard" : "Log in"}
        </Link>
        <Link className="primary" href={primaryHref}>
          {primaryLabel}
        </Link>
      </div>
    </header>
  );
  const footer = (
    <footer className="footer">
      <Wordmark />
      <span>
        <Link href={primaryHref}>{primaryLabel}</Link> ·{" "}
        <Link href="/pricing">Pricing</Link>
        {!signedIn && (
          <>
            {" "}
            · <Link href="/login">Log in</Link>
          </>
        )}
      </span>
    </footer>
  );
  return (
    <div ref={root} className="landing-direction">
      <a className="skip" href="#main-content">
        Skip to content
      </a>
      <div className="wrap">
        {header}
        <p className="notice">
          {isSelfHost
            ? "Self-host / Your infrastructure / BYOK"
            : `Free · ${FREE_PLAN_LIMIT} PRDs/mo · Pro $${PRO_PRICE}/mo · BYOK`}
        </p>
        <main id="main-content">
          <section className="hero">
            <div>
              <p className="eyebrow">Know what you are building.</p>
              <h1>
                Your next idea.
                <br />A <span>clearer first draft.</span>
              </h1>
              <p className="intro">
                Define the problem, decide the scope, and give your team a
                product brief they can build from.
              </p>
            </div>
            <div className="heroright">
              <form className="composer" id="composer">
                <label htmlFor="idea">What would you like to build?</label>
                <textarea
                  id="idea"
                  required
                  placeholder="An ordering app for a small coffee shop. Customers order ahead, and baristas see a shared queue."
                  defaultValue="An ordering app for a small coffee shop. Customers order ahead, and baristas see a shared queue."
                />
                <div className="composerfooter">
                  <select aria-label="Drafting mode">
                    <option>One-Shot</option>
                    <option>Chat</option>
                    <option>Create from Scratch</option>
                  </select>
                  <button className="primary with-icon" type="submit">
                    Preview the example
                    <Icon name="arrow" />
                  </button>
                </div>
              </form>
              <div className="examples" aria-label="Example ideas">
                <button data-example="coffee" className="with-icon">
                  <Icon name="coffee" />
                  Coffee shop
                </button>
                <button data-example="study" className="with-icon">
                  <Icon name="book" />
                  Study planner
                </button>
                <button data-example="report" className="with-icon">
                  <Icon name="chart" />
                  Team reporting
                </button>
              </div>
              <p className="hint">
                Local demo. No AI request, account, or API key required.
              </p>
            </div>
          </section>
          <div
            className="hero-art wrap"
            aria-label="Example: an idea becomes a scoped product brief"
          >
            <svg viewBox="0 0 570 430" aria-hidden="true">
              <defs>
                <linearGradient id="beam" x2="1" y2="1">
                  <stop stopColor="#5267cc" stopOpacity="0"></stop>
                  <stop offset=".5" stopColor="#b4c9ff"></stop>
                  <stop offset="1" stopColor="#7bf7c6" stopOpacity="0"></stop>
                </linearGradient>
                <filter id="blur">
                  <feGaussianBlur stdDeviation="12"></feGaussianBlur>
                </filter>
              </defs>
              <path
                d="M250 -40C240 120 540 90 420 255S150 290 200 435"
                fill="none"
                stroke="#5769cc"
                strokeWidth="48"
                opacity=".45"
                filter="url(#blur)"
              ></path>
              <path
                d="M250 -40C240 120 540 90 420 255S150 290 200 435"
                fill="none"
                stroke="url(#beam)"
                strokeWidth="3"
              ></path>
              <circle
                cx="426"
                cy="268"
                r="110"
                fill="#6d83df"
                opacity=".08"
              ></circle>
            </svg>
            <div className="scene-card idea-card">
              <div className="scene-label with-icon">
                <Icon name="chat" />
                01 / YOUR STARTING POINT
              </div>
              <h3>
                “Ordering ahead,
                <br />
                without the queue.”
              </h3>
              <p>
                A coffee shop idea. A first user.
                <br />A problem worth solving.
              </p>
              <div className="scene-tags">
                <span>Customers</span>
                <span>Baristas</span>
              </div>
            </div>
            <div className="scene-card brief-card">
              <div className="scene-label with-icon">
                <Icon name="document" />
                02 / A PRODUCT BRIEF
              </div>
              <h3>
                Clear scope.
                <br />
                Testable decisions.
              </h3>
              <div className="scene-section">
                <b>FIRST RELEASE</b>Menu, order, and preparation status.
              </div>
              <div className="scene-section">
                <b>ACCEPTANCE CRITERIA</b>Orders appear in the barista queue.
              </div>
            </div>
            <div className="scene-output">
              <i aria-hidden="true">
                <Icon name="check" />
              </i>
              03 / Ready to review and build
            </div>
          </div>
          <div className="product" id="product">
            <div className="editor">
              <div className="editortop">
                <strong style={{ fontSize: "13px" }}>PRD</strong>
                <span className="crumb">
                  Example workspace /{" "}
                  <span id="crumb-title">Coffee shop ordering</span>
                </span>
                <span className="demo">DEMO</span>
                <details className="exportbox">
                  <summary className="paperbutton with-icon">
                    <Icon name="download" />
                    Export
                    <Icon name="chevron" />
                  </summary>
                  <div className="exportlist">
                    <button data-export="markdown">Download Markdown</button>
                    <button data-export="prompt">Download AI prompt</button>
                  </div>
                </details>
              </div>
              <div className="editorlayout">
                <aside className="sections" aria-label="Document sections">
                  <h3>IN THIS DOCUMENT</h3>
                  <button data-section="overview" aria-current="true">
                    <Icon name="document" />
                    Overview
                  </button>
                  <button data-section="problem" aria-current="false">
                    <Icon name="target" />
                    Problem
                  </button>
                  <button data-section="scope" aria-current="false">
                    <Icon name="layers" />
                    Scope
                  </button>
                  <button data-section="criteria" aria-current="false">
                    <Icon name="list" />
                    Acceptance criteria
                  </button>
                  <small>
                    Example document
                    <br />
                    English / First release
                  </small>
                </aside>
                <div className="draft">
                  <div
                    className="tabs"
                    role="tablist"
                    aria-label="Document view"
                  >
                    <button
                      id="draft-tab"
                      role="tab"
                      aria-selected="true"
                      aria-controls="draft-panel"
                      tabIndex={0}
                    >
                      <Icon name="document" />
                      Document
                    </button>
                    <button
                      id="changes-tab"
                      role="tab"
                      aria-selected="false"
                      aria-controls="changes-panel"
                      tabIndex={-1}
                    >
                      <Icon name="history" />
                      Version changes
                    </button>
                  </div>
                  <div
                    id="draft-panel"
                    className="tabbody document"
                    role="tabpanel"
                    aria-labelledby="draft-tab"
                  >
                    <p className="eyebrow">Product requirements / Example</p>
                    <h2 id="doc-title">Coffee shop ordering</h2>
                    <div className="docmeta">
                      Customers &amp; baristas · Focused first release
                    </div>
                    <div id="section-content">
                      <h3>The idea, with boundaries.</h3>
                      <p>
                        Let customers browse the menu and order ahead. Give
                        baristas a single queue to prepare and complete orders.
                      </p>
                      <div className="check">
                        <i aria-hidden="true">
                          <Icon name="check" />
                        </i>
                        <p>
                          <strong>Definition of done</strong>
                          <br />A submitted order appears in the barista queue
                          with its items and status.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    id="changes-panel"
                    hidden
                    className="tabbody document"
                    role="tabpanel"
                    aria-labelledby="changes-tab"
                  >
                    <p className="eyebrow">
                      Example comparison / Revision 1 → 2
                    </p>
                    <h2>A smaller, clearer release.</h2>
                    <h3>Scope</h3>
                    <div className="diffrow removed">
                      − Include checkout and card payments.
                    </div>
                    <div className="diffrow added">
                      + Take orders and show preparation status. Payments stay
                      outside this release.
                    </div>
                    <p>
                      Review changes before choosing which revision to keep.
                    </p>
                  </div>
                </div>
                <aside className="review">
                  <h3>DOCUMENT TOOLS</h3>
                  <div className="reviewbox">
                    <h4>One section at a time</h4>
                    <p>
                      Select a section to see how problem, scope, and acceptance
                      criteria fit together.
                    </p>
                    <button className="paperbutton with-icon" id="scope-action">
                      <Icon name="target" />
                      Inspect the scope
                    </button>
                  </div>
                  <div className="reviewbox">
                    <h4>Ready for review?</h4>
                    <p>
                      In the product, share a read-only link or export your
                      requirements.
                    </p>
                    <button
                      className="paperbutton with-icon"
                      id="review-action"
                    >
                      <Icon name="list" />
                      <span data-review-label>View review checklist</span>
                    </button>
                  </div>
                  <div id="review-checklist" hidden>
                    <label>
                      <input type="checkbox" /> Problem is clear
                    </label>
                    <label>
                      <input type="checkbox" /> Scope has boundaries
                    </label>
                    <label>
                      <input type="checkbox" /> Criteria are testable
                    </label>
                  </div>
                </aside>
              </div>
              <div className="docfooter">
                <span>Example content, not AI generated in this preview.</span>
                <span>Markdown · AI prompt</span>
              </div>
            </div>
          </div>
          <div className="productcaption">
            <span>
              Try the section navigation, version tabs, and export menu.
            </span>
            <span>Write → Refine → Hand off</span>
          </div>
          <div className="providers">
            <small>
              BRING YOUR OWN KEY
              <br />
              Choose your provider in the live product.
            </small>
            <b>OpenAI</b>
            <b>Anthropic</b>
            <b>Google</b>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Compatible endpoints
            </span>
          </div>
          <section className="section" id="modes">
            <div className="sectionheading">
              <div>
                <p className="eyebrow">Find your starting point</p>
                <h2>
                  You do not have to
                  <br />
                  think in the same way.
                </h2>
              </div>
              <p>
                Start with a complete idea, talk through the gaps, or build your
                document section by section.
              </p>
            </div>
            <div className="modegrid">
              <article className="mode selected">
                <small className="with-icon">
                  <Icon name="bolt" />
                  01 / ONE-SHOT
                </small>
                <h3>A brief in, a draft out.</h3>
                <p>
                  For the idea you already have. Put the users, needs, and
                  constraints in one place.
                </p>
                <div className="mini">
                  “A coffee shop app, with ordering
                  <br />
                  and a shared barista queue.”
                  <span>Problem · Scope · Acceptance</span>
                </div>
                <button data-mode="One-Shot" className="with-icon">
                  Try One-Shot in the composer
                </button>
              </article>
              <article className="mode">
                <small className="with-icon">
                  <Icon name="chat" />
                  02 / CHAT
                </small>
                <h3>Talk the idea through.</h3>
                <p>
                  For the questions you have not answered yet. Work through the
                  product in conversation.
                </p>
                <div className="mini">
                  <div className="bubble">Who is the first user?</div>
                  <div className="bubble">The barista taking orders.</div>
                </div>
                <button data-mode="Chat" className="with-icon">
                  Try Chat in the composer
                </button>
              </article>
              <article className="mode">
                <small className="with-icon">
                  <Icon name="layers" />
                  03 / CREATE FROM SCRATCH
                </small>
                <h3>Make each section count.</h3>
                <p>
                  For a structured approach. Work through requirements one
                  section at a time.
                </p>
                <div className="mini">
                  <div className="lineitem">01 Problem</div>
                  <div className="lineitem">02 Target user</div>
                  <div className="lineitem">03 Acceptance criteria</div>
                </div>
                <button data-mode="Create from Scratch" className="with-icon">
                  Try the structured mode
                </button>
              </article>
            </div>
          </section>
        </main>
      </div>
      <section className="featureband" id="revisions">
        <div className="wrap section featurelayout">
          <div>
            <p className="eyebrow">A draft is a starting point</p>
            <h2>
              Change your mind.
              <br />
              Keep the reasoning.
            </h2>
            <p>
              Compare revisions, see what changed, and restore the version that
              captures the right decision.
            </p>
            <a
              href={primaryHref}
              style={{ textDecoration: "underline", fontSize: "13px" }}
            >
              Create an account to save your own drafts
            </a>
          </div>
          <div className="revision">
            <div className="revisiontop">
              <span>EXAMPLE / VERSION COMPARISON</span>
              <select
                aria-label="Example revision comparison"
                id="revision-select"
              >
                <option value="scope">Scope change</option>
                <option value="criteria">Acceptance change</option>
              </select>
            </div>
            <h3 id="revision-title">A boundary for the first release</h3>
            <div className="diffrow removed" id="revision-old">
              − Include checkout and card payments.
            </div>
            <div className="diffrow added" id="revision-new">
              + Order ahead and track status. Payments are out of scope.
            </div>
          </div>
        </div>
      </section>
      <div className="wrap">
        {!isSelfHost && (
          <section className="section selfhost">
            <p className="eyebrow">Your infrastructure, your workspace</p>
            <h2>Run it yourself.</h2>
            <p>
              Self-host runs separately from cloud subscriptions, with your own
              provider credentials.
            </p>
            <a
              href="https://github.com/huseinrosidstilllearn/prdgenz"
              className="with-icon"
            >
              View the repository
              <Icon name="arrow" />
            </a>
          </section>
        )}
        <section className="section faq" id="faq">
          <p className="eyebrow">Before your first brief</p>
          <h2>A few practical answers.</h2>
          <details>
            <summary>
              Do I need my own API key?
              <Icon name="chevron" />
            </summary>
            <p>
              For AI generation in the live product, yes. Add your provider key
              in Settings. This design preview uses local example content and
              sends no AI requests.
            </p>
          </details>
          <details>
            <summary>
              Can I use all three writing modes on Free?
              <Icon name="chevron" />
            </summary>
            <p>
              Yes. Cloud Free includes all three modes, sharing, and version
              history. PDF export is a Pro feature.
            </p>
          </details>
          <details>
            <summary>
              Is self-host part of a subscription?
              <Icon name="chevron" />
            </summary>
            <p>
              No. Self-host runs separately from cloud subscriptions. It uses
              your own infrastructure and provider credentials.
            </p>
          </details>
        </section>
        {footer}
      </div>
      <div className="toast" id="status" role="status" hidden></div>
    </div>
  );
}
