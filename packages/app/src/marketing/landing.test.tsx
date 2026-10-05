import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_PLAN_LIMIT, PRO_PRICE } from "@prdgenz/shared";
import { Landing } from "./landing";
import { ThemeProvider } from "@prdgenz/ui";

const renderLanding = (props: { signedIn: boolean; isSelfHost?: boolean }) =>
  render(
    <ThemeProvider>
      <Landing {...props} />
    </ThemeProvider>,
  );

beforeEach(() =>
  vi.stubGlobal("localStorage", {
    getItem: () => null,
    setItem: () => undefined,
  }),
);
afterEach(() => vi.unstubAllGlobals());

describe("Landing", () => {
  it("invites a signed-out visitor to register", () => {
    renderLanding({ signedIn: false });
    expect(
      screen.getAllByRole("link", { name: /create an account/i }).length,
    ).toBeGreaterThan(0);
    // "Log in" appears in the header and again in the footer.
    expect(
      screen.getAllByRole("link", { name: /log in/i }).length,
    ).toBeGreaterThan(0);
  });

  it("sends a signed-in user to a new PRD instead", () => {
    renderLanding({ signedIn: true });
    expect(
      screen.getAllByRole("link", { name: /new prd/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it("quotes the real plan limits rather than invented numbers", () => {
    renderLanding({ signedIn: false });
    // The hero stamp reads "Free · 10 PRDs/mo · Pro $9/mo · BYOK".
    expect(
      screen.getByText(
        new RegExp(
          `Free . ${FREE_PLAN_LIMIT} PRDs/mo . Pro \\$${PRO_PRICE}/mo . BYOK`,
        ),
      ),
    ).toBeInTheDocument();
  });

  it("switches the example and keeps its document sections usable", () => {
    renderLanding({ signedIn: false });
    fireEvent.click(screen.getByRole("button", { name: "Study planner" }));
    expect(
      screen.getByRole("heading", { name: "Study planner" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Scope" }));
    expect(
      screen.getAllByText(
        /Calendar integration stays outside the first release/,
      ).length,
    ).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("tab", { name: "Version changes" }));
    expect(
      screen.getByRole("tabpanel", { name: "Version changes" }),
    ).toBeVisible();
  });

  it("hides the self-host note on a self-hosted install", () => {
    renderLanding({ signedIn: true, isSelfHost: true });
    expect(
      screen.queryByRole("heading", { name: /run it yourself/i }),
    ).toBeNull();
  });
});
