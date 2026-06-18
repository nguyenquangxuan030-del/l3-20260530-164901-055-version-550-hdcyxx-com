(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilter() {
    var panel = document.querySelector("[data-filter-form]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }

    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var state = panel.querySelector("[data-filter-state]");
    var clear = panel.querySelector("[data-filter-clear]");
    var cards = Array.prototype.slice.call(list.children);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");

    if (initial && input) {
      input.value = initial;
    }

    function values(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
    }

    function apply() {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = values(card);
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && normalize(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
          matched = false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")).indexOf(typeValue) === -1) {
          matched = false;
        }
        if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
          matched = false;
        }
        card.setAttribute("data-filter-hidden", matched ? "false" : "true");
        if (matched) {
          shown += 1;
        }
      });

      if (state) {
        state.textContent = shown > 0 ? "筛选结果已更新，可点击影片进入详情页。" : "未找到匹配影片，请调整关键词或筛选条件。";
      }
    }

    [input, region, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      }
    });

    if (clear) {
      clear.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (type) {
          type.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  ready(function () {
    initMenu();
    initFilter();
    initHero();
  });
})();
