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

  var started = false;

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
      return Promise.resolve(false);
    }
    return audio
      .play()
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  function removeGestureListeners() {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("wheel", onWheel, true);
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("touchstart", onTouchStart, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
  }

  function commitStartedIfPlaying() {
    if (mutedByUser || !audio.paused) {
      started = true;
      removeGestureListeners();
    }
    updateUi();
  }

  function tryStartAudio() {
    if (mutedByUser || started) return;
    playIfAllowed().then(function (ok) {
      if (ok && !audio.paused) {
        started = true;
        removeGestureListeners();
      }
      updateUi();
    });
  }

  function onScroll() {
    tryStartAudio();
  }

  function onWheel(e) {
    if (Math.abs(e.deltaY) < 1) return;
    tryStartAudio();
  }

  function onPointerDown(e) {
    if (btn.contains(e.target)) return;
    tryStartAudio();
  }

  function onTouchStart(e) {
    if (btn.contains(e.target)) return;
    tryStartAudio();
  }

  function onClick(e) {
    if (btn.contains(e.target)) return;
    tryStartAudio();
  }

  function onKeyDown(e) {
    if (e.key === "Tab" || e.key === "Escape") return;
    tryStartAudio();
  }

  updateUi();
  if (mutedByUser) {
    audio.pause();
  } else {
    audio.pause();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("wheel", onWheel, { capture: true, passive: true });
    document.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    document.addEventListener("touchstart", onTouchStart, { capture: true, passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("keydown", onKeyDown, { capture: true, passive: true });
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();

    if (mutedByUser) {
      mutedByUser = false;
      persist();
      playIfAllowed().then(function (ok) {
        if (ok && !audio.paused) {
          started = true;
          removeGestureListeners();
        }
        updateUi();
      });
      return;
    }

    if (audio.paused) {
      playIfAllowed().then(function (ok) {
        if (ok && !audio.paused) {
          started = true;
          removeGestureListeners();
        }
        updateUi();
      });
      return;
    }

    mutedByUser = true;
    persist();
    audio.pause();
    updateUi();
  });
})();
