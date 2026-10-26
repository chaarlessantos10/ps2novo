/* Pausa as animações SMIL do globo de cibersegurança (slide 2) quando o
   usuário solicita menos movimento. O SMIL não respeita
   prefers-reduced-motion sozinho, então congelamos no primeiro quadro. */
(function () {
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  function apply() {
    document.querySelectorAll('svg.cybermap-image').forEach(function (svg) {
      if (!svg.pauseAnimations || !svg.unpauseAnimations) return;
      if (mq.matches) {
        svg.pauseAnimations();
        try { svg.setCurrentTime(0); } catch (e) {}
      } else {
        svg.unpauseAnimations();
      }
    });
  }

  apply();
  if (mq.addEventListener) mq.addEventListener('change', apply);
  else if (mq.addListener) mq.addListener(apply);
})();
