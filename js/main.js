/**
 * LIMPIEZAS VALLES SOLUTIONS — main.js
 * Navigation · Mobile menu · Scroll animations · Scroll-to-top
 */

'use strict';

/* ============================================================
   NAVIGATION: transparent → solid on scroll
   ============================================================ */
const nav = document.getElementById('main-nav');
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');

function updateNav() {
  if (!nav) return;
  // Nav is always solid/frosted — logo is dark and needs white background
  if (window.scrollY > 60) {
    nav.classList.add('nav--solid');
    nav.classList.remove('nav--transparent');
  } else {
    nav.classList.add('nav--transparent');
    nav.classList.remove('nav--solid');
  }
}

// Run on load
updateNav();
window.addEventListener('scroll', updateNav, { passive: true });

/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
if (navToggle && navMobile) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('is-open');
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navMobile.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      navMobile.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navMobile.classList.contains('is-open')) {
      navMobile.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================================
   ACTIVE NAV LINK (highlight current page)
   ============================================================ */
function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
  });
}
setActiveNavLink();

/* ============================================================
   SCROLL ANIMATIONS — Intersection Observer
   ============================================================ */
function initScrollAnimations() {
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (!animatedEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  animatedEls.forEach(el => observer.observe(el));
}

/* ============================================================
   SCROLL-TO-TOP BUTTON
   ============================================================ */
function initScrollToTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'), 10) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   HERO PARALLAX (subtle, on desktop only)
   ============================================================ */
function initParallax() {
  const heroBg = document.querySelector('.hero__bg img');
  if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
  }, { passive: true });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initScrollToTop();
  initSmoothScroll();
  initParallax();
});
