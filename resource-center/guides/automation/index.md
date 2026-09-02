---
title: "How to Automate Tasks with Python & Cron"
author: "Karim (Masum)"
date: 2026-09-03
description: "Step-by-step guide to automating business tasks: email, file processing, data entry, and scheduling with Python and cron."
---

## Overview

This guide teaches automating common business tasks: processing files, sending emails, managing data, and scheduling recurring jobs. You'll write a Python script and schedule it to run automatically on your Linux server.

## Prerequisites

- Ubuntu Linux server with Python 3 installed
- Basic Python programming knowledge
- A repetitive task you want to automate

## Example: Automated Daily Report Email

Let's automate sending a daily sales report via email:

## Step 1: Create the Python Script

```
#!/usr/bin/env python3
import smtplib
import pandas as pd
from datetime import datetime, timedelta, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# How to Automate Tasks with Python & Cron
df = pd.read_csv('/data/sales.csv')
yesterday = df[df['date'] == (datetime.now().date() - timedelta(days=1))]

## Calculate metrics
total_sales = yesterday['amount'].sum()
orders = len(yesterday)
avg_order = total_sales / orders if orders > 0 else 0

## Create email
msg = MIMEMultipart()
msg['From'] = 'reports@yourcompany.com'
msg['To'] = 'manager@yourcompany.com'
msg['Subject'] = f'Daily Sales Report - {datetime.now().date()}'

body = f"""
Yesterday's Sales Summary:
- Total Revenue: ${total_sales:,.2f}
- Number of Orders: {orders}
- Average Order Value: ${avg_order:,.2f}

View full report at: yourcompany.com/reports
"""

msg.attach(MIMEText(body, 'plain'))

## Send email
server = smtplib.SMTP('localhost', 587)
server.starttls()
server.login('your-email@gmail.com', 'app-password')
server.send_message(msg)
server.quit()

print(f"Report sent successfully at {datetime.now()}")
```

## Step 2: Save and Test

```
nano /home/admin/send_report.py
chmod +x /home/admin/send_report.py
python3 /home/admin/send_report.py
```

## Step 3: Schedule with Cron

Edit crontab to run daily at 8 AM:

```
crontab -e
```

Add this line:

```
0 8 * * * /usr/bin/python3 /home/admin/send_report.py >> /var/log/report.log 2>&1
```

## More Automation Ideas

- **File Processing:** Convert images, compress files, organize folders
- **Data Entry:** Parse PDFs, extract data, populate databases
- **API Integration:** Sync data between tools (Stripe to database, etc.)
- **Backup & Cleanup:** Archive old files, delete temp data daily
- **Monitoring:** Check if services are running, send alerts if down

## Best Practices

- Log output for debugging: `>> /var/log/script.log 2>&1`
- Use absolute paths in scripts (not relative paths)
- Test scripts manually before scheduling with cron
- Monitor cron logs: `grep CRON /var/log/syslog`
- Set proper error handling and email alerts on failure

Learn advanced automation techniques in our [OpenClaw Automation Training](/freelancing-training/openclaw-training/) program.

## Frequently Asked Questions

### What is How to Automate Your First Repetitive Task about?

Step-by-step guide to automating business tasks: email, file processing, data entry, and scheduling with Python and cron.

### Who is this How to Automate Your First Repetitive Task resource for?

It is intended for readers who want practical, understandable guidance related to the topic.

### What should I do after reading this How to Automate Your First Repetitive Task resource?

Use the related service, training, or support pages to continue with a practical project or get technical assistance.
