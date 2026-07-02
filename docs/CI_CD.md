# CI/CD

Deckdown uses GitHub Actions.

## CI

Workflow: `.github/workflows/ci.yml`

Runs on pull requests and pushes to `main` or `master`.

Steps:

- Install dependencies with pnpm.
- Typecheck every shared package and the web app.
- Build shared packages and the desktop frontend.
- Validate the canonical example deck.
- Render a standalone HTML export smoke file.
- Typecheck the Tauri desktop shell.

## Desktop Client Build

Workflow: `.github/workflows/desktop.yml`

Runs on version tags such as `v0.1.0` and manual dispatch.

Steps:

- Build the Tauri desktop client on macOS and Windows.
- Upload native bundle artifacts from `apps/desktop/src-tauri/target/release/bundle`.
- Artifact names are `deckdown-macos` and `deckdown-windows`.
- On version tags, download both artifacts and attach the bundle files to the GitHub Release.

`apps/web` is the desktop client frontend. Deckdown does not deploy a hosted web preview as a product surface.

## npm Packages

The first npm-ready packages are:

- `@deckdown/schema`
- `@deckdown/renderer`

They are configured for public scoped publishing, but publication is manual until the `@deckdown` npm scope is available and release ownership is confirmed.
