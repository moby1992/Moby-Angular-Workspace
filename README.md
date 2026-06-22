# MobyAngularWorkspace

An Angular workspace containing one application and one shared library, built with:

- **Angular 22**
- **Angular Material 22** (azure/blue prebuilt theme, CSS-based)
- **Tailwind CSS 4** (via the `@tailwindcss/postcss` plugin)
- **CSS** for component styling

## Projects

| Project | Type        | Location        | Description                                                       |
| ------- | ----------- | --------------- | ----------------------------------------------------------------- |
| `web`   | application | `projects/web`  | Demo application that consumes the `ui` library.                  |
| `ui`    | library     | `projects/ui`   | Buildable library exposing the reusable `UiCard` Material component. |

## Styling

- Tailwind 4 is wired up through `.postcssrc.json` and imported in `projects/web/src/styles.css` via `@import "tailwindcss";`.
- Angular Material's `azure-blue` prebuilt theme is loaded from the `styles` array in `angular.json`.
- Roboto and Material Icons fonts are linked in `projects/web/src/index.html`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Then open `http://localhost:4200/`. The app reloads automatically on source changes.

## Building

The `ui` library is referenced via a TypeScript path mapping that points at its build output, so build the library before (or alongside) the app:

```bash
ng build ui      # build the shared library
ng build web     # build the application
```

Build artifacts are written to the `dist/` directory.

## Code scaffolding

```bash
ng generate component component-name --project web
```

For a complete list of available schematics, run `ng generate --help`.

## Running unit tests

Unit tests run on the [Vitest](https://vitest.dev/) test runner:

```bash
ng test web
ng test ui
```

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
