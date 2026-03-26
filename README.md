# MovieStreet
<img width="1917" height="1050" alt="upcomingPage" src="https://github.com/user-attachments/assets/066b694c-8678-4226-9173-992614750391" />
<img width="1917" height="1050" alt="trendingPage" src="https://github.com/user-attachments/assets/9f1b48f8-040d-45e8-b8a5-12704122d55f" />
<img width="1917" height="1050" alt="myListPage" src="https://github.com/user-attachments/assets/07c38cfe-d1cb-489f-a733-c0590cf8eaf6" />
<img width="1917" height="1050" alt="moodPickerPage" src="https://github.com/user-attachments/assets/1dc72289-45e2-426c-aa16-419d5fd2562e" />
<img width="1917" height="1050" alt="homePage" src="https://github.com/user-attachments/assets/26afe38a-eefd-423f-af1d-8f97bdaa9348" />


A full-featured movie and TV series discovery application built with Angular 21. It allows users to browse trending content, explore by category or genre, manage a personal watchlist, and get mood-based recommendations — all powered by the TMDB API.

The application is server-side rendered (SSR) via Angular Universal and ships as a Progressive Web App (PWA) with offline support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Routes](#available-routes)
- [Project Structure](#project-structure)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [SSR Server](#ssr-server)
- [PWA Support](#pwa-support)
- [Additional Resources](#additional-resources)

---

## Features

- Browse trending movies and TV series
- Explore content by category: Movies, Series, Animation, K-Drama, Anime
- Filter and sort by genre
- Full-text search across movies and series
- Mood-based content recommendations
- Upcoming releases section
- Movie and series collections browser
- Detailed view for individual titles including cast, ratings, and related content
- Personal watchlist with local persistence
- Progressive Web App with installable experience and offline support
- Server-side rendering for improved SEO and initial load performance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 |
| Rendering | Angular SSR (Universal) with Express 5 |
| Language | TypeScript 5.9 |
| Styling | CSS |
| Testing | Vitest |
| PWA | Angular Service Worker |
| Data Source | TMDB API |
| AI Features | OpenAI API |
| Package Manager | npm 11 |

---

## Prerequisites

- Node.js 20 or later
- npm 11 or later
- Angular CLI 21 (`npm install -g @angular/cli`)
- A TMDB API Bearer Token — obtain one at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- (Optional) An OpenAI API key for mood-based recommendation features

---

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd moviestreet
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (see [Environment Variables](#environment-variables)).

4. Start the development server:

```bash
npm start
```

The application will be available at `http://localhost:4200/`. It reloads automatically on file changes.

---

## Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `TMDB_BEARER_TOKEN` | TMDB API v4 read access token | Yes |
| `OPENAI_API_KEY` | OpenAI API key for mood recommendations | No |

The `scripts/load-env.js` script automatically injects these values into the Angular environment files before each build or serve run.

---

## Available Routes

| Path | Description |
|---|---|
| `/` | Home — trending content |
| `/trending` | Full trending page |
| `/movies` | Movies category |
| `/series` | TV series category |
| `/animation` | Animation category |
| `/kdrama` | K-Drama category |
| `/anime` | Anime category |
| `/genres` | Browse by genre |
| `/search` | Search movies and series |
| `/mood` | Mood-based recommendations |
| `/upcoming` | Upcoming releases |
| `/watchlist` | Personal watchlist |
| `/collections` | Movie collections |
| `/collection/:id` | Collection detail view |
| `/details/:type/:id` | Movie or series detail view |

---

## Project Structure

```
src/
  app/
    back-to-top/        Scroll-to-top button component
    category/           Shared category page (movies, series, anime, etc.)
    collection-details/ Individual collection detail view
    collections/        Collections browser
    core/               Core services and app-wide utilities
    details/            Movie and series detail page
    footer/             Footer component
    genre/              Genre browser
    header/             Header and navigation
    interceptors/       HTTP interceptors (e.g. auth token injection)
    loading-bar/        Global loading indicator
    models/             TypeScript interfaces and data models
    mood-picker/        Mood-based recommendation UI
    movie-grid/         Reusable grid layout for media cards
    not-found/          404 page
    pwa-install/        PWA install prompt component
    search/             Search page
    services/           API and data services
    trending/           Home trending section
    trending-page/      Full trending page
    upcoming/           Upcoming releases page
    watchlist/          Watchlist page
  environments/         Environment configuration files
  assets/               Static assets
public/
  icons/                PWA icons (multiple resolutions)
  manifest.webmanifest  PWA manifest
scripts/
  load-env.js           Pre-build environment loader
  generate-icons.js     PWA icon generation script
```

---

## Development

Start the dev server with live reload:

```bash
npm start
# or
ng serve
```

Watch mode for incremental builds:

```bash
npm run watch
```

Generate a new component:

```bash
ng generate component component-name
```

For a full list of available schematics:

```bash
ng generate --help
```

---

## Building

Production build:

```bash
npm run build
# or
ng build
```

Build artifacts are output to the `dist/` directory. The production build applies optimizations including ahead-of-time (AOT) compilation, tree-shaking, and minification.

---

## Testing

Run unit tests with Vitest:

```bash
npm test
# or
ng test
```

Run end-to-end tests (requires a separate e2e framework to be configured):

```bash
ng e2e
```

---

## SSR Server

After building, serve the application with server-side rendering using the Express server:

```bash
npm run serve:ssr:moviestreet
```

This runs the compiled SSR bundle at `dist/moviestreet/server/server.mjs`, which handles both API proxying and pre-rendered HTML delivery.

---

## PWA Support

The application is configured as a Progressive Web App using `@angular/service-worker`. It includes:

- A web app manifest (`public/manifest.webmanifest`) with app metadata and icons
- Service worker caching for offline support
- Multiple icon resolutions (72x72 through 512x512) for various device contexts
- An in-app install prompt component (`pwa-install`)

To regenerate PWA icons from the base SVG:

```bash
node scripts/generate-icons.js
```

---

## Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [TMDB API Documentation](https://developer.themoviedb.org/docs)
- [Vitest Documentation](https://vitest.dev)
- [Angular Service Worker Guide](https://angular.dev/ecosystem/service-workers)
