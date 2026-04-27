(function () {
  var body = document.body;
  if (!body) return;

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        body.classList.add("is-preloading");
        setTimeout(function () {
          body.classList.add("is-loaded");
        }, 500);
      });
    });
  });

  var pagesContainer = document.getElementById("pages-container");
  var pages = document.querySelectorAll(".page");
  var navDots = document.querySelectorAll(".nav-dot");
  var currentPage = 0;
  var isScrolling = false;

  function showPage(index) {
    if (index < 0 || index >= pages.length || isScrolling) return;
    
    isScrolling = true;
    
    pages.forEach(function (page, i) {
      if (i === index) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });

    navDots.forEach(function (dot, i) {
      if (i === index) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    currentPage = index;

    setTimeout(function () {
      isScrolling = false;
    }, 800);
  }

  navDots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showPage(index);
    });
  });

  var scrollIndicator = document.getElementById("scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", function () {
      showPage(1);
    });
  }

  window.addEventListener("wheel", function (e) {
    if (isScrolling) return;
    
    if (e.deltaY > 0) {
      showPage(currentPage + 1);
    } else {
      showPage(currentPage - 1);
    }
  }, { passive: true });

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      showPage(currentPage + 1);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      showPage(currentPage - 1);
    }
  });

  var d = document.getElementById("wish-details");
  if (d) {
    var summary = d.querySelector("summary");
    if (summary) {
      function sync() {
        summary.textContent = d.open ? "收起祝福" : "展开祝福";
      }
      d.addEventListener("toggle", sync);
      sync();
    }
  }
})();
