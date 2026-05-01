import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AngiographicFunctionTrajectory } from "../AngiographicFunctionTrajectory";

describe("AngiographicFunctionTrajectory", () => {
  it("renders the four trajectory stages", () => {
    render(<AngiographicFunctionTrajectory />);
    expect(screen.getByTestId("trajectory-step-L1")).toBeInTheDocument();
    expect(screen.getByTestId("trajectory-step-L2")).toBeInTheDocument();
    expect(screen.getByTestId("trajectory-step-L3")).toBeInTheDocument();
    expect(screen.getByTestId("trajectory-step-PostPhD")).toBeInTheDocument();
  });

  it("describes L1 as see & decide and the long-term selected revascularization horizon", () => {
    render(<AngiographicFunctionTrajectory />);
    expect(screen.getByText(/See & Decide/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected 4-Zero Revascularization/i)).toBeInTheDocument();
  });

  it("makes the non-replacement disclaimer visible", () => {
    render(<AngiographicFunctionTrajectory />);
    expect(
      screen.getByText(
        /does not claim to replace conventional angiography during the thesis/i,
      ),
    ).toBeInTheDocument();
  });
});
