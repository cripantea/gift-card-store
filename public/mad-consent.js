/*
 * Banner e preferenze cookie di MAD for Hair (madvigevano.it e shop.madvigevano.it).
 *
 * Lo stesso file serve entrambi i siti: le categorie facoltative arrivano da
 * window.MAD_CONSENT_CONFIG, definito prima di questo script. La scelta è
 * salvata nel cookie tecnico `mad_consent` per 6 mesi e, sui domini
 * madvigevano.it, vale per sito e shop insieme. Se cambiano i cookie usati,
 * aumentare CONSENT_VERSION: il banner verrà riproposto a tutti.
 *
 * API: window.madConsent.get() / .has(categoria) / .open()
 * Evento: window "mad:consent" con detail = scelte salvate.
 * Qualsiasi elemento con [data-mad-consent-open] o href="#preferenze-cookie"
 * riapre il pannello delle preferenze.
 */
(function () {
  "use strict";

  var CONSENT_VERSION = "2026-10-05";
  var COOKIE_NAME = "mad_consent";
  var MAX_AGE_SECONDS = 60 * 60 * 24 * 182; // 6 mesi

  var config = window.MAD_CONSENT_CONFIG || {};
  var categories = config.categories || [];
  var policyUrl = config.policyUrl || "/cookie-policy";
  var privacyUrl = config.privacyUrl || "/privacy";

  var cookieSetter = (function () {
    var d = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
    return d && d.set ? function (v) { d.set.call(document, v); } : function (v) { document.cookie = v; };
  })();

  function readConsent() {
    var match = document.cookie.match(/(?:^|;\s*)mad_consent=([^;]*)/);
    if (!match) return null;
    try {
      var value = JSON.parse(decodeURIComponent(match[1]));
      if (!value || value.v !== CONSENT_VERSION) return null;
      if (!value.ts || Date.now() - value.ts > MAX_AGE_SECONDS * 1000) return null;
      return value;
    } catch (e) {
      return null;
    }
  }

  function cookieDomain() {
    var host = location.hostname;
    return /(^|\.)madvigevano\.it$/.test(host) ? "; Domain=.madvigevano.it" : "";
  }

  function saveConsent(choices) {
    var previous = readConsent() || {};
    var value = { v: CONSENT_VERSION, ts: Date.now() };
    // Mantiene le scelte delle categorie dell'altro sito (stesso cookie).
    Object.keys(previous).forEach(function (k) {
      if (k !== "v" && k !== "ts") value[k] = previous[k];
    });
    categories.forEach(function (c) { value[c.id] = !!choices[c.id]; });
    cookieSetter(
      COOKIE_NAME + "=" + encodeURIComponent(JSON.stringify(value)) +
      "; Max-Age=" + MAX_AGE_SECONDS + "; Path=/; SameSite=Lax" +
      (location.protocol === "https:" ? "; Secure" : "") + cookieDomain()
    );
    current = value;
    window.dispatchEvent(new CustomEvent("mad:consent", { detail: value }));
  }

  var current = readConsent();

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function allChoices(value) {
    var o = {};
    categories.forEach(function (c) { o[c.id] = value; });
    return o;
  }

  // ---------- Banner ----------
  var banner = null;

  function closeBanner() {
    if (banner) { banner.remove(); banner = null; }
  }

  function showBanner() {
    if (banner) return;
    var text =
      "Usiamo cookie tecnici necessari al funzionamento del sito. " +
      (categories.length
        ? "Con il tuo consenso useremo anche cookie facoltativi (" +
          categories.map(function (c) { return c.title.toLowerCase(); }).join(", ") +
          "). Puoi accettarli, rifiutarli o scegliere categoria per categoria, e cambiare idea quando vuoi da “Preferenze cookie” in fondo alla pagina. "
        : "") +
      "Chiudendo il banner con la X restano attivi solo i cookie tecnici.";

    banner = el("div", { class: "madc-banner", role: "region", "aria-label": "Informativa sui cookie" }, [
      el("button", { class: "madc-x", type: "button", "aria-label": "Chiudi: continua solo con i cookie tecnici", text: "×" }),
      el("p", { class: "madc-title", text: "Rispettiamo la tua privacy" }),
      el("p", { class: "madc-text" }, [
        document.createTextNode(text + " "),
        el("a", { href: policyUrl, text: "Cookie policy" }),
        document.createTextNode(" · "),
        el("a", { href: privacyUrl, text: "Informativa privacy" }),
      ]),
      el("div", { class: "madc-actions" }, [
        el("button", { class: "madc-btn", type: "button", "data-act": "reject", text: "Rifiuta" }),
        el("button", { class: "madc-btn", type: "button", "data-act": "custom", text: "Personalizza" }),
        el("button", { class: "madc-btn", type: "button", "data-act": "accept", text: "Accetta" }),
      ]),
    ]);

    banner.addEventListener("click", function (e) {
      var t = e.target;
      if (t.classList.contains("madc-x") || t.getAttribute("data-act") === "reject") {
        saveConsent(allChoices(false)); closeBanner();
      } else if (t.getAttribute("data-act") === "accept") {
        saveConsent(allChoices(true)); closeBanner();
      } else if (t.getAttribute("data-act") === "custom") {
        openPreferences();
      }
    });
    document.body.appendChild(banner);
  }

  // ---------- Pannello preferenze ----------
  var modal = null;

  function closePreferences() {
    if (modal) { modal.remove(); modal = null; }
  }

  function openPreferences() {
    closePreferences();
    var saved = current || {};
    var rows = [
      el("div", { class: "madc-cat" }, [
        el("div", { class: "madc-cat-head" }, [
          el("strong", { text: "Necessari" }),
          el("span", { class: "madc-always", text: "Sempre attivi" }),
        ]),
        el("p", { text: config.necessaryDescription || "Servono al funzionamento del sito e a ricordare le tue scelte sui cookie. Non richiedono consenso." }),
      ]),
    ];
    categories.forEach(function (c) {
      var id = "madc-" + c.id;
      var input = el("input", { type: "checkbox", id: id, "data-cat": c.id, role: "switch" });
      input.checked = !!saved[c.id];
      rows.push(el("div", { class: "madc-cat" }, [
        el("div", { class: "madc-cat-head" }, [
          el("label", { for: id }, [el("strong", { text: c.title })]),
          el("span", { class: "madc-switch" }, [input, el("span", { class: "madc-slider", "aria-hidden": "true" })]),
        ]),
        el("p", { text: c.description }),
      ]));
    });
    if (!categories.length) {
      rows.push(el("p", { text: "Su questo sito non usiamo cookie facoltativi." }));
    }

    var dialog = el("div", { class: "madc-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "madc-dialog-title" }, [
      el("button", { class: "madc-x", type: "button", "aria-label": "Chiudi senza salvare", text: "×" }),
      el("p", { class: "madc-title", id: "madc-dialog-title", text: "Preferenze cookie" }),
      el("p", { class: "madc-text" }, [
        document.createTextNode("Scegli quali cookie facoltativi attivare. La scelta vale 6 mesi e puoi modificarla in qualsiasi momento. Dettagli nella "),
        el("a", { href: policyUrl, text: "Cookie policy" }),
        document.createTextNode("."),
      ]),
      el("div", { class: "madc-cats" }, rows),
      el("div", { class: "madc-actions" }, [
        el("button", { class: "madc-btn", type: "button", "data-act": "reject", text: "Rifiuta tutti" }),
        el("button", { class: "madc-btn", type: "button", "data-act": "save", text: "Salva le scelte" }),
        el("button", { class: "madc-btn", type: "button", "data-act": "accept", text: "Accetta tutti" }),
      ]),
    ]);
    modal = el("div", { class: "madc-overlay" }, [dialog]);

    modal.addEventListener("click", function (e) {
      var t = e.target;
      var act = t.getAttribute("data-act");
      if (t === modal || t.classList.contains("madc-x")) {
        closePreferences();
        return;
      }
      if (!act) return;
      if (act === "save") {
        var choices = {};
        modal.querySelectorAll("input[data-cat]").forEach(function (i) { choices[i.getAttribute("data-cat")] = i.checked; });
        saveConsent(choices);
      } else {
        saveConsent(allChoices(act === "accept"));
      }
      closePreferences();
      closeBanner();
    });
    modal.addEventListener("keydown", function (e) { if (e.key === "Escape") closePreferences(); });
    document.body.appendChild(modal);
    var first = modal.querySelector("input, button.madc-btn");
    if (first) first.focus();
  }

  // ---------- Avvio ----------
  document.addEventListener("click", function (e) {
    var trigger = e.target.closest && e.target.closest('[data-mad-consent-open], a[href="#preferenze-cookie"]');
    if (!trigger) return;
    e.preventDefault();
    openPreferences();
  });

  window.madConsent = {
    version: CONSENT_VERSION,
    get: function () { return current; },
    has: function (category) { return !!(current && current[category]); },
    open: openPreferences,
  };

  function start() {
    if (!current) showBanner();
    else window.dispatchEvent(new CustomEvent("mad:consent", { detail: current }));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
