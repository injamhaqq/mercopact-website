# MERCOPACT — Research Tools, GitHub Agents and Compliance Decision
**Checked 2026-10-12.** The fastest credible improvement is reliable sourced research and a basic CRM/evidence workflow. Avoid a brittle autonomous LinkedIn mass-messaging stack.

| Tool | Official source | Best use | Decision |
|---|---|---|---|
| Public association and company pages | https://www.bgapmea.org/ and https://www.aci-bd.com/manufacturing-facilities/premiaflex-unit.html | Verify manufacturing activities and candidate product fit | **USE** with source and freshness record |
| Official trade-show exhibitor directories | https://exhibitors.gulfoodmanufacturing.com/gulfood-manufacturing-2026/Exhibitor | Discover manufacturers and commercial expansion signals | **USE for legitimate company discovery**, not fabricated buying demand |
| LinkedIn Sales Navigator Core | https://business.linkedin.com/sell/sales-navigator/compare-plans | Manually research roles/accounts, official price starts $119.99/mo in US | **OPTIONAL** if research ROI supports paid seat |
| Google Workspace | https://workspace.google.com/pricing | Authenticated business email and permitted outbound | **OPTIONAL**, published Starter annual plan ~$7/user/month |
| Apify | https://apify.com/pricing | Collect permitted public company site data, structured inputs; free $5 usage / Starter $19 + usage | **OPTIONAL** with platform/privacy review |
| go-to-market-agent | https://github.com/maxrihter/go-to-market-agent | Source-gated competitor research reports, SQLite history | **LATER**, inspect code, dependencies, license and data providers; does not replace commercial outreach |
| AgentReach | https://github.com/tenlifejosh/agentreach | Authenticated drivers for several platforms; README lists LinkedIn in future v1.0 | **DO NOT USE AS LINKEDIN ENGINE**; unsupported and bot/terms risk |
| External data/contact enrichment | Vendor-specific license | Supplement direct publicly sourced account research | **DEFER** until quality and lawful-use tests |

## Safe architecture
`Public company sources → source ledger → fit quality gate → approved private CRM → human-approved LinkedIn/email outreach → observed replies / RFQs → actual hours & cost ledger → consented case proof`.

## No unearned claims
Researching an organization from a public association does not make it an actual buyer. Official pricing does not equal MERCOPACT expenses, provider software use does not establish lawful consent, and agent output does not prove agreement to meet.

## Required policy checks
- LinkedIn prohibits unauthorized scraping and automated messaging: https://www.linkedin.com/help/linkedin/answer/a1341387/
- For U.S.-directed commercial email, FTC CAN-SPAM opt-out and identity rules: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- Check other recipient jurisdictions and country-specific marketing, privacy and trade rules before outreach.
- Obtain client authorization to disclose buyer information, pricing, NDA-sensitive data or send communications in its name.
- Use client systems/storage for any prospect or customer PII and negotiated deal data. GitHub public repository holds reusable SOPs and sanitized research only.

## Explicit exclusions
No automated cold DMs, credential harvesting, anti-bot evasion, fake profiles, proxy rotation, lead purchase without verification, inflated outreach limits, fake results or unconsented publishing.

## Practical recommendation
Start with manual prospect research and human-reviewed outreach to validate the 30-day service economics. Automate repeatable **non-sensitive source extraction, de-duplication, evidence freshness checks, and report formatting** afterward. If a CRM/plugin is connected, inspect authorizations and do not silently message contacts.
