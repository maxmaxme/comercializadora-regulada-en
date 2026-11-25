// ==UserScript==
// @name         Comercializadora Regulada Área Clientes in English
// @namespace    https://github.com/maxmaxme/comercializadora-regulada-en
// @version      1.1.0
// @description  Translates the areaclientes.comercializadoraregulada.es customer area (Naturgy's regulated gas & electricity supplier) into English.
// @author       maxmaxme
// @match        https://areaclientes.comercializadoraregulada.es/*
// @run-at       document-start
// @resource     EN https://raw.githubusercontent.com/maxmaxme/comercializadora-regulada-en/main/en.json
// @grant        GM_getResourceText
// @updateURL    https://raw.githubusercontent.com/maxmaxme/comercializadora-regulada-en/main/comercializadora-regulada-en.user.js
// @downloadURL  https://raw.githubusercontent.com/maxmaxme/comercializadora-regulada-en/main/comercializadora-regulada-en.user.js
// ==/UserScript==
(() => {
  'use strict';

  // The site has no English locale (`?lang=en` falls back to Spanish), so the Spanish
  // pages are translated in the DOM: a text node or attribute whose whitespace-
  // normalised text is a key of en.json gets its English value.
  const EN = JSON.parse(GM_getResourceText('EN'));
  const ATTRIBUTES = ['placeholder', 'title', 'alt', 'aria-label', 'value'];
  const COUNTRIES = new Intl.DisplayNames(['en'], { type: 'region' });

  // Ambiguous words and sentence fragments are keyed per page ("MyContracts.gas › En curso"),
  // so a translation written for one context doesn't leak into another.
  const PAGE = location.pathname.replace(/^\/ovh-web\//, '');
  const lookup = (text) => {
    const key = text.replace(/\s+/g, ' ').trim();
    return EN[`${PAGE} › ${key}`] ?? EN[key];
  };

  // Writing an unchanged value still queues a mutation and would re-trigger the
  // observer forever, so only real changes are written.
  const translateText = (node) => {
    const english = lookup(node.data);
    if (english === undefined) return;
    // Server-rendered text keeps its surrounding whitespace, which separates it from links.
    const [, lead, , trail] = node.data.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const value = lead + english + trail;
    if (value !== node.data) node.data = value;
  };

  const translateAttributes = (el) => {
    for (const attr of ATTRIBUTES) {
      if (attr === 'value' && !(el.type === 'submit' || el.type === 'button')) continue;
      const current = el.getAttribute(attr);
      const english = current && lookup(current);
      if (english !== undefined && english !== current) el.setAttribute(attr, english);
    }
    // Country lists are <option value="ES">España</option>: ISO codes, named by the browser.
    if (el.tagName === 'OPTION' && /^[A-Z]{2}$/.test(el.value) && el.parentElement?.options?.length > 100) {
      const name = COUNTRIES.of(el.value);
      if (name && name !== el.value && name !== el.textContent) el.textContent = name;
    }
  };

  const translateTree = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) translateText(node);
    translateAttributes(root);
    for (const el of root.querySelectorAll('[placeholder], [title], [alt], [aria-label], input[type=submit], input[type=button], option')) translateAttributes(el);
  };

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') translateText(m.target);
      else if (m.type === 'attributes') translateAttributes(m.target);
      else for (const node of m.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) translateText(node);
        else if (node.nodeType === Node.ELEMENT_NODE) translateTree(node);
      }
    }
  }).observe(document, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });

  document.addEventListener('DOMContentLoaded', () => {
    // The parser can grow a text node after it was first inserted, past the observer.
    // The whole document, so the <title> (the tab name) is covered too.
    translateTree(document.documentElement);
    // Stops the browser from offering to translate the page from Spanish.
    document.documentElement.lang = 'en';
  });
})();
