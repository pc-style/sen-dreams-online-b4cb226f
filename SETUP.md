# Important: Setup Instructions

Before running the app, you MUST run Convex setup:

1. Run `bunx convex dev` - This will:
   - Prompt you to log in with GitHub
   - Let you create or select a Convex project
   - Automatically generate your `.env.local` file with `VITE_CONVEX_URL`
   - Generate type definitions in `convex/_generated/`

2. After Convex is running, in a separate terminal run:
   - `bun dev` - Start the Vite dev server

The app will NOT work without completing step 1 first!
