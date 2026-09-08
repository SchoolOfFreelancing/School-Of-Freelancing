# auth.md — Agent Registration for School of Freelancing

## Agent Audience

This document is for browser-based AI agents (e.g. Claude in Chrome,
ChatGPT Operator, or any WebMCP-capable browser extension) and for
autonomous MCP-based agents assisting a human user who wants to enroll
in a School of Freelancing training program or request an IT/AI
service.

School of Freelancing supports two independent registration methods.
Use whichever fits your integration: WebMCP form-fill for
human-confirmed browser flows, or OAuth for autonomous agents that need
a verified-identity access token.

## Method 1: WebMCP Form-Fill (human-confirmed)

This is a browser-side WebMCP tool that fills in the
payment-confirmation form on the registration page. The human user must
review the filled form and press Send in WhatsApp — nothing is ever
submitted automatically by the agent.

- Tool manifest: `https://schooloffreelancing.com/.well-known/agent-skills.json`
- Tool implementation: `https://schooloffreelancing.com/assets/js/tools.js`
- Form page: `https://schooloffreelancing.com/register/`

Supported tools:

- `confirm_registration_payment` — fills the registration form
  (fullName, email, trainingOrService, paymentMethod, transactionId)
  and opens WhatsApp with the details pre-filled for human review.
- `get_registration_form_options` — returns the valid
  training/service names and payment method names accepted by
  `confirm_registration_payment`.

No credentials, tokens, or API keys are involved in this method.
Payment confirmation always requires explicit human action (sending the
pre-filled WhatsApp message); the agent cannot complete registration on
its own.

## Method 2: OAuth 2.0 (verified identity, autonomous agents)

School of Freelancing runs a standard OAuth 2.0 authorization code
server, backed by Google as the identity provider. This grants an
agent a short-lived, verified-email access token that can be used to
authenticate to protected endpoints (e.g. the MCP server) without human
review of each request.

- Authorization server metadata: `https://schooloffreelancing.com/.well-known/oauth-authorization-server`
- Protected resource metadata: `https://schooloffreelancing.com/.well-known/oauth-protected-resource/mcp`
- Authorization endpoint: `https://schooloffreelancing.com/api/oauth/authorize`
- Token endpoint: `https://schooloffreelancing.com/api/oauth/token`
- Revocation endpoint: `https://schooloffreelancing.com/api/oauth/revoke`
- Userinfo endpoint: `https://schooloffreelancing.com/api/oauth/userinfo`

Supported grant: `authorization_code` (`response_types_supported: ["code"]`).
Identity assertion is a Google-verified email (`verified_email`), returned
as a JWT bearer access token (`token_type: "Bearer"`, 1 hour TTL) with
`scope: "openid email"`.

Flow:

1. Send the user to the authorization endpoint with
   `response_type=code`, your `redirect_uri`, and a `state` value.
2. The user authenticates with Google and grants consent.
3. The server redirects back to your `redirect_uri` with a one-time
   `code`.
4. Exchange the `code` at the token endpoint
   (`grant_type=authorization_code`) for a Bearer access token.
5. Use the access token as `Authorization: Bearer <token>` against
   protected resources, e.g. `https://agents.schooloffreelancing.com/mcp`.
6. Revoke the token at the revocation endpoint when done, if desired.

Tokens can be revoked; revocation events are supported
(`events_supported: ["revocation"]`).

## Credential Use

No credentials are issued for the WebMCP method (Method 1). For OAuth
(Method 2), the only credential is the short-lived Bearer access token
returned by the token endpoint — no client secret, API key, or
long-lived credential is ever issued to an agent. Public catalog
information (training programs, services) is available without
authentication either way — see `https://schooloffreelancing.com/llms.txt`
and `https://schooloffreelancing.com/llms-full.txt`.

## Discovery

- Agent skills index: `https://schooloffreelancing.com/.well-known/agent-skills.json`
- OAuth authorization server metadata: `https://schooloffreelancing.com/.well-known/oauth-authorization-server`
- OAuth protected resource metadata: `https://schooloffreelancing.com/.well-known/oauth-protected-resource/mcp`
- Training catalog: `https://schooloffreelancing.com/freelancing-training/`
- Services catalog: `https://schooloffreelancing.com/linux-ai-services/`
- Full site content for LLMs: `https://schooloffreelancing.com/llms-full.txt`
