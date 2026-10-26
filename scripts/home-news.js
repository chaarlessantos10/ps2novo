(() => {
  const carousel = document.querySelector('[data-home-news-carousel]');
  if (!carousel) return;

  const title = carousel.querySelector('#insight-title');
  const summary = carousel.querySelector('#insight-summary');
  const category = carousel.querySelector('[data-news-category]');
  const readMore = carousel.querySelector('[data-news-readmore]');
  const imageLink = carousel.querySelector('[data-news-image-link]');
  const image = carousel.querySelector('[data-news-image]');
  const imageCaption = carousel.querySelector('[data-news-image-caption]');
  const indexLabel = carousel.querySelector('[data-news-index]');
  const controls = carousel.querySelector('[data-news-controls]');
  const dots = carousel.querySelector('[data-news-dots]');
  const status = carousel.querySelector('[data-news-status]');
  const previousButton = carousel.querySelector('[data-news-previous]');
  const nextButton = carousel.querySelector('[data-news-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let news = [];
  let currentIndex = 0;
  let timer = null;
  let paused = false;

  const stopRotation = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const startRotation = () => {
    stopRotation();
    if (news.length < 2 || paused || document.hidden || reducedMotion.matches) return;
    timer = window.setInterval(() => showNews(currentIndex + 1), 7000);
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).toUpperCase();
  };

  const showNews = (requestedIndex) => {
    if (!news.length) return;
    currentIndex = (requestedIndex + news.length) % news.length;
    const item = news[currentIndex];
    title.textContent = item.title;
    summary.textContent = item.summary;
    category.textContent = item.category;
    readMore.href = item.href;
    imageLink.href = item.href;
    if (item.image) {
      image.src = item.image;
      imageLink.style.setProperty('--insight-image', `url("${item.image}")`);
    }
    imageCaption.textContent = item.category;
    indexLabel.textContent = `${formatDate(item.date)} · ${String(currentIndex + 1).padStart(2, '0')} / ${String(news.length).padStart(2, '0')}`;
    status.textContent = `Notícia ${currentIndex + 1} de ${news.length}: ${item.title}`;
    [...dots.children].forEach((dot, index) => {
      dot.setAttribute('aria-pressed', String(index === currentIndex));
      dot.setAttribute('aria-label', `Mostrar notícia ${index + 1}: ${news[index].title}`);
    });
  };

  const loadNews = async () => {
    try {
      const response = await fetch(new URL('noticias.html', window.location.href));
      if (!response.ok) return;
      const documentCopy = new DOMParser().parseFromString(await response.text(), 'text/html');
      news = [...documentCopy.querySelectorAll('.news-feature')].map((article) => {
        const link = article.querySelector('.news-readmore');
        const time = article.querySelector('time');
        return {
          title: article.querySelector('h2')?.textContent.trim(),
          summary: article.querySelector('.news-feature-copy>p:not(.mono)')?.textContent.trim(),
          category: article.querySelector('.news-card-meta span')?.textContent.trim() || 'NOTÍCIA',
          date: time?.getAttribute('datetime') || '',
          image: article.querySelector('.news-art img')?.getAttribute('src')
            ? new URL(article.querySelector('.news-art img').getAttribute('src'), new URL('noticias.html', window.location.href)).href
            : '',
          href: link ? new URL(link.getAttribute('href'), new URL('noticias.html', window.location.href)).href : ''
        };
      }).filter((item) => item.title && item.summary && item.href);

      if (!news.length) return;
      dots.replaceChildren(...news.map((item, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Mostrar notícia ${index + 1}: ${item.title}`);
        dot.setAttribute('aria-pressed', 'false');
        dot.addEventListener('click', () => {
          showNews(index);
          startRotation();
        });
        return dot;
      }));
      controls.hidden = false;
      showNews(0);
      startRotation();
    } catch {
      return;
    }
  };

  previousButton.addEventListener('click', () => {
    showNews(currentIndex - 1);
    startRotation();
  });
  nextButton.addEventListener('click', () => {
    showNews(currentIndex + 1);
    startRotation();
  });
  window.initCarouselSwipe?.(carousel, {
    onNext: () => { showNews(currentIndex + 1); startRotation(); },
    onPrevious: () => { showNews(currentIndex - 1); startRotation(); }
  });
  carousel.addEventListener('mouseenter', () => {
    paused = true;
    stopRotation();
  });
  carousel.addEventListener('mouseleave', () => {
    paused = false;
    startRotation();
  });
  carousel.addEventListener('focusin', () => {
    paused = true;
    stopRotation();
  });
  carousel.addEventListener('focusout', (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    paused = false;
    startRotation();
  });
  document.addEventListener('visibilitychange', startRotation);
  reducedMotion.addEventListener?.('change', startRotation);

  loadNews();
})();
