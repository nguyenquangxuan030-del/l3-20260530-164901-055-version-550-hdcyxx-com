(function () {
  window.bindMoviePlayer = function (sourceUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.querySelector(".player-cover");
    var activeHls = null;
    var loaded = false;

    if (!video || !sourceUrl) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        activeHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        activeHls.loadSource(sourceUrl);
        activeHls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      loadSource();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (activeHls) {
        activeHls.destroy();
        activeHls = null;
      }
    });
  };
})();
