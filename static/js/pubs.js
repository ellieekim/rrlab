// Publications filter: by kind (chips) and free-text search over title + venue.
(function () {
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip-btn"));
  var q = document.getElementById("pub-q");
  var status = document.getElementById("pub-status");
  var empty = document.getElementById("pub-empty");
  var items = Array.prototype.slice.call(document.querySelectorAll(".pub"));
  var years = Array.prototype.slice.call(document.querySelectorAll(".pub-year"));
  if (!items.length) return;
  var kind = "all";
  items.forEach(function (li) { li._text = li.textContent.toLowerCase(); });

  function apply() {
    var term = (q && q.value || "").trim().toLowerCase();
    var shown = 0;
    items.forEach(function (li) {
      var ok = (kind === "all" || li.dataset.kind === kind) && (!term || li._text.indexOf(term) !== -1);
      li.hidden = !ok;
      if (ok) shown++;
    });
    years.forEach(function (y) {
      y.hidden = !y.querySelector(".pub:not([hidden])");
    });
    empty.hidden = shown !== 0;
    var filtered = kind !== "all" || term;
    status.textContent = filtered ? shown + "건 표시 중 (전체 " + items.length + "건)" : "";
  }

  chips.forEach(function (b) {
    b.addEventListener("click", function () {
      kind = b.dataset.kind;
      chips.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      apply();
    });
  });
  if (q) q.addEventListener("input", apply);
})();
