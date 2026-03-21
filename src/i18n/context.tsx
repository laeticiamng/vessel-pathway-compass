import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { en } from "./en";
import { fr } from "./fr";
import { de } from "./de";

export type Language = "en" | "fr" | "de";

const dictionaries = { en, fr, de } as const;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18N_CONTEXT_KEY = "__aquamr_flow_i18n_context__";
const globalI18n = globalThis as typeof globalThis & {
  [I18N_CONTEXT_KEY]?: React.Context<I18nContextType | null>;
};

const I18nContext =
  globalI18n[I18N_CONTEXT_KEY] ?? createContext<I18nContextType | null>(null);

if (!globalI18n[I18N_CONTEXT_KEY]) {
  globalI18n[I18N_CONTEXT_KEY] = I18nContext;
}

function getNestedValue(obj: any, path: string): any {
  const val = path.split(".").reduce((acc, part) => acc?.[part], obj);
  if (typeof val === "string" || Array.isArray(val)) return val;
  return path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("aquamr-flow-lang");
    return (stored === "fr" || stored === "de") ? stored : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("aquamr-flow-lang", lang);
  }, []);

  const t = useCallback(
    (key: string) => getNestedValue(dictionaries[language], key),
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
