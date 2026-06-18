(function() {
  window.initVideoPlayer = function(selector, streamUrl) {
    var shell = document.querySelector(selector);

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('button');
    var started = false;
    var hls = null;

    function bindStream() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      bindStream();

      if (button) {
        button.classList.add('hidden');
        button.setAttribute('aria-hidden', 'true');
      }

      var playAction = video.play();

      if (playAction && playAction.catch) {
        playAction.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function() {
      if (!started || video.paused) {
        start();
      }
    });
  };
})();
