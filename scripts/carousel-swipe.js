(() => {
  const interactiveSelector = 'button, input, select, textarea, [role="button"], [role="tab"], [contenteditable="true"]';

  window.initCarouselSwipe = (surface, { onNext, onPrevious }) => {
    if (!surface || typeof onNext !== 'function' || typeof onPrevious !== 'function') return;

    const mobileQuery = window.matchMedia('(max-width: 800px)');
    let gesture = null;
    let suppressClickUntil = 0;

    surface.style.touchAction = 'pan-y';

    const resetGesture = () => {
      gesture = null;
    };

    surface.addEventListener('pointerdown', (event) => {
      if (!mobileQuery.matches || event.pointerType === 'mouse' || !event.isPrimary || event.button !== 0) return;
      if (event.target.closest(interactiveSelector)) return;

      gesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastTime: event.timeStamp,
        horizontal: false
      };
    });

    surface.addEventListener('pointermove', (event) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;

      if (!gesture.horizontal) {
        if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;
        if (Math.abs(deltaY) >= Math.abs(deltaX)) {
          resetGesture();
          return;
        }
        gesture.horizontal = true;
      }

      gesture.lastX = event.clientX;
      gesture.lastTime = event.timeStamp;
    });

    const finishGesture = (event) => {
      if (!gesture || event.pointerId !== gesture.pointerId) return;
      const deltaX = event.clientX - gesture.startX;
      const deltaY = event.clientY - gesture.startY;
      const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
      const velocity = Math.abs(event.clientX - gesture.lastX) / elapsed;
      const threshold = velocity >= 0.5 ? 32 : 48;
      const canNavigate = gesture.horizontal && Math.abs(deltaX) >= threshold && Math.abs(deltaX) > Math.abs(deltaY);
      resetGesture();

      if (!canNavigate) return;
      suppressClickUntil = Date.now() + 400;
      if (deltaX < 0) onNext();
      else onPrevious();
    };

    surface.addEventListener('pointerup', finishGesture);
    surface.addEventListener('pointercancel', resetGesture);
    surface.addEventListener('lostpointercapture', resetGesture);
    surface.addEventListener('click', (event) => {
      if (Date.now() > suppressClickUntil) return;
      suppressClickUntil = 0;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    mobileQuery.addEventListener?.('change', resetGesture);
  };
})();
