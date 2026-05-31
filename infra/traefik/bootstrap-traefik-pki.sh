#!/bin/sh
set -eu

PKI_DIR="${1:-/pki}"
ROOT_CA_KEY="$PKI_DIR/rootCA.key"
ROOT_CA_CRT="$PKI_DIR/rootCA.crt"
SERVER_KEY="$PKI_DIR/localhost.key"
SERVER_CRT="$PKI_DIR/localhost.crt"
SERVER_CSR="$PKI_DIR/localhost.csr"
SERVER_EXT="$PKI_DIR/localhost.ext"
ROOT_CA_SERIAL="$PKI_DIR/rootCA.srl"

mkdir -p "$PKI_DIR"

if [ ! -f "$ROOT_CA_KEY" ] || [ ! -f "$ROOT_CA_CRT" ]; then
  openssl genrsa -out "$ROOT_CA_KEY" 4096 >/dev/null 2>&1
  openssl req -x509 -new -nodes \
    -key "$ROOT_CA_KEY" \
    -sha256 \
    -days 3650 \
    -out "$ROOT_CA_CRT" \
    -subj "/CN=DASS Local Root CA" >/dev/null 2>&1
fi

if [ ! -f "$SERVER_KEY" ] || [ ! -f "$SERVER_CRT" ]; then
  openssl genrsa -out "$SERVER_KEY" 2048 >/dev/null 2>&1
  cat >"$SERVER_EXT" <<'EOF'
subjectAltName=DNS:localhost,IP:127.0.0.1,IP:::1
extendedKeyUsage=serverAuth
keyUsage=digitalSignature,keyEncipherment
basicConstraints=CA:FALSE
EOF
  openssl req -new \
    -key "$SERVER_KEY" \
    -out "$SERVER_CSR" \
    -subj "/CN=localhost" >/dev/null 2>&1
  openssl x509 -req \
    -in "$SERVER_CSR" \
    -CA "$ROOT_CA_CRT" \
    -CAkey "$ROOT_CA_KEY" \
    -CAcreateserial \
    -out "$SERVER_CRT" \
    -days 825 \
    -sha256 \
    -extfile "$SERVER_EXT" >/dev/null 2>&1
fi

chmod 600 "$ROOT_CA_KEY" "$SERVER_KEY"
rm -f "$SERVER_CSR" "$SERVER_EXT" "$ROOT_CA_SERIAL"

printf '%s\n' "$ROOT_CA_CRT"
