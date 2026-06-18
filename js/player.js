(function () {
  function setupMoviePlayer() {
    var boxes = document.querySelectorAll('[data-player]');

    boxes.forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('[data-player-overlay]');
      var message = box.parentElement ? box.parentElement.querySelector('[data-player-message]') : null;
      var source = video ? video.getAttribute('data-src') : '';

      function setMessage(text) {
        if (message) {
          message.textContent = text;
        }
      }

      if (!overlay) {
        return;
      }

      overlay.addEventListener('click', function () {
        if (!video || !source) {
          setMessage('当前详情页已保留播放器结构，可在数据文件中接入影片播放地址。');
          return;
        }

        if (!video.getAttribute('src')) {
          video.setAttribute('src', source);
        }

        video.play().then(function () {
          overlay.hidden = true;
          setMessage('正在播放。');
        }).catch(function () {
          setMessage('浏览器阻止自动播放，请再次点击播放按钮。');
        });
      });
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;

  document.addEventListener('DOMContentLoaded', setupMoviePlayer);
})();
