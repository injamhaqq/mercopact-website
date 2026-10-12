# MERCOPACT — International Pilot Acquisition, Pricing and Retention Validation

**Current state:** Real MERCOPACT baseline prospect count, replies, paid pilots, collections, retention, actual delivery hours and accepted case studies are **MISSING / NOT VERIFIED** in the inspected website and public repository. Do not set missing values to zero; unknown is not zero.

## Metrics dictionary (single agreed CRM definition)
- `ICP companies qualified`: unique organizations satisfying published product, region, readiness and budget-owner criteria with evidence URL.
- `Contacted companies`: unique ICP accounts where relevant message actually sent via approved method; multiple followups count once.
- `Interested responses`: attributable replies asking for sample/proposal/call and meaningfully relevant to service.
- `Discovery calls completed`: held with decision-maker/champion, not merely booked.
- `Qualified proposals`: written offer with product/country, scope, acceptance criteria, pricing, confidentiality and start date, actually transmitted.
- `Signed pilots`: signed agreements, regardless of payment.
- `Collected pilot revenue`: cash actually settled, excluding taxes and pass-through ad spend.
- `Continuing retainer`: paid next-month recurring agreement; pilot extension is not automatically recurring.
- `Pilot renewal rate`: number of first-month paid pilots that renew / number eligible to renew (cohort based).
- `Gross contribution`: collected fees less actual direct cash cost; economic contribution separately recognizes loaded founder labor.
- `Sales cycle`: first qualified contact to signed agreement in calendar days.
- `Case-study proof`: only verified metrics published with explicit client approval.

## Core formulas
`Positive reply rate = interested responses / contacted ICP companies` (denominator cannot include skipped/invalid messages).
`Discovery conversion = completed discovery calls / interested responses`.
`Proposal win rate = signed pilots / transmitted qualified proposals`.
`Cash collection rate = collected invoices / issued invoices`, matched by cohort.
`Economic margin = (fee income - labor economic cost - paid third-party delivery costs) / fee income`.
`Retained paid clients end = paid at start + new activated - churned`.
`CAC = actual sales/prospecting spend / newly paying customers`.
Only compute where denominator > 0 and numerator evidence exists.

## Evidence-level gates and small experiments
**Experiment A — Demand for the offer:** choose 25–40 actual high-fit manufacturing firms from owned or otherwise authorized accounts (not Cuttavo/other business leads), manually qualify, research 3 public company-specific market-fit insights, outreach via permitted channels, log real responses for two distinctly worded messages. No message volume guarantee.
**Experiment B — Price fit:** present 2 alternative fixed-scope written prices at actual discovery calls, record exact objections, buyer budget authority, and whether an invoice was paid. Do not infer WTP from a "sounds good" reply.
**Experiment C — Fulfillment efficiency:** timer-track 5 fully researched accounts + 10 contacts + 20 individualized outreach drafts + QA + report; use actual invoices, data provider receipts, CRM QA corrections.
**Experiment D — Retention:** track each paid pilot eligibility and acceptance/renewal 30 days after finish. Do not claim retained clients until payment collected.

### Checkpoints
- Week 1: verify company/product and establish permitted data/contact basis.
- Week 2: inspect true replies + held calls and whether pain is real.
- Week 3–4: verify accepted proposals, collected fees, logged delivery hours and actual account-fit quality.
- 60 days: check renewals, corrective action and workload.
- 90 days: decide scale, narrow, revise scope or pivot based on measured contribution and repeated paid demand.

### Decision rules (management hypotheses, not external benchmarks)
- If researched accounts are mostly wrong-fit: revisit ICP and datasource.
- If interested replies but no discovery: revise proposed relevance/evidence/CTA.
- If discovery but no paid pilots: test trust, scope, pricing and contract friction.
- If paying pilots but poor contribution: reduce work, improve processes or price with approval.
- If measured margin and renewals are not available: **do not publish million-dollar forecasts as factual evidence**.
- Only expand sectors/countries when the first corridor demonstrates valid delivered value and retained economics.

## Privacy / data rule
Never commit identifiable prospect records, client replies, buyer contact details, consent letters, or deal terms to this public repository. Use an authorized private CRM/workspace and appropriate access controls, retention and opt-out handling.
