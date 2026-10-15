(function () {
  "use strict";

  /* Meniu telefone */
  var virsus = document.querySelector(".virsus");
  var mygtukas = document.querySelector(".meniu-mygtukas");
  if (virsus && mygtukas) {
    var nav = virsus.querySelector("nav");
    var atidaryti = function (ar) {
      virsus.classList.toggle("atidarytas", ar);
      mygtukas.setAttribute("aria-expanded", ar ? "true" : "false");
      mygtukas.querySelector("span").textContent = ar ? "Uždaryti" : "Meniu";
    };
    mygtukas.addEventListener("click", function () {
      atidaryti(mygtukas.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mygtukas.getAttribute("aria-expanded") === "true") {
        atidaryti(false);
        mygtukas.focus();
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) atidaryti(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) atidaryti(false);
    });
  }

  /* Lankstinio brėžinys pradeda piešti, kai pasirodo ekrane */
  var b = document.querySelector(".brezinys");
  if (b) {
    if (!("IntersectionObserver" in window)) {
      b.classList.add("matosi");
    } else {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { b.classList.add("matosi"); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(b);
    }
  }

  /* Laiško (mailto) paruošimas iš formos laukų */
  function laiskas(forma) {
    var laukai = forma.querySelectorAll("input, select, textarea");
    var eilutes = [];
    Array.prototype.forEach.call(laukai, function (l) {
      var lab = forma.querySelector('label[for="' + l.id + '"]');
      var pav = lab ? lab.getAttribute("data-pav") || lab.textContent.trim() : l.name;
      var v = l.tagName === "SELECT" && l.selectedIndex >= 0 ? l.options[l.selectedIndex].text.trim() : l.value.trim();
      if (l.tagName === "SELECT" && !l.value) v = "";
      if (v) eilutes.push(pav + ": " + v);
    });
    var tema = forma.getAttribute("data-tema") || "Užklausa";
    var kintamasis = forma.querySelector("[data-tema-dalis]");
    if (kintamasis && kintamasis.value) {
      var tekstas = kintamasis.tagName === "SELECT" ? kintamasis.options[kintamasis.selectedIndex].text : kintamasis.value;
      tema += ": " + tekstas;
    }
    var miestas = forma.querySelector("[data-miestas]");
    if (miestas && miestas.value.trim()) tema += ", " + miestas.value.trim();
    var kam = forma.getAttribute("data-mailto");
    var nl = "\r\n";
    var turinys = "Laba diena," + nl + nl + eilutes.join(nl) + nl + nl + "Ačiū.";
    return "mailto:" + kam + "?subject=" + encodeURIComponent(tema) + "&body=" + encodeURIComponent(turinys);
  }
  window.bliekoriusLaiskas = laiskas;

  /* Formos: tikrinimas ir laiško paruošimas (mailto) */
  var formos = document.querySelectorAll("form[data-mailto]");
  Array.prototype.forEach.call(formos, function (forma) {
    var santrauka = forma.querySelector(".forma-santrauka");

    function rodytiKlaida(laukas, tekstas) {
      var vieta = forma.querySelector("#" + laukas.id + "-klaida");
      if (vieta) vieta.textContent = tekstas || "";
      if (tekstas) laukas.setAttribute("aria-invalid", "true");
      else laukas.removeAttribute("aria-invalid");
    }

    function patikrinti(laukas) {
      var reiksme = laukas.value.trim();
      if (laukas.required && !reiksme) {
        rodytiKlaida(laukas, laukas.getAttribute("data-klaida") || "Užpildykite šį lauką.");
        return false;
      }
      if (reiksme && laukas.type === "tel" && reiksme.replace(/\D/g, "").length < 7) {
        rodytiKlaida(laukas, "Įrašykite telefono numerį, kuriuo galime paskambinti.");
        return false;
      }
      rodytiKlaida(laukas, "");
      return true;
    }

    Array.prototype.forEach.call(forma.querySelectorAll("input, select, textarea"), function (l) {
      l.addEventListener("blur", function () { if (l.getAttribute("aria-invalid") === "true") patikrinti(l); });
      l.addEventListener("input", function () { if (l.getAttribute("aria-invalid") === "true") patikrinti(l); });
    });

    forma.addEventListener("submit", function (e) {
      e.preventDefault();
      var laukai = forma.querySelectorAll("input, select, textarea");
      var pirmas = null;
      Array.prototype.forEach.call(laukai, function (l) {
        if (!patikrinti(l) && !pirmas) pirmas = l;
      });
      if (pirmas) {
        if (santrauka) {
          santrauka.hidden = false;
          santrauka.textContent = "Laiškas dar neparuoštas: užpildykite pažymėtus laukus.";
        }
        pirmas.focus();
        return;
      }
      if (santrauka) santrauka.hidden = true;

      window.location.href = laiskas(forma);
    });
  });

  /* Paslaugos parinkimas iš nuorodos (?paslauga=...) */
  var parinkti = document.querySelector("select[data-is-adreso]");
  if (parinkti && window.URLSearchParams) {
    var p = new URLSearchParams(window.location.search).get("paslauga");
    if (p) {
      for (var i = 0; i < parinkti.options.length; i++) {
        if (parinkti.options[i].value === p) { parinkti.selectedIndex = i; break; }
      }
    }
  }
})();
