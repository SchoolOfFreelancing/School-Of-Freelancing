#!/usr/bin/env bash
# Web Bot Auth key setup (Ed25519).
#
# Usage:  ./make-web-bot-auth-keys.sh /var/www/pro/.well-known
#
# - PRIVATE key is written to ~/.web-bot-auth/ (mode 600). NEVER put it in the web root.
# - PUBLIC key set (JWKS) is written to <dir>/http-message-signatures-directory.
set -euo pipefail

WELL_KNOWN_DIR="${1:?Usage: $0 <path-to-.well-known-dir>}"
KEY_DIR="${WEB_BOT_AUTH_KEY_DIR:-$HOME/.web-bot-auth}"
PRIV="$KEY_DIR/private-ed25519.pem"
OUT="$WELL_KNOWN_DIR/http-message-signatures-directory"

[ -e "$PRIV" ] && { echo "Refusing to overwrite existing key: $PRIV" >&2; exit 1; }
[ -d "$WELL_KNOWN_DIR" ] || { echo "No such directory: $WELL_KNOWN_DIR" >&2; exit 1; }

b64url() { base64 -w0 | tr '+/' '-_' | tr -d '='; }

umask 077
mkdir -p "$KEY_DIR"
openssl genpkey -algorithm ed25519 -out "$PRIV"

# Raw 32-byte public key = last 32 bytes of the DER SubjectPublicKeyInfo
X=$(openssl pkey -in "$PRIV" -pubout -outform DER | tail -c 32 | b64url)
# RFC 7638 JWK thumbprint (canonical member order: crv, kty, x) used as kid
KID=$(printf '{"crv":"Ed25519","kty":"OKP","x":"%s"}' "$X" | openssl dgst -sha256 -binary | b64url)

umask 022
cat > "$OUT" <<EOF
{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "x": "$X",
      "kid": "$KID"
    }
  ]
}
EOF

echo "Private key : $PRIV  (keep secret, back it up)"
echo "Public JWKS : $OUT"
echo "kid         : $KID"
