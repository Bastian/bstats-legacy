# bStats Legacy

> Historic codebase behind [bStats.org](https://bStats.org/), the analytics platform for Minecraft plugins.

> **Heads-up:** The production rewrite of bStats lives in a separate repository. This legacy app is still useful for reference, experiments, and community pull requests that bring the old UI back to life.

## Stack

- Node.js + Express
- EJS templates
- Redis-backed sessions
- Tailwind CSS 3 (compiled locally) for styling
- Highcharts for interactive visualisations

## Getting Started

```bash
npm install
npm run build:css   # compiles Tailwind -> public/stylesheets/tailwind.css
npm start           # launches the Express server (see config.json for port)
```

During development you can keep the CSS build running in watch mode:

```bash
npm run dev:css
```

The generated stylesheet is committed to `public/stylesheets/tailwind.css` so the app can be deployed without an additional build step. Re-run `npm run build:css` before pushing changes that touch Tailwind classes.

## Frontend Notes

- Accent/theme colours are driven by a cookie (`custom-color1`) and exposed as CSS variables. Tailwind utilities reference those variables, so switching colours updates the entire shell without rebuilding CSS.
- Highcharts adopts a custom Tailwind-flavoured theme located in `public/javascripts/charts/themes/chartTheme.js`.
- Legacy Materialize components are being phased out view-by-view; some admin pages may still rely on the old assets.

## Contributing

Pull requests are welcome for polish, bug fixes, and documentation. Large feature work should target the new codebase instead. If in doubt, open an issue or ping the maintainers on Discord.
