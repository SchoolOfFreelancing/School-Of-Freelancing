# auth.md — Agent Registration for School of Freelancing

## Agent Authentication Metadata

```yaml
agent_auth:
  skill: https://schooloffreelancing.com/auth.md
  register_uri: https://schooloffreelancing.com/api/oauth/authorize
  registration_methods:
    - human_confirmed
    - oauth
```

## Agent Audience

This document is for browser-based AI agents and autonomous MCP-based agents assisting a human user who wants to enroll in a School of Freelancing training program or request an IT/AI service.

School of Freelancing supports two independent registration methods. Use whichever fits your integration: WebMCP form-fill for human-confirmed browser flows, or OAuth for autonomous agents that require a verified-identity access token.

## Method 1: WebMCP Form-Fill (Human-Confirmed)

This is a browser-side WebMCP tool that fills in the payment-confirmation form on the registration page. The human user must review the filled form and explicitly press Send in WhatsApp. Nothing is submitted automatically by the agent.

- Tool manifest: `https://schooloffreelancing.com/.well-known/agent-skills.json`
- Tool implementation: `https://schooloffreelancing.com/assets/js/tools.js`
- Registration page: `https://schooloffreelancing.com/register/`

### Supported Tools

- `confirm_registration_payment` — fills the registration form with `fullName`, `email`, `trainingOrService`, `paymentMethod`, and `transactionId`, then opens WhatsApp with the details pre-filled for human review.
- `get_registration_form_options` — returns the valid training/service names and payment method names accepted by `confirm_registration_payment`.

No credentials, tokens, or API keys are involved in this method.

Payment confirmation always requires explicit human action. The agent cannot independently complete the registration.

## Method 2: OAuth 2.0

School of Freelancing provides an OAuth 2.0 authorization-code flow for agents that require authenticated access to protected resources.

### OAuth Discovery

- Authorization server metadata: `https://schooloffreelancing.com/.well-known/oauth-authorization-server`
- Protected resource metadata: `https://schooloffreelancing.com/.well-known/oauth-protected-resource/mcp`

### OAuth Endpoints

- Authorization endpoint: `https://schooloffreelancing.com/api/oauth/authorize`
- Token endpoint: `https://schooloffreelancing.com/api/oauth/token`
- Revocation endpoint: `https://schooloffreelancing.com/api/oauth/revoke`
- Userinfo endpoint: `https://schooloffreelancing.com/api/oauth/userinfo`

### OAuth Parameters

- Grant type: `authorization_code`
- Response type: `code`
- Token type: `Bearer`
- Scope: `openid email`
- Access-token lifetime: 1 hour
- Identity assertion: Google-verified email
- Revocation events: supported

### Authorization Flow

1. Direct the human user to the authorization endpoint with `response_type=code`, a registered `redirect_uri`, and a unique `state` value.
2. The user authenticates and grants consent.
3. The authorization server redirects the user back to the supplied `redirect_uri` with a one-time authorization code.
4. Exchange the authorization code at the token endpoint using `grant_type=authorization_code`.
5. Use the resulting Bearer access token when accessing protected resources.
6. Revoke the access token at the revocation endpoint when it is no longer required.

Example protected resource:

`https://agents.schooloffreelancing.com/mcp`

Agents must not request, store, or expose user passwords or Google credentials.

## Credential Use

No credentials are issued for the WebMCP method.

For OAuth, the credential issued to the agent is a short-lived Bearer access token returned by the token endpoint.

No client secret, API key, password, or long-lived agent credential is issued through this registration document.

Public catalog information is available without authentication:

- `https://schooloffreelancing.com/llms.txt`
- `https://schooloffreelancing.com/llms-full.txt`

## Protected Resource

The MCP protected resource is:

`https://agents.schooloffreelancing.com/mcp`

Protected-resource metadata:

`https://schooloffreelancing.com/.well-known/oauth-protected-resource/mcp`

Agents accessing protected resources must send:

`Authorization: Bearer <access_token>`

## Discovery

### Agent Skills

`https://schooloffreelancing.com/.well-known/agent-skills.json`

### Authentication

`https://schooloffreelancing.com/auth.md`

### OAuth Authorization Server

`https://schooloffreelancing.com/.well-known/oauth-authorization-server`

### OAuth Protected Resource

`https://schooloffreelancing.com/.well-known/oauth-protected-resource/mcp`

### Training Catalog

`https://schooloffreelancing.com/freelancing-training/`

### Services Catalog

`https://schooloffreelancing.com/linux-ai-services/`

### LLM Content

`https://schooloffreelancing.com/llms.txt`

`https://schooloffreelancing.com/llms-full.txt`

## Agent Registration

For human-confirmed registration, use:

`https://schooloffreelancing.com/contact-us/`

The supported registration method is:

`human_confirmed`

For autonomous authenticated access, use the OAuth authorization-code flow described above.

Agents must obtain explicit user authorization before initiating an OAuth authorization request and must not impersonate a user or submit a registration without the required human authorization.

## Security Requirements

- Use HTTPS for all authentication and registration URLs.
- Use a unique `state` value for every OAuth authorization request.
- Do not expose authorization codes or access tokens in URLs, logs, page content, or user-visible messages.
- Treat access tokens as confidential credentials.
- Use the minimum OAuth scope required for the requested operation.
- Revoke tokens when they are no longer required.
- Do not request or store Google passwords.
- Do not bypass human confirmation for WebMCP registration.
- Do not automatically send payment-confirmation messages through WhatsApp.

## Canonical Authentication Document

This document is the canonical agent authentication and registration document for School of Freelancing:

`https://schooloffreelancing.com/auth.md`
