/**
 * Design mode stub for production/static Netlify builds.
 *
 * The original Anything-generated file imported `../../../../shared/design-mode`,
 * but that shared package is not included in this exported project. React Router
 * SPA builds therefore failed in Netlify with UNRESOLVED_IMPORT.
 *
 * CronoAula does not need Anything's internal design toolbar in production, so
 * this file intentionally registers no design-mode behavior.
 */

export type GetStyleInfo = (resolved: { element?: Element | null }) => {
  className?: string;
  styles?: Record<string, string> | null;
};

export function initDesignMode(_getStyleInfo?: GetStyleInfo) {
  return function reselect() {
    // no-op in exported production app
  };
}

// Keep a harmless side effect so `import '../__create/design-mode'` remains valid.
initDesignMode();
