(() => {
  const form = document.querySelector('#quote-form');
  if (!form) return;

  const status = form.querySelector('#quote-form-status');
  const submitButton = form.querySelector('[type="submit"]');
  const fallbackMessage = form.querySelector('#quote-form-fallback');
  const serviceOptions = form.querySelector('[data-contact-service-options]');
  const services = window.PS2_SERVICE_CATALOG?.services || [];
  const value = (name) => form.elements.namedItem(name)?.value.trim() || 'N\u00e3o informado';

  if (serviceOptions && services.length) {
    const requestedService = new URLSearchParams(window.location.search).get('servico');
    serviceOptions.replaceChildren();

    services.forEach((service) => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      const title = document.createElement('span');

      checkbox.type = 'checkbox';
      checkbox.name = 'servicos';
      checkbox.value = service.title;
      checkbox.checked = service.slug === requestedService;
      title.textContent = service.title;
      label.append(checkbox, title);
      serviceOptions.append(label);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const services = [...form.querySelectorAll('input[name="servicos"]:checked')]
      .map((checkbox) => checkbox.value);

    const message = [
      'Olá! Gostaria de solicitar um orçamento para a minha empresa.',
      '',
      '*Dados de contato*',
      `Nome: ${value('nome')}`,
      `Empresa: ${value('empresa')}`,
      `E-mail: ${value('email')}`,
      `Telefone / WhatsApp: ${value('telefone')}`,
      `Cargo / função: ${value('cargo')}`,
      '',
      '*Serviços de interesse*',
      services.length ? services.map((service) => `• ${service}`).join('\n') : 'Ainda não definido',
      '',
      '*Detalhes da infraestrutura*',
      `Computadores / usuários: ${value('usuarios')}`,
      `Provedor de TI: ${value('provedor')}`,
      `Urgência: ${value('urgencia')}`,
      `Faixa de investimento mensal: ${value('investimento')}`,
      `Necessidade: ${value('necessidade')}`
    ].join('\n');

    const whatsappUrl = `https://wa.me/551135008073?text=${encodeURIComponent(message)}`;
    if (status) status.textContent = 'Abrindo o WhatsApp com sua solicita\u00e7\u00e3o para revis\u00e3o.';
    const newTab = window.open(whatsappUrl, '_blank');

    if (newTab) {
      newTab.opener = null;
    } else {
      window.location.assign(whatsappUrl);
    }
  });

  if (submitButton) submitButton.disabled = false;
  if (fallbackMessage) fallbackMessage.hidden = true;
})();
