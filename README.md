# MERCOPACT — Static Production Website

A static, GitHub-Pages-ready corporate website for **MERCOPACT**.

## Structure

- `index.html` — corporate homepage
- `buyer-development.html` — Bangladesh / B2B buyer development
- `international-markets.html` — international buyer development
- `bangladesh-market-entry.html` — Bangladesh market-entry service
- `industries.html` — industry focus
- `how-we-work.html` — operating process
- `about.html` — company positioning and principles
- `contact.html` — corporate enquiry page
- `buyer-growth.html` — focused Meta/Facebook campaign landing page
- `privacy.html`, `terms.html`, `404.html` — legal and error pages
- `assets/css/` — design system and responsive styles
- `assets/js/` — navigation, reveal motion and static-form behavior
- `assets/images/logo/` — logo assets cropped directly from the supplied official reference artwork
- `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `CNAME`
- `IMAGE-CREDITS.md` — photography source record
- `QA-REPORT.md`, `qa-static.json`, `qa-browser.json` — verification summary and raw QA outputs

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

The final source was checked at 1440 px desktop and 390 px mobile using a local Chromium/Playwright render, plus static HTML/asset/link validation. See `QA-REPORT.md` for the full verification record.

The local QA environment intentionally blocked external network requests, so remote Unsplash photography and Google Fonts do not appear in the exported QA screenshots. The production files retain those live URLs.

## Custom domain

`CNAME` currently contains:

```text
mercopact.com
```

No rebuild is required when deploying the supplied files.

## Contact-form setup

GitHub Pages has no server-side forms. The build is intentionally honest about that.

`assets/js/forms.js` contains:

```js
const FORM_ENDPOINT = '';
```

- Leave it empty: forms open the visitor’s email application with the form data prepared for `hello@mercopact.com`.
- To use Formspree or another compatible hosted endpoint, replace the empty value with the real endpoint URL and test submission before launch.
- Do not publish secret API keys in this static repository.

## Meta Pixel / GA4 / Google Tag Manager

Tracking is **disabled** until valid IDs are supplied. Every HTML page contains comments showing where the approved snippets should be added.

Recommended production approach:

1. Configure Google Tag Manager with the real `GTM-...` ID.
2. Manage GA4 through GTM with the real `G-...` Measurement ID.
3. Add Meta Pixel through GTM or the official snippet using the real Pixel ID.
4. Verify consent/privacy requirements before enabling advertising or analytics tags.

## Replacing photography

Photography is loaded from the Unsplash image CDN so this repository remains light. To self-host later:

1. Download the chosen image from its source page under the applicable Unsplash license.
2. Export optimized WebP/JPEG variants.
3. Put them in `assets/images/photography/`.
4. Replace the corresponding remote URL in the HTML.
5. Preserve credits/source records below.

## Photography sources / license notes

The selected photographs are real photographs surfaced through Unsplash and marked free to use under the Unsplash License at the time selected. Re-check the source page and current license before major commercial redistribution.

1. **Industrial factory interior** — Ant Rozetsky
   - Source: https://unsplash.com/photos/SLIFI67jv5k
   - Used: primary industrial / hero context
2. **Container terminal / cargo vessel** — Andy Li
   - Source: https://unsplash.com/photos/CpsTAUPoScw
   - Used: international markets
3. **Industrial textile factory** — Lalit Kumar
   - Source: https://unsplash.com/photos/HpPmiduLDC0
   - Used: Bangladesh manufacturing / industry context
4. **Business meeting** — Christina @ wocintechchat.com
   - Source: https://unsplash.com/photos/Q80LYxv_Tbs
   - Used: commercial meeting / market-entry context
5. **Industrial warehouse** — Alberto Rodríguez
   - Source: https://unsplash.com/photos/-aCrA9FmT8Y
   - Used: account-development / operations context
6. **Industrial automation** — Simon Kadula
   - Source: https://unsplash.com/photos/8gr6bObQLOI
   - Used: industries / manufacturing context

## Logo note

The supplied reference image contained the official Mercopact horizontal logo. This build crops that exact artwork for web use rather than redrawing or reinterpreting the mark. If you later provide a transparent master SVG/PNG, replace `assets/images/logo/mercopact-horizontal.png` and `mercopact-mark.png` with the master files while keeping the same filenames or updating references.

## Launch checklist

Before launch, supply or verify:

- A standalone master logo file if available (recommended for maximum sharpness).
- Formspree/Web3Forms endpoint if you want in-page submissions instead of email fallback.
- Meta Pixel ID if advertising measurement is required.
- GA4 Measurement ID and/or Google Tag Manager container ID.
- Confirm the exact LinkedIn company URL if it differs from `/company/mercopact/`.
- Confirm privacy/cookie requirements for the jurisdictions where tracking will run.

## Brand / content rules preserved

- No invented clients, testimonials, awards, revenue claims or success rates.
- No “Mercopact Ltd.” wording.
- No unverified establishment year.
- No guaranteed buyers, sales or revenue claims.
- Public contact details use only the approved corporate emails.
