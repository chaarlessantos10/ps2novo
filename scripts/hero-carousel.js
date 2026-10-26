(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const slides = [...hero.querySelectorAll('.hero-slide')];
  const dots = [...hero.querySelectorAll('.hero-dot')];
  const mobileOrder = [
    slides.find((slide) => slide.classList.contains('slide-cyber')),
    slides.find((slide) => slide.classList.contains('slide-ai')),
    slides.find((slide) => !slide.classList.contains('slide-cyber') && !slide.classList.contains('slide-ai'))
  ].filter(Boolean);
  const mobileQuery = window.matchMedia('(max-width: 650px)');
  const prevButton = hero.querySelector('.hero-nav.prev');
  const nextButton = hero.querySelector('.hero-nav.next');

  if (slides.length <= 1) return;

  let currentIndex = 0;
  let autoTimer = null;
  const autoDelay = 7000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interaction = { hover: false, pointer: false, focus: false };

  const getSlideOrder = () => mobileQuery.matches && mobileOrder.length === slides.length ? mobileOrder : slides;

  const isPaused = () => reducedMotion.matches || document.hidden ||
    interaction.hover || interaction.pointer || interaction.focus;

  const stopAuto = () => {
    if (autoTimer !== null) {
      window.clearTimeout(autoTimer);
      autoTimer = null;
    }
  };

  const showSlide = (index) => {
    const slideOrder = getSlideOrder();
    currentIndex = (index + slideOrder.length) % slideOrder.length;
    const activeSlide = slideOrder[currentIndex];

    slides.forEach((slide) => {
      const slideIndex = slideOrder.indexOf(slide);
      const isActive = slide === activeSlide;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.setAttribute('aria-label', `${slideIndex + 1} de ${slides.length}`);
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  };

  const scheduleAuto = () => {
    stopAuto();
    if (isPaused()) return;

    autoTimer = window.setTimeout(() => {
      autoTimer = null;
      if (isPaused()) return;
      showSlide(currentIndex + 1);
      scheduleAuto();
    }, autoDelay);
  };

  const next = () => showSlide(currentIndex + 1);
  const prev = () => showSlide(currentIndex - 1);

  window.initCarouselSwipe?.(hero.querySelector('.hero-slides'), {
    onNext: () => { next(); scheduleAuto(); },
    onPrevious: () => { prev(); scheduleAuto(); }
  });

  // Click controls
  nextButton?.addEventListener('click', () => { next(); scheduleAuto(); });
  prevButton?.addEventListener('click', () => { prev(); scheduleAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      scheduleAuto();
    });
  });

  // Pause for mouse hover, pointer/touch contact, and keyboard focus.
  hero.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    interaction.hover = true;
    stopAuto();
  });
  hero.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    interaction.hover = false;
    scheduleAuto();
  });
  hero.addEventListener('pointerdown', (event) => {
    if (event.isPrimary === false) return;
    interaction.focus = false;
    interaction.pointer = true;
    stopAuto();
  });
  const endPointerInteraction = () => {
    if (!interaction.pointer) return;
    interaction.pointer = false;
    scheduleAuto();
  };
  window.addEventListener('pointerup', endPointerInteraction);
  window.addEventListener('pointercancel', endPointerInteraction);

  hero.addEventListener('focusin', (event) => {
    if (!event.target.matches(':focus-visible')) return;
    interaction.focus = true;
    stopAuto();
  });
  hero.addEventListener('focusout', (e) => {
    interaction.focus = Boolean(
      e.relatedTarget && hero.contains(e.relatedTarget) &&
      e.relatedTarget.matches?.(':focus-visible')
    );
    scheduleAuto();
  });

  // Keyboard navigation
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { next(); scheduleAuto(); }
    else if (e.key === 'ArrowLeft') { prev(); scheduleAuto(); }
  });

  // Visibility and motion preferences
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else scheduleAuto();
  });
  reducedMotion.addEventListener?.('change', scheduleAuto);
  mobileQuery.addEventListener?.('change', () => {
    const activeSlide = slides.find((slide) => slide.classList.contains('active'));
    const nextIndex = getSlideOrder().indexOf(activeSlide);
    showSlide(nextIndex < 0 ? 0 : nextIndex);
    scheduleAuto();
  });

  // Initialize
  showSlide(0);
  scheduleAuto();
})();

