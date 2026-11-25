// Lists the Spanish UI strings en.json does not cover yet.
//
// The customer area needs a login, so this runs in the browser, not in Node:
// log in, open DevTools on any areaclientes.comercializadoraregulada.es page,
// paste this file into the console. It GETs the read-only pages below, prints
// the strings missing from en.json and copies them to the clipboard as JSON.
//
// Review the output before committing: it also holds your own data (name,
// address, CUPS, email, contract numbers), which must not go into en.json.
(async () => {
  const PAGES = [
    'MyOfficeHome.gas', 'Notice/ViewNotices.gas', 'SearchInvoiceAndConsumptionList.gas',
    'Meter/MeterSearch.gas', 'MyContracts.gas', 'MyData/ViewData.gas', 'MyData/PersonalData.gas',
    'MyData/ContactData.gas', 'MyData/AccessData.gas', 'MyData/PreferencesData.gas',
    'CorrespondenceData.gas', 'PaymentData.gas', 'CustomerService/ViewData.gas',
    'CustomerService/Home.gas', 'CustomerService/ViewCreateSR.gas', 'CustomerService/BonoSocial.gas',
    'RequestSocialBonusStep1.gas', 'UpdateHolderContractStep0.gas', 'OnlineContractHome.gas',
    'PendingPaymentsBills.gas', 'ViewFolContract.gas', 'HelpMessage.gas',
  ];
  const ATTRIBUTES = ['placeholder', 'title', 'alt', 'aria-label'];
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const isText = (s) => /\p{L}{2}/u.test(s);

  let known = {};
  try {
    known = await (await fetch('https://raw.githubusercontent.com/maxmaxme/comercializadora-regulada-en/main/en.json')).json();
  } catch { console.warn('en.json not reachable, listing every string'); }

  const found = new Map(); // string -> first page it was seen on
  for (const page of PAGES) {
    const doc = new DOMParser().parseFromString(await (await fetch('/ovh-web/' + page)).text(), 'text/html');
    doc.querySelectorAll('script, style, noscript').forEach((el) => el.remove());
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    // A string counts as covered by a global key or by a key scoped to this page.
    const add = (s) => { s = norm(s ?? ''); if (isText(s) && !(s in known) && !(`${page} › ${s}` in known) && !found.has(s)) found.set(s, page); };
    for (let node = walker.nextNode(); node; node = walker.nextNode()) add(node.data);
    for (const el of doc.querySelectorAll('[placeholder], [title], [alt], [aria-label]')) ATTRIBUTES.forEach((a) => add(el.getAttribute(a)));
    for (const el of doc.querySelectorAll('input[type=submit], input[type=button]')) add(el.value);
    // Country lists (ISO-code values) are named by the browser, not en.json.
    for (const opt of doc.querySelectorAll('option')) if (!(/^[A-Z]{2}$/.test(opt.value) && opt.parentElement?.options?.length > 100)) add(opt.textContent);
  }
  const todo = Object.fromEntries([...found.keys()].map((s) => [s, '']));
  console.table([...found].map(([s, page]) => ({ page, s })));
  try { await navigator.clipboard.writeText(JSON.stringify(todo, null, 1)); console.log(`${found.size} strings copied to the clipboard`); }
  catch { console.log(JSON.stringify(todo, null, 1)); }
  return todo;
})();
