# CLAUDE.md

A single Tampermonkey userscript that translates areaclientes.comercializadoraregulada.es into English. No build, no dependencies: `comercializadora-regulada-en.user.js` ships as-is from `main` via the raw.githubusercontent `@updateURL`/`@downloadURL`, and `en.json` rides along as a `@resource`. Sibling of `../naturgy-en` (same author, same DOM-translation layer).

Releasing = commit + push to `main`. **Bump `@version` on every change to any file**, `en.json` included: managers only re-download `@resource`s when the script version changes.

## The target site

A legacy server-rendered Java app (`/ovh-web/*.gas`, jQuery). The language is a server session setting switched by `?lang=es|ca|gl|eu` (also the `#idioma` menu); there is no English, and `?lang=en` falls back to Spanish. Fetching any page with `?lang=xx` changes the session language, so leave it on `es`.

## How the script works

`en.json` maps Spanish text (whitespace-normalised, trimmed) to English. A `MutationObserver` from document-start translates text nodes, `placeholder`/`title`/`alt`/`aria-label` and submit/button `value`s whose text is a key; a final pass on `DOMContentLoaded` covers text nodes the parser grew after insertion and the `<title>`. Surrounding whitespace is kept, since it separates text from adjacent links. Country `<select>`s (>100 options, ISO-code values) are renamed with `Intl.DisplayNames`. Writes happen only when the value changes; an unconditional write re-queues a mutation and loops forever (the bug naturgy-en 1.0.0 had).

Some keys are fragments of a sentence split by links or `<strong>` (`"Recibir"`, `"La"`, `"El"`); their English is written to read right in that sentence, not standalone.

## Keeping `en.json` in sync

The area needs a login, so an agent cannot crawl it from Node. `collect.js` runs in the user's logged-in browser (DevTools console, or a browser tool's JS execution): it GETs the read-only pages in `PAGES` and lists strings missing from the published `en.json`. Never add personal data from its output (name, address, CUPS, email, contract and bank numbers) — the repo is public. Never GET action URLs (logout, NPS accept/decline, `CancelAccount`, payment gateway results).
