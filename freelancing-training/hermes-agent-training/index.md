index_md_content = """# Hermes Agent Training for Freelancers

Get hands-on Hermes Agent training to acquire direct clients via LinkedIn, YouTube, freelancer marketplaces, and job aggregators.

---

## Overview

You'll become a production-ready Hermes Agent engineer with a public portfolio proving real deployment skills. Earn via freelance gigs, direct client contracts, or building your own agent-based services.

### Training at a Glance

| Aspect | Detail |
| :--- | :--- |
| **Duration** | 12 sessions over 2 weeks, 1.5–2 hours per session (~24 hours total) |
| **Format** | Live, Hands-On Training with no Pre-Recorded Videos |
| **Covers** | Server setup, Nginx & SSL, Hermes install, MCP, systemd, production hardening, bots & automation, marketplace profiles, service videos, job bidding, client delivery, capstone |
| **Best for** | Aspiring freelancers, Linux admins, and developers wanting hands-on AI agent deployment skills to launch a freelance career |
| **Marketplaces** | Upwork, Guru, Freelancer |

---

## Participation Requirements

### 1. Training Prerequisites
* **DigitalOcean account**, Any Domain, & Verified Marketplace Profiles.
* **Rigorous:** Need to have patience and concentration during all training sessions.

### 2. Connectivity
* Portable messaging devices for 24/7 client communication.
* Reliable fiber-optic internet access for uninterruptible training sessions.

### 3. Training Rules
* Rules apply to all School of Freelancing trainees to keep training fair, focused, and productive.

---

## Why Join This Training?

AI agent deployment is a fast-growing, low-competition category on Upwork, Guru, and Freelancer. Most freelancers can't fill it because they've never deployed Hermes Agent in production. 

This training closes that gap fast: existing Linux/cloud freelancers add a high-ticket skill on top of what they already know, while newcomers leave with a public GitHub deployment, 3 marketplace profiles, and 5 service videos as instant proof of work. Job search, proposals, client communication, and delivery are covered too, so you're not just trained — you're positioned to get hired.

### You'll Leave With:
1. **Hands-on experience** in live, self-hosted Hermes Agent deployment.
2. **Marketplace portfolio** proving real support and Freelance-ready AI agent skills.
3. **Stronger habits** for deploying, troubleshooting, and reviewing Hermes Agent projects.

---

## Training Curriculum (12 Sessions)

*2 weeks, 6 sessions/week, 1.5–2 hours per session*

| Session | Topic | Content |
| :---: | :--- | :--- |
| **1** | Server & Foundations | DigitalOcean droplet, Ubuntu hardening, domain DNS, SSH keys, UFW |
| **2** | Nginx & SSL | Nginx reverse proxy, Certbot/Let's Encrypt SSL, domain live-check |
| **3** | Hermes Agent Install | Source/Docker install, .env config, AI provider (Ollama/API) connection |
| **4** | Core Features | Skills, Memory, MCP servers, systemd service, auto-restart |
| **5** | Production Hardening | Fail2ban, backups, logging, monitoring, security review |
| **6** | Bots & Automation | Telegram/Discord integration, cron jobs, custom tools |
| **7** | Portfolio Build | Deploy your own public GitHub repo as proof of work |
| **8** | Marketplace Setup | Create Upwork, Guru, Freelancer profiles — bio, portfolio links, pricing |
| **9** | Content & Marketing | 5 Hermes Agent service videos, LinkedIn/social post templates |
| **10** | Job Search & Bidding | Search filters, proposal writing, fast-apply strategy, red flags to avoid |
| **11** | Client Communication & Delivery | Onboarding, scope-setting, delivery, revisions, invoicing/withdrawal |
| **12** | Capstone + Review | Live Q&A, real client troubleshooting, collect testimonials |

---

## Program Details

* **Price:** $199 USD
* **Provider:** School of Freelancing
* **Level:** Intermediate to Advanced
* **Prerequisites:** 
  * Ubuntu Server (24.04/26.04 LTS)
  * DigitalOcean Account
  * Registered Domain/Subdomain
  * Verified Upwork/Guru/Freelancer Account

---

## Community & Resources

* [Technical Documentation](https://github.com/SchoolOfFreelancing/Linux-Freelancing-Training.git)
* [School of Freelancing Home](https://schooloffreelancing.com/)
"""

with open("index.md", "w", encoding="utf-8") as f:
    f.write(index_md_content)

print("index.md created successfully.")
