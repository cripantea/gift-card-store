@AGENTS.md
1. **Prisma 7 Protocol:** Utilizza sempre la sintassi di Prisma 7 facendo riferimento ai file presenti in `.claude/skills/prisma-*`. Utilizza i driver adapter ufficiali (`@prisma/adapter-pg`) per `src/lib/prisma.ts`.
2. **Next.js 16 (App Router):** Utilizza Server Components di default e dichiara `'use client'` solo dove strettamente necessario per l'interattività dell'interfaccia.
3. **TypeScript Strictly Typed:** Non utilizzare mai `any`. Definisci sempre gli argomenti e le risposte delle API/Server Actions.
