# ESG Copilot — esgcopilot.site

Pre-Disclosure ESG Data Audit Tool for sustainability teams and ESG consultants.

## Features
- Upload CSV/Excel ESG datasets
- 15 automated QA validation rules (GHG Protocol, GRI, IFRS S2)
- AI advisory notes with Why / Fix / Disclosure implication
- Executive summary + severity breakdown
- Export review memo as .txt

## File Structure

```
esgcopilot/
├── index.html          ← main app
├── vercel.json         ← Vercel deployment config
├── src/
│   ├── styles.css      ← all styles
│   ├── data.js         ← sample dataset + QA rules
│   └── app.js          ← QA engine + UI logic
└── README.md
```

## Deploy to Vercel (via GitHub)

1. Push this folder to a new GitHub repo
2. Go to vercel.com → New Project → Import from GitHub
3. Select the repo → Framework: **Other** → Deploy
4. In Vercel Settings → Domains → add `esgcopilot.site`
5. Copy the DNS records Vercel gives you into Namecheap

## Connect Domain (Namecheap → Vercel)

In Namecheap Advanced DNS, add:
- Type: `A` | Host: `@` | Value: `76.76.21.21`
- Type: `CNAME` | Host: `www` | Value: `cname.vercel-dns.com`

DNS propagates in 1–48 hours.

## Sample Dataset

The sample dataset (`SAMPLE_DATA` in `src/data.js`) contains:
- Company: GreenCo Ltd
- Years: 2021–2024
- 30 ESG indicators
- 10 intentional QA errors for demonstration

## Contact

info@esgcopilot.site
