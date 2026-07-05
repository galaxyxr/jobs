/* ============================================================
   个人名片 v2 — 完整交互
   - 点+环光标（环延迟跟随）
   - IntersectionObserver 卡片堆叠
   - 右侧导航 + topbar + hero 直线移动到左上角
   - 模态弹窗
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  //  光标 — 小圆点（跟手）+ 外环（0.08s lerp 延迟）
  // ============================================================
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (dot && ring && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // 点即时跟随
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    });

    // ring 用 lerp 平滑追
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // hover 可点击元素
    const interactive = document.querySelectorAll('a, button, .stack-card, .tl-item, .photo-item, .side-dot, [data-modal]');
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('hover');
        ring.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('hover');
        ring.classList.remove('hover');
      });
    });
  }

  // ========== 弹窗（支持照片左右滑动） ==========
  const modal     = document.getElementById('modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose= document.getElementById('modal-close');
  const modalBg   = modal ? modal.querySelector('.modal-bg') : null;

  const data = {
    'photo-1': { title:'摄影作品', type:'gallery', img:'assets/作品.jpg' },
    'photo-2': { title:'摄影作品', type:'gallery', img:'assets/作品2.jpg' },
    'photo-3': { title:'摄影作品', type:'gallery', img:'assets/作品3.jpg' },
    'photo-4': { title:'摄影作品', type:'gallery', img:'assets/作品4.jpg' },
    'photo-5': { title:'摄影作品', type:'gallery', img:'assets/作品5.jpg' }
  };

  const galleryKeys = ['photo-1', 'photo-2', 'photo-3', 'photo-4', 'photo-5'];
  let galleryRAF = null, galleryPaused = false;

  function openModal(k) {
    const d = data[k]; if (!d) return;

    if (d.type === 'gallery') {
      // 图片渲染两份，实现无缝无限循环
      const imgCards = galleryKeys.map(k => `<div class="carousel-card"><img src="${data[k].img}" alt=""></div>`).join('');
      modalBody.innerHTML = `
        <h3>📷 拍拍拍</h3>
        <div class="carousel-wrap" id="gallery-cw">
          <div class="carousel-track" id="gallery-track">
            ${imgCards}${imgCards}
          </div>
        </div>`;

      setTimeout(startInfiniteScroll, 200);
    } else {
      let h = `<h3>${d.title}</h3>${d.desc||''}`;
      if (d.type==='image' && d.img) h += `<img src="${d.img}" alt="${d.title}" loading="lazy">`;
      if (d.type==='video' && d.vid) {
        h += `<p style="margin-top:14px;font-weight:600;color:#E5E7EB;">🎬 ${d.vTitle||'视频介绍'}</p>
          <div class="modal-vid"><iframe src="${d.vid}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
      modalBody.innerHTML = h;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function startInfiniteScroll() {
    const track = document.getElementById('gallery-track');
    const wrap  = document.getElementById('gallery-cw');
    if (!track || !wrap) return;

    const speed = 1.2; // px per frame
    let offset = 0;

    stopInfiniteScroll();
    galleryPaused = false;

    function tick() {
      if (!galleryPaused) {
        offset -= speed;
        // 一份图片宽度走完后瞬移回 0（无缝循环）
        const singleSetW = track.scrollWidth / 2;
        if (offset <= -singleSetW) offset += singleSetW;
        track.style.transform = `translateX(${offset}px)`;
      }
      galleryRAF = requestAnimationFrame(tick);
    }
    galleryRAF = requestAnimationFrame(tick);

    wrap.addEventListener('mouseenter', () => { galleryPaused = true; });
    wrap.addEventListener('mouseleave', () => { galleryPaused = false; });
  }

  function stopInfiniteScroll() {
    if (galleryRAF) { cancelAnimationFrame(galleryRAF); galleryRAF = null; }
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    stopInfiniteScroll();
    setTimeout(()=>{ modalBody.innerHTML=''; }, 400);
  }

  modalClose.addEventListener('click', closeModal);
  modalBg.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key==='Escape' && modal.classList.contains('open')) closeModal(); });
  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.modal));
  });

  // 工作经历视频 — 直接新页面打开
  const workVideoBtn = document.getElementById('work-video-btn');
  if (workVideoBtn) {
    workVideoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open('https://weixin.qq.com/sph/AGZxpubAtZ', '_blank');
    });
  }

  // ========== 卡片堆叠动画 ==========
  const cards = document.querySelectorAll('.stack-card');
  if (cards.length > 0 && window.innerWidth > 768) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio < 0.4) {
          entry.target.style.transform = 'scale(0.95)';
          entry.target.style.opacity = '0.5';
        } else {
          entry.target.style.transform = 'scale(1)';
          entry.target.style.opacity = '1';
        }
      });
    }, { threshold: 0.4 });
    cards.forEach(card => obs.observe(card));
  }

  // ============================================================
  //  Hero → 左上角直线移动动画
  //  核心：计算 hero 头像和 topbar 头像的屏幕坐标差，
  //  用 scroll 进度驱动 hero 头像的 transform translate
  // ============================================================
  const topbar     = document.getElementById('topbar');
  const heroAvatar = document.getElementById('hero-avatar');
  const heroHi     = document.getElementById('hero-hi');
  const heroDesc   = document.getElementById('hero-desc');
  const heroQuote   = document.getElementById('hero-quote');
  const heroBtns    = document.getElementById('hero-btns');
  const scrollHint  = document.getElementById('scroll-hint');
  const heroBubbles = document.getElementById('hero-bubbles');
  const heroEl     = document.getElementById('hero');

  // 头像移动 delta：直接从屏幕坐标计算，不依赖 DOM 加载时序
  function getHeroDelta() {
    const heroR = heroAvatar.getBoundingClientRect();
    // 目标位置：页面左边 24px，页面上方 14px（与 topbar 内边距对齐）
    const targetX = 24 + 17;  // left padding + half of 34px avatar
    const targetY = 14 + 17;  // top padding + half of 34px avatar
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // hero 头像中心在视口中的位置
    const heroCX = heroR.left + heroR.width / 2;
    const heroCY = heroR.top  + heroR.height / 2;
    // 需要移动的距离
    const dx = targetX - heroCX;
    const dy = targetY - heroCY;
    const targetScale = 34 / Math.max(heroR.width, 1); // 34px / 130px ≈ 0.26
    return { x: dx, y: dy, scale: targetScale };
  }

  let heroDelta = { x: 0, y: 0, scale: 0.26 };

  function updateHero() {
    if (!heroEl) return;
    const heroH = heroEl.offsetHeight;
    const sy = window.scrollY;
    const raw = Math.max(0, Math.min(1, sy / heroH));
    const eased = 1 - Math.pow(1 - raw, 3);

    if (heroHi)     { heroHi.style.opacity     = 1 - eased * 0.9; heroHi.style.transform     = `translateY(${-eased * 20}px)`; }
    if (heroDesc)   { heroDesc.style.opacity   = 1 - eased * 0.95; heroDesc.style.transform  = `translateY(${-eased * 16}px)`; }
    if (heroQuote)  { heroQuote.style.opacity  = 1 - eased * 0.95; heroQuote.style.transform = `translateY(${-eased * 12}px)`; }
    if (heroBtns)    { heroBtns.style.opacity    = 1 - eased * 0.95; heroBtns.style.transform  = `translateY(${-eased * 12}px)`; }
    if (heroBubbles) { heroBubbles.style.opacity = 1 - eased * 0.95; /* transform 由 open/close 控制 */ }
    if (scrollHint)  { scrollHint.style.opacity  = 1 - raw * 3; }

    // 首次滚动时动态计算 delta
    if (sy > 5) heroDelta = getHeroDelta();

    // 头像：直线移动 + 逐渐淡化
    if (heroAvatar) {
      const d = heroDelta;
      heroAvatar.style.transform =
        `translate(${eased * d.x}px, ${eased * d.y}px) scale(${1 - eased * (1 - d.scale)})`;
      heroAvatar.style.opacity = Math.max(0, 1 - eased * 0.85);
    }
    // 头像侧按钮跟随淡出
    document.querySelectorAll('.bubble-toggle, .avatar-hint-btn').forEach(el => {
      el.style.opacity = Math.max(0, 1 - eased * 0.85);
    });

    if (topbar) {
      if (eased > 0.6) topbar.classList.add('visible');
      else topbar.classList.remove('visible');
    }
  }

  // ========== 导航高亮 + 精准跳转 ==========
  const sideDots = document.querySelectorAll('.side-dot');
  let currentActive = 'hero';

  // 计算精准滚动位置：每张卡片占 55vh + 32px margin
  function cardScrollPos(id) {
    const heroH = document.getElementById('hero').offsetHeight;
    const cardSlot = window.innerHeight * 0.55 + 32; // 55vh card + 2rem margin
    const secPad = 80; // cards-section padding-top
    const map = { campus: 0, work: 1, life: 2 };
    if (id === 'hero') return 0;
    if (id === 'contact') return heroH + secPad + cardSlot * 3;
    return heroH + secPad + cardSlot * map[id] + 10;
  }

  function updateNav() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const thresholds = {
      hero: cardScrollPos('hero') + vh * 0.2,
      campus: cardScrollPos('campus') + vh * 0.2,
      work: cardScrollPos('work') + vh * 0.2,
      life: cardScrollPos('life') + vh * 0.2,
      contact: cardScrollPos('contact') + vh * 0.2,
    };
    const order = ['contact','life','work','campus','hero'];
    let active = 'hero';
    for (const id of order) {
      if (sy >= thresholds[id] - vh * 0.5) { active = id; break; }
    }
    if (active !== currentActive) {
      currentActive = active;
      sideDots.forEach(d => d.classList.toggle('active', d.dataset.section === active));
    }
  }

  sideDots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const id = dot.dataset.section;
      const target = cardScrollPos(id);
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  });

  // ========== 滚动合体 ==========
  let tick = false;
  window.addEventListener('scroll', () => {
    if (!tick) {
      requestAnimationFrame(() => { updateHero(); updateNav(); tick = false; });
      tick = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateHero);
  updateHero();
  updateNav();

  // ========== 气泡展开/收起（从🏷️按钮处 burst 到右侧） ==========
  const bubbleToggle = document.getElementById('bubble-toggle');
  const bubblesWrap  = document.getElementById('hero-bubbles');
  if (bubbleToggle && bubblesWrap) {
    bubbleToggle.addEventListener('click', () => {
      const btnRect = bubbleToggle.getBoundingClientRect();
      const wrapRect = bubblesWrap.getBoundingClientRect();
      // 原点在 toggle 按钮中心相对于气泡容器
      const ox = btnRect.left + btnRect.width/2 - wrapRect.left;
      const oy = btnRect.top + btnRect.height/2 - wrapRect.top;
      bubblesWrap.style.transformOrigin = `${ox}px ${oy}px`;

      const open = bubblesWrap.classList.toggle('open');
      bubbleToggle.classList.toggle('active', open);
      bubbleToggle.textContent = open ? '✕' : '🏷️';
    });
    // 初始计算一次原点
    setTimeout(() => {
      const btnRect = bubbleToggle.getBoundingClientRect();
      const wrapRect = bubblesWrap.getBoundingClientRect();
      const ox = btnRect.left + btnRect.width/2 - wrapRect.left;
      const oy = btnRect.top + btnRect.height/2 - wrapRect.top;
      bubblesWrap.style.transformOrigin = `${ox}px ${oy}px`;
    }, 200);
  }

  // ========== 气泡投票（+1 / −1 双按钮） ==========
  document.querySelectorAll('.bubble').forEach(b => {
    const id = b.dataset.id;
    const plusBtn = b.querySelector('.bubble-vote b');
    const minusBtn = b.querySelector('.bubble-vote i');
    if (!plusBtn || !minusBtn) return;

    const saved = parseInt(localStorage.getItem('vote_' + id)) || 0;
    b.dataset.count = (parseInt(b.dataset.count) || 0) + saved;

    function applyVote(delta) {
      const cur = parseInt(b.dataset.count) || 0;
      const sv  = parseInt(localStorage.getItem('vote_' + id)) || 0;
      const newSv = sv + delta;
      b.dataset.count = Math.max(0, cur + delta);
      if (newSv === 0) localStorage.removeItem('vote_' + id);
      else localStorage.setItem('vote_' + id, newSv);
    }

    plusBtn.addEventListener('click', e => { e.stopPropagation(); applyVote(1); });
    minusBtn.addEventListener('click', e => { e.stopPropagation(); applyVote(-1); });
  });

  // ========== 全局 ==========
  window.jump = id => {
    const target = cardScrollPos(id);
    window.scrollTo({ top: target, behavior: 'smooth' });
  };
  window.openResume = () => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
});
