/* 4K IPTV — interactions (vanilla, no deps) */
(function () {
  "use strict";

  // Sticky header shadow on scroll
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("mobile-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close menu when a link is clicked
    header.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("mobile-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll reveal (progressive enhancement with failsafes so nothing ever stays hidden)
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function revealEl(el) { el.classList.add("in"); }
  function revealAll() { reveals.forEach(revealEl); }

  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { revealEl(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });

    // Failsafe 1: reveal anything already within (or above) the viewport right now.
    var vh = window.innerHeight || 800;
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 1.1) revealEl(el);
    });
    // Failsafe 2: guarantee everything is visible shortly after load, even if the
    // observer never fires (background tab, reduced-motion, odd browsers, etc.).
    window.addEventListener("load", function () { setTimeout(revealAll, 1200); });
  } else {
    revealAll();
  }

  // Native lazy-load fallback for older browsers
  if (!("loading" in HTMLImageElement.prototype)) {
    document.querySelectorAll('img[loading="lazy"][data-src]').forEach(function (img) {
      img.src = img.getAttribute("data-src");
    });
  }

  // FAQ: keep only one open at a time (optional enhancement)
  var faqItems = document.querySelectorAll(".faq-list .faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (o) { if (o !== item) o.open = false; });
      }
    });
  });

  // Current year in footer
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- TMDb movie strip ----------------
     Fetches popular films from The Movie Database and shows their posters.
     If the request fails (offline / rate-limited), the server-rendered
     fallback cards stay in place, so the section is never empty. */
  var TMDB_KEY = "eb88f8554c5c594b1b82a59672ee98f4"; // TMDb v3 API key
  var TMDB_IMG = "https://image.tmdb.org/t/p/w342";
  var star = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.5 7 .8-5.2 4.7 1.5 7L12 17.8 5.2 21l1.5-7L1.5 9.3l7-.8Z"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  document.querySelectorAll(".movies-track[data-tmdb]").forEach(function (track) {
    var kind = track.getAttribute("data-tmdb") || "popular";
    var lang = track.getAttribute("data-lang") || "en-US";
    var url = "https://api.themoviedb.org/3/movie/" + kind +
      "?api_key=" + TMDB_KEY + "&language=" + encodeURIComponent(lang) + "&page=1";

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (data) {
        var movies = (data && data.results ? data.results : [])
          .filter(function (m) { return m.poster_path; })
          .slice(0, 16);
        if (!movies.length) return; // keep fallback
        var html = movies.map(function (m) {
          var title = esc(m.title || m.name || "");
          var rating = m.vote_average ? m.vote_average.toFixed(1) : "";
          return '<div class="movie-card" role="listitem">' +
                   '<span class="movie-badge-4k">4K</span>' +
                   '<img loading="lazy" decoding="async" width="342" height="513" ' +
                     'src="' + TMDB_IMG + m.poster_path + '" alt="' + title + ' poster">' +
                   '<div class="movie-meta"><span class="t">' + title + '</span>' +
                     (rating ? '<span class="movie-rating">' + star + rating + '</span>' : '') +
                   '</div></div>';
        }).join("");
        track.innerHTML = html;
      })
      .catch(function () { /* offline or blocked — keep fallback cards */ });
  });

  /* Auto-scroll the film strip one poster every 3s (pause on hover/touch, loop back). */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".movies-track, .devices-track").forEach(function (track) {
    if (reduceMotion) return;
    var paused = false, resumeTimer;
    function pause() { paused = true; }
    function resumeSoon() { clearTimeout(resumeTimer); resumeTimer = setTimeout(function () { paused = false; }, 4000); }
    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", function () { paused = false; });
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", resumeSoon, { passive: true });
    track.addEventListener("wheel", function () { pause(); resumeSoon(); }, { passive: true });

    setInterval(function () {
      if (paused || !document.hasFocus()) return;
      var card = track.firstElementChild;
      if (!card) return;
      var cs = getComputedStyle(track);
      var gap = parseFloat(cs.columnGap || cs.gap) || 22;
      var step = card.getBoundingClientRect().width + gap;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 8) {
        track.scrollTo({ left: 0, behavior: "smooth" });   // loop back to start
      } else {
        track.scrollBy({ left: step, behavior: "smooth" }); // advance one item
      }
    }, 3000);
  });

  /* Hero poster wall: localized trending posters (falls back to the static ones) */
  (function () {
    var wall = document.querySelector(".p-wall");
    if (!wall || !window.fetch) return;
    var hl = (document.documentElement.lang || "pt-BR");
    var lang = /^en/i.test(hl) ? "en-US" : /^fr/i.test(hl) ? "fr-FR" : "pt-BR";
    fetch("https://api.themoviedb.org/3/trending/movie/week?api_key=" + TMDB_KEY + "&language=" + lang)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var list = (d.results || []).filter(function (m) { return m.poster_path; });
        var imgs = wall.querySelectorAll("img");
        for (var i = 0; i < imgs.length && i < list.length; i++) {
          imgs[i].src = "https://image.tmdb.org/t/p/w342" + list[i].poster_path;
          imgs[i].alt = list[i].title || "";
        }
      }).catch(function () {});
  })();

  /* Pricing connection stepper — price = base × (1 + 0.85 × (n − 1)); the buy button
     opens the checkout page with the chosen plan and connections. */
  var LANG = (document.documentElement.lang || "pt").slice(0, 2).toLowerCase();
  var CHECKOUT = LANG === "en" ? "/us/checkout/" : LANG === "fr" ? "/fr/checkout/" : "/checkout/";
  var PM_TXT = LANG === "en" ? ["One-time payment · just", "/ month"] : LANG === "fr" ? ["Paiement unique · soit", "/ mois"] : ["Pagamento único · só", "/ mês"];
  var MONTHS = { Bronze: 12, Gold: 18, Platinum: 18, Exclusivo: 24, Exclusive: 24, Exclusif: 24 };
  function scale(base, n) { return Math.round(base * (1 + 0.85 * (n - 1)) * 100) / 100; }
  document.querySelectorAll(".plan").forEach(function (plan) {
    var stepper = plan.querySelector(".stepper");
    var buy = plan.querySelector(".plan-buy");
    var name = plan.getAttribute("data-plan") || "Gold";
    var basePrice = parseFloat(plan.getAttribute("data-price")) || 0;
    var baseNormal = parseFloat(plan.getAttribute("data-normal")) || 0;
    var amtEl = plan.querySelector(".plan-price .amt");
    var decEl = plan.querySelector(".plan-price .dec");
    var normalEl = plan.querySelector(".plan-normal");
    var numEl = stepper ? stepper.querySelector(".step-num") : null;
    var labelEl = stepper ? stepper.querySelector(".step-val span") : null;
    var one = labelEl ? labelEl.textContent : "";
    var min = 1, max = 5, n = 1;
    var pmEl = null;
    if (buy) { pmEl = document.createElement("span"); pmEl.className = "plan-pm"; buy.parentNode.insertBefore(pmEl, buy.nextSibling); }

    function render() {
      var now = scale(basePrice, n);
      if (numEl) numEl.textContent = n;
      if (labelEl && one) labelEl.textContent = n > 1 ? one.replace(/(ão|ion|ection)$/i, function (m) { return m.toLowerCase() === "ão" ? "ões" : m + "s"; }) : one;
      if (amtEl && decEl && basePrice) {
        var s = now.toFixed(2).split(".");
        amtEl.textContent = s[0];
        decEl.textContent = "." + s[1];
      }
      if (normalEl && baseNormal) normalEl.textContent = "$" + scale(baseNormal, n).toFixed(2);
      if (stepper) stepper.querySelectorAll(".step-btn").forEach(function (b) {
        var d = parseInt(b.getAttribute("data-dir"), 10);
        b.disabled = (d < 0 && n <= min) || (d > 0 && n >= max);
      });
      if (pmEl) {
        var months = parseInt(plan.getAttribute("data-months"), 10) || MONTHS[name] || 12;
        pmEl.innerHTML = PM_TXT[0] + " <b>$" + (now / months).toFixed(2) + "</b> " + PM_TXT[1];
      }
      if (buy) {
        buy.setAttribute("href", CHECKOUT + "?plan=" + encodeURIComponent(name) + "&n=" + n);
        buy.removeAttribute("target");
        buy.removeAttribute("rel");
      }
    }
    if (stepper) stepper.querySelectorAll(".step-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = parseInt(b.getAttribute("data-dir"), 10);
        n = Math.min(max, Math.max(min, n + d));
        render();
      });
    });
    render();
  });
})();
