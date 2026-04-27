(function () {
  var audio = document.getElementById("bgm-audio");
  var btn = document.getElementById("bgm-btn");
  if (!audio || !btn) return;

  audio.volume = 0.38;
  audio.muted = false;
  audio.loop = true;
  audio.playsInline = true;
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.setAttribute("x5-playsinline", "true");
  audio.setAttribute("x5-audio-player-type", "h5-page");
  audio.setAttribute("preload", "auto");

  function updateUi() {
    var playing = !audio.paused && !audio.ended;
    btn.textContent = playing ? "停止播放" : "点击播放";
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute("aria-label", playing ? "停止背景音乐" : "播放背景音乐");
    btn.classList.toggle("is-playing", playing);
  }

  function togglePlay() {
    if (!audio.paused && !audio.ended) {
      audio.pause();
    } else {
      audio.play().then(function () {
        updateUi();
      }).catch(function (error) {
        console.warn("播放失败:", error);
      });
    }
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    togglePlay();
  });

  audio.addEventListener("play", function () {
    updateUi();
  });
  audio.addEventListener("pause", function () {
    updateUi();
  });
  audio.addEventListener("ended", function () {
    updateUi();
  });
  audio.addEventListener("error", function () {
    console.warn("BGM audio error", audio.error ? audio.error.code : "unknown");
    updateUi();
  });

  updateUi();
})();
