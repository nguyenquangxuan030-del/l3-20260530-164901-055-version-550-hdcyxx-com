(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function readQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";

        if (!value) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");

    if (!panel || !list) {
      return;
    }

    var textInput = panel.querySelector("[data-filter-text]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var categorySelect = panel.querySelector("[data-filter-category]");
    var empty = panel.querySelector("[data-filter-empty]");
    var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
    var firstQuery = readQueryValue();

    if (textInput && firstQuery) {
      textInput.value = firstQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(textInput ? textInput.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var visible = 0;

      items.forEach(function (item) {
        var text = normalize(item.getAttribute("data-search"));
        var itemRegion = normalize(item.getAttribute("data-region"));
        var itemYear = normalize(item.getAttribute("data-year"));
        var itemCategory = normalize(item.getAttribute("data-category"));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (region && itemRegion !== region) {
          matched = false;
        }

        if (year && itemYear !== year) {
          matched = false;
        }

        if (category && itemCategory !== category) {
          matched = false;
        }

        item.classList.toggle("is-hidden", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [textInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
      if (!control) {
        return;
      }

      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });

    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
