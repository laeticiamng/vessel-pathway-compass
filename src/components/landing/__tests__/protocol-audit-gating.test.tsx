import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

// Mocks must be declared before importing the components under test.
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));
vi.mock("@/hooks/useUserRoles", () => ({
  useUserRoles: vi.fn(),
}));
vi.mock("@/hooks/useAuditLog", () => ({
  useAuditLog: () => ({ log: vi.fn() }),
}));
vi.mock("@/i18n/context", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        in: () => ({
          order: () => ({ limit: async () => ({ data: [], error: null }) }),
        }),
      }),
    }),
  },
}));
vi.mock("@/lib/protocolCompleteness", () => ({
  auditProtocolCompleteness: () => ({
    score: 100,
    okCount: 8,
    warnCount: 0,
    errorCount: 0,
    results: [],
  }),
}));
vi.mock("@/lib/contentVersions", () => ({
  getContentVersion: () => ({ version: "1.0.0" }),
}));

import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { ComplianceBadge } from "@/components/landing/ComplianceBadge";
import { ProtocolAuditLogExporter } from "@/components/landing/ProtocolAuditLogExporter";
import { ProtocolCompletenessChecklist } from "@/components/landing/ProtocolCompletenessChecklist";

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseRoles = vi.mocked(useUserRoles);

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
    </HelmetProvider>,
  );
}

function setRoles(opts: { isAdmin?: boolean; isResearchLead?: boolean; roles?: string[] }) {
  mockedUseRoles.mockReturnValue({
    roles: (opts.roles ?? []) as never,
    hasRole: ((r: string | string[]) => {
      const targets = Array.isArray(r) ? r : [r];
      return targets.some((x) => (opts.roles ?? []).includes(x));
    }) as never,
    isAdmin: !!opts.isAdmin,
    isResearchLead: !!opts.isResearchLead,
    isPhysician: false,
    isTrainee: false,
    isLoading: false,
    isAuthenticated: true,
  } as never);
}

describe("Protocol audit components — RBAC gating (defense-in-depth)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Anonymous users (no session)", () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({ user: null, session: null, loading: false } as never);
      setRoles({});
    });

    it("ComplianceBadge renders nothing — no badge, no counters", () => {
      const { container } = wrap(<ComplianceBadge />);
      expect(container.querySelector("[id='compliance-badge-title']")).toBeNull();
      expect(container.textContent).not.toMatch(/100/);
    });

    it("ProtocolAuditLogExporter renders nothing", () => {
      const { container } = wrap(<ProtocolAuditLogExporter />);
      expect(container.firstChild).toBeNull();
    });

    it("ProtocolCompletenessChecklist renders nothing", () => {
      const { container } = wrap(<ProtocolCompletenessChecklist />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Authenticated user without governance role (403-equivalent)", () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: { id: "u1", email: "u@x.io" },
        session: {},
        loading: false,
      } as never);
      setRoles({ roles: ["physician"] });
    });

    it("hides ComplianceBadge entirely", () => {
      const { container } = wrap(<ComplianceBadge />);
      expect(container.firstChild).toBeNull();
    });

    it("hides audit log exporter (no export buttons exposed)", () => {
      const { container } = wrap(<ProtocolAuditLogExporter />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByText(/exportCsv/i)).toBeNull();
      expect(screen.queryByText(/exportPdf/i)).toBeNull();
    });

    it("hides completeness checklist", () => {
      const { container } = wrap(<ProtocolCompletenessChecklist />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Loading state — neutral skeletons, no audit data", () => {
    it("renders skeleton (no score) while roles are loading", () => {
      mockedUseAuth.mockReturnValue({
        user: { id: "u1" },
        session: {},
        loading: false,
      } as never);
      mockedUseRoles.mockReturnValue({
        roles: [],
        hasRole: () => false,
        isAdmin: false,
        isResearchLead: false,
        isPhysician: false,
        isTrainee: false,
        isLoading: true,
        isAuthenticated: true,
      } as never);
      const { container } = wrap(<ComplianceBadge />);
      expect(container.querySelector("[data-testid='compliance-badge-skeleton']")).toBeTruthy();
      expect(container.textContent).not.toMatch(/100/);
    });
  });

  describe("Admin sees audit components", () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: { id: "admin1", email: "a@x.io" },
        session: {},
        loading: false,
      } as never);
      setRoles({ isAdmin: true, roles: ["admin"] });
    });

    it("renders ComplianceBadge with score", () => {
      wrap(<ComplianceBadge />);
      expect(screen.getByText(/100/)).toBeTruthy();
    });

    it("renders audit log exporter with export controls", () => {
      wrap(<ProtocolAuditLogExporter />);
      expect(screen.getByText(/exportCsv/)).toBeTruthy();
      expect(screen.getByText(/exportPdf/)).toBeTruthy();
    });

    it("renders completeness checklist", () => {
      wrap(<ProtocolCompletenessChecklist />);
      expect(screen.getByText("pages.protocol.completeness.title")).toBeTruthy();
    });
  });

  describe("Research lead sees audit components", () => {
    beforeEach(() => {
      mockedUseAuth.mockReturnValue({
        user: { id: "rl1" },
        session: {},
        loading: false,
      } as never);
      setRoles({ isResearchLead: true, roles: ["research_lead"] });
    });

    it("renders ComplianceBadge", () => {
      wrap(<ComplianceBadge />);
      expect(screen.getByText(/100/)).toBeTruthy();
    });

    it("renders audit log exporter", () => {
      wrap(<ProtocolAuditLogExporter />);
      expect(screen.getByText(/exportCsv/)).toBeTruthy();
    });
  });
});
