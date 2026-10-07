import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AngiographicFunctionTrajectory } from "../AngiographicFunctionTrajectory";
import { LanguageProvider } from "@/i18n/context";

// Le composant utilise désormais useTranslation() : il doit être rendu dans
// un LanguageProvider (langue par défaut : en).
const renderWithI18n = () =>
  render(
    <LanguageProvider>
      <AngiographicFunctionTrajectory />
    </LanguageProvider>,
  );

describe("AngiographicFunctionTrajectory", () => {
  it("renders the four trajectory stages", () => {
    renderWithI18n();
    expect(screen.getByTestId("trajectory-step-L1")).toBeInTheDocument();
    expect(screen.getByTestId("trajectory-step-L2")).toBeInTheDocument();
    expect(screen.getByTestId("trajectory-step-L3")).toBeInTheDocument();
    expect(screen.getByTestId("trajectory-step-PostPhD")).toBeInTheDocument();
  });

  it("describes L1 as see & decide and the long-term selected revascularization horizon", () => {
    renderWithI18n();
    expect(screen.getByText(/See & Decide/i)).toBeInTheDocument();
    expect(screen.getByText(/Selected 4-Zero Revascularization/i)).toBeInTheDocument();
  });

  it("makes the non-replacement disclaimer visible", () => {
    renderWithI18n();
    expect(
      screen.getByText(
        /does not claim to replace conventional angiography during the thesis/i,
      ),
    ).toBeInTheDocument();
  });
});
