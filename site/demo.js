// Hero chat: messages arrive one by one, already translated for the chosen reader. No network, no storage.
(function () {
  var msgs = [].slice.call(document.querySelectorAll('.chat .msg')); if (!msgs.length) return;
  var view = 'en';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render(li) {
    var own = li.dataset.lang === view, txt = li.querySelector('.txt'), btn = li.querySelector('.see');
    li.dataset.showOrig = '';
    txt.textContent = own ? li.dataset.orig : li.dataset.tr;
    txt.lang = own ? li.dataset.lang : view;
    if (own && btn) { btn.remove(); }
    if (!own) {
      if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.className = 'see'; li.appendChild(btn); }
      btn.textContent = 'Translated · See original';
    }
  }
  document.querySelector('.chat').addEventListener('click', function (e) {
    var b = e.target.closest('.see'); if (!b) return;
    var li = b.closest('.msg'), txt = li.querySelector('.txt'), showing = li.dataset.showOrig === '1';
    li.dataset.showOrig = showing ? '' : '1';
    txt.textContent = showing ? li.dataset.tr : li.dataset.orig; txt.lang = showing ? view : li.dataset.lang;
    b.textContent = showing ? 'Translated · See original' : 'Original · See translation';
  });
  [].forEach.call(document.querySelectorAll('.viewas button'), function (b) {
    b.addEventListener('click', function () {
      view = b.dataset.view;
      [].forEach.call(document.querySelectorAll('.viewas button'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      msgs.forEach(render);
    });
  });
  msgs.forEach(render);
  if (reduce) { msgs.forEach(function (m) { m.classList.add('in'); }); return; }
  msgs.forEach(function (m, i) { setTimeout(function () { m.classList.add('in'); }, 500 + i * 1300); });
})();
