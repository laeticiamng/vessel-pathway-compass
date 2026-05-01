import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModalityPositioningMatrix } from "../ModalityPositioningMatrix";
import { LanguageProvider } from "@/i18n/context";

const renderWithI18n = () =>
  render(
    <LanguageProvider>
      <ModalityPositioningMatrix />
    </LanguageProvider>,
  );

describe("ModalityPositioningMatrix", () => {
  it("compares Doppler, VASCU-LINK and conventional angiography", () => {
    renderWithI18n();
    expect(screen.getByText("Doppler")).toBeInTheDocument();
    expect(screen.getByText("VASCU-LINK L1")).toBeInTheDocument();
    // Default language may be EN/FR/DE — match any of the three angiography headers
    expect(
      screen.getByText(/Conventional angiography|Angiographie conventionnelle|Konventionelle Angiographie/i),
    ).toBeInTheDocument();
  });

  it("renders the human revascularization row with a non-thesis value", () => {
    renderWithI18n();
    expect(
      screen.getByText(/Not during thesis|Pas pendant la thèse|Nicht während der Dissertation/i),
    ).toBeInTheDocument();
  });

  it("frames Doppler as the first-line hemodynamic test", () => {
    renderWithI18n();
    expect(
      screen.getByText(
        /Doppler remains the\s+first-line hemodynamic test|Le Doppler reste le test hémodynamique de première ligne|Der Doppler bleibt der hämodynamische Test der ersten Wahl/i,
      ),
    ).toBeInTheDocument();
  });

  it("explains the pre-revascularization mapping question VASCU-LINK targets", () => {
    renderWithI18n();
    expect(
      screen.getByText(
        /4-zero angiographic map support pre-revascularization decision-making|cartographie angiographique 4-zéro peut-elle soutenir la décision pré-revascularisation|4-Null-Angiographiekarte die Entscheidung vor der Revaskularisation unterstützen/i,
      ),
    ).toBeInTheDocument();
  });
});
