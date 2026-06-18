(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-mobile-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function() {
      menu.classList.toggle('open');
    });
  }

  var searchInput = document.querySelector('[data-filter-search]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var genreFilter = document.querySelector('[data-filter-genre]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function clean(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function matchText(card, query) {
    if (!query) {
      return true;
    }

    return clean(card.textContent).indexOf(query) !== -1;
  }

  function matchData(card, name, value) {
    if (!value) {
      return true;
    }

    return clean(card.getAttribute('data-' + name)).indexOf(value) !== -1;
  }

  function applyFilters() {
    var query = clean(searchInput && searchInput.value);
    var typeValue = clean(typeFilter && typeFilter.value);
    var regionValue = clean(regionFilter && regionFilter.value);
    var genreValue = clean(genreFilter && genreFilter.value);

    cards.forEach(function(card) {
      var visible = matchText(card, query) &&
        matchData(card, 'type', typeValue) &&
        matchData(card, 'region', regionValue) &&
        matchData(card, 'genre', genreValue);

      card.hidden = !visible;
    });
  }

  [searchInput, typeFilter, regionFilter, genreFilter].forEach(function(control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });
})();
