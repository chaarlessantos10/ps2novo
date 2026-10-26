(() => {
  const catalog = window.PS2_SERVICE_CATALOG;
  if (!catalog) return;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
  const sectionTitle = (value, fallback) => escapeHtml(String(value || fallback).replace(/[.!?]+$/, ''));

  const serviceUrl = (service) => `/servicos/${service.slug === 'suporte-tecnico' ? 'suporte-tecnico-empresarial' : service.slug}/`;
  const contactUrl = (service) => `/contato.html?servico=${encodeURIComponent(service.slug)}`;
  const serviceContactUrl = (service) => service.slug === 'suporte-tecnico'
    ? 'mailto:chamado@ps2.tech?subject=Solicita%C3%A7%C3%A3o%20de%20Suporte'
    : contactUrl(service);
  const serviceMenuOrder = [
    'servicos-de-ia',
    'pabx-virtual',
    'gestao-de-redes-e-seguranca',
    'suporte-tecnico',
    'datacenter-cloud',
    'backup-recuperacao',
    'link-dedicado',
    'microsoft-365',
    'projetos-consultoria-ti'
  ];
  const orderedServices = [...catalog.services].sort((first, second) =>
    serviceMenuOrder.indexOf(first.slug) - serviceMenuOrder.indexOf(second.slug)
  );

  const cardMarkup = (service) => `
    <a class="catalog-card" data-service-slug="${escapeHtml(service.slug)}" href="${serviceUrl(service)}">
      <span class="catalog-icon" aria-hidden="true">${service.icon}</span>
      <h3>${escapeHtml(service.title)}</h3>
      <p>${escapeHtml(service.description)}</p>
      ${service.items.length ? `<ul>${service.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ""}
      <span class="catalog-card-action">Saiba mais <span>→</span></span>
    </a>`;

  document.querySelectorAll('[data-service-cards]').forEach((grid) => {
    grid.innerHTML = catalog.services.map(cardMarkup).join('');
  });

  document.querySelectorAll('nav[aria-label="Navegação principal"] a[href="/servicos/"]').forEach((servicesLink, index) => {
    const menu = document.createElement('div');
    menu.className = 'services-nav-menu';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = `services-nav-toggle${servicesLink.classList.contains('active') ? ' active' : ''}`;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-haspopup', 'true');
    toggle.setAttribute('aria-controls', `services-nav-panel-${index}`);
    toggle.innerHTML = '<span>Serviços</span><span class="services-nav-caret" aria-hidden="true">⌄</span>';

    const panel = document.createElement('div');
    panel.className = 'services-nav-panel';
    panel.id = `services-nav-panel-${index}`;
    panel.hidden = true;
    panel.innerHTML = `<a class="services-nav-all" href="/servicos/">Todos os serviços <span>↗</span></a>${orderedServices.map((service) => `<a href="${serviceUrl(service)}">${escapeHtml(service.title)}</a>`).join('')}`;

    const setMenuOpen = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    };

    servicesLink.replaceWith(menu);
    menu.append(toggle, panel);
    toggle.addEventListener('click', () => setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMenuOpen(true);
        panel.querySelector('a')?.focus();
      }
    });
    menu.addEventListener('focusin', (event) => {
      if (event.target !== toggle) setMenuOpen(true);
    });
    menu.addEventListener('focusout', (event) => {
      if (!menu.contains(event.relatedTarget)) setMenuOpen(false);
    });
    document.addEventListener('pointerdown', (event) => {
      if (!menu.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenuOpen(false);
        toggle.focus();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Layout premium — páginas de serviço (piloto: backup-recuperacao).
  // Serviços com premiumLayout:true usam a composição comercial abaixo;
  // os demais continuam no layout clássico, sem alteração.
  // ---------------------------------------------------------------------------
  const premiumIcons = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.4l7 2.8v5.3c0 4.4-2.9 7.4-7 8.6-4.1-1.2-7-4.2-7-8.6V6.2z"/><path d="M9.2 12.1l2 2 3.6-4"/></svg>',
    recovery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.7"/><path d="M4 4v4.7h4.7"/></svg>',
    replace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="7" height="7" rx="1.2"/><rect x="13.5" y="13" width="7" height="7" rx="1.2"/><path d="M7 15V13a3 3 0 0 1 3-3h5M14 7h3a3 3 0 0 1 3 3v1M13 5l2 2-2 2M11 13l-2 2 2 2"/></svg>',
    continuity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-6.2 4 12.4L16 12h5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.6l5 5L19.5 6"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5v-1.5a8 8 0 0 1 16 0v1.5"/><rect x="2.6" y="13" width="4.4" height="7" rx="2"/><rect x="17" y="13" width="4.4" height="7" rx="2"/><path d="M19.2 20a3 3 0 0 1-2.9 2h-2.3"/></svg>',
    tools: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.2 6.4a4 4 0 0 1 5.3-3.8l-2.6 2.6 2.3 2.3 2.6-2.6a4 4 0 0 1-5.4 5.2L8.6 19.8a2.1 2.1 0 0 1-3-3l9.7-9.5a4 4 0 0 1-1.1-1z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.2" cy="6" r="1.2"/><circle cx="4.2" cy="12" r="1.2"/><circle cx="4.2" cy="18" r="1.2"/></svg>',
    checklist: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6h11M10 12h11M10 18h11"/><path d="m3.5 5.8 1.6 1.6 2.8-3M3.5 11.8l1.6 1.6 2.8-3M3.5 17.8l1.6 1.6 2.8-3"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="2.4"/><circle cx="19" cy="6" r="2.4"/><circle cx="12" cy="18.5" r="2.4"/><path d="M6.6 7.8l4 8.9M17.4 7.8l-4 8.9M7.4 6h9.2"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18.5h10.2a3.8 3.8 0 0 0 .8-7.5A5.8 5.8 0 0 0 6.4 9.3 3.9 3.9 0 0 0 7 18.5z"/></svg>',
    server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4" width="17" height="7" rx="1.6"/><rect x="3.5" y="13" width="17" height="7" rx="1.6"/><path d="M7 7.5h.01M7 16.5h.01M11 7.5h6M11 16.5h6"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.6 17.5a9 9 0 1 1 14.8 0"/><path d="M12 13.5 16 9"/><circle cx="12" cy="13.8" r="1.4"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5"/><path d="M12.8 6.8 14.5 5a3.9 3.9 0 0 1 5.5 5.5l-1.8 1.8M11.2 17.2 9.5 19A3.9 3.9 0 0 1 4 13.5l1.8-1.8"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.4 3.6c.6 0 1.1.4 1.3 1l1 3c.2.6 0 1.3-.5 1.7l-1.3 1a12.4 12.4 0 0 0 5.8 5.8l1-1.3c.4-.5 1-.7 1.7-.5l3 1c.6.2 1 .7 1 1.3v2.9c0 .9-.7 1.5-1.5 1.4C10.8 20.6 3.4 13.2 2.9 6.1c-.1-.8.5-1.5 1.4-1.5z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2.5 4.6 13.6h6L11 21.5l8.4-11.1h-6z"/></svg>',
    clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4.5" width="14" height="17" rx="2"/><path d="M9 4.5V3.6c0-.6.5-1.1 1.1-1.1h3.8c.6 0 1.1.5 1.1 1.1v.9"/><path d="M8.5 10h7m-7 4h7m-7 4h4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><rect x="5.5" y="12" width="3.4" height="5.5" rx="1"/><rect x="10.4" y="8" width="3.4" height="9.5" rx="1"/><rect x="15.3" y="4.5" width="3.4" height="13" rx="1"/></svg>'
  };

  // Cenas tecnológicas do hero — uma por serviço, todas decorativas
  // (aria-hidden), no mesmo quadro: plataforma, glow e marcas de canto.
  const premiumSceneFrame = (inner) => `
    <svg viewBox="0 0 560 470" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="svcx-cyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#1d242c"/><stop offset=".45" stop-color="#0e1318"/><stop offset="1" stop-color="#171e25"/>
        </linearGradient>
        <linearGradient id="svcx-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#161d25"/><stop offset="1" stop-color="#0d1117"/>
        </linearGradient>
        <radialGradient id="svcx-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#ff4d1622"/><stop offset="1" stop-color="#ff4d1600"/>
        </radialGradient>
      </defs>
      <ellipse cx="285" cy="402" rx="225" ry="46" fill="url(#svcx-glow)"/>
      <ellipse cx="285" cy="404" rx="192" ry="24" fill="#0f1419" stroke="#ffffff14"/>
      <g stroke="#ffffff10" stroke-width="1"><path d="M86 118h34m-17-17v34" opacity=".7"/><path d="M492 356h30m-15-15v30" opacity=".7"/></g>
      <circle cx="86" cy="118" r="3" fill="#ff4d16" opacity=".65"/>
      <circle cx="507" cy="356" r="3" fill="#ff4d16" opacity=".65"/>
      ${inner}
    </svg>`;

  const premiumScenes = {
    backup: () => premiumSceneFrame(`
      <g>
        <path d="M118 306v42a72 19 0 0 0 144 0v-42" fill="url(#svcx-cyl)"/>
        <ellipse cx="190" cy="306" rx="72" ry="19" fill="#1a212a" stroke="#ffffff18"/>
        <path d="M118 256v42a72 19 0 0 0 144 0v-42" fill="url(#svcx-cyl)"/>
        <ellipse cx="190" cy="256" rx="72" ry="19" fill="#1a212a" stroke="#ffffff18"/>
        <path d="M118 206v42a72 19 0 0 0 144 0v-42" fill="url(#svcx-cyl)"/>
        <ellipse cx="190" cy="206" rx="72" ry="19" fill="#202832" stroke="#ff4d168c"/>
        <circle cx="190" cy="206" r="5" fill="#ff4d16"/>
        <circle cx="214" cy="212" r="2.4" fill="#ff4d16" opacity=".55"/>
        <circle cx="166" cy="212" r="2.4" fill="#ff4d16" opacity=".55"/>
      </g>
      <circle cx="382" cy="238" r="99" stroke="#ffffff14" stroke-dasharray="3 10"/>
      <path d="M382 168l53 21.5v44c0 38.5-22.5 63-53 75-30.5-12-53-36.5-53-75v-44z" fill="url(#svcx-shield)" stroke="#ff4d16" stroke-width="2"/>
      <path d="M359 245l13.5 13.5L402 229" stroke="#ff4d16" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="svcx-flow" d="M266 198c30-16 44-12 62 10" stroke="#ff4d16" stroke-width="1.6" stroke-linecap="round"/>
      <path class="svcx-flow svcx-flow-slow" d="M382 322c0 34-28 52-62 57" stroke="#ff4d1688" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M310 373l12 8-12 8z" fill="#ff4d16" opacity=".85"/>`),
    suporte: () => premiumSceneFrame(`
      <rect x="150" y="140" width="260" height="170" rx="10" fill="#12181f" stroke="#ffffff18"/>
      <rect x="164" y="154" width="232" height="142" rx="6" fill="#0c1015" stroke="#ffffff10"/>
      <rect x="182" y="172" width="120" height="34" rx="9" fill="#ff4d1614" stroke="#ff4d1659"/>
      <path d="M194 183h84M194 193h56" stroke="#ff805e" stroke-width="1.6" stroke-linecap="round"/>
      <rect x="240" y="220" width="138" height="30" rx="9" fill="#1a212a" stroke="#ffffff17"/>
      <circle cx="292" cy="235" r="3" fill="#8b949b"/><circle cx="304" cy="235" r="3" fill="#8b949b" opacity=".7"/><circle cx="316" cy="235" r="3" fill="#8b949b" opacity=".45"/>
      <path d="M280 310v66M244 388h72" stroke="#ffffff22" stroke-width="2" stroke-linecap="round"/>
      <circle cx="398" cy="300" r="21" fill="#131920" stroke="#ff4d16" stroke-width="2"/>
      <path d="M389 300l6 6 12-13" stroke="#ff4d16" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="430" cy="180" r="15" stroke="#ff4d168c" stroke-width="1.6"/>
      <circle cx="430" cy="180" r="5.5" stroke="#ff4d168c" stroke-width="1.6"/>
      <g stroke="#ff4d168c" stroke-width="1.6" stroke-linecap="round"><path d="M430 158v6M430 196v6M408 180h6M446 180h6M414.5 164.5l4.2 4.2M441.3 191.3l4.2 4.2M445.5 164.5l-4.2 4.2M418.7 191.3l-4.2 4.2"/></g>
      <path class="svcx-flow" d="M104 262c30-30 18-52 46-62" stroke="#ff4d16" stroke-width="1.6" stroke-linecap="round"/>`),
    redes: () => premiumSceneFrame(`
      <g stroke="#ffffff14" stroke-width="1.2">
        <path d="M156 154 258 232M418 154 302 232M132 276h110M428 276H318M196 362l50-72M366 362l-50-72"/>
      </g>
      <g fill="#141a21" stroke="#ffffff18">
        <rect x="138" y="136" width="22" height="22" rx="5"/><rect x="400" y="136" width="22" height="22" rx="5"/>
        <rect x="114" y="265" width="22" height="22" rx="5"/><rect x="424" y="265" width="22" height="22" rx="5"/>
        <rect x="178" y="351" width="22" height="22" rx="5"/><rect x="360" y="351" width="22" height="22" rx="5"/>
      </g>
      <g fill="#ff4d16"><circle cx="149" cy="147" r="3"/><circle cx="411" cy="147" r="3"/><circle cx="125" cy="276" r="3"/><circle cx="435" cy="276" r="3"/><circle cx="189" cy="362" r="3"/><circle cx="371" cy="362" r="3"/></g>
      <path d="M258 232v-14a22 22 0 0 1 44 0v14" stroke="#ff4d16" stroke-width="2.2" fill="none"/>
      <rect x="242" y="230" width="76" height="58" rx="10" fill="url(#svcx-shield)" stroke="#ff4d16" stroke-width="2"/>
      <circle cx="280" cy="253" r="6" fill="#ff4d16"/><path d="M280 259v10" stroke="#ff4d16" stroke-width="3" stroke-linecap="round"/>
      <path class="svcx-flow" d="M104 320c60 34 292 34 352 0" stroke="#ff4d1688" stroke-width="1.6" stroke-linecap="round"/>`),
    cloud: () => premiumSceneFrame(`
      <g fill="#141b23">
        <circle cx="268" cy="182" r="40"/><circle cx="322" cy="168" r="30"/><rect x="228" y="192" width="148" height="36" rx="18"/>
      </g>
      <path d="M256 194c8-18 26-27 46-23" stroke="#ffffff22" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="352" cy="152" r="3.4" fill="#ff4d16"/>
      <rect x="126" y="286" width="112" height="78" rx="9" fill="url(#svcx-cyl)" stroke="#ffffff17"/>
      <path d="M142 308h52M142 326h52M142 344h52" stroke="#ffffff14" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="222" cy="308" r="3.2" fill="#8dd4a2"/><circle cx="222" cy="326" r="3.2" fill="#ff4d16"/>
      <rect x="322" y="286" width="112" height="78" rx="9" fill="url(#svcx-cyl)" stroke="#ffffff17"/>
      <path d="M338 308h52M338 326h52M338 344h52" stroke="#ffffff14" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="418" cy="308" r="3.2" fill="#8dd4a2"/><circle cx="418" cy="344" r="3.2" fill="#ffffff36"/>
      <path d="M182 270v-26m-8 8 8-8 8 8" stroke="#ff4d16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M378 246v26m-8-8 8 8 8-8" stroke="#ff4d1688" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="svcx-flow" d="M108 250c26 10 22 30 18 36" stroke="#ff4d16" stroke-width="1.6" stroke-linecap="round"/>`),
    m365: () => premiumSceneFrame(`
      <rect x="176" y="148" width="88" height="88" rx="9" fill="#ff4d1614" stroke="#ff4d168c"/>
      <circle cx="220" cy="192" r="6" fill="#ff4d16"/>
      <rect x="276" y="148" width="88" height="88" rx="9" fill="#141b23" stroke="#ffffff17"/>
      <circle cx="320" cy="192" r="6" fill="#8b949b"/>
      <rect x="176" y="248" width="88" height="88" rx="9" fill="#141b23" stroke="#ffffff17"/>
      <circle cx="220" cy="292" r="6" fill="#8b949b"/>
      <rect x="276" y="248" width="88" height="88" rx="9" fill="#141b23" stroke="#ffffff17"/>
      <circle cx="320" cy="292" r="6" fill="#8b949b"/>
      <rect x="386" y="180" width="82" height="102" rx="9" fill="#12181f" stroke="#ffffff15"/>
      <path d="M402 202h50M402 218h50M402 234h34" stroke="#ffffff1e" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M402 258h24" stroke="#ff4d16" stroke-width="1.8" stroke-linecap="round"/>
      <path class="svcx-flow" d="M126 192c22 0 30 14 30 34v22c0 20 8 34 30 34" stroke="#ff4d16" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="122" cy="192" r="6" stroke="#ff4d168c" stroke-width="1.8"/>
      <circle cx="427" cy="330" r="3" fill="#ff4d16" opacity=".6"/>`),
    link: () => premiumSceneFrame(`
      <rect x="118" y="222" width="98" height="64" rx="11" fill="url(#svcx-cyl)" stroke="#ffffff18"/>
      <path d="M152 222v-24" stroke="#8b949b" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M164 212a18 18 0 0 0-12-10" stroke="#8b949b" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      <circle cx="140" cy="256" r="3.6" fill="#8dd4a2"/><circle cx="156" cy="256" r="3.6" fill="#ffffff36"/><circle cx="172" cy="256" r="3.6" fill="#ffffff36"/>
      <rect x="344" y="222" width="98" height="64" rx="11" fill="url(#svcx-cyl)" stroke="#ffffff18"/>
      <path d="M408 222v-24" stroke="#8b949b" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M396 212a18 18 0 0 1 12-10" stroke="#8b949b" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      <circle cx="410" cy="256" r="3.6" fill="#8dd4a2"/><circle cx="394" cy="256" r="3.6" fill="#ffffff36"/><circle cx="378" cy="256" r="3.6" fill="#ffffff36"/>
      <path d="M216 254h128" stroke="#ff4d16" stroke-width="2.6" stroke-linecap="round"/>
      <path class="svcx-flow" d="M216 268h128" stroke="#ff4d1688" stroke-width="2" stroke-linecap="round"/>
      <circle cx="248" cy="254" r="3.6" fill="#ff4d16"/><circle cx="280" cy="254" r="3.6" fill="#ff4d16"/><circle cx="312" cy="254" r="3.6" fill="#ff4d16"/>
      <path d="M104 238a32 32 0 0 0 0 32M456 238a32 32 0 0 1 0 32" stroke="#8b949b" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
      <path d="M92 226a46 46 0 0 0 0 56M468 226a46 46 0 0 1 0 56" stroke="#8b949b" stroke-width="1.4" stroke-linecap="round" opacity=".3"/>`),
    projetos: () => premiumSceneFrame(`
      <rect x="192" y="142" width="152" height="212" rx="12" fill="url(#svcx-shield)" stroke="#ffffff18"/>
      <rect x="242" y="128" width="52" height="24" rx="7" fill="#1a212a" stroke="#ff4d168c"/>
      <g fill="none" stroke="#ffffff2a" stroke-width="1.6">
        <rect x="212" y="184" width="20" height="20" rx="5"/><rect x="212" y="234" width="20" height="20" rx="5"/><rect x="212" y="284" width="20" height="20" rx="5"/>
      </g>
      <rect x="212" y="184" width="20" height="20" rx="5" fill="none" stroke="#ff4d16" stroke-width="1.8"/>
      <path d="M216.5 194l3.5 3.5 6-7" stroke="#ff4d16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M246 194h74M246 244h74M246 294h50" stroke="#ffffff24" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="380" y="310" width="13" height="42" rx="3" fill="#ff4d1659"/>
      <rect x="404" y="286" width="13" height="66" rx="3" fill="#ff4d168c"/>
      <rect x="428" y="260" width="13" height="92" rx="3" fill="#ff4d16"/>
      <circle cx="116" cy="190" r="5" fill="#ff4d16"/>
      <path class="svcx-flow" d="M126 190h56" stroke="#ff4d16" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="116" cy="322" r="5" stroke="#8b949b" stroke-width="1.6"/>
      <path d="M126 322h44" stroke="#8b949b" stroke-width="1.6" stroke-linecap="round" opacity=".6"/>`)
  };

  const premiumDetail = (service) => {
    const benefits = service.premiumBenefits || service.benefits.slice(0, 3).map((benefit) => ({ icon: 'shield', ...benefit }));
    const supportDesk = service.supportDesk;
    const [claimFirst, ...claimRest] = service.headline.split('. ');
    const claim = claimRest.length
      ? `${escapeHtml(claimFirst)}. <span>${escapeHtml(claimRest.join('. '))}</span>`
      : escapeHtml(service.headline);
    const contactLabel = service.slug === 'suporte-tecnico' ? 'Abrir chamado' : 'Conversar com um especialista';
    const sceneFactory = premiumScenes[service.premiumScene] || premiumScenes.backup;
    const pabxHeroVisual = `
      <div class="pabx-hero-console" aria-label="Interface visual demonstrativa de telefonia empresarial">
        <div class="pabx-hero-console-head"><span class="pabx-hero-brand"><i></i> 3CX · CENTRAL DE COMUNICAÇÃO</span><span class="pabx-hero-console-state"><i></i> CENÁRIO ILUSTRATIVO</span></div>
        <div class="pabx-hero-console-body">
          <div class="pabx-hero-sidebar"><span class="pabx-hero-sidebar-mark">PS²</span><i class="pabx-hero-sidebar-icon pabx-hero-sidebar-icon--active">${premiumIcons.phone}</i><i class="pabx-hero-sidebar-icon">${premiumIcons.grid}</i><i class="pabx-hero-sidebar-icon">${premiumIcons.chart}</i></div>
          <div class="pabx-hero-workspace">
            <div class="pabx-hero-overview"><div><span class="mono">VISÃO GERAL</span><strong>Comunicação da equipe</strong></div><span class="pabx-hero-period">OPERAÇÃO · 3CX</span></div>
            <div class="pabx-hero-stat-grid"><div class="pabx-hero-stat pabx-hero-stat--call"><span class="mono">CHAMADAS ATIVAS</span><strong>12</strong><i>${premiumIcons.phone}</i></div><div class="pabx-hero-stat"><span class="mono">RAMAIS LIVRES</span><strong>08<span> / 10</span></strong><i>${premiumIcons.headset}</i></div><div class="pabx-hero-stat pabx-hero-stat--queue"><span class="mono">NA FILA</span><strong>03</strong><i>${premiumIcons.list}</i></div></div>
            <div class="pabx-hero-call-list"><div class="pabx-hero-list-head"><span class="mono">ATIVIDADE DE ATENDIMENTO</span><span class="mono">EXEMPLO VISUAL</span></div><div class="pabx-hero-call"><span class="pabx-hero-call-avatar">F</span><span><strong>Fila Financeiro</strong><small>Chamada direcionada</small></span><i class="pabx-hero-call-line"></i><span class="pabx-hero-call-time mono">00:42</span></div><div class="pabx-hero-call"><span class="pabx-hero-call-avatar pabx-hero-call-avatar--orange">V</span><span><strong>Vendas · Ramal 204</strong><small>Em atendimento</small></span><i class="pabx-hero-call-line"></i><span class="pabx-hero-call-time mono">02:18</span></div></div>
          </div>
        </div>
        <div class="pabx-hero-console-foot"><span><i></i> CENTRAL TELEFÔNICA EM NUVEM</span><span class="mono">PS² TECH / VOZ IP</span></div>
      </div>`;
    const heroVisual = service.slug === 'pabx-virtual' ? pabxHeroVisual : service.image
      ? `<img src="${escapeHtml(service.image)}" alt="" class="svcx-visual-img" loading="eager">`
      : sceneFactory();
    const visual = { status: 'SOLUÇÃO ATIVA', note: 'GESTÃO PROFISSIONAL', meta: 'PS² TECH', ...(service.premiumVisual || {}) };
    const kasperskySection = service.kaspersky ? `
      <section class="svcx-section kaspersky-section" id="protecao-ambientes-corporativos" aria-labelledby="kaspersky-title">
        <div class="kaspersky-intro">
          <p class="eyebrow"><i></i> Proteção para ambientes corporativos</p>
          <h2 id="kaspersky-title">Proteção corporativa com <span>Kaspersky</span></h2>
          <p class="kaspersky-subtitle">Soluções de segurança para proteger os dispositivos, os dados e a operação da sua empresa contra ameaças digitais.</p>
          <p class="kaspersky-description">${escapeHtml(service.kaspersky.introduction)}</p>
        </div>
        <div class="kaspersky-banner">
          <div class="kaspersky-banner-copy">
            <span class="kaspersky-brand">Kaspersky</span>
            <h3>${escapeHtml(service.kaspersky.bannerTitle)}</h3>
            <p>${escapeHtml(service.kaspersky.bannerText)}</p>
          </div>
          <a class="button" href="#kaspersky-products">Conheça nossas soluções <span>↓</span></a>
        </div>
        <div class="kaspersky-products-wrap" id="kaspersky-products" aria-labelledby="kaspersky-products-title">
          <div class="kaspersky-heading">
            <p class="eyebrow"><i></i> Portfólio Kaspersky</p>
            <h3 id="kaspersky-products-title">Soluções Kaspersky para diferentes necessidades<span>.</span></h3>
            <p>Conheça opções de proteção para pequenas empresas e organizações que precisam fortalecer sua segurança digital.</p>
          </div>
          <div class="kaspersky-products">
            ${service.kaspersky.products.map((product, index) => `<article class="kaspersky-product"><span class="kaspersky-product-index mono">0${index + 1}</span><span class="kaspersky-product-label">Kaspersky</span><h4>${escapeHtml(product.name)}</h4><p>${escapeHtml(product.text)}</p><a class="kaspersky-product-action" href="${serviceContactUrl(service)}">${escapeHtml(product.action)} <span>↗</span></a></article>`).join('')}
          </div>
          <p class="kaspersky-availability">Nomes e linhas conforme o portfólio atual da Kaspersky. Disponibilidade, recursos e condições são confirmados de acordo com a licença e a necessidade da empresa.</p>
        </div>
        <div class="kaspersky-benefits-wrap">
          <div class="kaspersky-heading">
            <p class="eyebrow"><i></i> Segurança para a operação</p>
            <h3>Mais proteção para a continuidade do seu negócio<span>.</span></h3>
          </div>
          <div class="kaspersky-benefits">
            ${service.kaspersky.benefits.map((benefit) => `<article class="kaspersky-benefit"><span class="kaspersky-benefit-icon" aria-hidden="true">${premiumIcons[benefit.icon] || premiumIcons.shield}</span><h4>${escapeHtml(benefit.title)}</h4><p>${escapeHtml(benefit.text)}</p></article>`).join('')}
          </div>
        </div>
        <div class="kaspersky-complementary">
          <div class="kaspersky-heading">
            <p class="eyebrow"><i></i> Atuação da PS² TECH</p>
            <h3>Segurança além do antivírus<span>.</span></h3>
            <p>A proteção corporativa envolve tecnologia, processos e acompanhamento. A PS² TECH pode apoiar sua empresa em diferentes frentes de infraestrutura e segurança de TI.</p>
          </div>
          <ul class="kaspersky-service-list">
            ${service.kaspersky.complementaryServices.map((item) => `<li><span aria-hidden="true">${premiumIcons.check}</span>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
      </section>` : '';
    const supportDeskSections = supportDesk ? `
      <section class="svcx-section supportdesk-intro" aria-labelledby="supportdesk-intro-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Service Desk</p><h2 id="supportdesk-intro-title">${escapeHtml(supportDesk.introTitle)}<span>.</span></h2></div>
        <div class="supportdesk-intro-copy">${supportDesk.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      </section>
      <section class="svcx-section supportdesk-solutions-section" id="supportdesk-solutions" aria-labelledby="supportdesk-solutions-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Soluções de Service Desk</p><h2 id="supportdesk-solutions-title">${escapeHtml(supportDesk.solutionsTitle)}<span>.</span></h2><p class="supportdesk-section-lead">${escapeHtml(supportDesk.solutionsDescription)}</p></div>
        <div class="supportdesk-solutions-grid">${supportDesk.solutions.map((solution) => `<article class="supportdesk-solution-card"><span class="svcx-card-icon" aria-hidden="true">${premiumIcons[solution.icon] || premiumIcons.tools}</span><h3>${escapeHtml(solution.title)}</h3><p>${escapeHtml(solution.text)}</p><a class="supportdesk-card-link" href="${serviceContactUrl(service)}">Fale com a equipe <span aria-hidden="true">↗</span></a></article>`).join('')}</div>
      </section>
      <section class="svcx-section supportdesk-benefits-section" aria-labelledby="supportdesk-benefits-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Apoio à operação</p><h2 id="supportdesk-benefits-title">${escapeHtml(supportDesk.benefitsTitle)}<span>.</span></h2></div>
        <div class="supportdesk-benefits-grid">${supportDesk.benefits.map((benefit) => `<article class="supportdesk-benefit-card"><span class="svcx-card-icon" aria-hidden="true">${premiumIcons[benefit.icon] || premiumIcons.check}</span><h3>${escapeHtml(benefit.title)}</h3><p>${escapeHtml(benefit.text)}</p></article>`).join('')}</div>
      </section>` : '';
    const connectivity = service.connectivity;
    const pabx3cx = service.slug === 'pabx-virtual';
    const pabxWhatsAppUrl = 'https://wa.me/551135008073?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20avalia%C3%A7%C3%A3o%20do%203CX.';
    const customServicePage = Boolean(connectivity || pabx3cx);
    const connectivitySections = connectivity ? `
      <section class="svcx-section custom-service-intro" aria-labelledby="connectivity-intro-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Conectividade empresarial</p><h2 id="connectivity-intro-title">${escapeHtml(connectivity.introTitle)}<span>.</span></h2></div>
        <div class="custom-service-copy">${connectivity.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
      </section>
      <section class="svcx-section" aria-labelledby="connectivity-infrastructure-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Infraestrutura</p><h2 id="connectivity-infrastructure-title">${escapeHtml(connectivity.infrastructureTitle)}<span>.</span></h2></div>
        <div class="custom-card-grid custom-card-grid--four">${connectivity.infrastructure.map((item) => `<article class="svcx-card"><span class="svcx-card-icon" aria-hidden="true">${premiumIcons[item.icon] || premiumIcons.network}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')}</div>
      </section>
      <section class="svcx-section" aria-labelledby="connectivity-differentiators-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Diferenciais</p><h2 id="connectivity-differentiators-title">${escapeHtml(connectivity.differentiatorsTitle)}<span>.</span></h2></div>
        <div class="custom-card-grid custom-card-grid--four">${connectivity.differentiators.map((item) => `<article class="svcx-card"><span class="svcx-card-icon" aria-hidden="true">${premiumIcons[item.icon] || premiumIcons.network}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')}</div>
      </section>
      <section class="svcx-section" id="connectivity-solutions" aria-labelledby="connectivity-solutions-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Soluções de conectividade</p><h2 id="connectivity-solutions-title">${escapeHtml(connectivity.solutionsTitle)}<span>.</span></h2><p class="custom-section-lead">${escapeHtml(connectivity.solutionsDescription)}</p></div>
        <div class="custom-card-grid custom-card-grid--three">${connectivity.solutions.map((solution) => `<article class="svcx-card custom-solution-card"><span class="svcx-card-icon" aria-hidden="true">${premiumIcons[solution.icon] || premiumIcons.network}</span><h3>${escapeHtml(solution.title)}</h3><p>${escapeHtml(solution.text)}</p><ul>${solution.benefits.map((benefit) => `<li><span aria-hidden="true">${premiumIcons.check}</span>${escapeHtml(benefit)}</li>`).join('')}</ul><a class="button" href="${serviceContactUrl(service)}">${escapeHtml(solution.action)} <span>↗</span></a></article>`).join('')}</div>
      </section>
      <section class="svcx-section" aria-labelledby="connectivity-audiences-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Aplicações</p><h2 id="connectivity-audiences-title">${escapeHtml(connectivity.audiencesTitle)}<span>.</span></h2></div>
        <ul class="custom-audience-grid">${connectivity.audiences.map((item) => `<li><span aria-hidden="true">${premiumIcons.check}</span>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
      <section class="svcx-section" aria-labelledby="connectivity-process-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Como funciona</p><h2 id="connectivity-process-title">${escapeHtml(connectivity.processTitle)}<span>.</span></h2></div>
        <ol class="svcx-steps">${connectivity.process.map((step, index) => `<li><span class="svcx-step-num">0${index + 1}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join('')}</ol>
        <p class="custom-service-note">${escapeHtml(connectivity.processNote)}</p>
      </section>` : '';
    const pabx = service.pabx || {};
    const pabxProductSection = pabx3cx ? `
      <section class="svcx-section pabx-product" id="pabx-3cx" aria-labelledby="pabx-3cx-title">
        <div class="pabx-product-copy">
          <p class="eyebrow"><i></i> Plataforma de comunica\u00e7\u00e3o empresarial</p>
          <h2 id="pabx-3cx-title">Conhe\u00e7a o <span>3CX</span></h2>
          <p>O 3CX re\u00fane telefonia IP e recursos de comunica\u00e7\u00e3o empresarial em uma plataforma integrada. Ramais, URA, filas, aplicativos para dispositivos compat\u00edveis, grava\u00e7\u00e3o, correio de voz, videoconfer\u00eancia e integra\u00e7\u00f5es podem compor a solu\u00e7\u00e3o, conforme a edi\u00e7\u00e3o, a configura\u00e7\u00e3o e o ambiente contratado.</p>
          <p class="pabx-product-note">A PS\u00b2 TECH ajuda a avaliar quais recursos fazem sentido para a estrutura e a rotina da sua empresa.</p>
          <a class="button" href="${pabxWhatsAppUrl}" target="_blank" rel="noopener noreferrer">Solicitar avalia\u00e7\u00e3o do 3CX <span aria-hidden="true">&#8599;</span></a>
        </div>
        <figure class="pabx-product-visual">
          <img src="/assets/images/hero/3cx.png" alt="Interface do 3CX em uma videoconfer\u00eancia empresarial" loading="lazy">
          <figcaption><strong>3CX</strong><span>Comunica\u00e7\u00e3o empresarial integrada</span></figcaption>
        </figure>
      </section>
` : '';
    const pabxSections = pabx3cx ? `

      <section class="svcx-section pabx-ia" id="pabx-ia" aria-labelledby="pabx-ia-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Inteligência artificial</p><h2 id="pabx-ia-title">${sectionTitle(pabx.ai?.title, 'Sua central mais inteligente')}<span>.</span></h2><p class="custom-section-lead">${escapeHtml(pabx.ai?.intro || '')}</p></div>
        <div class="pabx-ia-visual" role="group" aria-label="Demonstração ilustrativa de uma central telefônica inteligente">
          <div class="pabx-flow-panel">
            <div class="pabx-flow-top"><span class="pabx-flow-label mono">CENTRAL INTELIGENTE</span><span class="pabx-flow-demo mono"><i></i> DEMONSTRAÇÃO</span></div>
            <div class="pabx-audio-strip" aria-label="Visualização gráfica de áudio demonstrativo">
              <span class="pabx-audio-tag mono">VOZ · ENTRADA</span><span class="pabx-audio-wave" aria-hidden="true">${Array.from({ length: 31 }, (_, index) => `<i style="--bar:${[20, 34, 48, 27, 61, 38, 73, 46, 28, 56, 82, 43, 31, 67, 39, 91, 54, 32, 70, 45, 84, 36, 60, 29, 75, 48, 34, 63, 42, 78, 26][index]}%"></i>`).join('')}</span><span class="pabx-audio-caption">Processamento de voz ilustrativo</span>
            </div>
            <div class="pabx-flow-step pabx-flow-call"><span class="pabx-flow-icon">${premiumIcons.phone}</span><span class="pabx-flow-copy"><small>01 · CHAMADA RECEBIDA</small><strong>Entrada de chamada</strong></span><span class="pabx-flow-state pabx-flow-state--received">Recebida</span></div>
            <div class="pabx-flow-connector" aria-hidden="true"><i></i></div>
            <div class="pabx-flow-step pabx-flow-step--identify"><span class="pabx-flow-icon pabx-flow-icon--soft">${premiumIcons.clipboard}</span><span class="pabx-flow-copy"><small>02 · IA IDENTIFICA A SOLICITAÇÃO</small><strong>Segunda via de boleto</strong></span><span class="pabx-flow-check" aria-hidden="true">✓</span></div>
            <div class="pabx-flow-connector pabx-flow-connector--two" aria-hidden="true"><i></i></div>
            <div class="pabx-flow-step pabx-flow-step--route"><span class="pabx-flow-icon pabx-flow-icon--soft">${premiumIcons.grid}</span><span class="pabx-flow-copy"><small>03 · ENCAMINHAMENTO INTELIGENTE</small><strong>Departamento Financeiro</strong></span><span class="pabx-flow-route mono">FILA 02</span></div>
            <div class="pabx-flow-footer"><span class="pabx-flow-live"><i></i> 04 · STATUS</span><strong>Solicitação encaminhada</strong></div>
          </div>
        </div>
        <div class="pabx-ia-list">
          ${(pabx.ai?.resources || []).map((resource, index) => {
            const resourceIcons = [premiumIcons.headset, premiumIcons.clipboard, premiumIcons.list, premiumIcons.chart];
            return `<article class="pabx-ia-item"><div class="pabx-ia-item-top"><span class="mono pabx-ia-num">0${index + 1}</span><span class="pabx-ia-item-icon" aria-hidden="true">${resourceIcons[index] || premiumIcons.check}</span></div><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.text)}</p></article>`;
          }).join('')}
        </div>
      </section>
      <section class="svcx-section pabx-mcp" id="pabx-mcp" aria-labelledby="pabx-mcp-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Integração MCP</p><h2 id="pabx-mcp-title">${sectionTitle(pabx.mcp?.title, 'Converse com sua central')}<span>.</span></h2><p class="custom-section-lead">${escapeHtml(pabx.mcp?.intro || '')}</p></div>
        <div class="pabx-mcp-wrap">
          <div class="pabx-mcp-architecture" role="group" aria-label="Fluxo ilustrativo: assistente de IA, camada MCP, ferramentas autorizadas e PABX 3CX">
            <article class="pabx-mcp-node pabx-mcp-node--ai">
              <span class="pabx-mcp-node-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M8 10h8M8 13.5h5"/></svg></span>
              <div><span class="mono pabx-mcp-node-kicker">ASSISTENTE DE IA</span><h3>Claude ou ChatGPT</h3><p>Exemplos de ferramentas compatíveis</p></div>
            </article>
            <span class="pabx-mcp-connector" aria-hidden="true"><i></i></span>
            <article class="pabx-mcp-node pabx-mcp-node--mcp">
              <span class="pabx-mcp-node-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="16" height="6" rx="1.5"/><rect x="4" y="14.5" width="16" height="6" rx="1.5"/><path d="M7.5 6.5h.01M7.5 17.5h.01M11 6.5h5M11 17.5h5M12 9.5v5"/></svg></span>
              <div><span class="mono pabx-mcp-node-kicker">CAMADA DE INTEGRAÇÃO</span><h3>Servidor MCP</h3><p>Comunicação e acesso às ferramentas autorizadas</p></div>
            </article>
            <span class="pabx-mcp-connector" aria-hidden="true"><i></i></span>
            <article class="pabx-mcp-node pabx-mcp-node--tools">
              <span class="pabx-mcp-node-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7h11M8 12h11M8 17h11"/><circle cx="4.5" cy="7" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17" r="1"/></svg></span>
              <div><span class="mono pabx-mcp-node-kicker">ESCOPO CONTROLADO</span><h3>Ferramentas autorizadas</h3><p>Consultas permitidas pela configuração</p></div>
            </article>
            <span class="pabx-mcp-connector" aria-hidden="true"><i></i></span>
            <article class="pabx-mcp-node pabx-mcp-node--pabx">
              <span class="pabx-mcp-node-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h11A2.5 2.5 0 0 1 20 6v12a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18V6a2.5 2.5 0 0 1 2.5-2.5Z"/><path d="M8 7.5h8M8 11.5h8M8 15.5h4"/></svg></span>
              <div><span class="mono pabx-mcp-node-kicker">ORIGEM DOS DADOS</span><h3>PABX 3CX</h3><p>Informações disponibilizadas pela integração</p></div>
            </article>
            <p class="pabx-mcp-access-note"><span aria-hidden="true">${premiumIcons.shield}</span><span><strong>Acesso controlado</strong> · As consultas dependem das ferramentas habilitadas, das permissões e da configuração da integração.</span></p>
          </div>
          <div class="pabx-mcp-demo">
            <div class="pabx-mcp-console-head"><div><span class="mono pabx-mcp-console-kicker">CONSOLE DE CONSULTA</span><h3>Explore uma consulta</h3></div><span class="pabx-mcp-demo-label mono"><i></i> SIMULAÇÃO · DADOS FICTÍCIOS</span></div>
            <div class="pabx-mcp-questions" role="group" aria-label="Perguntas de demonstração">
              ${(pabx.mcp?.questions || []).map((q, index) => `<button type="button" class="pabx-mcp-q${index === 0 ? ' pabx-mcp-q--active' : ''}" data-question="${escapeHtml(q.q)}" data-answer="${escapeHtml(q.a)}" aria-pressed="${index === 0 ? 'true' : 'false'}"><span>${escapeHtml(q.q)}</span><i aria-hidden="true">↗</i></button>`).join('')}
            </div>
            <div class="pabx-mcp-transcript" aria-live="polite" aria-atomic="true">
              <div class="pabx-mcp-user-message"><span class="mono">CONSULTA</span><p id="pabx-mcp-selected-question"></p></div>
              <div class="pabx-mcp-answer"><span class="pabx-mcp-answer-mark" aria-hidden="true">M</span><div><span class="mono pabx-mcp-answer-label">RESPOSTA ILUSTRATIVA</span><p class="pabx-mcp-answer-text" id="pabx-mcp-answer-text"></p></div></div>
            </div>
            <p class="pabx-mcp-note mono">Sem conexão a um servidor ou PABX real.</p>
          </div>
        </div>
      </section>
      <section class="svcx-section pabx-grafana" id="pabx-grafana" aria-labelledby="pabx-grafana-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Monitoramento</p><h2 id="pabx-grafana-title">${sectionTitle(pabx.grafana?.title, 'Sua operação em uma visão')}<span>.</span></h2><p class="custom-section-lead">${escapeHtml(pabx.grafana?.intro || '')}</p></div>
        <div class="pabx-grafana-demo" role="group" aria-label="Dashboard demonstrativo com indicadores fictícios de chamadas, fila, agentes e latência">
          <div class="pabx-grafana-panel">
            <div class="pabx-grafana-header"><span class="mono pabx-grafana-panel-title">3CX · Visão operacional</span><span class="mono pabx-grafana-panel-demo"><i></i> DADOS FICTÍCIOS</span></div>
            <div class="pabx-grafana-metrics">
              <div class="pabx-grafana-metric pabx-grafana-metric--primary"><span class="mono pabx-grafana-metric-label">Chamadas ativas</span><span class="mono pabx-grafana-metric-value">12</span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--primary"><span class="mono pabx-grafana-metric-label">Na fila</span><span class="mono pabx-grafana-metric-value">03</span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--primary"><span class="mono pabx-grafana-metric-label">Agentes disponíveis</span><span class="mono pabx-grafana-metric-value">08<span class="pabx-grafana-metric-unit"> / 10</span></span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--primary"><span class="mono pabx-grafana-metric-label">Atendimento</span><span class="mono pabx-grafana-metric-value pabx-grafana-metric-ok">Ativo</span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--secondary"><span class="mono pabx-grafana-metric-label">Chamadas hoje</span><span class="mono pabx-grafana-metric-value">148</span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--secondary"><span class="mono pabx-grafana-metric-label">Perdidas</span><span class="mono pabx-grafana-metric-value pabx-grafana-metric-warn">02</span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--secondary"><span class="mono pabx-grafana-metric-label">Espera média</span><span class="mono pabx-grafana-metric-value">00:42</span></div>
              <div class="pabx-grafana-metric pabx-grafana-metric--secondary"><span class="mono pabx-grafana-metric-label">Latência</span><span class="mono pabx-grafana-metric-value">18<span class="pabx-grafana-metric-unit"> ms</span></span></div>
            </div>
            <div class="pabx-grafana-chart-wrap" aria-hidden="true">
              <div class="pabx-grafana-chart-head"><span class="mono">Volume de chamadas</span><span class="mono">ÚLTIMAS 5 HORAS</span></div>
              <div class="pabx-grafana-chart">
                <div class="pabx-grafana-bar" style="--bar-height:38%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:56%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:45%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:72%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:61%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:49%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:83%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:67%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:54%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:76%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:59%"></div>
                <div class="pabx-grafana-bar" style="--bar-height:42%"></div>
              </div>
              <div class="pabx-grafana-axis mono"><span>09h</span><span>10h</span><span>11h</span><span>12h</span><span>13h</span></div>
            </div>
          </div>
        </div>
        <p class="pabx-grafana-note mono">${escapeHtml(pabx.grafana?.demoNote || '')}</p>
      </section>
      <section class="svcx-section pabx-essentials" id="pabx-essentials" aria-labelledby="pabx-essentials-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Recursos do 3CX</p><h2 id="pabx-essentials-title">${sectionTitle(pabx.essentials?.title, 'Telefonia completa. Gest\u00e3o simplificada')}<span>.</span></h2><p class="custom-section-lead">Recursos dispon\u00edveis conforme a edi\u00e7\u00e3o contratada, a configura\u00e7\u00e3o e a compatibilidade com o ambiente.</p></div>
        <div class="pabx-essentials-grid">
          ${(pabx.essentials?.items || []).map((item, index) => {
            const icons = [premiumIcons.list, premiumIcons.clipboard, premiumIcons.phone, premiumIcons.grid, premiumIcons.link];
            return `<article class="pabx-essential${index === 0 ? ' pabx-essential--featured' : ''}"><span class="pabx-essential-icon" aria-hidden="true">${icons[index] || premiumIcons.check}</span><span class="pabx-essential-index mono" aria-hidden="true">0${index + 1}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div></article>`;
          }).join('')}
        </div>
      </section>
      <section class="svcx-section pabx-deployment" id="pabx-deployment" aria-labelledby="pabx-deployment-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Implanta\u00e7\u00e3o 3CX pela PS? TECH</p><h2 id="pabx-deployment-title">${sectionTitle(pabx.deployment?.title, 'Do planejamento \u00e0 opera\u00e7\u00e3o, com a PS? TECH')}<span>.</span></h2><p class="custom-section-lead">${escapeHtml(pabx.deployment?.intro || '')}</p></div>
        <ol class="pabx-deployment-steps">
          ${(pabx.deployment?.steps || []).map((step, index) => `<li><span class="mono pabx-deployment-num">0${index + 1}</span><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div></li>`).join('')}
        </ol>
      </section>
      <section class="svcx-section pabx-faq" id="pabx-faq" aria-labelledby="pabx-faq-title">
        <div class="svcx-head"><p class="eyebrow"><i></i> Perguntas frequentes</p><h2 id="pabx-faq-title">FAQ<span>.</span></h2></div>
        <div class="pabx-faq-list">
          ${(pabx.faq || []).map((item, index) => `<details class="pabx-faq-item"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')}
        </div>
      </section>
      <section class="svcx-cta pabx-cta" id="pabx-cta">
        <div>
          <p class="eyebrow"><i></i> Próximo passo</p>
          <h2>${sectionTitle(service.ctaTitle, 'Vamos conversar')}<span>.</span></h2>
          <p>${escapeHtml(service.ctaText)}</p>
        </div>
        <a class="button" href="${pabxWhatsAppUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(service.ctaLabel || 'Solicitar avaliação gratuita')} <span>↗</span></a>
      </section>` : '';
    return `
    <div class="service-detail-wrap service-premium${supportDesk ? ' service-premium--supportdesk' : ''}${connectivity ? ' service-premium--connectivity' : ''}${pabx3cx ? ' service-premium--pabx' : ''}">
      <nav class="service-breadcrumb" aria-label="Você está em">
        <a href="/">Início</a><span aria-hidden="true">/</span><a href="/servicos/">Serviços</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(service.title)}</span>
      </nav>
      ${pabxProductSection}
      <section class="svcx-hero">
        <div class="svcx-hero-copy">
          <p class="svcx-chip"><i aria-hidden="true"></i>${escapeHtml(service.category)}</p>
          <h1>${escapeHtml(supportDesk?.heroTitle || connectivity?.heroTitle || (pabx3cx ? service.headline : service.title))}</h1>
          ${customServicePage ? '' : `<p class="svcx-claim">${claim}</p>`}
          <p class="svcx-lead">${escapeHtml(supportDesk?.heroDescription || connectivity?.heroDescription || service.description)}</p>
          <div class="svcx-actions">
            ${supportDesk ? `<a class="button" href="#supportdesk-solutions">Conheça nossas soluções <span>↓</span></a><a class="svcx-ghost" href="${supportDesk.ctaUrl}">Fale com um especialista <span>↗</span></a>` : pabx3cx ? `<a class="button" href="${pabxWhatsAppUrl}" target="_blank" rel="noopener noreferrer">Solicitar avalia\u00e7\u00e3o do 3CX <span>↗</span></a><a class="svcx-ghost" href="#pabx-ia">Explorar recursos de IA <span>↓</span></a>` : customServicePage ? `<a class="button" href="#connectivity-solutions">Conheça nossas soluções <span>↓</span></a><a class="svcx-ghost" href="${serviceContactUrl(service)}">Solicitar orçamento <span>↗</span></a>` : `<a class="button" href="${serviceContactUrl(service)}">${contactLabel} <span>↗</span></a><a class="svcx-ghost" href="#svcx-processo">Ver como funciona <span>↓</span></a>`}
          </div>
        </div>
        <div class="svcx-visual${pabx3cx ? ' svcx-visual--pabx' : service.image ? ' svcx-visual--img' : ''}" aria-hidden="true">
          ${heroVisual}
          <span class="svcx-visual-tag svcx-tag-tl mono">PS² / ${escapeHtml(service.slug.toUpperCase().replace(/-/g, ' '))}</span>
          <span class="svcx-visual-tag svcx-tag-tr mono svcx-dot-ok"><i></i>${escapeHtml(visual.status)}</span>
          <span class="svcx-visual-tag svcx-tag-bl mono svcx-dot-orange"><i></i>${escapeHtml(visual.note)}</span>
          <span class="svcx-visual-tag svcx-tag-br mono">${escapeHtml(visual.meta)}</span>
        </div>
      </section>
      ${supportDesk || pabx3cx ? '' : customServicePage ? '' : `<section class="svcx-section" aria-labelledby="svcx-benefits-title">
        <div class="svcx-head">
          <p class="eyebrow"><i></i> Benefícios do serviço</p>
          <h2 id="svcx-benefits-title">${escapeHtml(service.premiumBenefitsTitle || 'Como este serviço apoia a sua operação')}<span>.</span></h2>
        </div>
        <div class="svcx-benefit-grid">
          ${benefits.map((benefit) => `<article class="svcx-card"><span class="svcx-card-icon" aria-hidden="true">${premiumIcons[benefit.icon] || premiumIcons.shield}</span><h3>${escapeHtml(benefit.title)}</h3><p>${escapeHtml(benefit.text)}</p></article>`).join('')}
        </div>
      </section>`}
      ${!supportDesk && !customServicePage && service.process.length ? `<section class="svcx-section" id="svcx-processo" aria-labelledby="svcx-process-title">
        <div class="svcx-head">
          <p class="eyebrow"><i></i> Como a PS² TECH trabalha</p>
          <h2 id="svcx-process-title">${escapeHtml(service.premiumProcessTitle || 'Como funciona')}<span>.</span></h2>
        </div>
        <ol class="svcx-steps">
          ${service.process.map((step, index) => `<li><span class="svcx-step-num">0${index + 1}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join('')}
        </ol>
      </section>` : ""}
      ${supportDesk || customServicePage ? '' : `<section class="svcx-section" aria-labelledby="svcx-scope-title">
        <div class="svcx-scope">
          <div class="svcx-scope-intro">
            <p class="eyebrow"><i></i> Informações do serviço</p>
            <h2 id="svcx-scope-title">O que está incluso no serviço<span>.</span></h2>
            <p class="svcx-scope-lead">${escapeHtml(service.overview)}</p>
            ${service.audience || service.businessProblem ? `<div class="svcx-context-grid">${service.audience ? `<div class="svcx-context"><p class="svcx-context-label mono">Indicado para</p><p>${escapeHtml(service.audience)}</p></div>` : ""}${service.businessProblem ? `<div class="svcx-context"><p class="svcx-context-label mono">O desafio</p><p>${escapeHtml(service.businessProblem)}</p></div>` : ""}</div>` : ""}
          </div>
          ${service.offers.length ? `<ul class="svcx-list">
            ${service.offers.map((item) => `<li><span class="svcx-list-icon" aria-hidden="true">${premiumIcons.check}</span>${escapeHtml(item)}</li>`).join('')}
          </ul>` : ""}
        </div>
      </section>`}
      ${supportDeskSections}
      ${connectivitySections}
      ${pabxSections}
      ${kasperskySection}
      ${pabx3cx ? '' : `<section class="svcx-cta">
        <div>
          <p class="eyebrow"><i></i> Próximo passo</p>
          <h2>${escapeHtml(supportDesk?.ctaTitle || connectivity?.ctaTitle || service.kaspersky?.ctaTitle || service.ctaTitle)}</h2>
          <p>${escapeHtml(supportDesk?.ctaText || connectivity?.ctaText || service.kaspersky?.ctaText || service.ctaText)}</p>
        </div>
        <a class="button" href="${supportDesk?.ctaUrl || serviceContactUrl(service)}">${supportDesk?.ctaLabel || connectivity?.ctaLabel || (service.kaspersky ? 'Solicitar uma avaliação' : pabx3cx ? 'Solicitar avaliação' : contactLabel)} <span>↗</span></a>
      </section>`}
    </div>`;
  };

  const detailRoot = document.querySelector('[data-service-detail]');
  if (!detailRoot) return;

  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments[pathSegments.length - 1] === 'index.html') pathSegments.pop();
  const rawSlug = detailRoot.dataset.serviceSlug || pathSegments[pathSegments.length - 1];
  const slug = rawSlug === 'suporte-tecnico-empresarial' ? 'suporte-tecnico' : rawSlug;
  const service = catalog.services.find((item) => item.slug === slug);

  if (!service) {
    detailRoot.innerHTML = '<section class="service-not-found"><p class="eyebrow"><i></i> Serviços</p><h1>Não encontramos esse serviço.</h1><a class="button" href="/servicos/">Ver todos os serviços <span>↗</span></a></section>';
    return;
  }

  const canonicalUrl = `https://ps2tech.com.br${serviceUrl(service)}`;
  let descriptionMeta = document.querySelector('meta[name="description"]');
  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta');
    descriptionMeta.name = 'description';
    document.head.append(descriptionMeta);
  }
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  const setMeta = (property, value) => {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.append(meta);
    }
    meta.content = value;
  };

  document.title = service.seoTitle;
  descriptionMeta?.setAttribute('content', service.seoDescription);
  canonical?.setAttribute('href', canonicalUrl);
  setMeta('og:title', service.seoTitle);
  setMeta('og:description', service.seoDescription);
  setMeta('og:url', canonicalUrl);

  detailRoot.innerHTML = service.premiumLayout
    ? premiumDetail(service)
    : `
    <div class="service-detail-wrap">
      <nav class="service-breadcrumb" aria-label="Você está em">
        <a href="/">Início</a><span aria-hidden="true">/</span><a href="/servicos/">Serviços</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(service.title)}</span>
      </nav>
      <section class="service-detail-hero">
        <div class="service-detail-copy">
          <p class="eyebrow"><i></i> ${escapeHtml(service.category)}</p>
          <h1>${escapeHtml(service.title)}</h1>
          <p class="service-detail-claim">${escapeHtml(service.headline)}</p>
          <p class="service-detail-lead">${escapeHtml(service.detailIntro)}</p>
          <a class="button" href="${serviceContactUrl(service)}">${service.slug === 'suporte-tecnico' ? 'Solicitar suporte' : 'Conversar sobre este serviço'} <span>↗</span></a>
        </div>
        <div class="service-detail-art" aria-hidden="true">
          <div class="service-art-grid"></div>
          <div class="service-art-ring service-art-ring-one"></div>
          <div class="service-art-ring service-art-ring-two"></div>
          <div class="service-art-icon">${service.image ? `<img class="service-art-image" src="${escapeHtml(service.image)}" alt="" loading="lazy">` : service.icon}</div>
          <span class="service-art-code mono">PS² / ${escapeHtml(service.slug.toUpperCase())}</span>
          <span class="service-art-status mono"><i></i> SOLUÇÃO ATIVA</span>
          <span class="service-art-index mono">01—09</span>
        </div>
      </section>

      <section class="service-detail-overview" aria-labelledby="service-overview-title">
        <div class="service-section-label"><span class="mono">01 / VISÃO GERAL</span><i></i></div>
        <div class="service-overview-copy"><p class="mono">O SERVIÇO</p><h2 id="service-overview-title">Como este serviço apoia sua operação.</h2><p>${escapeHtml(service.overview)}</p></div>
        ${service.audience || service.businessProblem ? `<div class="service-challenges">${service.audience ? `<div class="service-context-block"><p class="mono">INDICADO PARA</p><p class="service-context">${escapeHtml(service.audience)}</p></div>` : ""}${service.businessProblem ? `<div class="service-context-block"><p class="mono">PROBLEMA EMPRESARIAL</p><p class="service-context">${escapeHtml(service.businessProblem)}</p></div>` : ""}</div>` : ""}
      </section>

      ${service.offers.length ? `<section class="service-offer" aria-labelledby="service-offer-title">
        <div class="service-section-heading"><p class="eyebrow"><i></i> Escopo do serviço</p><h2 id="service-offer-title">O que oferecemos<span>.</span></h2></div>
        <div class="service-offer-list">${service.offers.map((item, index) => `<article class="service-offer-item"><span class="mono">0${index + 1}</span><h3>${escapeHtml(item)}</h3><i aria-hidden="true">↗</i></article>`).join('')}</div>
      </section>` : ""}

      ${service.benefits.length ? `<section class="service-benefits" aria-labelledby="service-benefits-title">
        <div class="service-section-heading"><p class="eyebrow"><i></i> Impacto para a empresa</p><h2 id="service-benefits-title">Benefícios para sua operação<span>.</span></h2></div>
        <div class="service-benefit-grid">${service.benefits.map((benefit, index) => `<article class="service-benefit"><span class="mono">0${index + 1}</span><h3>${escapeHtml(benefit.title)}</h3><p>${escapeHtml(benefit.text)}</p></article>`).join('')}</div>
      </section>` : ""}

      ${service.process.length ? `<section class="service-process" aria-labelledby="service-process-title">
        <div class="service-section-heading"><p class="eyebrow"><i></i> Do primeiro contato ao acompanhamento</p><h2 id="service-process-title">Como funciona<span>.</span></h2></div>
        <ol class="service-process-list">${service.process.map((step, index) => `<li><span class="mono">0${index + 1}</span><div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div></li>`).join('')}</ol>
      </section>` : ""}

      ${service.features && service.features.length ? `<section class="service-features" aria-labelledby="service-features-title">
        <div class="service-section-heading"><p class="eyebrow"><i></i> Recursos do serviço</p><h2 id="service-features-title">O que a plataforma oferece<span>.</span></h2></div>
        <div class="service-feature-grid">${service.features.map((feature, index) => `<article class="service-feature-card"><span class="mono">0${index + 1}</span><h3>${escapeHtml(feature.title)}</h3><p>${escapeHtml(feature.text)}</p></article>`).join('')}</div>
      </section>` : ""}

      <section class="service-detail-cta">
        <div><p class="eyebrow"><i></i> Próximo passo</p><h2>${escapeHtml(service.ctaTitle)}</h2><p>${escapeHtml(service.ctaText)}</p></div>
        <a class="button" href="${serviceContactUrl(service)}">${service.slug === 'suporte-tecnico' ? 'Abrir chamado' : 'Falar com um especialista'} <span>↗</span></a>
      </section>
    </div>`;

  if (slug === 'pabx-virtual') {
    const answer = detailRoot.querySelector('#pabx-mcp-answer-text');
    const selectedQuestion = detailRoot.querySelector('#pabx-mcp-selected-question');
    const questions = detailRoot.querySelectorAll('.pabx-mcp-q');
    const firstQuestion = questions[0];
    if (firstQuestion) {
      if (answer) answer.textContent = firstQuestion.dataset.answer || '';
      if (selectedQuestion) selectedQuestion.textContent = firstQuestion.dataset.question || '';
    }
    questions.forEach((question) => {
      question.addEventListener('click', () => {
        if (answer) answer.textContent = question.dataset.answer || '';
        if (selectedQuestion) selectedQuestion.textContent = question.dataset.question || '';
        questions.forEach((item) => {
          const active = item === question;
          item.classList.toggle('pabx-mcp-q--active', active);
          item.setAttribute('aria-pressed', String(active));
        });
      });
    });
  }
})();
