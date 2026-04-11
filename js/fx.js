(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("fx");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;

  var stars = [];
  var hearts = [];
  var petals = [];
  var confetti = [];
  var bursts = [];

  var colors = ["#ff6b9d", "#f472b6", "#fbbf24", "#c4b5fd", "#a78bfa", "#fda4af", "#fb7185"];
  var petalColors = ["rgba(255,182,193,0.65)", "rgba(244,114,182,0.5)", "rgba(253,164,175,0.55)"];

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initStars(n) {
    stars.length = 0;
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.3,
        tw: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.2,
      });
    }
  }

  function spawnHeart() {
    hearts.push({
      x: Math.random() * W,
      y: H + 20,
      s: 0.35 + Math.random() * 0.55,
      vx: -0.35 + Math.random() * 0.7,
      vy: -(0.4 + Math.random() * 0.9),
      rot: Math.random() * Math.PI * 2,
      vr: -0.008 + Math.random() * 0.016,
      a: 0.15 + Math.random() * 0.35,
      c: Math.random() > 0.5 ? "#ff6b9d" : "#f9a8d4",
    });
  }

  function spawnPetal() {
    petals.push({
      x: Math.random() * W,
      y: -15,
      r: 3 + Math.random() * 5,
      vx: -0.6 + Math.random() * 1.2,
      vy: 0.6 + Math.random() * 1.4,
      rot: Math.random() * Math.PI,
      vr: -0.04 + Math.random() * 0.08,
      c: petalColors[(Math.random() * petalColors.length) | 0],
    });
  }

  function spawnConfettiFall(n) {
    for (var i = 0; i < n; i++) {
      confetti.push({
        x: Math.random() * W,
        y: -20 - Math.random() * H * 0.4,
        w: 5 + Math.random() * 7,
        h: 6 + Math.random() * 9,
        vx: -1.2 + Math.random() * 2.4,
        vy: 1.2 + Math.random() * 3.2,
        rot: Math.random() * Math.PI,
        vr: -0.2 + Math.random() * 0.4,
        c: colors[(Math.random() * colors.length) | 0],
        type: Math.random() > 0.35 ? 0 : 1,
      });
    }
  }

  function burstAt(x, y, count) {
    for (var i = 0; i < count; i++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = 3 + Math.random() * 9;
      bursts.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 2,
        life: 1,
        w: 4 + Math.random() * 6,
        h: 5 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: -0.35 + Math.random() * 0.7,
        c: colors[(Math.random() * colors.length) | 0],
        g: 0.12 + Math.random() * 0.08,
      });
    }
    for (var j = 0; j < Math.floor(count * 0.35); j++) {
      var a = Math.random() * Math.PI * 2;
      var s = 2 + Math.random() * 5;
      bursts.push({
        x: x,
        y: y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 3,
        life: 1,
        heart: true,
        s: 0.25 + Math.random() * 0.35,
        rot: Math.random() * Math.PI * 2,
        vr: -0.1 + Math.random() * 0.2,
        c: "#ff6b9d",
        g: 0.06,
      });
    }
  }

  function fillHeart(x, y, scale, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(0, 4, -12, 0, -12, 10);
    ctx.bezierCurveTo(-12, 20, 0, 28, 0, 36);
    ctx.bezierCurveTo(0, 28, 12, 20, 12, 10);
    ctx.bezierCurveTo(12, 0, 0, 4, 0, 10);
    ctx.closePath();
    var g = ctx.createRadialGradient(0, 12, 0, 0, 14, 22);
    g.addColorStop(0, "#fff5f7");
    g.addColorStop(0.35, color);
    g.addColorStop(1, color);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  var t = 0;
  function tick() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);

    for (var si = 0; si < stars.length; si++) {
      var st = stars[si];
      var tw = 0.35 + Math.sin(t * st.sp + st.tw) * 0.65;
      ctx.fillStyle = "rgba(255,255,255," + (0.15 + tw * 0.55) + ")";
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var hi = hearts.length - 1; hi >= 0; hi--) {
      var h = hearts[hi];
      h.x += h.vx;
      h.y += h.vy;
      h.rot += h.vr;
      fillHeart(h.x, h.y, h.s * 18, h.rot, h.c, h.a);
      if (h.y < -60) hearts.splice(hi, 1);
    }

    for (var pi = petals.length - 1; pi >= 0; pi--) {
      var pe = petals[pi];
      pe.x += pe.vx + Math.sin(t + pi) * 0.15;
      pe.y += pe.vy;
      pe.rot += pe.vr;
      ctx.save();
      ctx.translate(pe.x, pe.y);
      ctx.rotate(pe.rot);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = pe.c;
      ctx.beginPath();
      ctx.ellipse(0, 0, pe.r, pe.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (pe.y > H + 30) petals.splice(pi, 1);
    }

    for (var ci = confetti.length - 1; ci >= 0; ci--) {
      var c = confetti[ci];
      c.x += c.vx;
      c.y += c.vy;
      c.rot += c.vr;
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha = 0.88;
      if (c.type === 0) {
        ctx.fillStyle = c.c;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      } else {
        ctx.strokeStyle = c.c;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-c.w, 0);
        ctx.lineTo(c.w, 0);
        ctx.stroke();
      }
      ctx.restore();
      if (c.y > H + 40) {
        c.y = -25;
        c.x = Math.random() * W;
      }
    }

    for (var bi = bursts.length - 1; bi >= 0; bi--) {
      var b = bursts[bi];
      b.x += b.vx;
      b.y += b.vy;
      b.vy += b.g;
      b.life -= 0.014;
      b.rot += b.vr;
      if (b.heart) {
        fillHeart(b.x, b.y, b.s * 18, b.rot, b.c, Math.max(0, b.life) * 0.9);
      } else {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = Math.max(0, b.life);
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      if (b.life <= 0) bursts.splice(bi, 1);
    }

    requestAnimationFrame(tick);
  }

  function onResize() {
    resize();
    initStars(W < 600 ? 55 : 95);
  }

  if (!reduce) {
    onResize();
    window.addEventListener("resize", onResize);

    spawnConfettiFall(W < 600 ? 42 : 72);
    setTimeout(function () {
      spawnConfettiFall(W < 600 ? 28 : 48);
    }, 1600);
    burstAt(W * 0.5, H * 0.28, W < 600 ? 55 : 85);

    setInterval(function () {
      if (Math.random() > 0.55) spawnHeart();
    }, 900);
    setInterval(function () {
      if (Math.random() > 0.4) spawnPetal();
    }, 500);

    setInterval(function () {
      burstAt(Math.random() * W * 0.7 + W * 0.15, Math.random() * H * 0.35 + H * 0.08, W < 600 ? 28 : 42);
    }, 5200);

    requestAnimationFrame(tick);

    document.addEventListener(
      "click",
      function (e) {
        if (e.target.closest && (e.target.closest("a") || e.target.closest(".no-fx-burst"))) return;
        burstAt(e.clientX, e.clientY, W < 600 ? 48 : 72);
      },
      { passive: true }
    );

    var par = document.getElementById("hero-parallax");
    var mqFine = window.matchMedia("(pointer: fine)");
    if (par && mqFine.matches) {
      document.addEventListener(
        "mousemove",
        function (e) {
          var cx = W / 2;
          var cy = H / 2;
          var dx = (e.clientX - cx) / cx;
          var dy = (e.clientY - cy) / cy;
          par.style.transform =
            "perspective(1000px) rotateY(" + (dx * 7).toFixed(2) + "deg) rotateX(" + (-dy * 5).toFixed(2) + "deg)";
        },
        { passive: true }
      );
    }
  } else {
    resize();
  }
})();
