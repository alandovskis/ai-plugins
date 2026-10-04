---
name: web-stack
description: Preferred web stack is Rust compiled to WebAssembly. Use whenever starting, scaffolding, choosing technology for, or extending a web app, frontend, browser UI or web-facing component, and when writing requirements or designs that name a web technology.
---

# Web Stack: Rust / WebAssembly

Web applications are written in **Rust compiled to WebAssembly (WASM)**. Do not default to a JavaScript or TypeScript framework (React, Vue, Svelte, Next.js, etc.) unless the user asks for one or a hard constraint requires it. When it does, say why and ask before deviating.

## Defaults

1. **Language:** Rust for application logic and UI, targeting `wasm32-unknown-unknown`.
2. **Browser bindings:** `wasm-bindgen`, with `web-sys` and `js-sys` for DOM and browser APIs. Keep hand-written JavaScript to a minimum and isolate it behind a small, typed interface.
3. **Build and dev server:** Trunk for browser apps (bundling, dev server, rebuild on change). `wasm-pack` is for building Rust libraries consumed from JavaScript, not whole apps.
4. **UI framework:** a Rust one (for example Leptos, Yew or Dioxus). The user has not chosen one, so ask once when a project starts, then record the choice in the project's docs and reuse it.
5. **Backend:** Rust as well when a server is needed, sharing types with the frontend through a common crate.
6. **Always use the latest versions** of crates and the Rust toolchain. Look up current releases with Context7 or crates.io rather than relying on memory, since this ecosystem changes quickly.

## Practices

- **Project layout:** a Cargo workspace; shared types in their own crate; the WASM crate as `cdylib`.
- **Size and speed:** release builds with `opt-level = "s"` or `"z"` and LTO, measured with `twiggy` or the bundle size, and `wasm-opt` when worthwhile. Avoid pulling large crates into the WASM bundle for small tasks.
- **Errors:** return `Result` and surface failures to the user; do not let a panic silently blank the page. Install a panic hook that logs to the console in debug builds.
- **Testing:** unit tests with `cargo test` for pure logic; browser tests with `wasm-bindgen-test`; end-to-end tests through a real browser for key flows.
- **Accessibility:** WASM does not exempt apps from it. Use semantic HTML, labels and keyboard support.
- **Bilingual EN/FR:** applies to every app. Use a Rust i18n approach (for example Fluent) or the framework's, with `en` and `fr` resources, and `Intl` through `js-sys`/`web-sys` for locale formatting. See the `bilingual-apps` skill.
- **CI:** GitHub Actions. Install the target with `rustup target add wasm32-unknown-unknown`, then run `cargo fmt --check`, `cargo clippy -- -D warnings`, `cargo test`, and the Trunk release build. See the `ci` skill.

## Workflow

- In requirements and design documents, name Rust/WASM as the web stack and note any approved exception.
- For a new project, scaffold the workspace, Trunk config, i18n resources (`en`, `fr`) and the GitHub Actions workflow first, then build features.
