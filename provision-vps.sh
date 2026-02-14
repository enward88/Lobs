#!/usr/bin/env bash
# VPS Provisioning Script for Lobs (Solana Program + Dashboard)
# Target: Ubuntu 22.04 LTS, minimum 4GB RAM
# Usage: ssh root@your-vps 'bash -s' < provision-vps.sh

set -euo pipefail

echo "=== Lobs VPS Provisioning ==="
echo "Target: Solana program build + deploy, dashboard hosting"
echo ""

# ─── System updates ──────────────────────────────────────
echo "[1/8] Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  build-essential pkg-config libssl-dev libudev-dev \
  git curl wget unzip jq \
  nginx certbot python3-certbot-nginx \
  ufw fail2ban

# ─── Firewall ────────────────────────────────────────────
echo "[2/8] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# ─── Create deploy user ─────────────────────────────────
echo "[3/8] Creating deploy user..."
if ! id -u lobs &>/dev/null; then
  useradd -m -s /bin/bash lobs
  usermod -aG sudo lobs
  mkdir -p /home/lobs/.ssh
  cp /root/.ssh/authorized_keys /home/lobs/.ssh/ 2>/dev/null || true
  chown -R lobs:lobs /home/lobs/.ssh
  chmod 700 /home/lobs/.ssh
  chmod 600 /home/lobs/.ssh/authorized_keys 2>/dev/null || true
fi

# Everything below runs as the lobs user
sudo -u lobs bash << 'USERBLOCK'
set -euo pipefail
cd /home/lobs

# ─── Rust ─────────────────────────────────────────────────
echo "[4/8] Installing Rust..."
if ! command -v rustc &>/dev/null; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
fi
source "$HOME/.cargo/env"
rustup default stable
rustc --version

# ─── Solana CLI ───────────────────────────────────────────
echo "[5/8] Installing Solana CLI..."
if ! command -v solana &>/dev/null; then
  sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
fi
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> "$HOME/.bashrc"
solana --version

# Generate a keypair if none exists (for program deployment)
if [ ! -f "$HOME/.config/solana/id.json" ]; then
  echo "Generating Solana keypair..."
  solana-keygen new --no-passphrase -o "$HOME/.config/solana/id.json"
fi
echo "Deploy wallet: $(solana address)"

# Default to mainnet (switch to devnet for testing with: solana config set --url devnet)
solana config set --url mainnet-beta

# ─── Anchor CLI ───────────────────────────────────────────
echo "[6/8] Installing Anchor CLI..."
if ! command -v anchor &>/dev/null; then
  cargo install --git https://github.com/coral-xyz/anchor avm --force
  avm install 0.30.1
  avm use 0.30.1
fi
anchor --version

# ─── Node.js (via nvm) ───────────────────────────────────
echo "[7/8] Installing Node.js..."
if ! command -v node &>/dev/null; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
fi
node --version
npm --version

# ─── Clone & build ────────────────────────────────────────
echo "[8/8] Cloning repository..."
if [ ! -d "$HOME/Lobs" ]; then
  git clone https://github.com/enward88/Lobs.git "$HOME/Lobs"
else
  cd "$HOME/Lobs" && git pull && cd ..
fi

echo ""
echo "=== Provisioning complete ==="
echo ""
echo "Next steps:"
echo "  1. ssh lobs@your-vps"
echo "  2. cd ~/Lobs"
echo "  3. anchor build                    # Build the Solana program"
echo "  4. anchor deploy                   # Deploy to mainnet (needs SOL)"
echo "  5. cd app && npm install && npm run build  # Build dashboard"
echo ""
echo "To set the $LOBS token mint after Pump.fun launch:"
echo "  solana program invoke <PROGRAM_ID> initialize <TOKEN_MINT_ADDRESS>"
echo ""
echo "Deploy wallet address: $(solana address)"
echo "Fund this wallet with SOL for program deployment (~3-5 SOL)"
USERBLOCK

echo ""
echo "=== Root-level setup complete ==="
echo "VPS is ready. Log in as: ssh lobs@$(hostname -I | awk '{print $1}')"
