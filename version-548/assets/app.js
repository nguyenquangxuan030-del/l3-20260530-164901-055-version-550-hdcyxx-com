
(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function setupMenu() {
    var button = one('[data-menu-toggle]');
    var menu = one('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = one('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = all('.hero-slide', hero);
    var dots = all('[data-hero-dot]', hero);
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function setupPlayer() {
    var video = one('[data-stream]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var trigger = one('[data-play-trigger]');
    var attached = false;
    function attach() {
      if (attached || !stream) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }
    attach();
    function playNow() {
      attach();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {});
      }
    }
    if (trigger) {
      trigger.addEventListener('click', playNow);
    }
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        playNow();
      }
    });
  }

  function createSearchCard(item) {
    var tags = [item.region, item.type, item.year].filter(Boolean).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var coverStyle = "--cover: url('./" + item.cover + ".jpg');";
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + item.url + '" style="' + coverStyle + '" aria-label="' + escapeHtml(item.title) + '">',
      '<span class="type-badge">' + escapeHtml(item.type || '影片') + '</span>',
      '<span class="play-float">▶</span>',
      '</a>',
      '<div class="card-content">',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.one || '') + '</p>',
      '<div class="card-meta">' + tags + '</div>',
      '<div class="tag-row"><span>' + escapeHtml(item.genre || '精选') + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupSearchPage() {
    var results = one('#search-results');
    if (!results || !window.MOVIE_SEARCH) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim().toLowerCase();
    var input = one('.search-page-form input[name="q"]');
    if (input) {
      input.value = q;
    }
    if (!q) {
      return;
    }
    var items = window.MOVIE_SEARCH.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.one].join(' ').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 96);
    results.innerHTML = items.length ? items.map(createSearchCard).join('') : '<div class="search-empty">没有匹配结果，换个关键词试试看。</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupPlayer();
    setupSearchPage();
  });
})();
