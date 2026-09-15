# Deploying TMUA Lab

The site is **entirely static** — HTML, CSS, JS, ~700 KB total, no backend, no
database, no build step. Everything a visitor does stays in their own browser.
That makes hosting close to free, and it makes the home PC the *harder* option
rather than the cheaper one.

## The recommendation: CDN for the site, home PC only when you need an API

```
                    ┌──────────────────────────────┐
  visitors  ───────▶│  Cloudflare Pages (free)     │   the whole site
                    │  global CDN, TLS, unlimited  │   ~700 KB, cached at edge
                    └──────────────────────────────┘
                                   │
                                   │  only if/when you add accounts
                                   ▼
                    ┌──────────────────────────────┐
                    │  home PC, via Cloudflare      │  small JSON API
                    │  Tunnel (no open ports)       │  SQLite or Postgres
                    └──────────────────────────────┘
```

Why not serve the site itself from home:

| | Cloudflare Pages | home PC |
| --- | --- | --- |
| cost | £0 | electricity + your time |
| bandwidth | unlimited, free | your upload line, shared with the household |
| latency | edge PoP near the visitor | one box in one town |
| uptime | theirs | yours: power cuts, router reboots, ISP work |
| TLS | automatic | yours to renew |
| a spike of 500 students | invisible | saturates a domestic uplink |
| your home IP | never exposed | exposed unless tunnelled |

A domestic upload line is typically 10–50 Mbps. At 700 KB a cold visit, ~50
simultaneous first-time visitors will saturate 30 Mbps and the site gets slow
for everyone in the house too. A CDN removes that problem for free.

Also check your ISP's terms — many UK residential contracts prohibit running
public servers on the connection.

---

## Path A — Cloudflare Pages (recommended for the site)

Push the repo to GitHub, then in Cloudflare: Workers & Pages → Create → connect
the repo. Build command: **none**. Output directory: **/** (the repo root).

Or straight from this machine, no GitHub:

```bash
npx wrangler login                              # opens a browser once
npx wrangler pages deploy . --project-name tmua
```

That gives a live `tmua.pages.dev` immediately. `_headers` in the repo root is
picked up automatically for caching and security headers.

Custom domain: Pages project → Custom domains → Add → `tmua.dev`. Because the
domain is on Cloudflare Registrar the DNS record and certificate are created
for you; nothing to configure.

Note `.dev` is on the HSTS preload list, so browsers refuse plain HTTP for it
under all circumstances. Pages issues the certificate automatically, so this is
free correctness rather than a problem — but it does mean the site is only ever
reachable over HTTPS, which is what you want.

GitHub Pages and Netlify work identically and are also free.

---

## Path B — your home PC (what you asked about)

Worth it when you add a backend. Two ways in:

### B1. Cloudflare Tunnel — preferred, even with a static IP

No open ports, home IP never published, survives an IP change, free.

```bash
# on the home PC
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
sudo install cloudflared /usr/local/bin/
cloudflared tunnel login
cloudflared tunnel create tmualab
cloudflared tunnel route dns tmualab tmua.dev

# ~/.cloudflared/config.yml
tunnel: tmualab
credentials-file: /home/you/.cloudflared/<TUNNEL-ID>.json
ingress:
  - hostname: tmua.dev
    service: http://localhost:8080
  - service: http_status:404

sudo cloudflared service install     # runs on boot
```

### B2. Direct, using your static IP

Forward 80 and 443 to the box and let Caddy handle TLS — see `Caddyfile`.
This publishes your home IP. Prefer B1 unless you have a reason not to.

### Serving the files

`Caddyfile` and `tmualab.service` in this directory give you a hardened static
server with compression, caching and security headers. Install:

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo cp deploy/tmualab.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now tmualab
```

### Shipping updates from this machine

```bash
deploy/push.sh you@your.static.ip          # rsync over SSH, atomic swap
```

---

## Before it is a real public site

- [x] **Domain** — `tmua.dev`, on Cloudflare Registrar, so the zone is already
      in the account and attaching it to Pages needs no DNS work.
- [x] **Self-host the fonts** — done; `deploy/fetch-fonts.sh` regenerates them.
      The site makes no third-party request at all.
- [ ] **Fill in the placeholders** — search the repo for `EDIT ME` (the "who
      runs this" card, the Discord/review/support links).
- [ ] **Check the university list** in `guide.html` against this cycle.
- [ ] **Analytics, if you want them** — use something that does not profile
      visitors (Plausible, Umami self-hosted, or Cloudflare Web Analytics,
      which is free and cookieless). The privacy page currently promises no
      analytics at all; if you add any, that page has to change.
- [ ] **Decide about accounts before you build them.** See below.

## If you add accounts

Right now the site stores nothing and transmits nothing, which is why its
privacy policy is three paragraphs long. The moment you hold student progress
on a server you take on real obligations — a lawful basis, a retention policy,
subject access and deletion requests, and a breach duty — and your users are
largely 16–18, so some will be minors. That is a product decision with legal
weight, not just an engineering one. It is worth being sure the feature is
worth it before building it; "progress follows you between devices" can also be
done with an export/import file, which the dashboard already has.
