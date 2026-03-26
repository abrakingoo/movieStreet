# Security Notice

## Environment Variables Setup

This application requires a TMDB API Bearer Token to function. **Never commit your actual API token to version control.**

### Setup Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your TMDB API token from [TMDB API Settings](https://www.themoviedb.org/settings/api)

3. Add your token to `.env`:
   ```
   TMDB_BEARER_TOKEN=your_actual_token_here
   ```

4. Run the app (the token is automatically loaded):
   ```bash
   npm start
   ```

### How It Works

- `.env` contains your actual token (gitignored ✅)
- `scripts/load-env.js` reads `.env` and generates `src/environments/environment.ts`
- `src/environments/environment.ts` is auto-generated and gitignored ✅
- `src/environments/environment.template.ts` is the template committed to git
- `npm start` and `npm build` automatically run the script

### Files in Git

✅ **Committed to Git:**
- `.env.example` - Template showing required format
- `src/environments/environment.template.ts` - Empty template
- `scripts/load-env.js` - Script to load environment

❌ **NOT Committed (gitignored):**
- `.env` - Your actual token
- `src/environments/environment.ts` - Auto-generated file with token

### Important

- ✅ `.env` is in `.gitignore`
- ✅ `src/environments/environment.ts` is in `.gitignore`
- ✅ `.env.example` shows the required format
- ✅ `environment.template.ts` is the safe template
- ❌ Never commit actual tokens
- ❌ Never edit `environment.ts` manually (it's auto-generated)
