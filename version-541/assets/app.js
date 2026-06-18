(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    var start = function () {
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    start();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var typeSelect = filterRoot.querySelector('[data-filter-type]');
    var categorySelect = filterRoot.querySelector('[data-filter-category]');
    var reset = filterRoot.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');

    if (preset && input) {
      input.value = preset;
    }

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var apply = function () {
      var query = normalize(input ? input.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var category = normalize(categorySelect ? categorySelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', apply);
    }

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        apply();
      });
    }

    apply();
  }
})();

function initMoviePlayer(url) {
  var video = document.querySelector('[data-player="video"]');
  var overlay = document.querySelector('[data-player="overlay"]');
  var hls = null;
  var ready = false;

  if (!video || !url) {
    return;
  }

  var load = function () {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    ready = true;
  };

  var start = function () {
    load();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  };

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!ready || video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
      hls = null;
    }
  });
}
