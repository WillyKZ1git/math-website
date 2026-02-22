/* ============================================================
   MathCoach — Script principal
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. NAVBAR : ombre au scroll + menu mobile
  ---------------------------------------------------------- */
  const navbar      = document.getElementById('navbar');
  const menuToggle  = document.getElementById('menu-toggle');
  const navLinks    = document.getElementById('nav-links');

  // Ombre au scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  // Menu hamburger
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Fermer le menu en cliquant sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      });
    });

    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      }
    });
  }

  /* ----------------------------------------------------------
     2. HERO STATS : animation compteur
  ---------------------------------------------------------- */
  function animateCounter(el) {
    const target  = el.textContent.trim();
    const isPlus  = target.endsWith('+');
    const isPct   = target.endsWith('%');
    const num     = parseInt(target.replace(/[^0-9]/g, ''), 10);
    const suffix  = isPlus ? '+' : isPct ? '%' : '';
    const duration = 1400;
    const start   = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing : ease-out cubique
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * num);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  // Déclencher quand la section hero est visible
  const heroStats = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        heroStats.forEach(el => animateCounter(el));
      }
    });
  }, { threshold: 0.5 });

  const heroSection = document.querySelector('.hero-stats');
  if (heroSection) statsObserver.observe(heroSection);

  /* ----------------------------------------------------------
     3. SCROLL REVEAL : apparition des éléments
  ---------------------------------------------------------- */
  // Ajouter la classe .reveal aux éléments cibles
  const revealSelectors = [
    '.feature-card',
    '.level-card',
    '.level-col',
    '.step-card',
    '.testimonial-card',
    '.section-header',
    '.cta-box',
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Délais en cascade (max 5 items)
      const delay = Math.min(i, 4) + 1;
      el.classList.add(`reveal-delay-${delay}`);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ----------------------------------------------------------
     4. SMOOTH SCROLL pour les liens d'ancre
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     5. CARTE HERO : animation de la barre de progression
  ---------------------------------------------------------- */
  // Déclencher la barre après le chargement pour l'effet de "remplissage"
  window.addEventListener('load', () => {
    const progressBar = document.querySelector('.card-1 .progress-bar');
    if (progressBar) {
      // Reset puis ré-animer
      const targetWidth = progressBar.style.width;
      progressBar.style.width = '0%';
      setTimeout(() => {
        progressBar.style.width = targetWidth;
      }, 600);
    }
  });

  /* ----------------------------------------------------------
     6. BARRE DE PROGRESSION DU GRAPHE HERO
  ---------------------------------------------------------- */
  // Animer les barres du mini graphe
  function animateBars() {
    const bars = document.querySelectorAll('.mini-chart .bar');
    bars.forEach((bar, i) => {
      const targetHeight = bar.style.height;
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.transition = 'height 0.6s ease';
        bar.style.height = targetHeight;
      }, 800 + i * 80);
    });
  }

  window.addEventListener('load', animateBars);

})();
