/* Vybog Services — main.js (lightweight, no framework) */
(function () {
  'use strict';

  // ---- Header scroll state + body.scrolled (compact header / hide utility bar) ----
  const header = document.querySelector('.site-header');
  const SCROLL_COMPACT = 60;
  const onHeaderScroll = () => {
    const compact = window.scrollY > SCROLL_COMPACT;
    document.body.classList.toggle('scrolled', compact);
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  };
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  // ---- Floating CTA visibility ----
  const fcta = document.querySelector('.floating-cta');
  if (fcta) {
    const FCTA_SHOW = 480;
    const onFctaScroll = () => fcta.classList.toggle('visible', window.scrollY > FCTA_SHOW);
    onFctaScroll();
    window.addEventListener('scroll', onFctaScroll, { passive: true });
  }

  // ---- Page-tabs scroll-spy (sticky sub-nav on service pages) ----
  const pageTabs = document.querySelectorAll('.page-tabs .tab');
  if (pageTabs.length) {
    const tabSections = Array.from(pageTabs).map((t) => {
      const href = t.getAttribute('href') || '';
      return href.startsWith('#') ? document.querySelector(href) : null;
    });
    const onTabScroll = () => {
      const offset = 220;
      let activeIdx = 0;
      for (let i = 0; i < tabSections.length; i++) {
        const s = tabSections[i];
        if (s && s.getBoundingClientRect().top - offset <= 0) activeIdx = i;
      }
      pageTabs.forEach((t, i) => t.classList.toggle('active', i === activeIdx));
    };
    onTabScroll();
    window.addEventListener('scroll', onTabScroll, { passive: true });
  }

  // ---- Mobile drawer ----
  const toggle = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-backdrop');
  const closeBtn = document.querySelector('.drawer-close');
  const openDrawer = () => { drawer && drawer.classList.add('open'); backdrop && backdrop.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeDrawer = () => { drawer && drawer.classList.remove('open'); backdrop && backdrop.classList.remove('open'); document.body.style.overflow = ''; };
  toggle && toggle.addEventListener('click', openDrawer);
  closeBtn && closeBtn.addEventListener('click', closeDrawer);
  backdrop && backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  // ---- Mega-menu click for touch ----
  document.querySelectorAll('.nav-item').forEach((item) => {
    const trigger = item.querySelector('.nav-link');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 1080) return;
      if (!item.querySelector('.mega-menu')) return;
      e.preventDefault();
      document.querySelectorAll('.nav-item.open').forEach((n) => { if (n !== item) n.classList.remove('open'); });
      item.classList.toggle('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-item.open').forEach((n) => n.classList.remove('open'));
    }
  });

  // ---- Tab panels ----
  document.querySelectorAll('.tabs').forEach((tabRoot) => {
    const buttons = tabRoot.querySelectorAll('.tab-btn');
    const panels = tabRoot.querySelectorAll('.tab-panel');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        panels.forEach((p) => p.classList.toggle('active', p.getAttribute('data-panel') === target));
      });
    });
  });

  // ---- Fade-up on scroll ----
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('in-view'));
  }

  // ---- Counter animation ----
  if ('IntersectionObserver' in window) {
    const counters = document.querySelectorAll('[data-counter]');
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseFloat(el.getAttribute('data-counter')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const dur = 1400;
        const start = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = end * eased;
          el.textContent = prefix + (end % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => co.observe(c));
  }

  // ---- Smooth-scroll anchor offset ----
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: y, behavior: 'smooth' });
      closeDrawer();
    });
  });

  // ---- Form: client-side guard only (replace endpoint server-side later) ----
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const data = new FormData(form);
      const email = (data.get('email') || '').toString().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (status) { status.textContent = 'Please enter a valid email address.'; status.style.color = '#b00020'; }
        return;
      }
      if (status) { status.textContent = 'Thanks — we will reach out within 1 business day.'; status.style.color = 'var(--success)'; }
      form.reset();
    });
  });
})();

// ---- Hire Talent mega menu: category pane switcher ----
(function () {
  document.querySelectorAll('.mega-menu.mega-tabbed').forEach((menu) => {
    const cats = menu.querySelectorAll('.mega-cat[data-target]');
    const panes = menu.querySelectorAll('.mega-pane[data-pane]');
    if (!cats.length || !panes.length) return;
    const setActive = (target) => {
      cats.forEach((c) => c.classList.toggle('active', c.getAttribute('data-target') === target));
      panes.forEach((p) => p.classList.toggle('active', p.getAttribute('data-pane') === target));
    };
    cats.forEach((c) => {
      c.addEventListener('mouseenter', () => setActive(c.getAttribute('data-target')));
      c.addEventListener('focus', () => setActive(c.getAttribute('data-target')));
    });
  });
})();
