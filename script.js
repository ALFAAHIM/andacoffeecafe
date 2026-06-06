/* =====================================================
   ...AND A COFFEE – RESTO CAFÉ
   Main JavaScript
   ===================================================== */
'use strict';

/* ==============================
   NAVBAR – scroll & mobile menu
   ============================== */
const navbar     = document.getElementById('navbar');
const navBurger  = document.getElementById('navBurger');
const navLinks   = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

let menuOpen = false;

function openMenu() {
  menuOpen = true;
  navBurger.classList.add('open');
  navLinks.classList.add('open');
  navOverlay.classList.add('show');
  navBurger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menuOpen = false;
  navBurger.classList.remove('open');
  navLinks.classList.remove('open');
  navOverlay.classList.remove('show');
  navBurger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

navBurger.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
navOverlay.addEventListener('click', closeMenu);

// Close menu when a nav link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => { if (menuOpen) closeMenu(); });
});

// Navbar scroll state
const handleScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightActiveLink();
};
window.addEventListener('scroll', handleScroll, { passive: true });

// Active link highlighting
function highlightActiveLink() {
  const scrollY = window.scrollY + navbar.offsetHeight + 20;
  document.querySelectorAll('section[id]').forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    link.classList.toggle('active', scrollY >= top && scrollY < bottom);
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ==============================
   SCROLL REVEAL
   ============================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ==============================
   MENU TABS
   ============================== */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(`tab-${target}`).classList.add('active');

    // Scroll active tab into center view on mobile
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
});

// Swipe support for tabs on mobile
(function () {
  const tabRow = document.querySelector('.menu-tabs');
  if (!tabRow) return;
  let startX = 0;

  tabRow.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  tabRow.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) < 50) return;
    const btns  = [...document.querySelectorAll('.tab-btn')];
    const cur   = btns.findIndex(b => b.classList.contains('active'));
    const next  = diff > 0 ? Math.min(cur + 1, btns.length - 1) : Math.max(cur - 1, 0);
    if (next !== cur) btns[next].click();
  }, { passive: true });
})();

/* ==============================
   GALLERY LIGHTBOX
   ============================== */
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
const lbBackdrop = document.getElementById('lbBackdrop');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const galleryItems = [...document.querySelectorAll('.g-item')];

let currentIdx = 0;

function openLightbox(idx) {
  currentIdx = idx;
  const img = galleryItems[idx].querySelector('img');
  if (!img) return;
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lbImg.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lbImg.src = ''; }, 300);
}

function shiftLightbox(dir) {
  currentIdx = (currentIdx + dir + galleryItems.length) % galleryItems.length;
  const img = galleryItems[currentIdx].querySelector('img');
  if (!img) return;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbImg.style.opacity = '1';
  }, 150);
}

galleryItems.forEach((item, idx) => {
  item.addEventListener('click', () => openLightbox(idx));
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); } });
});

lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); shiftLightbox(-1); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); shiftLightbox(1); });

// Keyboard & swipe for lightbox
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  shiftLightbox(-1);
  if (e.key === 'ArrowRight') shiftLightbox(1);
});

(function () {
  let startX = 0;
  lbImg.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
  lbImg.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) shiftLightbox(diff > 0 ? 1 : -1);
  }, { passive: true });
})();

/* ==============================
   MENU ITEM HOVER MICRO-ANIMATION
   ============================== */
document.querySelectorAll('.menu-row').forEach(row => {
  row.style.transition = 'padding-left 0.22s ease';
});

/* ==============================
   FLOATING WA – show after scroll
   ============================== */
const floatWa = document.getElementById('float-whatsapp');
if (floatWa) {
  // Initially hidden below fold, appear after first scroll
  floatWa.style.opacity = '0';
  floatWa.style.transform = 'translateY(8px)';
  floatWa.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.3s ease';

  const showWa = () => {
    if (window.scrollY > 300) {
      floatWa.style.opacity = '1';
      floatWa.style.transform = 'translateY(0)';
    } else {
      floatWa.style.opacity = '0';
      floatWa.style.transform = 'translateY(8px)';
    }
  };
  window.addEventListener('scroll', showWa, { passive: true });
}

/* ==============================
   INIT
   ============================== */
handleScroll();
