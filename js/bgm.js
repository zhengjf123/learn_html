(function () {
  var audio = document.getElementById("bgm-audio");
  var btn = document.getElementById("bgm-float");
  if (!audio || !btn) return;

  var STORAGE_KEY = "learn_html_bgm_muted";
  var mutedByUser = false;
  var hasStarted = false;
  var ignoreBtnClickUntil = 0;

  var wheelScrollOpts = { capture: true, passive: true };
  var touchEndOpts = { capture: true, passive: true };

  audio.volume = 0.38;
  audio.muted = false;
  audio.playsInline = true;
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.setAttribute("x5-playsinline", "true");
  audio.setAttribute("x5-audio-player-type", "h5-page");

  try {
    mutedByUser = localStorage.getItem(STORAGE_KEY) === "1";
  } catch (e) {}

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, mutedByUser ? "1" : "0");
    } catch (e) {}
  }

  function updateUi() {
    var isPlaying = !audio.paused && !audio.ended;
    btn.classList.toggle("is-muted", mutedByUser || !isPlaying);
    btn.setAttribute("aria-pressed", mutedByUser ? "false" : "true");
    btn.setAttribute("aria-label", mutedByUser ? "开启背景音乐" : "关闭背景音乐");
    btn.title = mutedByUser ? "点击开启音乐" : "点击关闭音乐";
  }

  function eventTarget(el) {
    if (!el) return null;
    return el.nodeType === 3 ? el.parentNode : el;
  }

  function removeStartListeners() {
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("touchstart", onFirstGesture, true);
    document.removeEventListener("click", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstKeydown, true);
    document.removeEventListener("mousedown", onFirstGesture, true);
    document.removeEventListener("touchend", onTouchEnd, touchEndOpts);
    window.removeEventListener("wheel", onWheel, wheelScrollOpts);
    window.removeEventListener("scroll", onScroll, wheelScrollOpts);
  }

  function addStartListeners() {
    document.addEventListener("pointerdown", onFirstGesture, true);
    document.addEventListener("touchstart", onFirstGesture, true);
    document.addEventListener("click", onFirstGesture, true);
    document.addEventListener("keydown", onFirstKeydown, true);
    document.addEventListener("mousedown", onFirstGesture, true);
    document.addEventListener("touchend", onTouchEnd, touchEndOpts);
    window.addEventListener("wheel", onWheel, wheelScrollOpts);
    window.addEventListener("scroll", onScroll, wheelScrollOpts);
  }

  function playAudio() {
    if (mutedByUser) {
      audio.pause();
      updateUi();
      return Promise.resolve(false);
    }

    if (!audio.paused && !audio.ended) {
      hasStarted = true;
      removeStartListeners();
      updateUi();
      return Promise.resolve(true);
    }

    audio.muted = false;

    var result;
    try {
      result = audio.play();
    } catch (err) {
      updateUi();
      return Promise.resolve(false);
    }

    if (!result || typeof result.then !== "function") {
      hasStarted = !audio.paused;
      if (hasStarted) removeStartListeners();
      updateUi();
      return Promise.resolve(hasStarted);
    }

    return result
      .then(function () {
        hasStarted = true;
        removeStartListeners();
        updateUi();
        return true;
      })
      .catch(function (err) {
        var name = err && err.name;
        if (name === "NotAllowedError") {
          console.warn("BGM play failed:", name);
          updateUi();
          return false;
        }
        return new Promise(function (resolve) {
          function cleanup() {
            audio.removeEventListener("canplay", onCanPlay);
            audio.removeEventListener("error", onErr);
          }
          function onCanPlay() {
            cleanup();
            audio
              .play()
              .then(function () {
                hasStarted = true;
                removeStartListeners();
                updateUi();
                resolve(true);
              })
              .catch(function () {
                updateUi();
                resolve(false);
              });
          }
          function onErr() {
            cleanup();
            console.warn("BGM audio element error", audio.error ? audio.error.code : "unknown");
            updateUi();
            resolve(false);
          }
          audio.addEventListener("canplay", onCanPlay);
          audio.addEventListener("error", onErr);
        });
      });
  }

  function tryStartFromInteraction(target) {
    if (mutedByUser || hasStarted) return;
    var t = eventTarget(target);
    if (t && btn.contains(t)) {
      ignoreBtnClickUntil = Date.now() + 320;
    }
    playAudio();
  }

  function onFirstGesture(e) {
    tryStartFromInteraction(e.target);
  }

  function onTouchEnd(e) {
    tryStartFromInteraction(e.target);
  }

  function onFirstKeydown(e) {
    if (e.key === "Tab" || e.key === "Escape") return;
    tryStartFromInteraction(e.target);
  }

  function onWheel(e) {
    if (Math.abs(e.deltaY) < 0.5 && Math.abs(e.deltaX) < 0.5) return;
    tryStartFromInteraction(null);
  }

  function onScroll() {
    if ((window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0) <= 0) return;
    tryStartFromInteraction(null);
  }

  audio.addEventListener("play", function () {
    hasStarted = true;
    updateUi();
  });

  audio.addEventListener("pause", function () {
    updateUi();
  });

  audio.addEventListener("error", function () {
    console.warn("BGM audio element error", audio.error ? audio.error.code : "unknown");
    updateUi();
  });

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (Date.now() < ignoreBtnClickUntil) {
      return;
    }

    if (mutedByUser || audio.paused) {
      mutedByUser = false;
      persist();
      playAudio();
      return;
    }

    mutedByUser = true;
    persist();
    audio.pause();
    updateUi();
  });

  updateUi();
  if (!mutedByUser) {
    addStartListeners();
  }
})();
