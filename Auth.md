# auth.md — Agent Authentication & Registration

This document describes how to authenticate and register as an agent with School of Freelancing APIs.

## Overview

School of Freelancing provides multiple authentication methods for agent integration:
- **OAuth 2.0** with PKCE for third-party agents
- **OpenID Connect** for identity verification
- **Model Context Protocol (MCP)** for extended capabilities
- **WebMCP** for browser-based agents

All authentication endpoints are discoverable via `.well-known/` endpoints.

## Discovery Endpoints

Agents should first discover available authentication methods:

```bash
# OAuth 2.0 Authorization Server
curl https://www.schooloffreelancing.com/.well-known/oauth-authorization-server.json

# OpenID Connect Configuration
curl https://www.schooloffreelancing.com/.well-known/openid-configuration.json

# MCP Server Configuration
curl https://www.schooloffreelancing.com/.well-known/mcp.json

# WebMCP Configuration
curl https://www.schooloffreelancing.com/.well-known/webmcp.json

# Agent Skills Index
curl https://www.schooloffreelancing.com/.well-known/skills.json

# OAuth Protected Resource Metadata (RFC 9728)
curl https://www.schooloffreelancing.com/.well-known/oauth-protected-resource
```

## Agent Registration Methods

The authorization server metadata advertises an `agent_auth` block describing
how agents register:

- **Audience:** autonomous AI agents integrating with School of Freelancing
  discovery and catalog APIs.
- **Anonymous registration** (`identity_types_supported: ["anonymous"]`):
  agents register without a user identity by POSTing to the
  `register_uri` (`https://www.schooloffreelancing.com/api/oauth/register`)
  and receive an `oauth2_client` credential (client ID and secret).
- **Claiming:** an anonymous registration can later be claimed by a human
  account via the `claim_uri`
  (`https://www.schooloffreelancing.com/api/oauth/claim`).
- **Credential use:** the issued client credentials are exchanged for access
  tokens at the token endpoint (see flows below); tokens are sent as
  `Authorization: Bearer` headers.
- **Revocation:** credentials can be revoked at
  `https://www.schooloffreelancing.com/api/oauth/revoke`.

## OAuth 2.0 Registration

### 1. Register Application

POST to the registration endpoint with your agent details:

```bash
curl -X POST https://www.schooloffreelancing.com/api/oauth/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My AI Agent",
    "description": "Agent for discovering training programs",
    "redirect_uris": [
      "https://your-domain.com/callback"
    ],
    "grant_types": [
      "authorization_code",
      "refresh_token"
    ],
    "response_types": [
      "code"
    ],
    "scopes": [
      "openid",
      "profile",
      "training:read",
      "services:read"
    ],
    "contacts": [
      "support@your-domain.com"
    ]
  }'
```

**Response:**

```json
{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "client_id_issued_at": 1234567890,
  "client_secret_expires_at": 0,
  "registration_client_uri": "https://www.schooloffreelancing.com/api/oauth/client/your-client-id",
  "registration_access_token": "registration-token"
}
```

Store these credentials securely. The `client_id` is public, but `client_secret` must remain confidential.

### 2. Authorization Code Flow (with PKCE)

#### Step A: Generate PKCE Parameters

```bash
# Generate code verifier (43-128 characters)
CODE_VERIFIER=$(openssl rand -hex 32)

# Generate code challenge
CODE_CHALLENGE=$(echo -n $CODE_VERIFIER | sha256sum | base64 | tr -d '=' | tr '+/' '-_')
```

#### Step B: Redirect User to Authorization Endpoint

```
https://www.schooloffreelancing.com/api/oauth/authorize?
  client_id=your-client-id&
  response_type=code&
  scope=openid%20profile%20training:read&
  redirect_uri=https://your-domain.com/callback&
  code_challenge={CODE_CHALLENGE}&
  code_challenge_method=S256&
  state={random-state}
```

#### Step C: Handle Redirect and Get Code

User authorizes, you receive:
```
https://your-domain.com/callback?
  code=authorization-code&
  state={same-state}
```

Verify `state` parameter matches your request.

#### Step D: Exchange Code for Token

```bash
curl -X POST https://www.schooloffreelancing.com/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&
      client_id=your-client-id&
      client_secret=your-client-secret&
      code=authorization-code&
      redirect_uri=https://your-domain.com/callback&
      code_verifier=${CODE_VERIFIER}"
```

**Response:**

```json
{
  "access_token": "access-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-token",
  "id_token": "jwt-id-token",
  "scope": "openid profile training:read"
}
```

### 3. Client Credentials Flow (Server-to-Server)

For backend agent services:

```bash
curl -X POST https://www.schooloffreelancing.com/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&
      client_id=your-client-id&
      client_secret=your-client-secret&
      scope=training:read%20services:read"
```

**Response:**

```json
{
  "access_token": "access-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "training:read services:read"
}
```

## Using Access Tokens

### API Requests

Include the access token in the Authorization header:

```bash
curl https://www.schooloffreelancing.com/api/skills/training-discovery \
  -H "Authorization: Bearer access-token"
```

### Refreshing Tokens

When access token expires:

```bash
curl -X POST https://www.schooloffreelancing.com/api/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&
      client_id=your-client-id&
      client_secret=your-client-secret&
      refresh_token=refresh-token"
```

## OAuth Protected Resource

After authentication, access protected resources:

```bash
# Get user info
curl https://www.schooloffreelancing.com/api/oauth/userinfo \
  -H "Authorization: Bearer access-token"

# Response
{
  "sub": "user-id",
  "name": "User Name",
  "email": "user@domain.com",
  "email_verified": true,
  "aud": "your-client-id"
}
```

## Scopes

| Scope | Description | Required For |
|-------|-------------|--------------|
| `openid` | OpenID Connect identity | All authenticated requests |
| `profile` | User profile information | User details |
| `email` | Email address | Contact information |
| `training:read` | Read training programs | Training discovery |
| `services:read` | Read service offerings | Service discovery |
| `resources:read` | Read resources (FAQs, testimonials) | Resource access |
| `agent:access` | Full agent access | MCP/API integration |
| `offline_access` | Refresh tokens | Long-lived sessions |

## Model Context Protocol (MCP)

### Endpoint Discovery

```bash
curl https://www.schooloffreelancing.com/.well-known/mcp.json
```

### Connection Methods

#### 1. Server-Sent Events (SSE)

```javascript
const eventSource = new EventSource(
  'https://www.schooloffreelancing.com/api/mcp/sse',
  { headers: { 'Authorization': 'Bearer access-token' } }
);

eventSource.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle MCP messages
};
```

#### 2. WebSocket

```javascript
const ws = new WebSocket(
  'wss://www.schooloffreelancing.com/api/mcp/ws',
  ['mcp'],
  { headers: { 'Authorization': 'Bearer access-token' } }
);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle MCP messages
};
```

#### 3. Standard I/O

```bash
# For standalone agents
curl -X POST https://www.schooloffreelancing.com/api/mcp/stdio \
  -H "Authorization: Bearer access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

## WebMCP Integration

For browser-based agents, use WebMCP:

```html
<script src="https://www.schooloffreelancing.com/webmcp/client.js"></script>

<script>
  const webMcp = new WebMCP({
    baseUrl: 'https://www.schooloffreelancing.com',
    clientId: 'your-client-id',
    scopes: ['openid', 'training:read', 'services:read']
  });

  // Initialize and authenticate
  await webMcp.init();

  // Call tools
  const results = await webMcp.callTool('search_training', {
    query: 'Linux administration',
    category: 'linux'
  });
</script>
```

## Agent Skills

Discover available skills via the skills endpoint:

```bash
curl https://www.schooloffreelancing.com/.well-known/skills.json
```

Available skills include:
- `training-discovery` - Search and find training programs
- `service-discovery` - Find IT and AI services
- `resource-access` - Access FAQs, testimonials, guides
- `enrollment` - Training enrollment information
- `contact` - Contact information and support
- `content-negotiation` - Format conversion
- `agent-registration` - Register custom agents
- `mcp-integration` - Use Model Context Protocol

## Security Best Practices

1. **Always use HTTPS** - All endpoints require TLS
2. **Store secrets securely** - Never commit `client_secret` to version control
3. **Validate redirect URIs** - Only register trusted callback URLs
4. **Use PKCE** - Especially for public/mobile agents
5. **Verify signatures** - Validate JWT `id_token` signatures using JWKS endpoint
6. **Monitor token expiry** - Refresh tokens before they expire
7. **Revoke tokens** - Call the revocation endpoint when done

## Rate Limiting

- **Public endpoints**: 100 requests per minute per IP
- **Authenticated endpoints**: 1,000 requests per minute per user
- **Authorization endpoint**: 10 requests per minute per IP
- **Token endpoint**: 5 requests per minute per IP

## Support

For authentication issues:
- **Documentation**: https://www.schooloffreelancing.com/Auth.md
- **OIDC Configuration**: https://www.schooloffreelancing.com/.well-known/openid-configuration.json
- **MCP Configuration**: https://www.schooloffreelancing.com/.well-known/mcp.json
- **Contact**: See https://www.schooloffreelancing.com/contact-us/

## Examples

### Python Agent

```python
import requests
from authlib.integrations.requests_client import OAuth2Session

client = OAuth2Session(
    client_id='your-client-id',
    client_secret='your-client-secret',
    scope='openid training:read services:read'
)

token = client.fetch_token(
    'https://www.schooloffreelancing.com/api/oauth/token',
    grant_type='client_credentials'
)

# Use token for API requests
headers = {'Authorization': f'Bearer {token["access_token"]}'}
response = requests.get(
    'https://www.schooloffreelancing.com/api/skills/training-discovery',
    headers=headers,
    params={'query': 'Linux'}
)
```

### JavaScript Agent

```javascript
const client = {
  id: 'your-client-id',
  secret: 'your-client-secret'
};

const tokenResponse = await fetch(
  'https://www.schooloffreelancing.com/api/oauth/token',
  {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: client.id,
      client_secret: client.secret,
      scope: 'training:read services:read'
    })
  }
);

const token = await tokenResponse.json();

// Use token
const response = await fetch(
  'https://www.schooloffreelancing.com/api/skills/training-discovery',
  {
    headers: {
      'Authorization': `Bearer ${token.access_token}`
    }
  }
);
```

---

**Last Updated**: July 23, 2026
