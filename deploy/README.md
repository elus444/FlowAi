# Deploying FlowAI for free on Oracle Cloud

Oracle Cloud's "Always Free" tier gives you a real VM (up to 4 OCPU / 24GB
RAM on the Ampere ARM shape) forever, at no cost. This runs the exact
Docker stack already tested locally, behind Caddy for automatic HTTPS.

## 1. Create the Oracle Cloud account (you do this part)

I can't create accounts or enter payment details on your behalf, so:

1. Go to https://signup.oraclecloud.com and sign up for the **Always Free**
   tier. It asks for a credit card for identity verification only --
   Always Free resources are never charged, and Oracle will not
   auto-upgrade you without explicit action.
2. Once your account is active, open **Compute → Instances → Create Instance**.
3. Name it (e.g. `flowai`).
4. Under **Image and shape**, click **Edit** on the shape:
   - Choose **Ampere** (ARM) → **VM.Standard.A1.Flex**.
   - Set **1 OCPU / 6 GB RAM** (comfortably enough for this stack; you can
     go up to 4 OCPU / 24 GB, still free, if you want headroom).
   - For the image, **Canonical Ubuntu 22.04** (or 24.04) is the simplest
     match for the setup script below.
5. Under **Add SSH keys**, either let Oracle generate a key pair for you
   (download the private key) or paste your own public key.
6. Leave networking on the default VCN/subnet and click **Create**.
7. Once it's running, note the **public IP address** shown on the instance
   page -- you'll need it for both DNS and SSH.

## 2. Open the firewall (you do this part, in the Oracle Console)

Oracle's virtual network has its own firewall in front of the VM, separate
from the VM's own. In the Console: **Networking → Virtual Cloud Networks**
→ your VCN → the subnet the instance is in → **Security Lists** → the
default list → **Add Ingress Rules**, and add:
- Source `0.0.0.0/0`, TCP, destination port `80`
- Source `0.0.0.0/0`, TCP, destination port `443`

## 3. SSH in and run the setup script

```bash
ssh -i /path/to/your/private-key.pem ubuntu@<VM_PUBLIC_IP>
```

Once connected, either paste `deploy/setup-vm.sh`'s contents directly, or:

```bash
curl -fsSL https://raw.githubusercontent.com/elus444/FlowAi/main/deploy/setup-vm.sh -o setup-vm.sh
bash setup-vm.sh
```

This installs Docker, enables it on boot, and opens the VM's own firewall
for 80/443. Follow the steps it prints at the end (clone the repo,
configure `.env`, bring the stack up).

## 4. Hand it back to me (optional)

If you'd rather I finish the last mile -- filling in `.env`, running the
stack, verifying it's live -- give me SSH access (the same command you
used above) and I'll take it from there.

## Notes

- **HTTPS with no domain purchase**: `DOMAIN` in `.env` uses
  `<ip-with-dashes>.sslip.io`, a free service that resolves that hostname
  straight back to your IP. That's enough for Let's Encrypt to issue a
  real certificate via Caddy, automatically, with zero extra config. Swap
  in a real domain later by pointing its DNS A record at the VM's IP and
  updating `DOMAIN`.
- **Updating after a `git push`**: SSH in, `git pull`, then
  `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`.
- **Postgres/Redis data** persist in Docker named volumes across restarts
  and `git pull` rebuilds; they're only lost if you explicitly
  `docker compose down -v`.
