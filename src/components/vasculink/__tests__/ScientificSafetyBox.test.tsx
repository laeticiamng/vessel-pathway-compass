import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScientificSafetyBox } from "../ScientificSafetyBox";
import { LanguageProvider } from "@/i18n/context";

// Le composant utilise désormais useTranslation() : il doit être rendu dans
// un LanguageProvider (langue par défaut : en).
const renderWithI18n = () =>
  render(
    <LanguageProvider>
      <ScientificSafetyBox />
    </LanguageProvider>,
  );

describe("ScientificSafetyBox", () => {
  it("separates strategic ambition and scientific boundary", () => {
    renderWithI18n();
    expect(screen.getByText("Strategic ambition")).toBeInTheDocument();
    expect(screen.getByText("Scientific boundary")).toBeInTheDocument();
  });

  it("declares no human revascularization during the thesis", () => {
    renderWithI18n();
    expect(
      screen.getByText(/thesis does not perform human revascularization/i),
    ).toBeInTheDocument();
  });

  it("keeps conventional angiography mandatory for emergencies and complex cases", () => {
    renderWithI18n();
    expect(
      screen.getByText(
        /Conventional angiography remains mandatory for emergencies, complex/i,
      ),
    ).toBeInTheDocument();
  });
});
