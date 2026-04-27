(function () {
  var body = document.body;
  if (!body) return;

  // 两帧后再进入，避免首屏一加载就“跳”
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      body.classList.add("is-loaded");
    });
  });

  var d = document.getElementById("wish-details");
  if (!d) return;
  var summary = d.querySelector("summary");
  if (!summary) return;

  function sync() {
    summary.textContent = d.open ? "收起祝福" : "展开祝福";
  }

  d.addEventListener("toggle", sync);
  sync();
})();

