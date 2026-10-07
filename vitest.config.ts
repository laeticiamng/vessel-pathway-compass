import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Valeurs factices (aucun secret) : le client Supabase généré lève
    // « supabaseUrl is required » à l'import si ces variables manquent,
    // ce qui faisait échouer 9 fichiers de tests en CI (pas de .env).
    // Aucun test ne doit joindre un vrai projet Supabase.
    env: {
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "cle-factice-tests",
      VITE_SUPABASE_PROJECT_ID: "projet-factice-tests",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
