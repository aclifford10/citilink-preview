// Audit P1-1: keep the invite through the install. The store links carry the token as ?ref=<kind>-<token>
// (Play passes it to the app as the install referrer; the app also accepts it pasted from the link).
(function () {
  var m = location.pathname.match(/^\/(i|g)\/([A-Za-z0-9_-]{1,64})/);
  if (!m) return;
  var ref = encodeURIComponent(m[1] + '-' + m[2]);
  ['get-ios', 'get-android'].forEach(function (id) {
    var a = document.getElementById(id);
    if (!a) return;
    var u = new URL(a.href);
    if (id === 'get-android') u.searchParams.set('referrer', 'ref=' + ref); else u.searchParams.set('ref', ref);
    a.href = u.toString();
  });
})();
