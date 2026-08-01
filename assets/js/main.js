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

  /* Pricing connection stepper — scales the price by connections and updates the
     WhatsApp order link. Each extra connection is $50 (15% off => $42.50). */
  var CONN_ADD_NOW = 42.5;     // per extra connection, after 15% discount
  var CONN_ADD_NORMAL = 50;    // per extra connection, normal price
  document.querySelectorAll(".plan").forEach(function (plan) {
    var stepper = plan.querySelector(".stepper");
    if (!stepper) return;
    var numEl = stepper.querySelector(".step-num");
    var buy = plan.querySelector(".plan-buy");
    var amtEl = plan.querySelector(".plan-price .amt");
    var decEl = plan.querySelector(".plan-price .dec");
    var normalEl = plan.querySelector(".plan-normal");
    var basePrice = parseFloat(plan.getAttribute("data-price")) || 0;
    var baseNormal = parseFloat(plan.getAttribute("data-normal")) || 0;
    var waBase = buy ? (buy.getAttribute("href") || "").split("?")[0] : null;
    var tpl = buy ? buy.getAttribute("data-msg") : null;
    var min = parseInt(stepper.getAttribute("data-min"), 10) || 1;
    var max = parseInt(stepper.getAttribute("data-max"), 10) || 4;
    var n = parseInt(stepper.getAttribute("data-conn"), 10) || 1;

    function render() {
      numEl.textContent = n;
      var now = basePrice + (n - 1) * CONN_ADD_NOW;
      var normal = baseNormal + (n - 1) * CONN_ADD_NORMAL;
      if (amtEl && decEl && basePrice) {
        var s = now.toFixed(2).split(".");
        amtEl.textContent = s[0];
        decEl.textContent = "." + s[1];
      }
      if (normalEl && baseNormal) normalEl.textContent = "$" + normal.toFixed(2);
      stepper.querySelectorAll(".step-btn").forEach(function (b) {
        var d = parseInt(b.getAttribute("data-dir"), 10);
        b.disabled = (d < 0 && n <= min) || (d > 0 && n >= max);
      });
      if (buy && waBase && tpl) {
        var msg = tpl.replace("{n}", n).replace("{price}", now.toFixed(2));
        buy.setAttribute("href", waBase + "?text=" + encodeURIComponent(msg));
      }
    }
    stepper.querySelectorAll(".step-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = parseInt(b.getAttribute("data-dir"), 10);
        n = Math.min(max, Math.max(min, n + d));
        render();
      });
    });
    render();
  });
})();
