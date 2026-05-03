import { Component, type ReactNode } from "react";

/**
 * Global ErrorBoundary — last-line defense against a runtime crash in any
 * lazy-loaded route taking down the whole shell.
 *
 * Intentionally minimal: we don't want this file to depend on Tailwind classes
 * or i18n, because if those are the source of the crash the boundary itself
 * would also fail.
 */
interface State {
  error: Error | null;
}

interface Props {
  children: ReactNode;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // Logged here so it surfaces in the browser console + any future Sentry hook.
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Captured runtime error:", error, info);
  }

  private handleReload = () => {
    this.setState({ error: null });
    if (typeof window !== "undefined") window.location.assign("/");
  };

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "hsl(210 40% 98%)",
            color: "hsl(222 47% 11%)",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              Something went wrong.
            </h1>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>
              The application hit an unexpected error. Returning to the home page usually
              fixes it. If the problem persists, please contact support.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: "hsl(210 80% 45%)",
                color: "white",
                padding: "10px 20px",
                borderRadius: 8,
                border: 0,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Return to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
