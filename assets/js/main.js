(() => {
  const cleanRoutes = {
    'buyer-development.html': '/buyer-development/',
    'international-markets.html': '/international-markets/',
    'bangladesh-market-entry.html': '/bangladesh-market-entry/',
    'industries.html': '/industries/',
    'how-we-work.html': '/how-we-work/',
    'about.html': '/about/',
    'contact.html': '/contact/',
    'packages.html': '/packages/',
    'privacy.html': '/privacy/',
    'terms.html': '/terms/',
    'global-buyer-pilot.html': '/global-buyer-pilot.html'
  };

  const currentFile = window.location.pathname.split('/').pop();
  if (cleanRoutes[currentFile]) {
    history.replaceState(null, '', cleanRoutes[currentFile] + window.location.search + window.location.hash);
  }

  // Resolve relative links from the site root. Clean Jekyll routes (e.g. /packages/)
  // otherwise turn contact.html?package=... into /packages/contact.html?package=...
  // and lose qualified enquiries.
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('//') ||
        /^[a-z][a-z0-9+.-]*:/i.test(href)) return;
    const url = new URL(href, window.location.origin + '/');
    const path = url.pathname.replace(/^\//, '');
    const route = path === 'index.html' ? '/' : cleanRoutes[path];
    if (route) link.setAttribute('href', route + url.search + url.hash);
    else if (path.endsWith('.html')) link.setAttribute('href', '/' + path + url.search + url.hash);
  });

  // Carry opted-in campaign URL labels across our own pilot/contact pages, without cookies.
  const campaign = new URLSearchParams(window.location.search);
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  if (campaignKeys.some(key => campaign.has(key))) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|https?:\/\/(?!mercopact\.com))/i.test(href)) return;
      const target = new URL(href, window.location.origin);
      if (target.origin !== window.location.origin ||
          !/^\/(contact\/|global-buyer-pilot\.html|international-markets\/)/.test(target.pathname)) return;
      for (const key of campaignKeys) {
        const value = campaign.get(key);
        if (value && /^[a-zA-Z0-9 _.-]{1,80}$/.test(value) && !target.searchParams.has(key))
          target.searchParams.set(key, value);
      }
      link.setAttribute('href', target.pathname + target.search + target.hash);
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const headerCta = document.querySelector('.header-cta');
  const siteHeader = document.querySelector('.site-header');

  if (menuToggle && nav) {
    const setMenu = (open) => {
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('is-open', open);
      if (headerCta) headerCta.classList.toggle('is-open', open);
      if (siteHeader) siteHeader.classList.toggle('menu-open', open);
    };

    menuToggle.addEventListener('click', () => {
      setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
      }
    });
  }

  const normalizedPath = window.location.pathname.replace(/\/index\.html$/, '/');
  document.querySelectorAll('.site-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === normalizedPath) link.setAttribute('aria-current', 'page');
  });

  const reveals = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }
})();

// Public MERCOPACT phone contact. Added at runtime so the number appears consistently across static pages.
(() => {
  const phoneHref = 'tel:+8801793122369';
  const phoneLabel = '+880 1793-122369';

  document.querySelectorAll('.site-footer .footer-label').forEach((label) => {
    if (label.textContent.trim().toLowerCase() !== 'contact') return;
    const links = label.parentElement?.querySelector('.footer-links');
    if (!links || links.querySelector(`a[href="${phoneHref}"]`)) return;
    const phone = document.createElement('a');
    phone.href = phoneHref;
    phone.textContent = phoneLabel;
    const partnership = links.querySelector('a[href^="mailto:partnerships@"]');
    if (partnership) partnership.insertAdjacentElement('afterend', phone);
    else links.appendChild(phone);
  });

  const compactFooter = document.querySelector('.site-footer .footer-legal');
  if (compactFooter && !compactFooter.querySelector(`a[href="${phoneHref}"]`) && !document.querySelector('.site-footer .footer-label')) {
    const phone = document.createElement('a');
    phone.href = phoneHref;
    phone.textContent = phoneLabel;
    compactFooter.prepend(phone);
  }
})();
