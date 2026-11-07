/* Angebots-Bot — interactive demo mock (no real messages sent).
   Flow: Problem (chips) → Ort (chips) → Dringlichkeit (chips)
   → Name + Telefon (form) → Summary card (DEMO promise).
   Business name comes from window.SITE.BUSINESS_NAME only. */
(function () {
  "use strict";

  var NAME = (window.SITE && window.SITE.BUSINESS_NAME) || "Sanitärtechnik Schenk GmbH";
  var body = document.getElementById("bot-body");
  if (!body) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = { problem: null, place: null, urgency: null, name: "", phone: "" };

  var PROBLEMS = [
    { id: "rohrbruch", label: "Rohrbruch", bot: "Verstanden — Rohrbruch. Wo befindet sich das Problem?" },
    { id: "heizung", label: "Heizung ausgefallen", bot: "Verstanden — Heizungsausfall. Wo befindet sich das Problem?" },
    { id: "bad", label: "Neues Bad", bot: "Verstanden — neues Bad. Wo befindet sich das Problem?" },
    { id: "wartung", label: "Wartung", bot: "Verstanden — Wartung. Wo befindet sich das Problem?" },
    { id: "sonstiges", label: "Sonstiges", bot: "Verstanden. Wo befindet sich das Problem?" }
  ];
  var PLACES = [
    { id: "freiburg", label: "Freiburg" },
    { id: "umgebung", label: "Umgebung (bis ~25 km)" }
  ];
  var URGENCIES = [
    { id: "heute", label: "Heute" },
    { id: "woche", label: "Diese Woche" },
    { id: "geplant", label: "Geplant" }
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function scrollDown() {
    body.scrollTop = body.scrollHeight;
    var panel = body.closest(".bot-panel");
    if (panel) panel.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }

  function addBotBubble(text) {
    var b = el("div", "bubble bubble--bot", text);
    body.appendChild(b);
    scrollDown();
    return b;
  }

  function addUserBubble(text) {
    var b = el("div", "bubble bubble--user", text);
    body.appendChild(b);
    scrollDown();
    return b;
  }

  function showTyping() {
    var t = el("div", "typing");
    t.setAttribute("aria-label", "Bot tippt …");
    t.appendChild(el("i")); t.appendChild(el("i")); t.appendChild(el("i"));
    body.appendChild(t);
    scrollDown();
    return t;
  }

  function botSay(text, done) {
    var t = showTyping();
    var delay = reduceMotion ? 60 : 750;
    setTimeout(function () {
      t.remove();
      addBotBubble(text);
      if (done) done();
    }, delay);
  }

  function chipRow(options, onPick) {
    var row = el("div", "chips");
    options.forEach(function (opt) {
      var c = el("button", "chip", opt.label);
      c.type = "button";
      c.addEventListener("click", function () {
        row.querySelectorAll(".chip").forEach(function (x) { x.disabled = true; });
        onPick(opt, c);
      });
      row.appendChild(c);
    });
    body.appendChild(row);
    scrollDown();
    return row;
  }

  function askProblem() {
    botSay("Hallo! Ich bin der Angebots-Assistent von " + NAME + ". Was ist das Problem?", function () {
      chipRow(PROBLEMS, function (opt) {
        state.problem = opt.label;
        addUserBubble(opt.label);
        botSay(opt.bot, askPlace);
      });
    });
  }

  function askPlace() {
    chipRow(PLACES, function (opt) {
      state.place = opt.label;
      addUserBubble(opt.label);
      botSay("Danke. Wie dringend ist es?", askUrgency);
    });
  }

  function askUrgency() {
    chipRow(URGENCIES, function (opt) {
      state.urgency = opt.label;
      addUserBubble(opt.label);
      botSay("Fast geschafft — wie können wir Sie erreichen? Bitte hinterlassen Sie Name und Telefonnummer.", askContact);
    });
  }

  function askContact() {
    var form = el("form", "bot-contact-form");
    form.noValidate = true;

    var nameWrap = el("div");
    var nameLabel = el("label", null, "Name *");
    nameLabel.setAttribute("for", "bot-name");
    var nameInput = el("input");
    nameInput.type = "text"; nameInput.id = "bot-name"; nameInput.name = "name";
    nameInput.autocomplete = "name"; nameInput.required = true;
    nameInput.placeholder = "Ihr Name";
    var nameErr = el("p", "field-error", "Bitte geben Sie Ihren Namen ein.");
    nameWrap.appendChild(nameLabel); nameWrap.appendChild(nameInput); nameWrap.appendChild(nameErr);

    var phoneWrap = el("div");
    var phoneLabel = el("label", null, "Telefon *");
    phoneLabel.setAttribute("for", "bot-phone");
    var phoneInput = el("input");
    phoneInput.type = "tel"; phoneInput.id = "bot-phone"; phoneInput.name = "phone";
    phoneInput.autocomplete = "tel"; phoneInput.required = true;
    phoneInput.placeholder = "Ihre Telefonnummer";
    var phoneErr = el("p", "field-error", "Bitte geben Sie eine Telefonnummer ein.");
    phoneWrap.appendChild(phoneLabel); phoneWrap.appendChild(phoneInput); phoneWrap.appendChild(phoneErr);

    var submit = el("button", "btn btn--sm", "Angaben übernehmen →");
    submit.type = "submit";

    form.appendChild(nameWrap); form.appendChild(phoneWrap); form.appendChild(submit);
    body.appendChild(form);
    nameInput.focus();
    scrollDown();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      if (!nameInput.value.trim()) { nameErr.classList.add("show"); ok = false; }
      else { nameErr.classList.remove("show"); }
      if (nameInput.value.trim().length < 2) { nameErr.classList.add("show"); ok = false; }
      if (phoneInput.value.trim().length < 5) { phoneErr.classList.add("show"); ok = false; }
      else { phoneErr.classList.remove("show"); }
      if (!ok) return;
      state.name = nameInput.value.trim();
      state.phone = phoneInput.value.trim();
      nameInput.disabled = true; phoneInput.disabled = true; submit.disabled = true;
      addUserBubble(state.name + " · " + state.phone);
      botSay("Alles klar. Wir fassen zusammen:", showSummary);
    });
  }

  function showSummary() {
    var card = el("div", "summary-card");
    card.setAttribute("role", "status");
    card.appendChild(el("h3", null, "Ihre Anfrage (Demo)"));
    var dl = el("dl");
    var rows = [
      ["Problem", state.problem],
      ["Ort", state.place],
      ["Dringlichkeit", state.urgency],
      ["Name", state.name],
      ["Telefon", state.phone]
    ];
    rows.forEach(function (r) {
      dl.appendChild(el("dt", null, r[0]));
      dl.appendChild(el("dd", null, r[1]));
    });
    card.appendChild(dl);
    var note = el("p", "confirm", "DEMO-VERSPRECHEN — KEINE VERBINDLICHE ZUSAGE [TO CONFIRM Rückrufzeit]");
    card.appendChild(note);

    var actions = el("div", "bot-actions");
    var restart = el("button", "btn btn--sm", "Neue Anfrage starten");
    restart.type = "button";
    restart.addEventListener("click", reset);
    var home = el("a", "btn btn--sm btn--ghost", "Zurück zur Startseite");
    home.href = "/";
    actions.appendChild(restart); actions.appendChild(home);
    card.appendChild(actions);
    body.appendChild(card);
    scrollDown();
  }

  function reset() {
    state = { problem: null, place: null, urgency: null, name: "", phone: "" };
    body.innerHTML = "";
    start();
  }

  function start() {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("problem");
    var pre = preset ? PROBLEMS.find(function (p) { return p.id === preset; }) : null;
    if (pre) {
      botSay("Hallo! Ich bin der Angebots-Assistent von " + NAME + ". Was ist das Problem?", function () {
        state.problem = pre.label;
        addUserBubble(pre.label);
        botSay(pre.bot, askPlace);
      });
    } else {
      askProblem();
    }
  }

  start();
})();
