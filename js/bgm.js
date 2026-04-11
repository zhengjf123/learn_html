(function () {
  var audio = document.getElementById("bgm-audio");
  var btn = document.getElementById("bgm-float");
  if (!audio || !btn) return;

  var STORAGE_KEY = "learn_html_bgm_muted";
  audio.volume = 0.38;

  var mutedByUser = false;
  try {
    mutedByUser = localStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {}

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, mutedByUser ? "1" : "0");
    } catch (e) {}
  }

  function updateUi() {
    btn.classList.toggle("is-muted", mutedByUser);
    btn.setAttribute("aria-pressed", mutedByUser ? "false" : "true");
    btn.setAttribute("aria-label", mutedByUser ? "开启背景音乐" : "关闭背景音乐");
    btn.title = mutedByUser ? "点击开启音乐" : "点击关闭音乐";
  }

  function playIfAllowed() {
    if (mutedByUser) {
      audio.pause();
      return Promise.resolve();
    }
    return audio.play().catch(function () {});
  }

  function tryUnlock(e) {
    if (mutedByUser) return;
    if (e && e.target && btn.contains(e.target)) return;
    if (!audio.paused) return;
    playIfAllowed();
  }

  updateUi();
  if (!mutedByUser) {
    playIfAllowed();
  } else {
    audio.pause();
  }

  window.addEventListener("pageshow", function (ev) {
    if (!mutedByUser && (audio.paused || ev.persisted)) playIfAllowed();
  });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !mutedByUser && audio.paused) playIfAllowed();
  });
  window.addEventListener("focus", function () {
    if (!mutedByUser && audio.paused) playIfAllowed();
  });

  document.addEventListener("pointerdown", tryUnlock, { capture: true, passive: true });
  document.addEventListener("click", tryUnlock, { capture: true, passive: true });
  document.addEventListener("touchstart", tryUnlock, { capture: true, passive: true });
  document.addEventListener("keydown", tryUnlock, { capture: true, passive: true });

  btn.addEventListener("click", function (e) {
    e.stopPropagation();

    if (mutedByUser) {
      mutedByUser = false;
      persist();
      playIfAllowed().then(function () {
        updateUi();
      });
      return;
    }

    if (audio.paused) {
      playIfAllowed().then(
        function () {
          updateUi();
        },
        function () {
          updateUi();
        }
      );
      return;
    }

    mutedByUser = true;
    persist();
    audio.pause();
    updateUi();
  });
})();
