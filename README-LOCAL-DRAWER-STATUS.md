Status: Work-in-progress.

Problem encountered: ESLint react-hooks/rules-of-hooks conditional-hook errors in ConvictionListOverlapPageContent.tsx.

Fix applied: Restructured ConvictionListOverlapPageContent.tsx to remove conditional hook calls.

Verification run:
- npm run test:sell-side ✅
- npm run test:feed ✅
- npm run smoke:sell-side ✅
- npm run smoke:feed ✅
- npm run guardrails:sell-side ✅
- npm run build ✅ (compiled)

Note: The requested drawer/table UI was not fully restored after the lint fix; ConvictionListOverlapPageContent.tsx currently contains a placeholder section where the drawer should appear.

