(() => {
  const viewport = document.querySelector('.partners-window');
  const track = document.querySelector('.partners-track');
  const previousButton = document.querySelector('.partner-arrow.previous');
  const nextButton = document.querySelector('.partner-arrow.next');
  const carousel = document.querySelector('.partners');
  const rotationButton = document.querySelector('.partner-rotation-toggle');

  if (!viewport || !track || !previousButton || !nextButton || !carousel || !rotationButton) return;

  const partners = [...track.children];
  const autoAdvanceDelay = 1000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let autoAdvanceTimer;
  let userPaused = false;
  let pointerWithin = false;
  let focusWithin = false;

  const visiblePartnerCount = () => {
    if (window.innerWidth <= 520) return 2;
    if (window.innerWidth <= 800) return 3;
    return 5;
  };

  const lastIndex = () => Math.max(0, partners.length - visiblePartnerCount());

  const render = () => {
    activeIndex = Math.min(activeIndex, lastIndex());
    const step = viewport.clientWidth / visiblePartnerCount();
    track.style.transform = `translate3d(${-activeIndex * step}px, 0, 0)`;
    viewport.setAttribute('aria-label', `Parceiros, item ${activeIndex + 1} de ${partners.length}`);
  };

  const advance = () => {
    activeIndex = activeIndex >= lastIndex() ? 0 : activeIndex + 1;
    render();
  };

  const moveBack = () => {
    activeIndex = activeIndex <= 0 ? lastIndex() : activeIndex - 1;
    render();
  };

  window.initCarouselSwipe?.(viewport, {
    onNext: () => { advance(); startAutoAdvance(); },
    onPrevious: () => { moveBack(); startAutoAdvance(); }
  });

  const startAutoAdvance = () => {
    window.clearInterval(autoAdvanceTimer);
    rotationButton.hidden = reducedMotion.matches;
    if (reducedMotion.matches || document.hidden || userPaused || pointerWithin || focusWithin) return;
    autoAdvanceTimer = window.setInterval(advance, autoAdvanceDelay);
  };

  previousButton.addEventListener('click', () => { moveBack(); startAutoAdvance(); });
  nextButton.addEventListener('click', () => { advance(); startAutoAdvance(); });
  rotationButton.addEventListener('click', () => {
    userPaused = !userPaused;
    rotationButton.textContent = userPaused ? 'Retomar rota\u00e7\u00e3o' : 'Pausar rota\u00e7\u00e3o';
    startAutoAdvance();
  });

  carousel.addEventListener('mouseenter', () => { pointerWithin = true; startAutoAdvance(); });
  carousel.addEventListener('mouseleave', () => { pointerWithin = false; startAutoAdvance(); });
  carousel.addEventListener('focusin', () => { focusWithin = true; startAutoAdvance(); });
  carousel.addEventListener('focusout', (event) => {
    focusWithin = carousel.contains(event.relatedTarget);
    startAutoAdvance();
  });
  window.addEventListener('resize', render);
  document.addEventListener('visibilitychange', startAutoAdvance);
  reducedMotion.addEventListener?.('change', startAutoAdvance);

  render();
  startAutoAdvance();
})();
