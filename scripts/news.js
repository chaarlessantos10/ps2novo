(() => {
  const searchForm = document.querySelector('.news-search');
  const searchInput = document.querySelector('#news-search-input');
  const articles = [...document.querySelectorAll('.news-feature[data-categories]')];
  const filterButtons = [...document.querySelectorAll('[data-news-filter]')];
  const emptyMessage = document.querySelector('.news-empty');
  const resultsStatus = document.querySelector('#news-results-status');

  if (!searchInput || articles.length === 0) return;

  const allowedCategories = new Set(['all', 'phishing', 'home-office', 'qr-code', 'inteligencia-artificial', 'seguranca']);
  const requestedCategory = new URLSearchParams(window.location.search).get('categoria');
  let activeCategory = allowedCategories.has(requestedCategory) ? requestedCategory : 'all';

  const normalize = (value) => value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const updateArticles = () => {
    const query = normalize(searchInput.value.trim());
    let visibleCount = 0;

    articles.forEach((article) => {
      const categories = article.dataset.categories.split(/\s+/);
      const searchableText = normalize(`${article.dataset.search} ${article.textContent}`);
      const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);
      const matchesSearch = query === '' || searchableText.includes(query);
      const isVisible = matchesCategory && matchesSearch;

      article.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
    if (resultsStatus) resultsStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'not\u00edcia encontrada' : 'not\u00edcias encontradas'}.`;
  };

  searchForm?.addEventListener('submit', (event) => event.preventDefault());
  searchInput.addEventListener('input', updateArticles);

  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.newsFilter === activeCategory));
  });
  updateArticles();

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.newsFilter;
      filterButtons.forEach((filterButton) => {
        filterButton.setAttribute('aria-pressed', String(filterButton.dataset.newsFilter === activeCategory));
      });
      const url = new URL(window.location.href);
      if (activeCategory === 'all') url.searchParams.delete('categoria');
      else url.searchParams.set('categoria', activeCategory);
      window.history.replaceState({}, '', url);
      updateArticles();
    });
  });
})();
