// 获取容器元素
const container = document.getElementById('web_bg');

// 数字粒子类（粒子CSS将通过JS动态生成）
const particleClass = 'particle';

// 设置滚动数字的范围和粒子数量
const numParticles = 400; // 粒子数量
const scrollDuration = 100; // 每个粒子滚动的时间，单位秒
const specialNumbers = ['0725','1023','0324','0105','2024','2023']; // 特别的数字，可以根据需要调整

// 创建粒子并将其添加到容器中
for (let i = 0; i < numParticles; i++) {
  // 创建粒子元素
  const particle = document.createElement('div');
  particle.classList.add(particleClass);
  const isSpecial = Math.random() < 0.02; 
  const particleNumber = isSpecial ? specialNumbers[Math.floor(Math.random() * specialNumbers.length)] :".";
  particle.textContent = particleNumber;
  
  // 添加到容器中
  container.appendChild(particle);
}

// 动态添加CSS样式
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  #web_bg {
    position: fixed
    z-index: -999
    width: 100%
    height: 100%
    background-attachment: local
    background-position: center
    background-size: cover
    background-repeat: no-repeat
  }
  .${particleClass} {
    position: absolute;
    font-size: 10px;
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    color: #ADD8E6;
    opacity: 1;
    animation: scrollAnimation ${scrollDuration}s linear infinite;
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  @keyframes scrollAnimation {
    0% {
      transform: translate(0, 0);
      opacity: 0.5;
      }
    50%{
      transform: translate(${1.1 * window.innerWidth}px, calc(${window.innerHeight*0.4}px*sin(2*var(--random))));
      opacity: 1;
    }
    100% {
      transform: translate(${2.2*window.innerWidth}px, calc(${window.innerHeight*0.4}px*sin(5*var(--random))));
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);

// 设置每个粒子的初始位置和动画延时，确保滚动效果错落有致
const particles = document.querySelectorAll(`.${particleClass}`);
particles.forEach((particle, index) => {
  // const delay = Math.random() * 2; // 随机延时，让粒子滚动时间不同
  // particle.style.animationDelay = `${delay}s`;
  
  // 设置随机的位置（可以调整粒子的初始垂直位置）
  const random = Math.random() * 2 - 1;
  const randomLeft = Math.random() * 200-100;
  const randomTop = Math.random() * 100;
  particle.style.left = `${randomLeft}%`;
  particle.style.top = `${randomTop}%`;
  particle.style.fontSize= `${Math.random()*20}px`
  particle.style.setProperty('--random', random);
});
function checkPosition() {
  particles.forEach((particle, index) => { 
    // const delay = Math.random() * 2; // 随机延时，让粒子滚动时间不同
    // particle.style.animationDelay = `${delay}s`;  
    if (particle.getBoundingClientRect().top>window.innerHeight||particle.getBoundingClientRect().left>window.innerWidth) {
      // 粒子超出可视区域，则重新设置位置
      console.log("超出可视区域");
      const isSpecial = Math.random() < 0.02; 
      const particleNumber = isSpecial ? specialNumbers[Math.floor(Math.random() * specialNumbers.length)] :".";
      particle.textContent = particleNumber;
      particle.style.animation = "none";
      particle.style.left = `${-1*Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`; 
      particle.style.fontSize= `${Math.random()*20}px`
      particle.style.setProperty('--random', Math.random() * 2 - 1);
      void particle.offsetWidth; // 触发重绘，重新设置位置
      particle.style.animation = `scrollAnimation ${scrollDuration}s linear infinite`;
    }
  });
  requestAnimationFrame(checkPosition);
}

// function stopAnimation() {
//   particles.forEach((particle, index) => { 
//     particle.style.animationPlayState = "paused";
//   });
// }

// function startAnimation() {
//   particles.forEach((particle, index) => { 
//     particle.style.animationPlayState = "running";
//   });
// }
requestAnimationFrame(checkPosition);

// document.addEventListener('visibilitychange', function() {
//   if (document.hidden) {
//     stopAnimation();
//   } else {
//     startAnimation();
//   }
// });


