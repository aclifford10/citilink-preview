// Beta signup. Live only when the build flag BETA_SIGNUP_LIVE=true; otherwise nothing leaves the browser.
(function () {
  var f = document.getElementById('beta'); if (!f) return;
  var status = f.querySelector('.status'), live = f.dataset.live === 'true', de = document.documentElement.lang === 'de';
  var T = de ? { consent: 'Bitte setz das Häkchen, damit wir dir zur Beta schreiben dürfen.', fill: 'Bitte ausfüllen: ', every: 'alle Felder', demo: function (n) { return 'Nur Vorschau: Es wurde nichts gesendet. Sobald die Beta-API läuft, bekommt „' + n + '“ eine Bestätigungs-E-Mail.'; }, ok: 'Fast geschafft: Schau in dein Postfach und tipp auf den Bestätigungslink.', err: 'Das hat nicht geklappt. Bitte prüf die Angaben und versuch es nochmal, oder schreib an hello@citilink.app.' }
    : { consent: 'Please tick the box so we can email about the beta.', fill: 'Please fill in ', every: 'every field', demo: function (n) { return 'Preview only: nothing was sent. When the beta API is on, “' + n + '” gets a confirmation email.'; }, ok: 'Almost done: check the inbox and tap the confirmation link.', err: 'That didn’t work. Please check the details and try again, or email hello@citilink.app.' };
  function say(msg, ok) { status.textContent = msg; status.className = 'status ' + (ok ? 'ok' : 'err'); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [].filter.call(f.querySelectorAll('[required]'), function (el) { return !el.checkValidity(); })[0];
    if (bad) { say(bad.name === 'consent' ? T.consent : T.fill + (bad.labels && bad.labels[0] ? bad.labels[0].textContent : T.every) + '.', false); (bad.type === 'radio' ? f.querySelector('[name=groupType]') : bad).focus(); return; }
    var data = { groupName: f.groupName.value.trim(), city: f.city.value.trim(), email: f.email.value.trim(), groupType: f.groupType.value, groupSize: Number(f.groupSize.value), consent: true, website: f.website.value };
    if (!live) { say(T.demo(data.groupName), true); return; }
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    fetch(f.action, { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit', body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw 0; say(T.ok, true); f.reset(); })
      .catch(function () { say(T.err, false); })
      .then(function () { btn.disabled = false; });
  });
})();
