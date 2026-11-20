# MERCOPACT: Static Production Website

A static, GitHub-Pages-ready corporate website for **MERCOPACT**.

## Structure

- `index.html`: corporate homepage
- `buyer-development.html`: Buyer Development Brief
- `international-markets.html`: international buyer development
- `bangladesh-market-entry.html`: legacy redirect to international market development
- `industries.html`: industry focus
- `how-we-work.html`: operating process
- `about.html`: company positioning and principles
- `contact.html`: corporate enquiry page
- `buyer-growth.html`: legacy campaign redirect to contact
- `privacy.html`, `terms.html`, `404.html`: legal and error pages
- `assets/css/`: design system and responsive styles
- `assets/js/`: navigation, reveal motion and static-form behavior
- `assets/images/logo/`: logo assets cropped directly from the supplied official reference artwork
- `favicon.ico`, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `CNAME`
- `IMAGE-CREDITS.md`: photography source record
- `QA-REPORT.md`, `qa-static.json`, `qa-browser.json`: verification summary and raw QA outputs

## Preview locally

From the project folder, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## GitHub Pages deployment

1. Create a GitHub repository and copy the **contents** of this folder into the repository root.
2. Commit and push.
3. In **GitHub → Settings → Pages**, deploy from the branch containing these files (normally `main`) and select `/ (root)`.
4. GitHub Pages will detect the included `CNAME` file for `mercopact.com`.
5. In your DNS provider, follow GitHub’s current custom-domain instructions for the apex domain and/or `www`.
6. In GitHub Pages settings, enable **Enforce HTTPS** after DNS is valid.

## Verification

Run `node scripts/verify-trust-pages.js` for structural, link, metadata and offer checks. The GitHub browser workflow checks all 27 public routes at 320, 390 and 1440 CSS pixels, plus the register, navigation and enquiry journeys. The renderer blocks external requests during tests.

## Custom domain

`CNAME` currently contains:

```text
mercopact.com
```

No rebuild is required when deploying the supplied files.

## Contact-form setup

The enquiry form prepares a WhatsApp draft in the visitor’s browser. It has no submission endpoint. The visitor opens the draft in WhatsApp and sends it there. The page also offers direct WhatsApp and Cal.com links, including when JavaScript is disabled. Public email and website analytics are disabled in this release. Verify mailbox receipt and update the privacy notice before introducing a new service that receives enquiry data or analytics.

## Replacing photography

The homepage photo is served as a local WebP. When replacing it, use a relevant manufacturing or trade photograph and preserve the photographer, original source and license in `IMAGE-CREDITS.md`. Keep illustrative photography separate from claims about real clients or buyers.

## MERCOPACT brand on the web

- The promise is **Across Markets. With Confidence.** MERCOPACT serves export-ready manufacturers and specialist B2B suppliers evaluating buyers in international markets.
- Confidence means a traceable reason for choosing an account, client approval before contact, and a buyer register the client can continue using.
- The transparent v7 lockup is the approved header, footer and structured-data logo. Browser icons use the original standalone emblem from the approved artwork, centered on ivory with padding at small sizes. Keep the original proportions, color and clear space.
- Use navy `#0B1F33` for the wordmark, ink and main dark surfaces, teal `#0F766E` for links and active states, brass `#C89B3C` for accents and high-emphasis actions, and ivory `#F7F4ED` for paper surfaces. The components live in `assets/css/mercopact-brand.css`.
- Use the local Manrope face for UI and reading text and Georgia for editorial headings. Keep photography about manufacturing or trade and maintain its attribution. Approved social artwork lives in `assets/images/og`.
- Before shipping, check the wordmark, favicon and share card. Verify page hierarchy, keyboard navigation, contrast and the route from a public evidence example to a written scope. Only publish supportable claims, current commercial terms and permissioned customer proof.

## Release checklist

- Confirm that each offer states the intended customer, deliverables, timeframe, price and next step.
- Read the main pages in order as a buyer. Check that the research, sample register, Pricing, written scope request and founder identity agree.
- Verify the named contact destinations and the enquiry draft on mobile and desktop.
- Keep public claims tied to evidence or client-approved proof. Match commercial terms to the signed scope template before changing commitments.
- Run the static and browser checks, then verify the live custom domain and share assets after deployment.
