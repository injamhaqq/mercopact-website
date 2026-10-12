/*
  MERCOPACT — STATIC WEBSITE SUBMISSION ROUTING
  Provider: FormSubmit.co (https://formsubmit.co/documentation)
  This service requires ONE-TIME recipient confirmation in hello@mercopact.com.
  A HTTP 200 is NOT proof that delivery succeeded; success must be literal true.
  No CRM storage, private keys, Formspree account or silent emails are implied.
  For non-JS users, form[action] uses the provider's normal form POST.
*/
const FORM_AJAX_ENDPOINT = 'https://formsubmit.co/ajax/hello@mercopact.com';

(() => {
  const params = new URLSearchParams(window.location.search);
  const requestedPackage = params.get('package');
  const packageMap = {
    'market-proof': 'Export Market Proof — ৳34,900 one-time',
    'international-pilot': 'International Buyer Development Pilot — scoped proposal',
    'buyer-development': 'Buyer Development System — ৳64,900/month',
    'growth-desk': 'Export Growth Desk — ৳109,900/month'
  };
  const packageSelect = document.querySelector('#package');
  if (packageSelect && requestedPackage && packageMap[requestedPackage]) {
    packageSelect.value = packageMap[requestedPackage];
  }

  document.querySelectorAll('form[data-static-form]').forEach((form) => {
    // Construct the fallback panel ONCE; repeated failed attempts must not
    // duplicate controls or create misleading stacks of stale draft links.
    const status = form.querySelector('.form-status');
    const recovery = document.createElement('div');
    recovery.className = 'mc-recovery';
    recovery.setAttribute('role', 'region');
    recovery.setAttribute('aria-label', 'Other ways to send this enquiry');
    const recoveryIntro = document.createElement('p');
    recoveryIntro.textContent = 'Prefer direct contact? We can prefill WhatsApp or email from this form. Review the message and press Send yourself.';
    const recoveryWhatsApp = document.createElement('a');
    recoveryWhatsApp.target = '_blank';
    recoveryWhatsApp.rel = 'noopener noreferrer';
    recoveryWhatsApp.textContent = 'Continue in WhatsApp →';
    const recoveryEmail = document.createElement('a');
    recoveryEmail.textContent = 'Continue by email →';
    recovery.append(recoveryIntro, recoveryWhatsApp, recoveryEmail);
    if (status) status.insertAdjacentElement('afterend', recovery);
    else form.appendChild(recovery);

    const refreshRecoveryLinks = () => {
      const lines = ['MERCOPACT — website enquiry (not yet submitted)', ''];
      for (const [key, value] of new FormData(form).entries()) {
        if (key.startsWith('_') || !String(value).trim()) continue;
        lines.push(key + ': ' + String(value).trim().slice(0, 320));
      }
      const draft = lines.join('\\n').slice(0, 1750);
      recoveryWhatsApp.href = 'https://wa.me/8801793122369?text=' + encodeURIComponent(draft);
      recoveryEmail.href = 'mailto:hello@mercopact.com?subject=' +
        encodeURIComponent('MERCOPACT buyer development enquiry') + '&body=' + encodeURIComponent(draft);
    };
    const showRecovery = () => {
      refreshRecoveryLinks();
      recoveryIntro.textContent = 'Online submission could not be confirmed. Your details remain in the form; use either direct option below to finish sending the enquiry.';
      recovery.classList.add('is-visible');
    };
    const hideRecovery = () => {
      recovery.classList.remove('is-visible');
      recoveryIntro.textContent = 'Prefer direct contact? We can prefill WhatsApp or email from this form. Review the message and press Send yourself.';
      refreshRecoveryLinks();
    };
    form.addEventListener('input', refreshRecoveryLinks);
    form.addEventListener('change', refreshRecoveryLinks);
    refreshRecoveryLinks();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submit = form.querySelector('[type="submit"]');
      const setStatus = (message, ok = false) => {
        if (!status) return;
        status.textContent = message;
        status.setAttribute('role', ok ? 'status' : 'alert');
        status.style.color = ok ? '#0F766E' : '#8A3A19';
      };

      // Honeypot failures are intentionally not sent to the provider.
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value.trim()) {
        setStatus('This request could not be processed. Please contact hello@mercopact.com.');
        return;
      }

      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      payload.name = data.get('Name') || '';
      payload.email = data.get('email') || data.get('Business email') || '';
      payload._replyto = payload.email;
      payload._subject = form.dataset.subject || 'MERCOPACT website enquiry';
      payload._url = window.location.href;
      payload._honey = '';
      const originalMarkup = submit ? submit.innerHTML : '';

      try {
        if (submit) { submit.disabled = true; submit.textContent = 'Sending enquiry…'; }
        hideRecovery();
        setStatus('Submitting your enquiry…', true);
        const response = await fetch(FORM_AJAX_ENDPOINT, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        const delivered = response.ok && (result.success === true || result.success === 'true');
        if (!delivered) {
          const message = String(result.message || '');
          if (/activat|confirm.*email|verify.*email/i.test(message)) {
            throw new Error('The website submission inbox has not yet been activated. Please send your enquiry directly to hello@mercopact.com or contact us via WhatsApp. Your enquiry is not confirmed.');
          }
          throw new Error('We could not confirm your enquiry was received. Please email hello@mercopact.com or use WhatsApp instead.');
        }
        form.reset();
        if (packageSelect && requestedPackage && packageMap[requestedPackage]) {
          packageSelect.value = packageMap[requestedPackage];
        }
        hideRecovery();
        setStatus('Your enquiry was accepted by the submission service. We will review it at our business inbox.', true);
      } catch (err) {
        setStatus(err.message && /inbox has not yet been activated|We could not confirm/.test(err.message) ? err.message :
          'We could not verify delivery. Please email hello@mercopact.com or use WhatsApp. No successful submission has been confirmed.');
        showRecovery();
      } finally {
        if (submit) { submit.disabled = false; submit.innerHTML = originalMarkup; }
      }
    });
  });
})();
