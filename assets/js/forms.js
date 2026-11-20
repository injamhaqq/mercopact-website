(() => {
  const form = document.querySelector('#enquiry-form');
  if (!form) return;

  const options = {
    brief: 'Buyer Development Brief',
    'development-pilot': 'Buyer Development Pilot',
    pilot: 'Buyer Development Brief',
    'market-proof': 'Buyer Development Brief',
    'international-pilot': 'Buyer Development Brief',
    'buyer-development': 'Buyer Development Brief',
    'outreach-sprint': 'Buyer Outreach Sprint',
    ongoing: 'Managed Buyer Development',
    'growth-desk': 'Managed Buyer Development',
    recovery: 'Sales Opportunity Recovery',
    sprint: 'Sales Opportunity Recovery',
    specialist: 'Specialist project',
    mandate: 'Specialist project'
  };
  const interest = form.elements.namedItem('package');
  const option = new URLSearchParams(location.search).get('package');
  if (Object.hasOwn(options, option)) interest.value = options[option];

  const enquiryHeading = document.querySelector('[data-enquiry-heading]');
  if (enquiryHeading) {
    const panelHeading = document.querySelector('[data-enquiry-panel-heading]');
    const generalEnquiry = document.querySelector('[data-general-enquiry]');
    const briefSummary = document.querySelector('[data-brief-summary]');
    const pilotSummary = document.querySelector('[data-pilot-summary]');
    const generalHeadingText = enquiryHeading.textContent;
    const generalPanelText = panelHeading.textContent;
    const updateEnquiryContext = () => {
      const isBrief = interest.value === options.brief;
      const isPilot = interest.value === options['development-pilot'];
      enquiryHeading.textContent = generalHeadingText;
      if (isPilot) enquiryHeading.textContent = 'Request a Buyer Development Pilot scope';
      if (isBrief) enquiryHeading.textContent = 'Check fit for your product';
      panelHeading.textContent = isBrief || isPilot ? 'Tell us what you sell' : generalPanelText;
      generalEnquiry.hidden = isBrief || isPilot;
      briefSummary.hidden = !isBrief;
      pilotSummary.hidden = !isPilot;
    };
    updateEnquiryContext();
    interest.addEventListener('change', updateEnquiryContext);
  }

  const draftLink = document.querySelector('#whatsapp-draft');
  const status = form.querySelector('.form-status');
  const inputs = [
    ['name', 'Your name', 'Enter your name.'],
    ['company', 'Company name', 'Enter your company name.'],
    ['website', 'Company website', 'Enter a valid website address, including https://, or leave the field blank.'],
    ['product', 'Product or requirement', 'Describe your product or requirement.'],
    ['market', 'Target country', 'Enter your target country.']
  ].map(([id, label, error]) => ({
    field: form.elements.namedItem(id),
    feedback: document.getElementById(id + '-error'),
    label,
    error
  }));

  function clearDraft() {
    draftLink.hidden = true;
    draftLink.removeAttribute('href');
    status.textContent = '';
  }

  interest.addEventListener('change', clearDraft);
  for (const link of document.querySelectorAll('[data-enquiry-package]')) {
    link.addEventListener('click', () => {
      const offer = link.dataset.enquiryPackage;
      if (!Object.hasOwn(options, offer)) return;
      interest.value = options[offer];
      interest.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function valid(field) {
    const value = field.value.trim();
    if (field.required && !value) return false;
    if (field.type === 'url' && value && !/^https?:\/\/[^/\s]+/i.test(value)) return false;
    return field.validity.valid;
  }

  form.addEventListener('input', event => {
    clearDraft();
    const row = inputs.find(input => input.field === event.target);
    if (row && valid(row.field)) {
      row.field.removeAttribute('aria-invalid');
      row.feedback.textContent = '';
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    clearDraft();
    let firstInvalid;
    for (const { field, feedback, error } of inputs) {
      if (!valid(field)) {
        field.setAttribute('aria-invalid', 'true');
        feedback.textContent = error;
        firstInvalid ??= field;
      } else {
        field.removeAttribute('aria-invalid');
        feedback.textContent = '';
      }
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const lines = ['Hello MERCOPACT, I’d like to discuss an enquiry.', ''];
    for (const { field, label } of inputs) {
      const value = field.value.trim();
      if (value) lines.push(label + ': ' + value);
    }
    if (interest.value) lines.push('Interested in: ' + interest.value);

    try {
      draftLink.href = 'https://wa.me/8801793122369?text=' + encodeURIComponent(lines.join('\n'));
      draftLink.hidden = false;
      status.textContent = 'Your draft is ready. Open WhatsApp and press Send when you’re ready.';
      draftLink.focus();
    } catch {
      status.textContent = 'We couldn’t prepare your draft. Your details are still here. You can message us directly on WhatsApp or book a call.';
    }
  });

  form.noValidate = true;
  form.querySelector('[data-prepare]').disabled = false;
})();
