(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (input && input.value.trim()) {
          return;
        }
        event.preventDefault();
        if (input) {
          input.focus();
        }
      });
    });

    setupHero();
    setupFilters();
    setupPlayer();
  });

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        activate(i);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    activate(0);
    restart();
  }

  function setupFilters() {
    var bars = document.querySelectorAll("[data-filter-bar]");
    bars.forEach(function (bar) {
      var scope = document.querySelector(bar.getAttribute("data-filter-scope")) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-filter-empty]");
      var search = bar.querySelector("[data-filter-search]");
      var genre = bar.querySelector("[data-filter-genre]");
      var year = bar.querySelector("[data-filter-year]");
      var region = bar.querySelector("[data-filter-region]");

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && search) {
        search.value = query;
      }

      function check() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var g = genre ? genre.value : "";
        var y = year ? year.value : "";
        var r = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();

          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (g && (card.getAttribute("data-genre") || "").indexOf(g) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (r && (card.getAttribute("data-region") || "").indexOf(r) === -1) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [search, genre, year, region].forEach(function (el) {
        if (el) {
          el.addEventListener("input", check);
          el.addEventListener("change", check);
        }
      });

      check();
    });
  }

  function setupPlayer() {
    document.addEventListener("click", function (event) {
      var target = event.target.closest(".play-overlay, .player-shell");
      if (!target) {
        return;
      }

      if (event.target.tagName && event.target.tagName.toLowerCase() === "video") {
        return;
      }

      var button = target.classList.contains("play-overlay")
        ? target
        : target.querySelector(".play-overlay:not(.is-hidden)");

      if (!button) {
        return;
      }

      event.preventDefault();
      launch(button);
    });
  }

  function loadMediaLib(done) {
    if (window.Hls) {
      done();
      return;
    }

    var existing = document.querySelector("script[data-media-lib]");
    if (existing) {
      existing.addEventListener("load", done, { once: true });
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-media-lib", "true");
    script.addEventListener("load", done, { once: true });
    document.head.appendChild(script);
  }

  function launch(button) {
    var selector = button.getAttribute("data-video");
    var url = button.getAttribute("data-url");
    var video = selector ? document.querySelector(selector) : null;

    if (!video || !url) {
      return;
    }

    function start() {
      if (video.dataset.readyUrl !== url) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          if (video.hlsInstance) {
            video.hlsInstance.destroy();
          }
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        } else {
          video.src = url;
        }
        video.dataset.readyUrl = url;
      }

      button.classList.add("is-hidden");
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      start();
    } else {
      loadMediaLib(start);
    }
  }
})();
