# CI/CD

Deckdown uses GitHub Actions.

## CI

Workflow: `.github/workflows/ci.yml`

Runs on pull requests and pushes to `main` or `master`.

Steps:

- Install dependencies with pnpm.
- Typecheck every shared package and the web app.
- Build shared packages and the web app.
- Validate the canonical example deck.
- Render a standalone HTML smoke artifact.
- Upload the rendered HTML artifact.

## CD

Workflow: `.github/workflows/deploy-pages.yml`

Runs on pushes to `main` and manual dispatch.

Steps:

- Build the `@deckdown/web` app.
- Upload `apps/web/dist` as a GitHub Pages artifact.
- Deploy to GitHub Pages.

The repository must have GitHub Pages enabled with GitHub Actions as the source.
