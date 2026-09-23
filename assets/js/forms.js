/*
  MERCOPACT STATIC FORM CONFIGURATION
  -----------------------------------
  GitHub Pages has no server-side form handler.
  Set FORM_ENDPOINT to a valid Formspree/Web3Forms-compatible endpoint to submit in-page.
  Leave it blank to use the documented email fallback.
*/
const FORM_ENDPOINT = '';

(() => {
  const params = new URLSearchParams(window.location.search);
  const requestedPackage = params.get('package');
  const packageMap = {
    'market-proof': 'Export Market Proof — ৳34,900 one-time',
    'buyer-development': 'Buyer Development System — ৳64,900/month',
    'growth-desk': 'Export Growth Desk — ৳109,900/month'
  };
  const packageSelect = document.querySelector('#package');
  if (packageSelect && requestedPackage && packageMap[requestedPackage]) {
    packageSelect.value = packageMap[requestedPackage];
  }

  const forms = document.querySelectorAll('form[data-static-form]');
  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      const submit = form.querySelector('[type="submit"]');
      const fallbackEmail = form.dataset.fallbackEmail || 'hello@mercopact.com';

      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const subject = form.dataset.subject || 'Mercopact website enquiry';

      if (!FORM_ENDPOINT) {
        const lines = [];
        data.forEach((value, key) => {
          if (String(value).trim()) lines.push(`${key}: ${value}`);
        });
        const href = `mailto:${encodeURIComponent(fallbackEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
        if (status) status.textContent = 'Opening your email app to complete the enquiry.';
        window.location.href = href;
        return;
      }

      try {
        submit.disabled = true;
        if (status) status.textContent = 'Sending…';
        const response = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Form submission failed');
        form.reset();
        if (status) status.textContent = 'Thank you. Your enquiry has been sent.';
      } catch (error) {
        if (status) status.textContent = `The form could not send automatically. Please email ${fallbackEmail}.`;
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
