---
title: "How to Set Up Your Own VoIP Phone System | School of Freelancing"
author: "Karim (Masum)"
date: 2026-09-03
description: "Complete guide to setting up FusionPBX/FreeSWITCH for a professional VoIP phone system: installation, extensions, IVR, call routing, and SIP trunking."
---

# How to Set Up Your Own VoIP Phone System | School of Freelancing

## Overview

This guide teaches you how to deploy FusionPBX, an open-source VoIP PBX system, on your Ubuntu server. You'll handle extensions, IVR menus, call routing, and SIP trunking — giving your business complete control over phone infrastructure and eliminating expensive carrier fees.

## Prerequisites

- A production-ready Ubuntu 24.04 LTS server (minimum 2GB RAM, 20GB disk)
- A domain name for SIP registration
- An external SIP trunk provider (Twilio, Telnyx, or similar)
- Basic Linux command-line familiarity

## Step 1: Install FusionPBX

### 1.1 Install FreeSWITCH Dependencies

FusionPBX is built on FreeSWITCH. Install required packages:

```
sudo apt update && sudo apt install -y curl wget gnupg2
sudo apt install -y postgresql postgresql-contrib
```

### 1.2 Install FusionPBX

Clone the FusionPBX repository and run the installer:

```
cd /opt
sudo git clone https://github.com/fusionpbx/fusionpbx.git
cd fusionpbx
sudo chmod +x -R install
sudo ./install/install.sh
```

The installer will prompt for PostgreSQL password and domain configuration.

### 1.3 Secure the Web Interface

Access FusionPBX at https://your-domain.com (username: admin, password: provided during install).

Immediately change the default password in Settings → Accounts.

## Step 2: Configure Extensions

### 2.1 Create Your First Extension

In FusionPBX web interface: Dialplan → Extensions → Add

- **Extension:** 1000
- **Enabled:** Yes
- **Description:** Main Office
- **Voicemail:** Enable
- **Voicemail Password:** Strong password
- **Caller ID Name:** Your Business Name
- **Caller ID Number:** Main phone number

Save and note the SIP credentials (username/password) for connecting a phone or softphone.

### 2.2 Configure SIP Phones or Softphones

Use these credentials to register:

- **Proxy/SIP Server:** your-domain.com
- **Port:** 5060 (or 5061 for TLS)
- **Username:** Extension (e.g., 1000)
- **Password:** As configured above
- **Display Name:** Your name

## Step 3: Build an IVR (Interactive Voice Response)

### 3.1 Create an IVR Menu

In FusionPBX: Dialplan → IVR → Add

- **Name:** Main Menu
- **Greet Long:** "Welcome to [Company Name]. Press 1 for sales, 2 for support, 0 for operator."
- **Menu Options:**
  - Press 1 → Route to extension 1001 (Sales)
  - Press 2 → Route to extension 1002 (Support)
  - Press 0 → Route to extension 1000 (Operator)

## Step 4: Set Up SIP Trunking

### 4.1 Configure Telnyx SIP Trunk (Example)

Register with Telnyx, get your SIP credentials, then in FusionPBX: Advanced → SIP Profiles → External Profile

Add gateway settings (Gateways tab):

- **Name:** telnyx-trunk
- **Proxy:** sip.telnyx.com
- **Username:** Your Telnyx username
- **Password:** Your Telnyx password
- **Realm:** sip.telnyx.com

### 4.2 Create Dialplan for Outbound Calls

In FusionPBX: Dialplan → Dialplan → Add outbound route

- **Expression:** ^(\d{10})$ (for 10-digit US numbers)
- **Gateway:** telnyx-trunk
- **Action:** bridge {sip_from_user=$1@sip.telnyx.com}

## Step 5: Call Recording & Voicemail

### 5.1 Enable Call Recording

In Extensions settings, enable "Record Calls" for quality assurance and compliance.

### 5.2 Voicemail to Email

Configure voicemail-to-email in Settings → Email to notify users of voicemails automatically.

## Step 6: Backup & Monitoring

### 6.1 Backup FusionPBX Configuration

```
sudo pg_dump -U postgres fusionpbx > /backups/fusionpbx_$(date +%Y%m%d).sql
```

Schedule this daily via cron.

### 6.2 Monitor System Health

In FusionPBX: System → System Status

Monitor active calls, registered extensions, and SIP trunk status.

## Common Troubleshooting

### No Inbound/Outbound Audio (One-Way Audio)

Check: 1) SIP trunk credentials correct? 2) Firewall allows RTP ports (16384-32767)? 3) NAT settings correct?

### SIP Registration Fails

Verify: 1) Domain DNS resolves? 2) Port 5060/5061 open? 3) Username/password correct?

### Extensions Don't Register

In FreeSWITCH console: `freeswitch> sofia status` to see registration status. Check logs: `tail -f /var/log/freeswitch/freeswitch.log`

## Next Steps

- Add additional extensions for team members
- Create department-specific IVR menus
- Integrate with CRM (Salesforce, etc.)
- Set up call center features (agents, queues)
- Implement call center dialer functionality

## Learn More

For comprehensive hands-on training, enroll in our [FusionPBX VoIP Training](/freelancing-training/fusionpbx-training/) program.

## Frequently Asked Questions

### What is How to Set Up Your Own VoIP Phone System about?

Complete guide to setting up FusionPBX/FreeSWITCH for a professional VoIP phone system: installation, extensions, IVR, call routing, and SIP trunking.

### Who is this How to Set Up Your Own VoIP Phone System resource for?

It is intended for readers who want practical, understandable guidance related to the topic.

### What should I do after reading this How to Set Up Your Own VoIP Phone System resource?

Use the related service, training, or support pages to continue with a practical project or get technical assistance.
