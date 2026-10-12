# MERCOPACT — 360° Website, Offer and Operating Readiness Audit
**Date:** 2026-10-12
**Scope:** The public MERCOPACT website and `injamhaqq/mercopact-website` GitHub Pages source, plus offer and operational assumptions reflected in the public pages.
**Evidence:** Fresh GitHub main-branch source inspection and live textual page/URL fetching, including /, /packages/, /contact/, /global-buyer-pilot.html and /buyer-growth/. No authenticated CRM, outreach data, inbox tests, visual-browser screenshot run, customer interviews, signed agency contracts, or third-party account verification. **An absence of verified evidence is not proof that a capability does not exist.**

## Overall verdict
**CONDITIONAL GO for founder-led, manually qualified international sales conversations; NOT YET VERIFIED as a fully self-serve lead-capture and scalable delivery funnel.** The basic category positioning, brand, services, clean route aliases and a scoped 30-day pilot exist. Do not promise clients, ROI, signed partners, RFQs or million-dollar outcomes. Immediate value comes from a working contact path, credible buyer-fit research and verifiable deliverables.

## Observed priorities

| Priority | Domain | Finding | Evidence | Action |
|---|---|---|---|---|
| P0 | Conversion routing | Public /packages/ listed package links as /packages/contact.html?package=... (incorrect nested paths) | Live public links + `packages.html`, Jekyll aliases, `assets/js/main.js` | **Fixed in this PR** with root-absolute CTA links and query-aware JS normalization |
| P0 | Lead capture | `FORM_ENDPOINT = ''` means contact and assessment forms do not send from the site, but invoke the visitor's mail client. No verified automatic capture. | `assets/js/forms.js`, `contact.html`, `buyer-growth.html` | **Open**: obtain and test an owned form endpoint, protect from spam, ensure privacy disclosure, confirm inbox delivery and conversion logging. Until then, make button and notice explicit. |
| P1 | Landing navigation | Relative links with query strings and `global-buyer-pilot.html` were not covered by the site's clean-route JS. | `assets/js/main.js`, global pilot and home links | **Fixed in this PR** with safe root-relative path resolution and query/hash preservation |
| P1 | Claims | “MOST POPULAR,” struck-through Standard prices and waived setup fees lacked corroborating transaction/pricing history in the audited sources. | `packages.html` | **Fixed in this PR**: retain actual published BDT service fees, remove unverified popularity/discount anchors |
| P1 | Audience consistency | Pricing page implied broadly international USD-facing packages while prices/scope are explicitly Bangladesh-oriented in BDT. | `packages.html` vs global pilot | **Fixed in this PR**: clearer page title, H1 and ongoing-program terminology; international offer remains separately scoped |
| P1 | SEO | Canonical/OG URLs from .html sources conflicted with Jekyll clean-route versions; sitemap enumerated .html despite clean navigation. | `route-*.html`, page metadata, `sitemap.xml` | **Fixed in this PR**: canonical/OG and sitemap use observed clean aliases, except standalone global pilot |
| P1 | Mobile navigation | CTA was positioned at a hard-coded 339px offset below the header, liable to overlap or drift when links wrap or fonts scale. | `assets/css/responsive.css` | **Fixed in this PR**: normal-flow, wrapped mobile nav and CTA; visually verify at 320/390/768px after deployment |
| P1 | Progressive enhancement | Elements tagged `.reveal` were invisible by default until JS/IntersectionObserver revealed them; no-JS visitors could miss substantive content. | `assets/css/styles-3.css` | **Fixed in this PR**: default readable content without a JS dependency |
| P1 | Contact friction | Contact hero sentence repeated product/target market awkwardly; the submit button implied completed submission. | `contact.html` | **Fixed in this PR**: remove duplicated wording, identify the email-app handoff |
| P1 | Offer promise | The 30-day pilot on the public site and the newer 28-day sprint in research have not been validated with paying buyers; swapping terms repeatedly reduces clarity. | `global-buyer-pilot.html`, research PR #3 | **Open strategic choice**: keep one current public 30-day pilot until interviews/paid test support a change. |
| P1 | Delivery credibility | No verified case studies, testimonials, signed distributor agreements or successful contract values were available in the inspected site/repo. | Website and provided repo content | **Open**: create genuine public sample briefs, transparent founder/team/identity details where verified, and client-approved case studies only after actual delivery |
| P1 | Operations | Marketing pages list extensive quantitative commitments (research volume, inboxes, outreach touches, creative concepts, meetings) without available proof of underlying capacity, SOPs or unit economics. | `packages.html` | **Open**: resource-cost model by tier, qualification definitions, staff hours, deliverability and data-access policy before signing 90-day contracts |
| P1 | Compliance | Cold email, company contact research and trade referrals raise privacy, sending, anti-spam, representation and contractual issues; operational safeguards not independently verified. | Current offer + published Terms and Privacy page | **Open**: document lawful source and opt-out, platform-compliant outreach, signed agency agreements, local trade/regulatory review |
| P2 | SEO content | Several titles are abstract ("Focused where B2B relationships matter") rather than precise buyer-intent service titles. | `industries.html`, `about.html`, `how-we-work.html` | Rewrite after target segment/corridor validated, avoiding keyword stuffing |
| P2 | Form length | The contact form asks for many operational details before an initial conversation, though most fields are optional. | `contact.html` | Future test: shorten to name, email, company, product, market and optional message, then qualify on a call |
| P2 | Tracking | No verified completed lead-to-CRM, GA4, consent, attribution or UTM event flow. | No connected telemetry/proof inspected | Instrument only with actual IDs, consent/privacy controls and test submissions |
| P2 | Visual QA | No current desktop/mobile rendered screenshot or automated interaction run in this inspection. | Tool/workflow limitation | Run browser-based checks for typography, sticky mobile navigation, button targets, menu keyboard focus, forms and contrast before claiming visual perfection |
| P2 | Conversion copy | No empirical data yet to prove exact winning headline, $1,500 pilot price or corridor. | Site and competitor research | Test buyer-specific one-page opportunity brief and discovery conversion on actual qualified prospects |

## What should not change without proof

- The approved full-color MERCOPACT emblem, horizontal lockup, immutable logo files, company colors and exact tagline **"Across Markets. With Confidence."**
- Existing BDT base package fee amounts unless an actual business decision authorizes repricing.
- The currently published 30-day international pilot simply because a newer **unvalidated** research document mentioned 28 days.
- No fabricated social proof, false scarcity, fictitious discounts, invented overseas offices or claims of guaranteed orders.
- No automatic mass outreach, scraping of logged-in LinkedIn data, or emailing prospect records without checking legitimacy, relevance and opt-outs.

## Recommended buyer-facing narrative

**Corporate category:** International buyer development and commercial market expansion for export-ready manufacturers.

**Hero:** "Your products are ready. Who is developing your next international buyers?"

**Lead magnet:** Show an actual dated and sourced *sample* market-access brief for a named product category/corridor, with account-fit justifications and no invented current demand. This is a higher-trust CTA than immediate payment from an unknown first-time agency.

**First paid engagement:** A clearly scoped **30-day** market development pilot, one product and one destination, with measurable research and approved outreach deliverables. Convert qualified demand into written managed follow-up. Differentiate relevant target organizations from verified buyer interest, RFQs and completed sales.

**Success metrics:** form working rate, visits→inquiries, inquiries→qualified calls, proposals, collected pilot fees, research hours, direct margin, correct-fit conversations, RFQs and renewals. Not message send counts alone.

## Prelaunch acceptance checklist

- [x] Package CTAs point to root contact route including preselected package parameter (source)
- [x] JS resolves internal links from root while retaining query strings (source)
- [x] Clearer contact copy and honest email-app handoff (source)
- [x] Bangladesh-specific BDT tier positioning with no unproven popularity/discount anchoring (source)
- [x] Canonical URL strategy + sitemap for clean routes (source)
- [x] Visible default reveal content without JavaScript (source)
- [x] Mobile navigation no longer uses fixed CTA offset (source)
- [ ] Run live browser desktop/mobile visual and keyboard QA postmerge
- [ ] Configure AND verify automatic form receiving and CRM event registration
- [ ] Test all 3 package selections and international pilot inquiry end to end
- [ ] Verify live company address/registration information before publishing it
- [ ] Validate service capacity and written terms against 30-day pilot scope
- [ ] Verify client payment, tax/invoicing route and paid offer traction
- [ ] Obtain genuine client permission before publishing logos, testimonials or case studies

**Boundary:** This is an evidence-backed technical/static and visible-content audit, not an independent legal, financial, penetration, browser visual, or accessibility conformance certification.
