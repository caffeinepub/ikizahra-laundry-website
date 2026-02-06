# Specification

## Summary
**Goal:** Allow very long descriptions to display fully (no truncation) and be edited comfortably across gallery-related UI.

**Planned changes:**
- Remove any UI truncation on gallery description text (e.g., `line-clamp-*`) and ensure descriptions wrap across multiple lines on: public gallery cards, admin gallery management cards, and featured gallery cards.
- Add safe wrapping/word-breaking for long unbroken strings to prevent overflow in gallery card layouts, and preserve line breaks where relevant.
- Ensure all description edit inputs are multiline and do not enforce short UI limits (no client-side `maxLength` or similar) so admins can enter and save long, multi-paragraph descriptions.

**User-visible outcome:** Gallery descriptions can be as long as needed, display fully everywhere they appear (wrapping cleanly), and admins can enter/edit long descriptions without hitting artificial UI limits.
