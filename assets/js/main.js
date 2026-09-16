(() => {
  const cleanRoutes = {
    'buyer-development.html': '/buyer-development/',
    'international-markets.html': '/international-markets/',
    'bangladesh-market-entry.html': '/bangladesh-market-entry/',
    'industries.html': '/industries/',
    'how-we-work.html': '/how-we-work/',
    'about.html': '/about/',
    'contact.html': '/contact/',
    'buyer-growth.html': '/buyer-growth/',
    'privacy.html': '/privacy/',
    'terms.html': '/terms/'
  };

  const currentFile = window.location.pathname.split('/').pop();
  if (cleanRoutes[currentFile]) {
    history.replaceState(null, '', cleanRoutes[currentFile] + window.location.search + window.location.hash);
  }

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (cleanRoutes[href]) link.setAttribute('href', cleanRoutes[href]);
    if (href === 'index.html') link.setAttribute('href', '/');
  });

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

// Public Mercopact phone contact. Added at runtime so the number appears consistently across static pages.
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
