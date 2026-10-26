/* Show the existing static globe only when the official mobile widget fails. */
(() => {
  if (!window.matchMedia('(max-width: 650px)').matches) return;

  const slide = document.querySelector('.hero-slide.slide-cyber');
  const frame = slide?.querySelector('.cybermap-iframe');
  if (!slide || !frame) return;

  let settled = false;
  let networkReachable = false;
  let iframeLoaded = false;
  const showFallback = () => {
    if (settled) return;
    settled = true;
    slide.classList.add('cybermap-fallback');
  };
  frame.loading = 'eager';
  frame.addEventListener('load', () => {
    iframeLoaded = true;
    if (networkReachable) settled = true;
  }, { once: true });
  frame.addEventListener('error', showFallback, { once: true });
  window.setTimeout(showFallback, 10000);

  // Cross-origin iframe load fires for some network error pages too. A small
  // no-cors probe distinguishes a reachable widget host from a blocked request
  // without trying to read the widget's cross-origin document.
  fetch(frame.src, {
    mode: 'no-cors',
    cache: 'no-store',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  }).then(() => {
    networkReachable = true;
    if (iframeLoaded) settled = true;
    else window.setTimeout(() => {
      if (!iframeLoaded) showFallback();
    }, 6000);
  }).catch(showFallback);
})();
