// Pro on the web: phone sign-in (same API as the app) → pick a group → Stripe Checkout (hosted, test mode).
// Token is kept in memory only (no cookies, no storage). Spec: docs/web/PRO_WEB_CHECKOUT.md
(function () {
  var root = document.getElementById('pro'); if (!root) return;
  var live = root.dataset.live === 'true', API = document.body.dataset.api, BASE = document.body.dataset.base;
  var status = root.querySelector('.status'), token = null, challenge = null;
  var steps = { phone: document.getElementById('p-phone'), code: document.getElementById('p-code'), group: document.getElementById('p-group') };
  var dots = root.querySelectorAll('.progress li');
  var T = document.documentElement.lang === 'de' ? {"noGroups": "Noch keine Gruppe. Gründe zuerst eine in der App und komm dann zurück.", "already": "Pro ist schon an", "members": " Leute", "num": "Bitte die Nummer mit Ländervorwahl eingeben, z. B. +43 660 1234567.", "demoSent": "Vorschau: Code „gesendet“. Gib 000000 ein.", "sendErr": "Der Code konnte nicht gesendet werden. Prüf die Nummer und versuch es nochmal.", "sent": "Code gesendet.", "six": "Der Code hat 6 Ziffern.", "wrong": "Falscher Code. In der Vorschau ist es 000000.", "codeErr": "Der Code hat nicht funktioniert. Versuch es nochmal oder fordere einen neuen an.", "pick": "Wähl zuerst eine Gruppe.", "opening": "Sicherer Checkout wird geöffnet …", "hasPro": "Diese Gruppe hat schon Pro.", "coErr": "Der Checkout konnte nicht starten. Es wurde nichts abgebucht. Bitte nochmal versuchen."} : {"noGroups": "No groups yet. Create one in the app first, then come back.", "already": "Pro already on", "members": " members", "num": "Please enter the number with country code, like +43 660 1234567.", "demoSent": "Preview: code “sent”. Enter 000000.", "sendErr": "Couldn’t send a code. Check the number and try again.", "sent": "Code sent.", "six": "The code has 6 digits.", "wrong": "Wrong code. In the preview it’s 000000.", "codeErr": "That code didn’t work. Try again or request a new one.", "pick": "Pick a group first.", "opening": "Opening secure checkout…", "hasPro": "That group already has Pro.", "coErr": "Checkout couldn’t start. Nothing was charged. Please try again."};
  var DEMO_DE = document.documentElement.lang === 'de';
  // Display price only. The charged currency is set server-side by the Checkout session (EUR, or USD for US customers).
  try { if (/^America\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone)) { document.querySelector('[data-price-eur]').hidden = true; document.querySelector('[data-price-usd]').hidden = false; } } catch (e) {}
  function say(m, ok) { status.textContent = m || ''; status.className = 'status' + (m ? (ok ? ' ok' : ' err') : ''); }
  function show(name, i) { Object.keys(steps).forEach(function (k) { steps[k].hidden = k !== name; }); [].forEach.call(dots, function (d, j) { d.classList.toggle('on', j === i); }); var el = steps[name].querySelector('input'); if (el) el.focus(); }
  function call(method, path, body) {
    return fetch(API + path, { method: method, credentials: 'omit', headers: Object.assign({ 'content-type': 'application/json' }, token ? { authorization: 'Bearer ' + token } : {}), body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw j; return j; }); });
  }
  var DEMO_GROUPS = [{ id: 'g1', name: DEMO_DE ? 'Sonntags-Laufcrew' : 'Sunday run crew', members: 4, pro: false }, { id: 'g2', name: 'Naschmarkt brunch club', members: 5, pro: true }, { id: 'g3', name: DEMO_DE ? 'WG Uni Wien' : 'Uni Wien flatmates', members: 3, pro: false }];
  function pick(groups) {
    var box = steps.group.querySelector('.groups'); box.textContent = '';
    if (!groups.length) { say(T.noGroups, false); return; }
    groups.forEach(function (g, i) {
      var l = document.createElement('label'); l.className = 'opt';
      var r = document.createElement('input'); r.type = 'radio'; r.name = 'group'; r.value = g.id; r.dataset.name = g.name; r.disabled = !!g.pro; if (!g.pro && !box.querySelector('input:not([disabled])')) r.checked = true;
      var s = document.createElement('small'); s.textContent = g.pro ? T.already : g.members + T.members;
      l.appendChild(r); l.appendChild(document.createTextNode(' ' + g.name)); l.appendChild(s); box.appendChild(l);
    });
    say(''); show('group', 1);
  }
  steps.phone.addEventListener('submit', function (e) {
    e.preventDefault(); var n = steps.phone.phone.value.replace(/[\s()-]/g, '');
    if (!/^\+[1-9]\d{6,14}$/.test(n)) { say(T.num, false); return; }
    if (!live) { say(T.demoSent, true); show('code', 0); return; }
    // challengeToken: same anti-abuse challenge the app sends (web: Turnstile, see spec).
    call('POST', '/v1/auth/phone/send-code', { phoneNumber: n, challengeToken: window.CITILINK_CHALLENGE || '' })
      .then(function (j) { challenge = j.challengeToken || null; say(T.sent, true); show('code', 0); })
      .catch(function () { say(T.sendErr, false); });
  });
  steps.code.addEventListener('submit', function (e) {
    e.preventDefault(); var c = steps.code.code.value.trim();
    if (!/^\d{6}$/.test(c)) { say(T.six, false); return; }
    if (!live) { if (c !== '000000') { say(T.wrong, false); return; } pick(DEMO_GROUPS); return; }
    call('POST', '/v1/auth/phone/verify', { challengeToken: challenge, code: c })
      .then(function (j) { token = j.accessToken; return call('GET', '/v1/billing/groups'); })
      .then(function (j) { pick(j.groups || []); })
      .catch(function () { say(T.codeErr, false); });
  });
  steps.code.querySelector('[data-back]').addEventListener('click', function () { say(''); show('phone', 0); });
  steps.group.addEventListener('submit', function (e) {
    e.preventDefault(); var r = steps.group.querySelector('input[name=group]:checked');
    if (!r) { say(T.pick, false); return; }
    [].forEach.call(dots, function (d, j) { d.classList.toggle('on', j === 2); });
    if (!live) { location.href = BASE + 'pro/success/?demo=1&group=' + encodeURIComponent(r.dataset.name); return; }
    var btn = steps.group.querySelector('button'); btn.disabled = true; say(T.opening, true);
    call('POST', '/v1/billing/checkout-session', { groupId: r.value })
      .then(function (j) { if (!/^https:\/\/checkout\.stripe\.com\//.test(j.url)) throw 0; location.href = j.url; })
      .catch(function (j) { btn.disabled = false; say(j && j.error === 'already_pro' ? T.hasPro : T.coErr, false); });
  });
})();
