(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.site-nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupLocalFilters() {
    var panels = document.querySelectorAll('.filter-panel');

    panels.forEach(function (panel) {
      var root = panel.parentElement;
      var input = panel.querySelector('.movie-filter-input');
      var yearSelect = panel.querySelector('[data-filter-field="year"]');
      var typeSelect = panel.querySelector('[data-filter-field="type"]');
      var empty = panel.querySelector('.filter-empty');
      var cards = root ? root.querySelectorAll('.filter-target .movie-card') : [];

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var matched = true;

          if (keyword && searchText.indexOf(keyword) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (type && cardType.indexOf(type) === -1) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.hidden = visibleCount !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', applyFilter);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + tag + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-search="' + movie.search + '" data-year="' + movie.year + '" data-type="' + movie.type + '" data-category="' + movie.category + '">',
      '  <a class="movie-cover" href="' + movie.url + '">',
      '    <img src="' + movie.poster + '" alt="' + movie.title + '" loading="lazy">',
      '    <span class="movie-duration">' + movie.duration + '分钟</span>',
      '    <span class="movie-score">' + movie.score + '</span>',
      '  </a>',
      '  <div class="movie-info">',
      '    <div class="movie-meta">',
      '      <span>' + movie.year + '</span>',
      '      <span>' + movie.region + '</span>',
      '      <span>' + movie.type + '</span>',
      '    </div>',
      '    <h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
      '    <p>' + movie.summary + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var form = document.querySelector('[data-search-page]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!form || !results || !Array.isArray(window.MOVIES)) {
      return;
    }

    var input = form.querySelector('[name="q"]');
    var category = form.querySelector('[name="category"]');
    var year = form.querySelector('[name="year"]');
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function applySearch() {
      var keyword = normalize(input && input.value);
      var cat = normalize(category && category.value);
      var selectedYear = normalize(year && year.value);
      var matched = window.MOVIES.filter(function (movie) {
        var ok = true;

        if (keyword && normalize(movie.search).indexOf(keyword) === -1) {
          ok = false;
        }

        if (cat && normalize(movie.category) !== cat) {
          ok = false;
        }

        if (selectedYear && normalize(movie.year) !== selectedYear) {
          ok = false;
        }

        return ok;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCard).join('');
      if (count) {
        count.textContent = '共找到 ' + matched.length + ' 条结果，最多展示前 120 条。';
      }
    }

    form.addEventListener('input', applySearch);
    form.addEventListener('change', applySearch);
    applySearch();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupLocalFilters();
    setupSearchPage();
  });
})();
