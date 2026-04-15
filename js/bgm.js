(function () {
  var audio = document.getElementById("bgm-audio");
  var btn = document.getElementById("bgm-btn");
  if (!audio || !btn) return;

  audio.volume = 0.38;
  audio.muted = false;
  audio.playsInline = true;
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.setAttribute("x5-playsinline", "true");
  audio.setAttribute("x5-audio-player-type", "h5-page");

  var starting = false;
  var ignoreClickUntil = 0;

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
        function () {
          starting = false;
          updateUi();
        }
      );
    } else {
      starting = false;
      updateUi();
    }
  }

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

  updateUi();
})();