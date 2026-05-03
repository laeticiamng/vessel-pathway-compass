import { useState } from "react";
import jsPDF from "jspdf";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation, type Language } from "@/i18n/context";
import { getContentVersion } from "@/lib/contentVersions";

interface SectionContent {
  doesTitle: string;
  does: string[];
  doesNotTitle: string;
  doesNot: string[];
  traceTitle: string;
  trace: string[];
  title: string;
  intro: string;
}

interface Props {
  content: SectionContent;
}

const LABELS: Record<Language, {
  cta: string;
  generating: string;
  toc: string;
  versionLine: (v: string, d: string) => string;
  generated: string;
  disclaimerTitle: string;
  disclaimers: string[];
  pageOf: (n: number, t: number) => string;
  filename: string;
}> = {
  en: {
    cta: "Export PDF",
    generating: "Generating PDF…",
    toc: "Table of contents",
    versionLine: (v, d) => `Content version ${v} — last updated ${d}`,
    generated: "Generated",
    disclaimerTitle: "Compliance-ready disclaimers (no regulatory promise)",
    disclaimers: [
      "VASCU-LINK / AquaMR Flow is research software in academic validation. It is NOT a CE-marked medical device under MDR (EU 2017/745) and NO notified body has certified the software at this stage.",
      "NO HIPAA compliance and NO FDA clearance are claimed. The platform is operated under GDPR (EU) and nFADP (CH) and is not marketed in the US healthcare system.",
      "Every output (CI-AKI, L1 board, simulation, digital twin, AI summary) is decision support inside an approved research protocol. Final clinical responsibility stays with the qualified clinician.",
      "AquaMR Flow targets specific angiography-like functions on selected indications and is not a 1:1 substitute for digital subtraction angiography.",
      "L3 covers preclinical / animal-model work only. No human revascularisation is performed via the platform during the doctoral phase.",
      "This document reflects the state at the version date above. Refer to /audit-limitations for the canonical, dated version.",
    ],
    pageOf: (n, t) => `Page ${n} / ${t}`,
    filename: "VASCU-LINK-Audit-Limitations",
  },
  fr: {
    cta: "Exporter en PDF",
    generating: "Génération du PDF…",
    toc: "Sommaire",
    versionLine: (v, d) => `Version du contenu ${v} — dernière mise à jour ${d}`,
    generated: "Généré le",
    disclaimerTitle: "Mentions « compliance-ready » (sans promesse réglementaire)",
    disclaimers: [
      "VASCU-LINK / AquaMR Flow est un logiciel de recherche en validation académique. Ce N'EST PAS un dispositif médical marqué CE selon le MDR (UE 2017/745) et AUCUN organisme notifié n'a certifié le logiciel à ce stade.",
      "AUCUNE conformité HIPAA ni clearance FDA n'est revendiquée. La plateforme est exploitée sous RGPD (UE) et nLPD (CH) et n'est pas commercialisée dans le système de santé américain.",
      "Chaque sortie (CI-AKI, board L1, simulation, jumeau numérique, synthèse IA) est une aide à la décision dans un protocole de recherche approuvé. La responsabilité clinique finale reste au clinicien qualifié.",
      "AquaMR Flow vise certaines fonctions angiographiques sur indications ciblées et n'est pas un substitut 1:1 à l'angiographie de soustraction numérique.",
      "L3 couvre uniquement le travail préclinique / modèle animal. Aucune revascularisation humaine n'est réalisée via la plateforme pendant la phase doctorale.",
      "Ce document reflète l'état à la date de version ci-dessus. Référez-vous à /audit-limitations pour la version canonique datée.",
    ],
    pageOf: (n, t) => `Page ${n} / ${t}`,
    filename: "VASCU-LINK-Audit-Limites",
  },
  de: {
    cta: "Als PDF exportieren",
    generating: "PDF wird erstellt…",
    toc: "Inhaltsverzeichnis",
    versionLine: (v, d) => `Inhaltsversion ${v} — zuletzt aktualisiert ${d}`,
    generated: "Erstellt",
    disclaimerTitle: "Compliance-ready Hinweise (ohne regulatorisches Versprechen)",
    disclaimers: [
      "VASCU-LINK / AquaMR Flow ist Forschungssoftware in akademischer Validierung. Es ist KEIN CE-zertifiziertes Medizinprodukt nach MDR (EU 2017/745); KEINE benannte Stelle hat die Software derzeit zertifiziert.",
      "KEINE HIPAA-Konformität und KEINE FDA-Zulassung wird beansprucht. Die Plattform wird nach DSGVO (EU) und nDSG (CH) betrieben und nicht im US-Gesundheitssystem vermarktet.",
      "Jede Ausgabe (CI-AKI, L1-Board, Simulation, digitaler Zwilling, KI-Zusammenfassung) ist Entscheidungsunterstützung innerhalb eines genehmigten Forschungsprotokolls. Die endgültige klinische Verantwortung bleibt beim qualifizierten Kliniker.",
      "AquaMR Flow zielt auf bestimmte angiographische Funktionen bei gezielten Indikationen und ist kein 1:1-Ersatz für digitale Subtraktionsangiographie.",
      "L3 deckt nur präklinische / Tiermodell-Arbeiten ab. Während der Doktoratsphase wird über die Plattform keine humane Revaskularisation durchgeführt.",
      "Dieses Dokument spiegelt den Stand des oben genannten Versionsdatums wider. Die kanonische, datierte Fassung steht unter /audit-limitations.",
    ],
    pageOf: (n, t) => `Seite ${n} / ${t}`,
    filename: "VASCU-LINK-Audit-Grenzen",
  },
};

export function AuditLimitationsPdfButton({ content }: Props) {
  const { language } = useTranslation();
  const labels = LABELS[language] ?? LABELS.en;
  const meta = getContentVersion("audit-limitations");
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 16;
      const maxW = pageW - margin * 2;
      const now = new Date();
      const generatedIso = now.toISOString().slice(0, 19).replace("T", " ");

      const writeWrapped = (
        text: string,
        x: number,
        y: number,
        size = 10,
        style: "normal" | "bold" | "italic" = "normal"
      ): number => {
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, maxW - (x - margin)) as string[];
        const lineH = size * 0.45;
        let cy = y;
        for (const line of lines) {
          if (cy > pageH - margin - 10) {
            doc.addPage();
            cy = margin;
          }
          doc.text(line, x, cy);
          cy += lineH;
        }
        return cy;
      };

      // ---- Cover ----
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("VASCU-LINK — " + content.title, margin, 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110);
      if (meta) {
        doc.text(labels.versionLine(meta.version, meta.updatedAt), margin, 31);
      }
      doc.text(`${labels.generated}: ${generatedIso} UTC`, margin, 36);
      doc.setTextColor(0);

      let y = 46;
      y = writeWrapped(content.intro, margin, y, 10, "italic") + 4;

      // ---- TOC ----
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(labels.toc, margin, y + 4);
      y += 10;
      const toc = [
        `1. ${content.doesTitle}`,
        `2. ${content.doesNotTitle}`,
        `3. ${content.traceTitle}`,
        `4. ${labels.disclaimerTitle}`,
      ];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const line of toc) {
        doc.text(line, margin + 2, y);
        y += 6;
      }

      const renderSection = (
        idx: number,
        title: string,
        items: string[],
        ordered = false
      ) => {
        doc.addPage();
        let cy = margin + 4;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`${idx}. ${title}`, margin, cy);
        cy += 8;
        items.forEach((item, i) => {
          const bullet = ordered ? `${i + 1}.` : "•";
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(bullet, margin, cy);
          cy = writeWrapped(item, margin + 6, cy, 10, "normal") + 2;
        });
      };

      renderSection(1, content.doesTitle, content.does);
      renderSection(2, content.doesNotTitle, content.doesNot);
      renderSection(3, content.traceTitle, content.trace, true);
      renderSection(4, labels.disclaimerTitle, labels.disclaimers);

      // ---- Footer (page numbers + version) ----
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(130);
        const footerL = meta
          ? `VASCU-LINK · ${content.title} · v${meta.version} (${meta.updatedAt})`
          : `VASCU-LINK · ${content.title}`;
        doc.text(footerL, margin, pageH - 8);
        doc.text(labels.pageOf(i, total), pageW - margin, pageH - 8, {
          align: "right",
        });
        doc.setTextColor(0);
      }

      const stamp = now.toISOString().slice(0, 10);
      const versionPart = meta ? `-v${meta.version}` : "";
      doc.save(`${labels.filename}${versionPart}-${stamp}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={busy}
      variant="default"
      size="sm"
      data-testid="audit-pdf-export"
    >
      {busy ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          {labels.generating}
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-1" />
          {labels.cta}
        </>
      )}
    </Button>
  );
}

export default AuditLimitationsPdfButton;
