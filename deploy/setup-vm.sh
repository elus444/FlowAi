#!/usr/bin/env bash
# One-time setup for a fresh Ubuntu VM (tested against Oracle Cloud's
# Always Free Ampere/ARM shape running Ubuntu 22.04/24.04).
# Run as: bash setup-vm.sh
set -euo pipefail

echo "==> Installing Docker Engine + Compose plugin"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "==> Adding $(whoami) to the docker group (log out/in, or run 'newgrp docker', for this to take effect without sudo)"
sudo usermod -aG docker "$(whoami)"

echo "==> Enabling Docker to start on boot"
sudo systemctl enable docker

echo "==> Opening firewall for HTTP/HTTPS (iptables -- Oracle images use this by default, not ufw)"
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
# Persist across reboots if iptables-persistent is available; harmless if not.
sudo netfilter-persistent save 2>/dev/null || true

cat <<'EOF'

==> Done. Remaining steps (see deploy/README.md for the full walkthrough):

1. In the Oracle Cloud Console, open port 80 and 443 in the VM's subnet's
   Security List (or attached Network Security Group) -- the iptables
   rules above only affect the VM's own firewall, not Oracle's virtual
   cloud network firewall in front of it.

2. Clone the repo and configure secrets:
     git clone https://github.com/elus444/FlowAi.git
     cd FlowAi
     cp deploy/.env.production.example .env
     nano .env   # fill in DOMAIN (see the comment in that file), SECRET_KEY, POSTGRES_PASSWORD

3. Bring the stack up:
     newgrp docker   # or log out/in first, so this shell has docker group membership
     docker compose -f docker-compose.prod.yml --env-file .env up -d --build

4. Watch it come up:
     docker compose -f docker-compose.prod.yml logs -f

EOF
