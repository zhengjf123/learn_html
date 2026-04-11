(function () {
  var slideshow = document.getElementById("slideshow");
  var emptyEl = document.getElementById("gallery-empty");
  if (!slideshow || !emptyEl) return;

  var layers = slideshow.querySelectorAll(".slide-layer");
  var imgs = [layers[0].querySelector("img"), layers[1].querySelector("img")];
  var captionEl = slideshow.querySelector(".slide-caption");
  var filmstrip = document.getElementById("filmstrip");
  var btnPrev = slideshow.querySelector(".btn-prev");
  var btnNext = slideshow.querySelector(".btn-next");
  var btnPlay = slideshow.querySelector(".btn-play");
  var btnFs = slideshow.querySelector(".btn-fullscreen");
  var progressFill = slideshow.querySelector(".slide-progress-fill");
  var frameEl = slideshow.querySelector(".slide-frame");

  var prefix = "photos/";
  var list = [];
  var idx = 0;
  var visibleLayer = 0;
  var autoTimer = null;
  var playing = true;
  var autoMs = 6000;
  var swipeX = null;
  var fitFrameGeneration = 0;

  function clearAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function scheduleAuto() {
    clearAuto();
    if (!playing || list.length <= 1) return;
    autoTimer = setTimeout(function () {
      go(idx + 1);
    }, autoMs);
  }

  function restartProgress() {
    if (!progressFill) return;
    progressFill.style.transition = "none";
    progressFill.style.transform = "scaleX(0)";
    if (!playing || list.length <= 1) return;
    void progressFill.offsetWidth;
    progressFill.style.transition = "transform " + autoMs / 1000 + "s linear";
    progressFill.style.transform = "scaleX(1)";
  }

  function setPlayUi() {
    btnPlay.textContent = playing ? "⏸" : "▶";
    btnPlay.setAttribute("aria-label", playing ? "暂停自动放映" : "继续自动放映");
    restartProgress();
    scheduleAuto();
  }

  function updateFilmstrip() {
    var thumbs = filmstrip.querySelectorAll(".filmstrip-thumb");
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].classList.toggle("is-current", i === idx);
    }
  }

  function fitFrameToImage(img) {
    if (!frameEl || !img || !img.naturalWidth || !img.naturalHeight) return;
    if (document.fullscreenElement === frameEl) return;
    var pad = 36;
    var maxW = Math.min(920, (window.innerWidth || 800) - pad);
    var maxH = Math.min(720, (window.innerHeight || 600) * 0.72);
    var nw = img.naturalWidth;
    var nh = img.naturalHeight;
    var scale = Math.min(maxW / nw, maxH / nh);
    var dw = Math.max(1, Math.round(nw * scale));
    var dh = Math.max(1, Math.round(nh * scale));
    frameEl.style.width = dw + "px";
    frameEl.style.height = dh + "px";
  }

  function scheduleFitFrameAfterTransition() {
    var gen = ++fitFrameGeneration;
    var layer = layers[visibleLayer];
    var done = function () {
      if (gen !== fitFrameGeneration) return;
      fitFrameToImage(imgs[visibleLayer]);
    };
    var fallback = setTimeout(function () {
      layer.removeEventListener("transitionend", onEnd);
      done();
    }, 1400);
    function onEnd(ev) {
      if (ev.target !== layer || ev.propertyName !== "opacity") return;
      layer.removeEventListener("transitionend", onEnd);
      clearTimeout(fallback);
      if (gen !== fitFrameGeneration) return;
      done();
    }
    layer.addEventListener("transitionend", onEnd);
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var img = imgs[visibleLayer];
      if (img && img.naturalWidth) fitFrameToImage(img);
    }, 120);
  });

  document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement && frameEl) {
      var img = imgs[visibleLayer];
      if (img && img.naturalWidth) fitFrameToImage(img);
    }
  });

  function swapTo(newIdx) {
    newIdx = ((newIdx % list.length) + list.length) % list.length;
    var nextLayer = 1 - visibleLayer;
    var nextImg = imgs[nextLayer];
    var item = list[newIdx];
    var url = prefix + item.file;

    function finish() {
      layers[visibleLayer].classList.remove("is-visible");
      layers[nextLayer].classList.add("is-visible");
      visibleLayer = nextLayer;
      idx = newIdx;
      captionEl.textContent = item.caption || "";
      updateFilmstrip();
      scheduleFitFrameAfterTransition();
      restartProgress();
      scheduleAuto();
    }

    function onLoad() {
      nextImg.onload = null;
      nextImg.onerror = null;
      finish();
    }

    function onErr() {
      nextImg.onload = null;
      nextImg.onerror = null;
      console.warn("无法加载照片:", url);
      if (list.length < 2) return;
      var n = (newIdx + 1) % list.length;
      if (n === newIdx) return;
      go(n, true);
    }

    if (nextImg.getAttribute("data-current-src") === url) {
      finish();
      return;
    }

    nextImg.onload = onLoad;
    nextImg.onerror = onErr;
    nextImg.src = url;
    nextImg.setAttribute("data-current-src", url);
    if (nextImg.complete && nextImg.naturalWidth > 0) onLoad();
  }

  function go(newIdx, skipClear) {
    if (!list.length) return;
    if (!skipClear) clearAuto();
    swapTo(newIdx);
  }

  function buildFilmstrip() {
    filmstrip.innerHTML = "";
    list.forEach(function (item, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filmstrip-thumb";
      if (i === 0) b.classList.add("is-current");
      b.setAttribute("aria-label", "第 " + (i + 1) + " 张");
      var im = document.createElement("img");
      im.src = prefix + item.file;
      im.alt = "";
      im.loading = "lazy";
      b.appendChild(im);
      b.addEventListener("click", function () {
        go(i);
      });
      filmstrip.appendChild(b);
    });
  }

  function initWithPhotos() {
    emptyEl.hidden = true;
    slideshow.hidden = false;
    buildFilmstrip();
    visibleLayer = 0;
    layers[0].classList.add("is-visible");
    layers[1].classList.remove("is-visible");
    imgs[0].removeAttribute("data-current-src");
    imgs[1].removeAttribute("data-current-src");
    idx = 0;

    imgs[0].onload = function () {
      imgs[0].onload = null;
      imgs[0].onerror = null;
      captionEl.textContent = list[0].caption || "";
      fitFrameToImage(imgs[0]);
      restartProgress();
      scheduleAuto();
    };
    imgs[0].onerror = function () {
      imgs[0].onerror = null;
      clearAuto();
      if (list.length > 1) {
        imgs[0].removeAttribute("data-current-src");
        go(1, true);
      } else {
        slideshow.hidden = true;
        emptyEl.hidden = false;
      }
    };
    imgs[0].src = prefix + list[0].file;
    imgs[0].setAttribute("data-current-src", prefix + list[0].file);
    if (imgs[0].complete && imgs[0].naturalWidth > 0) {
      imgs[0].onload = null;
      captionEl.textContent = list[0].caption || "";
      fitFrameToImage(imgs[0]);
      restartProgress();
      scheduleAuto();
    }
  }

  fetch("photos/manifest.json", { cache: "no-store" })
    .then(function (r) {
      return r.json();
    })
    .catch(function () {
      return { photos: [] };
    })
    .then(function (data) {
      var raw = data.photos || [];
      list = raw.filter(function (p) {
        return p && typeof p.file === "string" && p.file.trim().length > 0;
      });
      if (typeof data.autoAdvanceSeconds === "number" && data.autoAdvanceSeconds > 0) {
        autoMs = Math.round(data.autoAdvanceSeconds * 1000);
      }

      if (!list.length) {
        slideshow.hidden = true;
        emptyEl.hidden = false;
        return;
      }

      initWithPhotos();
    });

  btnPrev.addEventListener("click", function () {
    go(idx - 1);
  });
  btnNext.addEventListener("click", function () {
    go(idx + 1);
  });
  btnPlay.addEventListener("click", function () {
    playing = !playing;
    setPlayUi();
  });

  if (btnFs && frameEl) {
    btnFs.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        frameEl.style.width = "";
        frameEl.style.height = "";
        frameEl.requestFullscreen().catch(function () {
          var im = imgs[visibleLayer];
          if (im && im.naturalWidth) fitFrameToImage(im);
        });
      } else {
        document.exitFullscreen();
      }
    });
  }

  if (frameEl) {
    frameEl.addEventListener(
      "touchstart",
      function (e) {
        if (e.changedTouches.length === 1) swipeX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    frameEl.addEventListener(
      "touchend",
      function (e) {
        if (swipeX == null || e.changedTouches.length !== 1) return;
        var dx = e.changedTouches[0].clientX - swipeX;
        swipeX = null;
        if (Math.abs(dx) < 48) return;
        if (dx > 0) go(idx - 1);
        else go(idx + 1);
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", function (e) {
    if (slideshow.hidden) return;
    var rect = slideshow.getBoundingClientRect();
    var vh = window.innerHeight || 0;
    if (rect.top > vh * 0.85 || rect.bottom < vh * 0.15) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(idx - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(idx + 1);
    }
  });

  slideshow.addEventListener("keydown", function (e) {
    if (e.key === " ") {
      e.preventDefault();
      playing = !playing;
      setPlayUi();
    }
  });
})();
