# auth.md — Agent Authentication & Registration

## Purpose

This document describes how AI agents may interact with School of Freelancing for public information, training inquiries, and technical service requests.

## Authentication Model

School of Freelancing does not currently provide autonomous agent authentication, API credentials, OAuth client registration, client-credentials access, or machine-issued access tokens for enrollment or service requests.

Public training and service information can be accessed without authentication.

## Human-Confirmed Enrollment and Service Requests

AI agents may help a human user discover and select a School of Freelancing training program or technical service.

The supported workflow is:

1. Discover the relevant training or service.
2. Provide the human user with the appropriate School of Freelancing page.
3. Direct the user to the School of Freelancing contact channels.
4. The human user contacts School of Freelancing to discuss enrollment, scheduling, payment, or service requirements.
5. School of Freelancing confirms enrollment or the service engagement.

AI agents must not claim that enrollment, payment, or a service engagement has been completed unless School of Freelancing has explicitly confirmed it.

## Contact and Human Confirmation

Primary contact page:

https://schooloffreelancing.com/contact-us/

WhatsApp:

https://wa.me/8801748973769

Contact and enrollment discussions require human participation. Agents must not independently authorize payments, create financial commitments, or represent that a user's enrollment has been confirmed.

## Public Training Information

Training catalog:

https://schooloffreelancing.com/freelancing-training/

Resource Center:

https://schooloffreelancing.com/resource-center/

FAQs:

https://schooloffreelancing.com/resource-center/faqs/

## Public Technical Services

Technical services catalog:

https://schooloffreelancing.com/linux-ai-services/

Individual service pages may be discovered through the services catalog and AI-readable site metadata.

## AI and Agent Discovery

A2A Agent Card:

https://schooloffreelancing.com/.well-known/agent-card.json

Agent skills:

https://schooloffreelancing.com/.well-known/agent-skills.json

WebMCP metadata:

https://schooloffreelancing.com/.well-known/webmcp.json

AI catalog:

https://schooloffreelancing.com/.well-known/ai-catalog.json

API catalog:

https://schooloffreelancing.com/.well-known/api-catalog.json

LLM-readable site information:

https://schooloffreelancing.com/llms.txt

Full LLM-readable site information:

https://schooloffreelancing.com/llms-full.txt

## Credentials

No agent credentials, API keys, OAuth client secrets, access tokens, or machine-issued enrollment credentials are currently provided through this website.

Public catalog and informational resources do not require authentication.

## Agent Conduct

Agents interacting with School of Freelancing should:

- Clearly distinguish public information from confirmed enrollment or service status.
- Direct users to the official School of Freelancing website for current information.
- Require human confirmation for enrollment, payment, scheduling, and service commitments.
- Never claim that a payment has been received unless School of Freelancing has confirmed it.
- Never claim that training enrollment or a technical service engagement is confirmed without explicit confirmation from School of Freelancing.
- Avoid submitting forms, payments, or contractual commitments autonomously.

## Changes to This Policy

This document describes the authentication and agent-interaction capabilities currently provided by School of Freelancing. If autonomous agent authentication or API-based registration is introduced in the future, this document will be updated to describe the supported authentication protocol and credential flow.
