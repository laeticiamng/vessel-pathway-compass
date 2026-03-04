

## Fix: "View Plans" button not visible in ContentGate overlay

### Problem

The ContentGate CTA overlay (with "Sign In" and "View Plans" buttons) is not clearly visible when a user is not logged in. The issue stems from the CSS layout:

1. The gradient overlay uses `absolute inset-0 top-[15vh]` which can cover the CTA buttons area
2. The CTA section uses `relative -mt-16` which may not position correctly depending on content height
3. On pages with short content, the 35vh cutoff may result in an awkward layout where the buttons are hidden or partially obscured

### Fix

Restructure the ContentGate component to ensure the CTA section is always fully visible below the gradient:

**`src/components/ContentGate.tsx`** -- Adjust layout:
- Wrap the preview + gradient in a single container with `relative max-h-[35vh] overflow-hidden`
- Place the gradient as an `absolute bottom-0` element inside that container
- Move the CTA section completely outside the clipped container so it's never cut off
- Remove the negative margin hack (`-mt-16`)

```text
┌──────────────────────────────────┐
│  <div relative max-h-[35vh]     │  ← clipped container
│    overflow-hidden>             │
│    {children}                   │
│    <gradient absolute bottom-0> │
│  </div>                        │
├──────────────────────────────────┤
│  <div CTA section>              │  ← always visible, outside clip
│    🔒 Lock icon                 │
│    "Sign in for full access"    │
│    [Sign In]  [View Plans]      │
│  </div>                        │
└──────────────────────────────────┘
```

### Changes

| File | Change |
|---|---|
| `src/components/ContentGate.tsx` | Fix CSS layout so CTA + "View Plans" button is always visible below the gradient |

