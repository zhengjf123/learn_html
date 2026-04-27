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

  var starting = false;
  var ignoreClickUntil = 0;
  var isWeChat = /MicroMessenger/i.test(navigator.userAgent);

  function updateUi() {
    var playing = !audio.paused && !audio.ended;
    btn.textContent = starting ? "缓冲中…" : playing ? "停止播放" : "点击播放";
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute("aria-label", playing ? "停止背景音乐" : "播放背景音乐");
    btn.classList.toggle("is-playing", playing);
  }

  function startPlay() {
    if (starting) return;
    if (!audio.paused && !audio.ended) return;
    starting = true;
    updateUi();

    // 在“按下”就触发 play()，减少点击后才开始缓冲的体感延迟
    var p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(
        function () {
          starting = false;
          updateUi();
        },
        function (error) {
          console.warn("播放失败:", error);
          starting = false;
          updateUi();
        }
      );
    } else {
      starting = false;
      updateUi();
    }
  }

  function handleUserInteraction() {
    if (!audio.paused) return;
    // 尝试预加载
    audio.load();
  }

  // 监听用户交互事件，解决微信浏览器的自动播放限制
  document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
  document.addEventListener('click', handleUserInteraction, { once: true, passive: true });
  document.addEventListener('keydown', handleUserInteraction, { once: true, passive: true });

  btn.addEventListener(
    "pointerdown",
    function () {
      // pointerdown 后通常还会触发 click，避免 click 立刻 pause 掉
      ignoreClickUntil = Date.now() + 350;
      startPlay();
    },
    { passive: true }
  );

  btn.addEventListener(
    "touchstart",
    function () {
      ignoreClickUntil = Date.now() + 350;
      startPlay();
    },
    { passive: true }
  );

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (Date.now() < ignoreClickUntil) return;

    if (audio.paused || audio.ended) {
      startPlay();
    } else {
      audio.pause();
      updateUi();
    }
  });

  audio.addEventListener("play", function () {
    starting = false;
    updateUi();
  });
  audio.addEventListener("pause", function () {
    starting = false;
    updateUi();
  });
  audio.addEventListener("ended", function () {
    starting = false;
    updateUi();
  });
  audio.addEventListener("error", function () {
    console.warn("BGM audio error", audio.error ? audio.error.code : "unknown");
    starting = false;
    updateUi();
  });
  audio.addEventListener("loadedmetadata", function () {
    console.log("音频加载成功");
  });
  audio.addEventListener("canplay", function () {
    console.log("音频可以播放");
  });

  updateUi();
})();