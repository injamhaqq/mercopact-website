# Mercopact Website QA Report

## Verification completed

- All 12 HTML pages returned HTTP 200 from a local static server during browser QA.
- Every page has exactly one H1.
- No page showed horizontal overflow at the tested desktop/mobile viewports.
- Mobile navigation opens, exposes the full navigation and CTA, and closes with Escape.
- The Buyer Growth landing page was checked at 390px width with no horizontal overflow.
- Both enquiry forms have labelled required fields and a working static-site fallback: when no hosted endpoint is configured, submission opens the visitor's email app with the form values prepared.
- Local asset/link checks found no broken local file references.
- All content images include alt text or an intentionally empty alt value for decorative strips.
- Non-hero editorial images use lazy loading; hero/lead imagery uses high fetch priority.
- Logo and photography image dimensions are declared to reduce layout shift.
- Web app manifest icon references resolve to included 192px and 512px Mercopact mark assets.
- `robots.txt`, `sitemap.xml`, `CNAME`, favicon and web manifest are present.
- Service schema is included on Buyer Development, International Markets and Bangladesh Market Entry pages; Organization schema is included across the site.
- No invented testimonials, client logos, awards, success rates, revenue claims, establishment year or "Mercopact Ltd." wording is present.

## Browser QA environment limitation

The sandbox browser used for local QA could not fetch external network resources, so the browser console recorded `net::ERR_FAILED` for remote Google Fonts and Unsplash CDN photography and screenshots show the designed image frames without the live photos. This is an environment/network limitation, not a broken local path. The production files intentionally reference real Unsplash photography through HTTPS and include source records in `IMAGE-CREDITS.md`.

## Viewports inspected

- Desktop homepage: 1440px reference viewport
- Mobile homepage: 390px viewport
- Mobile Buyer Growth landing page: 390px viewport
- Mobile expanded navigation: 390px viewport

## Remaining launch inputs

See `README.md` for the small set of optional/credential-dependent items: hosted form endpoint, tracking IDs, exact LinkedIn URL verification, and an optional transparent master logo replacement.
