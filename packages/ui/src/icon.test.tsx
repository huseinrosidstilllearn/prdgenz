import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

describe("Icon", () => {
  it("keeps decorative paths out of accessible button names", () => {
    const { getByRole, container } = render(
      <button>
        <Icon name="document" />
        Open document
      </button>,
    );
    expect(getByRole("button", { name: "Open document" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
