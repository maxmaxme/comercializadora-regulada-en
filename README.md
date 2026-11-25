# Comercializadora Regulada Área Clientes in English

Userscript that translates the [areaclientes.comercializadoraregulada.es](https://areaclientes.comercializadoraregulada.es/) customer area (Comercializadora Regulada, Gas & Power — Naturgy's regulated-tariff supplier, TUR gas and PVPC electricity) into **English**. No app changes, nothing leaves your browser.

For Naturgy's main customer area (omega.naturgy.es), see [naturgy-en](https://github.com/maxmaxme/naturgy-en).

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or [Violentmonkey](https://violentmonkey.github.io/)). In Chrome, also turn on **Allow User Scripts** in the extension's details page.
2. Install the script: **https://raw.githubusercontent.com/maxmaxme/comercializadora-regulada-en/main/comercializadora-regulada-en.user.js**
3. Open the customer area with the site language set to **Español** (the default) — it's in English.

Auto-updates via `@updateURL`. To get Spanish back, disable the script.

## How it works

The site is server-rendered and has no English locale: its language menu offers Spanish, Catalan, Galician and Basque, and `?lang=en` falls back to Spanish. So the script translates the Spanish pages in the DOM: any text node, button label, `placeholder`, `title`, `alt` or `aria-label` whose text (whitespace-normalised) is a key of [`en.json`](en.json) gets the English value. Country lists use their ISO codes and get English names from the browser (`Intl.DisplayNames`).

## Caveats

- Only Spanish is translated. With the site set to Catalan, Galician or Basque, nothing matches.
- Text is matched whole, so strings that embed changing data (dates in banners, amounts, statuses not yet seen) stay Spanish until added to `en.json`.
- Pages only reachable in states the author's account hasn't been in (bills, payments, open requests) may have untranslated text. PRs welcome.
- Third-party widgets (cookie banner, chatbot) and PDFs stay Spanish.

## Development

`collect.js` lists the strings `en.json` doesn't cover yet. The area needs a login, so it runs in the browser: log in, open DevTools on the site and paste the file into the console. It reads the main pages (GET only), prints the missing strings and copies them to the clipboard as JSON. **Remove your own data** (name, address, CUPS, email, contract numbers) before adding the rest to `en.json`.

`en.json` ships as a `@resource`, which managers re-download only when the script version changes: after editing **any** file, **bump `@version`** in the userscript, then commit + push to `main`.

## Disclaimer

Unofficial, not affiliated with Comercializadora Regulada or Naturgy. Use at your own risk.
