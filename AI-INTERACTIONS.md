# AI Interactions Log — Helfy eCommerce


| Field | Value |
| ----- | ----- |
| **Tool** | [Cursor](https://cursor.com) — Agent / Composer |
| **Hard rules** | `.cursorrules` (auto-loaded) |
| **Blueprint** | `ai-blueprint/initial.md` + guidelines + capabilities |
| **Repository** | Single monorepo (`frontend`, `backend`, `shared`, `database`) |

---

## Models Used

Cursor Models : 

Composer 2.5 -> using for simple tasks to save credits (creating components, styling, easy logic to buld )
Opus 4.7 ->  using for creating planning tree and for harder logic

---

## Session Prompts (Chronological)

1. Planning mode Opus4.7 
    "Your Role : Full-stack engineer."
    "Your Task :You must develop a comprehensive "AI Blueprint" (consisting of system design definitions for AI driven development, and an initial prompt) that, when executed, generates a fully functional,high-quality eCommerce platform.
    
    Core Technology Stack 
        - Frontend: React.js (with beautiful, modern UI/UX)
        - Backend: Node.js (Express)
        - Database: MySQL
        - Design: Taiwind.css
    
    Required eCommerce Features
        - Authentication: Full Login/Sign-up flow with JWT or Session management.
        - Product Catalog: Search, filter, and detailed product views.
        - Cart & Checkout: Persistent cart and a multi-step checkout process.
        - Account Section: Order history and profile management.
    
    Use typescript.
    Create project tree structure, monorepo file where backend and frontent lives together. "

2. Agent mode Composer 2.5 
    "Follow and Execute phase0-phase 7 step by step and give me commit message suggestion after you will finish each task"

3. During Executing phases : 
    1. Agent mode to Composer 2.5 
        "Check .cursorrules and give me a report if something is missing or if its not relevant to this project and add them into file.(I gave AI project rules).

    2. Agent mode to Composer 2.5 
        "add initial.md capability-definitions.md and engineering-guidelines.md files in specipic folders"
    3. Agent mode to Composer 2.5 
        AI created clinerules by my mistake, and I asked it to remove file form roject and also from blueprint
    4. Agent mode to Composer 2.5  
        "Write me a command to reset root password set new one on mysql workbench"
    5. Agent mode to Composer 2.5  
        "Write me a command to creates databse and user on mysql for helfy_ecommerce".

4. Debug mode Composer 2.5
    "Click on Add to cart button returns error : failed to add items to cart. find the problem and fix it. give me report it finished"





## Verification Commands (run locally)

```bash
npm install
npm run build          # shared → backend → frontend
npm run lint           # frontend ESLint
npm run db:migrate     # requires MySQL
npm run db:seed
npm run dev            # :5173 + :4000
```

---

## Notes for Reviewers

- **No secrets** are committed; use `.env.example` / `backend/.env` / `frontend/.env`.
- **Payment is mocked** — no real charges (`payment.service.ts`).
- **Guest cart** uses `X-Session-Id` header + localStorage session UUID.
- Full acceptance criteria checklist: `ai-blueprint/initial.md` § Progress Tracker.
