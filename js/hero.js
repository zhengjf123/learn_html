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

  function revealIn(el) {
    if (!el) return;
    var items = el.querySelectorAll(".reveal");
    for (var i = 0; i < items.length; i++) {
      (function (node, idx) {
        node.classList.remove("is-visible");
        node.style.transitionDelay = Math.min(idx * 90, 420) + "ms";
        requestAnimationFrame(function () {
          node.classList.add("is-visible");
        });
      })(items[i], i);
    }
  }

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
    revealIn(pages[index]);

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
    
    if (e.deltaY > 50) {
      showPage(currentPage + 1);
    } else if (e.deltaY < -50) {
      showPage(currentPage - 1);
    }
  }, { passive: true });

  var touchStartY = 0;
  var touchEndY = 0;
  
  document.addEventListener("touchstart", function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener("touchmove", function (e) {
    if (isScrolling) return;
    touchEndY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener("touchend", function (e) {
    if (isScrolling) return;
    
    var diff = touchStartY - touchEndY;
    if (diff > 50) {
      showPage(currentPage + 1);
    } else if (diff < -50) {
      showPage(currentPage - 1);
    }
  });

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

  // 3D卡片鼠标跟随效果
  var coverWrapper = document.querySelector('.cover-text-wrapper');
  var coverText = document.querySelector('.cover-text');
  
  if (coverWrapper && coverText) {
    var isHovering = false;
    var rafId = null;
    var currentRotateX = 0;
    var currentRotateY = 0;
    var targetRotateX = 0;
    var targetRotateY = 0;
    
    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }
    
    function updateCardTransform() {
      currentRotateX = lerp(currentRotateX, targetRotateX, 0.1);
      currentRotateY = lerp(currentRotateY, targetRotateY, 0.1);
      
      coverWrapper.style.transform = 'perspective(1000px) rotateX(' + currentRotateX + 'deg) rotateY(' + currentRotateY + 'deg)';
      
      if (isHovering || Math.abs(currentRotateX) > 0.01 || Math.abs(currentRotateY) > 0.01) {
        rafId = requestAnimationFrame(updateCardTransform);
      } else {
        rafId = null;
      }
    }
    
    coverText.addEventListener('mouseenter', function() {
      isHovering = true;
      if (!rafId) {
        updateCardTransform();
      }
    });
    
    coverText.addEventListener('mouseleave', function() {
      isHovering = false;
      targetRotateX = 0;
      targetRotateY = 0;
      if (!rafId) {
        updateCardTransform();
      }
    });
    
    coverText.addEventListener('mousemove', function(e) {
      if (!isHovering) return;
      
      var rect = coverText.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      
      var mouseX = e.clientX - centerX;
      var mouseY = e.clientY - centerY;
      
      // 计算旋转角度，最大15度
      targetRotateY = (mouseX / (rect.width / 2)) * 15;
      targetRotateX = -(mouseY / (rect.height / 2)) * 15;
    });
    
    // 触摸设备支持
    coverText.addEventListener('touchstart', function(e) {
      isHovering = true;
      if (!rafId) {
        updateCardTransform();
      }
    }, { passive: true });
    
    coverText.addEventListener('touchmove', function(e) {
      if (!isHovering) return;
      
      var touch = e.touches[0];
      var rect = coverText.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      
      var touchX = touch.clientX - centerX;
      var touchY = touch.clientY - centerY;
      
      targetRotateY = (touchX / (rect.width / 2)) * 15;
      targetRotateX = -(touchY / (rect.height / 2)) * 15;
    }, { passive: true });
    
    coverText.addEventListener('touchend', function() {
      isHovering = false;
      targetRotateX = 0;
      targetRotateY = 0;
      if (!rafId) {
        updateCardTransform();
      }
    });
  }

  // 初始页触发一次 reveal（兼容 HTML 默认 active）
  for (var i = 0; i < pages.length; i++) {
    if (pages[i].classList.contains("active")) {
      currentPage = i;
      break;
    }
  }
  revealIn(pages[currentPage]);
})();
