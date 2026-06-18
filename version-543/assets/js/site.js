(function () {
  function queryAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var slides = queryAll('[data-hero-slide]');
    var dots = queryAll('[data-hero-dot]');
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
        start();
      });
    });

    start();
  }

  function initLocalFilter() {
    queryAll('.local-filter').forEach(function (input) {
      var targetSelector = input.getAttribute('data-filter-target');
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }

      var cards = queryAll('.movie-card', target);
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-card-text') || '').toLowerCase();
          card.hidden = keyword !== '' && text.indexOf(keyword) === -1;
        });
      });
    });
  }

  function createResultCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-card-text="' + escapeHtml(item.searchText) + '">' +
      '<a class="poster-link" href="' + escapeHtml(item.href) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="card-year">' + escapeHtml(item.year) + '</span>' +
      '<span class="card-type">' + escapeHtml(item.type) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');
    var summary = document.getElementById('search-summary');
    var data = globalThis.movieSearchData || [];
    if (!input || !results || !summary || data.length === 0) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var list = data.filter(function (item) {
        return keyword === '' || item.searchText.toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = list.map(createResultCard).join('');
      summary.textContent = keyword === '' ? '显示热门搜索结果' : '搜索结果：' + list.length + ' 部影片';
    }

    input.addEventListener('input', render);
    render();
  }

  function initPlayers() {
    queryAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var status = shell.querySelector('.player-status');
      var stream = shell.getAttribute('data-stream');
      var started = false;

      if (!video || !overlay || !stream) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function startVideo() {
        if (started) {
          video.play();
          return;
        }

        started = true;
        overlay.classList.add('is-hidden');
        video.controls = true;
        setStatus('正在加载影片...');

        if (globalThis.Hls && globalThis.Hls.isSupported()) {
          var hls = new globalThis.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(globalThis.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus('');
            }).catch(function () {
              setStatus('点击视频继续播放');
            });
          });
          hls.on(globalThis.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放加载失败，请稍后重试。');
            }
          });
          video.hlsController = hls;
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().then(function () {
              setStatus('');
            }).catch(function () {
              setStatus('点击视频继续播放');
            });
          }, { once: true });
          return;
        }

        setStatus('当前播放环境暂不支持该视频格式。');
      }

      overlay.addEventListener('click', startVideo);
      video.addEventListener('click', function () {
        if (!started) {
          startVideo();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
