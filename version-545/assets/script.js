(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    if (slides.length < 2) {
      return;
    }
    var activeIndex = 0;
    function setActive(nextIndex) {
      activeIndex = nextIndex % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === activeIndex);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === activeIndex);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setActive(index);
      });
    });
    window.setInterval(function () {
      setActive(activeIndex + 1);
    }, 5200);
  }

  function initFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var region = scope.querySelector("[data-region-filter]");
      var year = scope.querySelector("[data-year-filter]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = selectAll(".movie-card", scope).concat(selectAll(".rank-item", scope));
      var empty = scope.querySelector("[data-empty-state]");
      function apply() {
        var query = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var yearValue = normalize(year ? year.value : "");
        var typeValue = normalize(type ? type.value : "");
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (regionValue && normalize(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
            ok = false;
          }
          if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
            ok = false;
          }
          if (typeValue && normalize(card.getAttribute("data-type")).indexOf(typeValue) === -1) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }
      [input, region, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (videoUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".player-overlay");
    var button = document.querySelector("[data-play-button]");
    var started = false;
    var hlsInstance = null;
    if (!video || !videoUrl) {
      return;
    }
    function begin() {
      if (started) {
        if (video.paused) {
          var replay = video.play();
          if (replay && replay.catch) {
            replay.catch(function () {});
          }
        }
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", begin);
    }
    if (overlay) {
      overlay.addEventListener("click", begin);
    }
    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
