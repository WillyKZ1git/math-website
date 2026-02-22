/* ============================================================
   MathCoach — Script page chapitre
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ONGLETS (Cours / Exercices / Quiz)
  ---------------------------------------------------------- */
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(targetId) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetId);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === 'tab-' + targetId);
    });
    // Remonter en haut de la barre d'onglets
    const bar = document.querySelector('.chapter-tabs-bar');
    if (bar) {
      const top = bar.getBoundingClientRect().top + window.scrollY - 4;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  /* ----------------------------------------------------------
     2. SOLUTIONS EXERCICES (afficher/masquer)
  ---------------------------------------------------------- */
  document.querySelectorAll('.show-solution-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card     = btn.closest('.exercice-card');
      const solution = card.querySelector('.exercice-solution');
      const isOpen   = solution.classList.toggle('visible');
      btn.classList.toggle('open', isOpen);
      btn.querySelector('.btn-text').textContent = isOpen ? 'Masquer la correction' : 'Voir la correction';
    });
  });

  /* ----------------------------------------------------------
     3. QUIZ INTERACTIF
  ---------------------------------------------------------- */
  const quizQuestions = document.querySelectorAll('.quiz-question-card');
  const quizScoreCard = document.querySelector('.quiz-score-card');
  const progressFill  = document.querySelector('.quiz-progress-fill');
  const total         = quizQuestions.length;
  let answers         = new Array(total).fill(null); // null | true | false
  let current         = 0;

  function updateProgress() {
    const answered = answers.filter(a => a !== null).length;
    if (progressFill) progressFill.style.width = (answered / total * 100) + '%';
  }

  function showQuestion(index) {
    quizQuestions.forEach((q, i) => {
      q.style.display = i === index ? 'block' : 'none';
    });
  }

  // Répondre à une question
  quizQuestions.forEach((card, qIdx) => {
    const options  = card.querySelectorAll('.quiz-option');
    const feedback = card.querySelector('.quiz-feedback');
    const correct  = parseInt(card.dataset.correct, 10);

    options.forEach((opt, oIdx) => {
      opt.addEventListener('click', () => {
        if (answers[qIdx] !== null) return; // déjà répondu

        const isCorrect = oIdx === correct;
        answers[qIdx]   = isCorrect;

        // Colorier les options
        options.forEach((o, i) => {
          o.disabled = true;
          if (i === correct) o.classList.add('correct');
          if (i === oIdx && !isCorrect) o.classList.add('wrong');
        });

        // Feedback
        if (feedback) {
          feedback.textContent = isCorrect
            ? '✓ Bonne réponse !'
            : '✗ ' + (card.dataset.explanation || 'Mauvaise réponse.');
          feedback.className = 'quiz-feedback show ' + (isCorrect ? 'correct' : 'wrong');
        }

        updateProgress();
      });
    });
  });

  // Navigation quiz
  const btnPrev   = document.getElementById('quiz-prev');
  const btnNext   = document.getElementById('quiz-next');
  const btnFinish = document.getElementById('quiz-finish');

  function updateQuizNav() {
    if (btnPrev)   btnPrev.disabled   = current === 0;
    if (btnNext)   btnNext.style.display = current < total - 1 ? 'inline-flex' : 'none';
    if (btnFinish) btnFinish.style.display = current === total - 1 ? 'inline-flex' : 'none';
  }

  if (btnPrev) btnPrev.addEventListener('click', () => {
    if (current > 0) { current--; showQuestion(current); updateQuizNav(); }
  });

  if (btnNext) btnNext.addEventListener('click', () => {
    if (current < total - 1) { current++; showQuestion(current); updateQuizNav(); }
  });

  if (btnFinish) btnFinish.addEventListener('click', () => {
    const score = answers.filter(Boolean).length;
    quizQuestions.forEach(q => q.style.display = 'none');
    if (quizScoreCard) {
      quizScoreCard.classList.add('show');
      const circle = quizScoreCard.querySelector('.quiz-score-circle');
      if (circle) circle.textContent = score + '/' + total;
      const title = quizScoreCard.querySelector('.quiz-score-title');
      if (title) {
        if (score === total) title.textContent = 'Parfait ! 🎉';
        else if (score >= total * 0.7) title.textContent = 'Bien joué !';
        else title.textContent = 'Continue à t\'entraîner !';
      }
      const sub = quizScoreCard.querySelector('.quiz-score-sub');
      if (sub) sub.textContent = score + ' bonne' + (score > 1 ? 's' : '') + ' réponse' + (score > 1 ? 's' : '') + ' sur ' + total;
    }
  });

  const btnRetry = document.getElementById('quiz-retry');
  if (btnRetry) btnRetry.addEventListener('click', () => {
    answers = new Array(total).fill(null);
    current = 0;
    if (quizScoreCard) quizScoreCard.classList.remove('show');
    quizQuestions.forEach((card, i) => {
      card.style.display = i === 0 ? 'block' : 'none';
      card.querySelectorAll('.quiz-option').forEach(o => {
        o.classList.remove('correct', 'wrong');
        o.disabled = false;
      });
      const fb = card.querySelector('.quiz-feedback');
      if (fb) fb.className = 'quiz-feedback';
    });
    updateProgress();
    updateQuizNav();
  });

  // Init
  if (quizQuestions.length > 0) {
    showQuestion(0);
    updateQuizNav();
    updateProgress();
  }

  /* ----------------------------------------------------------
     4. SOMMAIRE : highlight de l'ancre active
  ---------------------------------------------------------- */
  const anchors     = document.querySelectorAll('.cours-section');
  const sommLinks   = document.querySelectorAll('.sommaire-list a');

  const anchorObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sommLinks.forEach(link => {
          link.classList.toggle('active-anchor', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  anchors.forEach(el => anchorObs.observe(el));

  /* ----------------------------------------------------------
     5. SMOOTH SCROLL pour les liens du sommaire
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 60 + 57 + 16; // navbar + tabs + padding
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
