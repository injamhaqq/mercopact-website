# MERCOPACT — Form Delivery Activation, QA, and Trust Credentials

## Current setup
- Provider: **FormSubmit.co** (official documentation: https://formsubmit.co/documentation).
- Forms: `contact.html` and `buyer-growth.html`.
- Non-JavaScript fallback: form POST to `https://formsubmit.co/hello@mercopact.com`.
- JavaScript: JSON AJAX POST to `https://formsubmit.co/ajax/hello@mercopact.com`; accept success ONLY when `result.success === true || result.success === 'true'`, and the HTTP status is 2xx. A 200 response with `'false'` is a failure.
- Provider anti-spam: default provider CAPTCHA behavior, honeypot `_honey`; no claim of hardened abuse protection or 100% uptime.
- Email must be an operational inbox controlled by MERCOPACT's owner.
- **No live email-delivery success may be claimed until the owner activates the mailbox and confirms a synthetic test message arrives.**

## Required one-time owner action (cannot be replaced by the website or AI)
1. Submit one synthetic test enquiry from https://mercopact.com/contact/ (clearly identify it as MERCOPACT TEST and do not include personal information).
2. Open the **hello@mercopact.com** inbox, including spam/junk, for the FormSubmit activation email.
3. Review the recipient and provider and click the legitimate activation link. Do not share the activation code/link publicly.
4. Return to the live contact page, submit a **second** synthetic enquiry.
5. Verify that the response says the service accepted the request AND the complete message actually arrived in hello@mercopact.com.
6. Repeat from https://mercopact.com/buyer-growth/ and from a package CTA at https://mercopact.com/packages/?package=market-proof or /packages/ → button.
7. In the inbox, verify subject, name, company, email, target market and package choice, and test that replying to the visitor is routed correctly.
8. On a 2xx/JSON activation or error state, the website must NOT show success. If it does, stop acquisition traffic and fix.
9. Check privacy policy and vendor terms; compare data protection requirements for recipient regions. FormSubmit publishes retention of up to 30 days; third-party transfer must be disclosed.
10. If additional controls, data residency, DPA, dedicated business SLA or CRM are required, migrate to a formally owned vendor project or server-side endpoint before scale.

**Security**: Forms transmit provided data to an external processor, not an owned MERCOPACT backend. Never ask for passport numbers, customer lists, payments, banking records, NDA details, or confidential quotations in public forms. Do not paste live leads into open GitHub.

## Recommended real credentials intake (internal, DO NOT publish guesses)
- Contracting legal entity and official jurisdiction.
- Business/trade registration certificate plus valid license and current status if required.
- Approved physical business address and authorized signatory.
- Issuing bank and compliant cross-border payment instructions.
- Written authorized manufacturer/agency representation letters **only if actually signed and current**.
- Proof of delivery: accepted project scope and customer permission to describe it publicly.
- Confirmable references or testimonials **only with written client consent**.
- Commercial complaint/privacy contact and document-retention policy.

The trust page intentionally does not display these as badges because none have been verified from documentary evidence. This is transparent, not a negative conclusion about their existence.

## Functional acceptance
- [ ] Provider activation confirmed by inbox owner.
- [ ] Contact form AJAX accepted with literal JSON success true.
- [ ] Contact form synthetic email delivered.
- [ ] Buyer Growth form synthetic email delivered.
- [ ] Package selection carried from campaign to form body.
- [ ] Spam/invalid inputs rejected or surfaced as actionable error.
- [ ] Failure state never resets the form or reports submission success.
- [ ] Mobile form usable at 360px.
- [ ] Screen reader aria-live status confirmed.
- [ ] Vendor privacy terms acceptable for target jurisdictions.
- [ ] If required, company credentials published **only after independent verification**.

## Commercial integrity
Case-research pages in this website are NOT client success stories. Source-backed account discovery demonstrates a method; signed POs and collected revenue require confidential, verified client evidence and explicit publication permission.
