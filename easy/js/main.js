/* ============================================================
   个人名片网站 — 交互脚本
   Hero→左上角缩小动画 · 卡片堆叠覆盖 · 导航跳转 · 弹窗
   ============================================================ */

// ---------- DOM 引用 ----------
const modal         = document.getElementById('modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');
const navDots       = document.querySelectorAll('.nav-dot');
const topBar        = document.getElementById('top-bar');

// Hero 元素（参与缩小动画）
const heroAvatar    = document.getElementById('hero-avatar');
const heroGreeting  = document.getElementById('hero-greeting');
const heroTagline   = document.getElementById('hero-tagline');
const heroSubtitle  = document.getElementById('hero-subtitle');
const heroCta       = document.getElementById('hero-cta');
const scrollHint    = document.querySelector('.scroll-hint');

// ========== 弹窗数据 ==========
const modalData = {
  'cert-1': {
    title: '录取通知书',
    type: 'image',
    desc: '<p>2020年9月，收到<strong>XX大学</strong>计算机科学与技术专业的录取通知书，开启了四年的大学生涯。</p><p>高考成绩：650分（省排名前5%）</p>',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=500&fit=crop'
  },
  'cert-2': {
    title: '全国大学生数学建模竞赛 · 省级一等奖',
    type: 'image',
    desc: '<p>2021年6月参加<strong>全国大学生数学建模竞赛</strong>，担任团队队长，负责模型构建与算法实现。</p><p>赛题：无人机路径规划优化<br>使用算法：遗传算法 + 模拟退火<br>最终获得省级一等奖。</p>',
    image: 'https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?w=800&h=500&fit=crop'
  },
  'cert-3': {
    title: '交换生成绩单',
    type: 'image',
    desc: '<p>2022年秋季学期，赴<strong>新加坡国立大学(NUS)</strong>进行为期一学期的交换学习。</p><p>修读课程：<br>· CS2103 软件工程 — A<br>· CS3240 人机交互 — A-<br>· ST2334 概率统计 — A</p>',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop'
  },
  'cert-4': {
    title: '学士学位证书',
    type: 'image',
    desc: '<p>2024年6月毕业于<strong>XX大学</strong>计算机科学与技术专业，获工学学士学位。</p><p>GPA：3.8/4.0<br>荣誉：优秀毕业生（Top 5%）<br>毕业论文：基于深度学习的Web无障碍检测工具（优秀论文）</p>',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90910e683?w=800&h=500&fit=crop'
  },
  'work-1': {
    title: '字节跳动 · 前端开发实习生',
    type: 'video',
    desc: '<p>2023年7月至12月，在<strong>字节跳动</strong>TikTok电商团队担任前端开发实习生。</p><p>· 参与商家后台核心模块开发，使用React + TypeScript<br>· 优化首屏加载性能，LCP 从 2.8s 降至 1.2s<br>· 独立负责订单管理模块的组件库搭建</p>',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoTitle: '字节跳动公司介绍'
  },
  'work-2': {
    title: '阿里巴巴 · 前端开发工程师',
    type: 'video',
    desc: '<p>2024年3月至今，就职于<strong>阿里巴巴</strong>淘宝事业部，担任前端开发工程师。</p><p>· 负责淘宝直播H5端消费链路开发（Next.js + Node.js）<br>· 主导微前端架构迁移，拆分3个巨型模块<br>· 设计并落地组件智能化测试方案，覆盖率提升至92%</p>',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoTitle: '淘宝技术介绍'
  },
  'photo-1': {
    title: '川西 · 贡嘎雪山',
    type: 'image',
    desc: '<p>2022年10月摄于川西高原。凌晨4点出发，在海拔4500米的子梅垭口等待日出。当第一缕阳光照在贡嘎主峰上，所有的寒冷和疲惫都值得了。</p><p>器材：Sony A7M4 + FE 70-200mm f/2.8 GM II</p>',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop'
  },
  'photo-2': {
    title: '西藏 · 纳木错星空',
    type: 'image',
    desc: '<p>2023年8月摄于西藏纳木错湖畔。海拔4718米，零下5度的夜晚，抬头就是银河横跨天际。</p><p>器材：Sony A7M4 + FE 14mm f/1.8 GM</p>',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop'
  },
  'photo-3': {
    title: '上海 · 外滩夜景',
    type: 'image',
    desc: '<p>2024年春节摄于上海外滩。一边是百年万国建筑群，一边是陆家嘴摩天大楼。</p><p>器材：Sony A7M4 + FE 24-70mm f/2.8 GM II</p>',
    image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&h=800&fit=crop'
  }
};

// ========== 弹窗逻辑 ==========
function openModal(key) {
  const data = modalData[key];
  if (!data) return;
  let html = `<h3>${data.title}</h3>`;
  if (data.desc) html += data.desc;
  if (data.type === 'image' && data.image) {
    html += `<img src="${data.image}" alt="${data.title}" loading="lazy">`;
  }
  if (data.type === 'video' && data.videoUrl) {
    html += `<p style="margin-top:16px;font-weight:600;">🎬 ${data.videoTitle || '视频介绍'}</p>
      <div class="modal-video-wrapper">
        <iframe src="${data.videoUrl}" title="${data.videoTitle || ''}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>`;
  }
  modalBody.innerHTML = html;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modalBody.innerHTML = ''; }, 350);
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});

document.querySelectorAll('.timeline-item[data-modal]').forEach(item => {
  item.addEventListener('click', () => openModal(item.dataset.modal));
});
document.querySelectorAll('.photo-card[data-modal]').forEach(card => {
  card.addEventListener('click', () => openModal(card.dataset.modal));
});

// ============================================================
//  Hero → 左上角缩小动画（scroll-driven）
//  0% (顶部) → 大居中头像
//  100% (hero 底部) → 头像缩小移到左上角，内容淡出，top-bar 淡入
// ============================================================

function updateHeroTransition() {
  const scrollY  = window.scrollY;
  const heroEl   = document.getElementById('hero');
  const heroH    = heroEl ? heroEl.offsetHeight : window.innerHeight;

  // 进度：0 = 在 hero 顶部，1 = hero 完全滚出
  const progress = Math.max(0, Math.min(1, scrollY / heroH));

  // Ease-out 让开头变化快，结尾变化慢（自然感）
  const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

  if (heroAvatar) {
    // 头像：从 150px 缩小，从居中偏移到左上角
    const scale = 1 - eased * 0.78;  // 1 → 0.22（最终约 33px）
    const opacity = 1 - eased * 0.85;

    heroAvatar.style.transform = `scale(${scale})`;
    heroAvatar.style.opacity = opacity;
  }

  if (heroGreeting) {
    heroGreeting.style.opacity = 1 - eased * 0.9;
    heroGreeting.style.transform = `translateY(${-eased * 20}px)`;
  }

  if (heroTagline) {
    heroTagline.style.opacity = 1 - eased * 0.95;
    heroTagline.style.transform = `translateY(${-eased * 16}px)`;
  }

  if (heroSubtitle) {
    heroSubtitle.style.opacity = 1 - eased * 0.95;
    heroSubtitle.style.transform = `translateY(${-eased * 12}px)`;
  }

  if (heroCta) {
    heroCta.style.opacity = 1 - eased * 0.95;
    heroCta.style.transform = `translateY(${-eased * 12}px)`;
  }

  if (scrollHint) {
    scrollHint.style.opacity = 1 - progress * 3; // 更快消失
  }

  // Top bar 显示
  if (topBar) {
    // 进度超过 30% 时 top-bar 开始出现
    const barProgress = Math.max(0, Math.min(1, (progress - 0.3) / 0.5));
    if (barProgress > 0) {
      topBar.classList.add('visible');
    } else {
      topBar.classList.remove('visible');
    }
  }
}

// ============================================================
//  卡片堆叠滚动 — 导航联动
// ============================================================

function getSectionPositions() {
  const hero = document.getElementById('hero');
  const heroH = hero ? hero.offsetHeight : window.innerHeight;
  const cardH = window.innerHeight * 0.7; // 卡片 70vh
  const stagePadding = 40;

  return {
    hero:    0,
    campus:  heroH + stagePadding,
    work:    heroH + stagePadding + cardH,
    life:    heroH + stagePadding + cardH * 2,
    contact: heroH + stagePadding + cardH * 3
  };
}

// peek 条点击 → 跳转到对应卡片
document.querySelectorAll('.card-peek').forEach(peek => {
  peek.addEventListener('click', (e) => {
    e.stopPropagation();
    const card = peek.closest('.stack-card');
    if (!card) return;
    const pos = getSectionPositions();
    const id = card.id;
    const scrollTarget = pos[id] !== undefined ? pos[id] : 0;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  });
});

// 导航圆点点击 → 精确滚动
navDots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    e.preventDefault();
    const target = dot.dataset.section;
    const pos = getSectionPositions();
    const scrollTarget = pos[target] !== undefined ? pos[target] : 0;
    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  });
});

let currentActive = 'hero';
let ticking = false;

function onScroll() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  const heroEl = document.getElementById('hero');
  const heroH = heroEl ? heroEl.offsetHeight : vh;

  // ====== 1. Hero → Top-bar 动画 ======
  updateHeroTransition();

  // ====== 2. 导航高亮 ======
  const cardH = vh * 0.7;
  const campusStart  = heroH + 40;
  const workStart    = heroH + 40 + cardH;
  const lifeStart    = heroH + 40 + cardH * 2;
  const contactStart = heroH + 40 + cardH * 3;

  let activeId;
  if (scrollY < campusStart) {
    activeId = 'hero';
  } else if (scrollY < workStart - vh * 0.6) {
    activeId = 'campus';
  } else if (scrollY < lifeStart - vh * 0.6) {
    activeId = 'work';
  } else if (scrollY < contactStart - vh * 0.3) {
    activeId = 'life';
  } else {
    activeId = 'contact';
  }

  if (activeId !== currentActive) {
    currentActive = activeId;
    navDots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === activeId);
    });
  }

  // ====== 3. 卡片覆盖状态（阴影变化） ======
  const workProgress = clamp((scrollY - (workStart - cardH)) / cardH, 0, 1);
  const lifeProgress = clamp((scrollY - (lifeStart - cardH)) / cardH, 0, 1);
  const campusCard = document.getElementById('campus');
  const workCard   = document.getElementById('work');
  const lifeCard   = document.getElementById('life');
  if (campusCard) campusCard.classList.toggle('covered', workProgress > 0.5);
  if (workCard)   workCard.classList.toggle('covered', lifeProgress > 0.5);
  if (lifeCard)   lifeCard.classList.toggle('covered', false);
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => { onScroll(); ticking = false; });
    ticking = true;
  }
}, { passive: true });

onScroll();

// 窗口大小变化时重算
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(onScroll, 100);
});

// ========== 公开函数 ==========
function scrollToSection(id) {
  const pos = getSectionPositions();
  window.scrollTo({ top: pos[id] || 0, behavior: 'smooth' });
}

function downloadResume() {
  alert('📄 Demo 模式：此处将触发简历 PDF 下载\n\n实际使用时替换为你的简历文件路径即可。');
}

// ========== 时间轴淡入 ==========
const tlObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateX(0)';
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.timeline-item').forEach((item, i) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-16px)';
  item.style.transition = `all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.08}s`;
  tlObserver.observe(item);
});
