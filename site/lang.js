// German is the default at the root. A browser with no German in its languages is sent once to /en/,
// unless it came here on purpose (?lang=de, or a link from this site). No cookies, no storage.
(function () {
  if (/[?&]lang=de/.test(location.search)) return;
  try { if (document.referrer && new URL(document.referrer).host === location.host) return; } catch (e) {}
  var langs = navigator.languages || [navigator.language || ''];
  if (langs.some(function (l) { return /^de\b/i.test(l); })) return;
  location.replace(document.body.dataset.base + 'en/' + location.hash);
})();
