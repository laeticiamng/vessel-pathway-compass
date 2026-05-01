import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModalityPositioningMatrix } from "../ModalityPositioningMatrix";

describe("ModalityPositioningMatrix", () => {
  it("compares Doppler, VASCU-LINK and conventional angiography", () => {
    render(<ModalityPositioningMatrix />);
    expect(screen.getByText("Doppler")).toBeInTheDocument();
    expect(screen.getByText("VASCU-LINK L1")).toBeInTheDocument();
    expect(screen.getByText("Conventional angiography")).toBeInTheDocument();
  });

  it("declares no human revascularization during thesis", () => {
    render(<ModalityPositioningMatrix />);
    expect(screen.getByText(/Not during thesis/i)).toBeInTheDocument();
  });

  it("frames Doppler as the first-line hemodynamic test", () => {
    render(<ModalityPositioningMatrix />);
    expect(
      screen.getByText(/Doppler remains the\s+first-line hemodynamic test/i),
    ).toBeInTheDocument();
  });

  it("explains the pre-revascularization mapping question VASCU-LINK targets", () => {
    render(<ModalityPositioningMatrix />);
    expect(
      screen.getByText(/4-zero angiographic map support pre-revascularization decision-making/i),
    ).toBeInTheDocument();
  });
});
