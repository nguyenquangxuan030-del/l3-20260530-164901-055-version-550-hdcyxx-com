(function () {
    var hlsLoader = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsLoader) {
            return hlsLoader;
        }
        hlsLoader = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return hlsLoader;
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        start();
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    function initCards() {
        var filter = document.querySelector("[data-card-filter]");
        var sort = document.querySelector("[data-card-sort]");
        var grid = document.querySelector("[data-card-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
        var queryInput = document.querySelector("[data-query-input]");
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (queryInput && q) {
            queryInput.value = q;
        }

        function applyFilter() {
            var value = filter ? filter.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                card.classList.toggle("is-hidden", value && text.indexOf(value) === -1);
            });
        }

        function applySort() {
            if (!sort) {
                return;
            }
            var value = sort.value;
            var sorted = cards.slice();
            if (value === "year") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
            }
            if (value === "views") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                });
            }
            if (value === "default") {
                sorted = cards.slice();
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        if (filter) {
            filter.addEventListener("input", applyFilter);
        }
        if (sort) {
            sort.addEventListener("change", applySort);
        }
        applySort();
        applyFilter();
    }

    function startVideo(video, source) {
        if (!source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        loadHlsLibrary().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }
        }).catch(function () {
            video.src = source;
            video.play().catch(function () {});
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-video]");
            if (!video || !button) {
                return;
            }
            function play() {
                button.classList.add("is-hidden");
                startVideo(video, button.getAttribute("data-video"));
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!video.src) {
                    play();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initNavigation();
        initHero();
        initSearchForms();
        initCards();
        initPlayers();
    });
})();
