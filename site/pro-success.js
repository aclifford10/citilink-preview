// "Pro is on for {group}". Live: confirm with the API (webhook already granted the entitlement). Demo: name from the URL.
(function () {
  var q = new URLSearchParams(location.search), el = document.getElementById('ok-group'); if (!el) return;
  var sid = q.get('session_id');
  if (sid) {
    fetch(document.body.dataset.api + '/v1/billing/checkout-session/' + encodeURIComponent(sid), { credentials: 'omit' })
      .then(function (r) { return r.json(); }).then(function (j) { if (j.groupName) el.textContent = j.groupName; }).catch(function () {});
  } else if (q.get('group')) el.textContent = q.get('group').slice(0, 40);
})();
