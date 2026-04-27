(function () {
  var body = document.body;
  if (!body) return;

  // 三帧后再进入，确保所有资源加载完成
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        // 先添加预加载类，触发初始动画
        body.classList.add("is-preloading");
        
        // 短暂延迟后添加加载完成类，触发主动画
        setTimeout(function() {
          body.classList.add("is-loaded");
        }, 300);
      });
    });
  });

  // 倒计时功能
  function startCountdown() {
    // 设置生日日期（修改为实际生日）
    var birthday = new Date(2026, 11, 25, 0, 0, 0); // 年, 月(0-11), 日, 时, 分, 秒
    
    var daysElement = document.getElementById('days');
    var hoursElement = document.getElementById('hours');
    var minutesElement = document.getElementById('minutes');
    var secondsElement = document.getElementById('seconds');
    
    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;
    
    function updateCountdown() {
      var now = new Date();
      var timeLeft = birthday - now;
      
      if (timeLeft <= 0) {
        daysElement.textContent = '00';
        hoursElement.textContent = '00';
        minutesElement.textContent = '00';
        secondsElement.textContent = '00';
        document.querySelector('.countdown-label').textContent = '生日快乐！';
        return;
      }
      
      var days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      daysElement.textContent = days.toString().padStart(2, '0');
      hoursElement.textContent = hours.toString().padStart(2, '0');
      minutesElement.textContent = minutes.toString().padStart(2, '0');
      secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  
  // 启动倒计时
  startCountdown();

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

