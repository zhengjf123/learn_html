(function () {
  var audio = document.getElementById("bgm-audio");
  var btn = document.getElementById("bgm-float");
  if (!audio || !btn) return;

  var STORAGE_KEY = "learn_html_bgm_muted";
  var mutedByUser = false;
  var hasStarted = false;
  var scrollTriggered = false;

  audio.volume = 0.38;
  audio.muted = false;
  audio.playsInline = true;
  audio.setAttribute("playsinline", "true");
  audio.setAttribute("webkit-playsinline", "true");
  audio.setAttribute("x5-playsinline", "true");
  audio.setAttribute("x5-audio-player-type", "h5-page");
  audio.load();

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

  function removeStartListeners() {
    document.removeEventListener("pointerdown", onFirstGesture, true);
    document.removeEventListener("touchstart", onFirstGesture, true);
    document.removeEventListener("click", onFirstGesture, true);
    document.removeEventListener("keydown", onFirstKeydown, true);
    document.removeEventListener("wheel", onWheelStart, true);
    window.removeEventListener("scroll", onScrollStart, true);
  }

  function addStartListeners() {
    document.addEventListener("pointerdown", onFirstGesture, true);
    document.addEventListener("touchstart", onFirstGesture, true);
    document.addEventListener("click", onFirstGesture, true);
    document.addEventListener("keydown", onFirstKeydown, true);
    document.addEventListener("wheel", onWheelStart, { capture: true, passive: true });
    window.addEventListener("scroll", onScrollStart, { capture: true, passive: true });
  }

  function playAudio() {
    if (mutedByUser) {
      audio.pause();
      updateUi();
      return Promise.resolve(false);
    }

    audio.muted = false;
    if (audio.readyState === 0) {
      audio.load();
    }

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
        console.warn("BGM play failed:", err && err.name ? err.name : err);
        updateUi();
        return false;
      });
  }

  function tryStartFromInteraction(target) {
    if (mutedByUser || hasStarted) return;
    if (target && btn.contains(target)) return;
    playAudio();
  }

  function onFirstGesture(e) {
    tryStartFromInteraction(e.target);
  }

  function onFirstKeydown(e) {
    if (e.key === "Tab" || e.key === "Escape") return;
    tryStartFromInteraction(e.target);
  }

  function onWheelStart(e) {
    if (Math.abs(e.deltaY) < 1) return;
    tryStartFromInteraction(e.target);
  }

  function onScrollStart() {
    if (scrollTriggered) return;
    if ((window.scrollY || window.pageYOffset || 0) <= 0) return;
    scrollTriggered = true;
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
