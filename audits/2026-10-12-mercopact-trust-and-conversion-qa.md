# MERCOPACT — Trust, Copy, Conversion & Navigation QA
**Updated 12 October 2026.** Scope: public website content, service navigation, homepage, About, proof center, international pilot, lead-intake forms, responsive source CSS and source-level navigation checks.

## Goal
Present MERCOPACT as a serious international buyer-development operator based on **what customers can actually inspect**: product-specific research, buyer/account fit, commercially appropriate outreach and explicit opportunity handoff. No invented delivery history, fake client logos, "team of experts" claims without named verifiable biographies, guaranteed deal revenue, signed mandates, licenses, registrations or case studies.

## Implemented
- Homepage leads with an identifiable buyer-development commercial outcome and clear two-step CTAs (see research examples; discuss market), not generic agency jargon.
- Dated independently source-linked work samples (Bangladesh/UAE/India) remain accessible above the fold and from navigation; clearly marked **methodology demonstrations, not customer case studies**.
- Primary site navigation reduced to five high-value destinations: Services, International Growth, How It Works, Research Examples, About. Distinct BDT packaging and Bangladesh-market services remain discoverable in the footer and contextual body links.
- Main and footer asset references are root-safe; internal links canonicalized to clean root paths; reduces failures on /packages/, /about/ and other clean URLs when script is delayed.
- About page now emphasizes functional disciplines, accountability and checkable research. Generic decorative factory stock photography removed from About; replaced with factual geographic focus, service focus and methodology strip. No false claims of facility ownership or staffing.
- Dedicated evidence/credentials page uses a practical pre-engagement verification process rather than a dismissive list of unsubstantiated facts.
- Contact: five mandatory inputs (name, company, email, product, commercial objective); optional service selection and progressively disclosed technical detail.
- Buyer Growth campaign landing: six required inputs (name, company, email, product, buyer focus, target buyer) and optional enrichment fields behind a detail disclosure. Research example link.
- Existing FormSubmit routing, provider error messages and package preselection preserved. Service-origin disclosure and privacy references retained.
- OG social preview of homepage and About uses the **approved MERCOPACT logo file**, not a generic stock factory photo.
- CSS improves mobile layout for progressive disclosure, keyboard focus, responsive editorials and contrast of the secondary homepage CTA.
- No public package fees, case studies, customer counts, ROI claims or international pilot day count changed.

## Principles and external context
- Google Search Central: original, sourced, useful content and accurate creator/organization identity matter more than unsupported claims. https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- NN/g site credibility research: genuine company details, expertise and professional web experience inform visitor trust. https://www.nngroup.com/reports/ecommerce-ux-trust-and-credibility/
- Baymard form research: unnecessary fields and unlabeled optionality create friction. Context is primarily transactional/ecommerce, applied here as directional UX guidance, not MERCOPACT-specific conversion rates. https://baymard.com/research-articles/current-state-of-checkout-ux

## Remaining verification gates
1. **FormSubmit activation and successful inbox email receipt** at hello@mercopact.com—no success assumed from a web form's HTTP 200.
2. Owner provides original documentary evidence for legal entity, address, role expertise, registration/license and any authorized representation claims before publishing specifics.
3. Verified customer engagement plus explicit consent before calling market-research examples "client case studies."
4. Technical browser checks at phone 360px, tablet 768px and desktop: nav opening/closing, focus order, spacing, logo size, sample-page overflow, forms, CAPTCHA/error states.
5. Actual Google Search Console/analytics and conversion tracking require account access and privacy implementation; currently not verified.
6. Timed delivery economics of advertised 90-day high-volume packages still require live execution evidence; do not assume the source edits prove operational capacity.
7. User tests and split-test conversion results are absent. No page design is scientifically confirmed "best" without traffic and inquiry data.

## QA source checks
- Approved immutable MERCOPACT brand image preserved.
- Homepage exactly one h1.
- Main and buyer-growth forms explicitly separate required from optional; provider `name="email"` intact.
- Form script maps package query string and reports provider rejection instead of fabricated confirmation.
- Primary menu and footer link to relevant service and evidence pages on clean URLs.
- No misleading stock photo represented as corporate factory.
- No unsubstantiated ratings, review counts, team headshots or revenue counters added.

**Verdict:** More coherent, less defensive, easier to evaluate and contact, with open legal/client-outcome and deliverability proof gaps requiring authorized owner evidence. This is not a compliance certificate or guarantee of commercial results.
