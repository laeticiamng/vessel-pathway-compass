import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScientificSafetyBox } from "../ScientificSafetyBox";

describe("ScientificSafetyBox", () => {
  it("separates strategic ambition and scientific boundary", () => {
    render(<ScientificSafetyBox />);
    expect(screen.getByText("Strategic ambition")).toBeInTheDocument();
    expect(screen.getByText("Scientific boundary")).toBeInTheDocument();
  });

  it("declares no human revascularization during the thesis", () => {
    render(<ScientificSafetyBox />);
    expect(
      screen.getByText(/thesis does not perform human revascularization/i),
    ).toBeInTheDocument();
  });

  it("keeps conventional angiography mandatory for emergencies and complex cases", () => {
    render(<ScientificSafetyBox />);
    expect(
      screen.getByText(
        /Conventional angiography remains mandatory for emergencies, complex/i,
      ),
    ).toBeInTheDocument();
  });
});
