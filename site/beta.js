// Beta signup. Live only when the build flag BETA_SIGNUP_LIVE=true; otherwise nothing leaves the browser.
(function () {
  var f = document.getElementById('beta'); if (!f) return;
  var status = f.querySelector('.status'), live = f.dataset.live === 'true';
  function say(msg, ok) { status.textContent = msg; status.className = 'status ' + (ok ? 'ok' : 'err'); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = [].filter.call(f.querySelectorAll('[required]'), function (el) { return !el.checkValidity(); })[0];
    if (bad) { say(bad.name === 'consent' ? 'Please tick the box so we can email about the beta.' : 'Please fill in ' + (bad.labels && bad.labels[0] ? bad.labels[0].textContent : 'every field').toLowerCase() + '.', false); (bad.type === 'radio' ? f.querySelector('[name=groupType]') : bad).focus(); return; }
    var data = { groupName: f.groupName.value.trim(), city: f.city.value.trim(), email: f.email.value.trim(), groupType: f.groupType.value, groupSize: Number(f.groupSize.value), consent: true, website: f.website.value };
    if (!live) { say('Preview only: nothing was sent. When the beta API is on, “' + data.groupName + '” gets a confirmation email.', true); return; }
    var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    fetch(f.action, { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit', body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw 0; say('Almost done: check the inbox and tap the confirmation link.', true); f.reset(); })
      .catch(function () { say('That didn’t work. Please check the details and try again, or email hello@citilink.app.', false); })
      .then(function () { btn.disabled = false; });
  });
})();
