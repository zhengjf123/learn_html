(function () {
  var audio = document.getElementById("bgm-audio");
  var btn = document.getElementById("btn-bgm");
  if (!audio || !btn) return;

  var mq = window.matchMedia("(min-width: 900px) and (pointer: fine)");
  audio.volume = 0.38;

  function setUi(playing) {
    btn.setAttribute("aria-pressed", playing ? "true" : "false");
    btn.setAttribute("aria-label", playing ? "暂停氛围音乐" : "播放氛围音乐");
    btn.textContent = playing ? "♪ 音乐开" : "♪ 氛围音乐";
    btn.classList.toggle("is-playing", playing);
  }

  function applyLayout() {
    if (!mq.matches) {
      btn.hidden = true;
      audio.pause();
      setUi(false);
    } else {
      btn.hidden = false;
    }
  }

  applyLayout();
  mq.addEventListener("change", applyLayout);

  btn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().then(
        function () {
          setUi(true);
        },
        function () {
          setUi(false);
        }
      );
    } else {
      audio.pause();
      setUi(false);
    }
  });

})();
