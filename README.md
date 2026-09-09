# Prathamesh Portfolio

A personal digital space for a product designer who designs products, builds useful things, and explores interfaces, systems, and technology.

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

## Commands

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run preview   # Preview the production build locally
```

## Tech stack

- React 19 with TypeScript
- Vite for local development and production builds
- Plain CSS for the visual system, keeping the site easy to continue editing
- Local TypeScript data modules for portfolio content

## Project structure

```text
src/
  data/             Typed content models and placeholder records
  components/       Small presentation primitives used by the homepage
  App.tsx           Application entry surface
  index.css         Homepage visual language and responsive layout
  main.tsx          React bootstrap
index.html          SEO and application shell
```

Content is intentionally separated from presentation. Replace records in `src/data/` and media paths under `public/media/` as real work becomes available.

## Deployment

The production output is a static `dist/` directory. It can be deployed to any static host that supports Vite output, including Netlify, Vercel, or GitHub Pages. Deployment configuration will be added only if a target host requires it.

## Status

Milestone 2 is complete: the art-directed homepage and visual foundation are in place. Design detail experiences, Build detail experiences, and the Explore archive interaction continue in later milestones.
