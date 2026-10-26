(() => {
  const buttons = document.querySelectorAll('[data-share-title]');

  buttons.forEach((button) => {
    const status = button.parentElement.querySelector('.share-status');

    button.addEventListener('click', async () => {
      const shareData = {
        title: button.dataset.shareTitle,
        text: button.dataset.shareTitle,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
          if (status) status.textContent = 'Artigo compartilhado.';
          return;
        }

        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareData.url);
          if (status) status.textContent = 'Link copiado.';
          return;
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
      }

      const message = `${shareData.title} ${shareData.url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });
  });
})();
