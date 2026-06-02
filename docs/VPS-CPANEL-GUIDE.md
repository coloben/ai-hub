# Guide Pratique — cPanel Personnel sur VPS

> **Objectif** : Transformer ton VPS en serveur web multi-sites avec panel de gestion, comme un hébergeur pro.

---

## Solution recommandée : HestiaCP

**Pourquoi HestiaCP** :
- Gratuit, open source (fork de VestaCP)
- Interface web proche de cPanel
- Gestion DNS intégrée
- Let's Encrypt auto
- FTP, base de données, emails
- Firewall intégré
- Mises à jour automatiques

**Alternative** : CloudPanel (plus moderne, Nginx natif, moins gourmand)

---

## Étape 1 : Préparer le VPS (Ubuntu 22.04)

### Se connecter en SSH

```bash
# Windows — PowerShell ou Terminal
ssh root@IP_DE_TON_VPS

# Si clé SSH
ssh -i ~/.ssh/ta_cle root@IP_DE_TON_VPS
```

### Mettre à jour le système

```bash
apt update && apt upgrade -y
apt install -y curl wget gnupg2 ca-certificates lsb-release software-properties-common apt-transport-https
```

### Sécuriser l'accès SSH

```bash
# 1. Changer le port SSH (optionnel mais recommandé)
nano /etc/ssh/sshd_config
# Modifier : Port 2222 (au lieu de 22)
# Modifier : PermitRootLogin no
# Modifier : PasswordAuthentication no (si tu as configuré une clé SSH)

# 2. Redémarrer SSH
systemctl restart sshd

# 3. Configurer le firewall
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp   # ton nouveau port SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8083/tcp  # HestiaCP panel
ufw enable
```

### Installer Fail2Ban (protection brute-force)

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## Étape 2 : Installer HestiaCP

```bash
# Télécharger le script d'installation
curl -O https://raw.githubusercontent.com/hestiacp/hestiacp/release/install/hst-install.sh

# Le rendre exécutable
chmod +x hst-install.sh

# Lancer l'installation
# Options : --nginx (serveur web) --phpfpm (PHP) --multiphp (plusieurs versions PHP) --vsftpd (FTP) --mysql (MariaDB) --postgresql (PostgreSQL) --quotad (quota disque) --exim (email) --dovecot (IMAP) --spamassassin (anti-spam) --clamav (antivirus) --sieved (filtres email) --iptables (firewall) --fail2ban (protection brute-force) --remi (repo PHP) --quota (quota) --api (API Hestia)

./hst-install.sh \
  --nginx yes \
  --apache yes \
  --phpfpm yes \
  --multiphp yes \
  --vsftpd yes \
  --proftpd no \
  --named yes \
  --mysql yes \
  --postgresql yes \
  --exim yes \
  --dovecot yes \
  --sieve no \
  --clamav yes \
  --spamassassin yes \
  --iptables yes \
  --fail2ban yes \
  --quota no \
  --api yes \
  --interactive yes
```

**L'installation dure 15-30 minutes.**

À la fin, tu verras :
```
================================================================================
  Hestia Control Panel
  https://IP_DE_TON_VPS:8083
  Username: admin
  Password: XXXXXXXX
================================================================================
```

**Note bien le mot de passe admin !**

---

## Étape 3 : Accéder au Panel

```
https://IP_DE_TON_VPS:8083
```

- Username : `admin`
- Password : celui affiché à l'installation

**Première chose à faire** :
1. Changer le mot de passe admin
2. Activer 2FA (Google Authenticator)
3. Configurer ton email admin

---

## Étape 4 : Ajouter un Nom de Domaine

### 1. Dans HestiaCP

```
Users → admin → Add Domain
```
- Domain : `ton-domaine.com`
- IP : (auto)
- DNS : cocher "Create DNS zone"
- Mail : cocher si tu veux des emails
- SSL : cocher "Enable SSL for this domain" + "Use Let's Encrypt"

### 2. Chez ton registrar (OVH, Namecheap, GoDaddy...)

Pointer les DNS vers ton VPS :
```
Type A     @     IP_DE_TON_VPS
Type A     www   IP_DE_TON_VPS
Type NS    @     ns1.ton-domaine.com
Type NS    @     ns2.ton-domaine.com
```

Ou utiliser les DNS de Cloudflare (recommandé) :
```
1. Créer un compte Cloudflare
2. Ajouter ton domaine
3. Changer les nameservers chez ton registrar pour ceux de Cloudflare
4. Dans Cloudflare : Type A → @ → IP_DE_TON_VPS (proxy désactivé initialement)
```

**Temps de propagation** : 5 minutes à 48 heures (généralement 15 min avec Cloudflare).

---

## Étape 5 : Créer un Site / Héberger AI Hub

### Option A : Site statique (HTML/CSS/JS)

```
Web → ton-domaine.com → Edit → Advanced Options
```
- Uploader les fichiers via FTP ou File Manager
- Chemin : `/home/admin/web/ton-domaine.com/public_html/`

### Option B : Node.js / Next.js (AI Hub)

HestiaCP ne gère pas Node.js nativement. Deux solutions :

#### Solution 1 : PM2 + Nginx reverse proxy

```bash
# Se connecter en SSH au VPS
ssh root@IP_DE_TON_VPS

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Installer PM2 (gestionnaire de process Node.js)
npm install -g pm2

# Créer le dossier du site
mkdir -p /home/admin/web/ai-hub.ton-domaine.com/
cd /home/admin/web/ai-hub.ton-domaine.com/

# Cloner le repo (ou uploader les fichiers)
git clone https://github.com/ton-repo/ai-hub.git .

# Installer les dépendances
npm install

# Builder
npm run build

# Lancer avec PM2
pm2 start npm --name "ai-hub" -- start

# Sauvegarder la config PM2
pm2 save
pm2 startup systemd
```

Puis configurer Nginx dans HestiaCP :
```
Web → ai-hub.ton-domaine.com → Edit → Advanced Options → Proxy Template
```

Template personnalisé `/usr/local/hestia/data/templates/web/nginx/` :
```nginx
# /usr/local/hestia/data/templates/web/nginx/NodeJS.stpl
server {
    listen      %ip%:%web_ssl% ssl;
    server_name %domain_idn% %alias_idn%;
    root        %docroot%;
    index       index.html index.htm;
    
    ssl_certificate     %ssl_pem%;
    ssl_certificate_key %ssl_key%;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Solution 2 : Docker (plus propre, recommandé)

```bash
# Installer Docker
apt install -y docker.io docker-compose-plugin

# Créer le dossier
mkdir -p /opt/sites/ai-hub
cd /opt/sites/ai-hub

# Copier les fichiers du projet (ou git clone)
cp -r /chemin/vers/ai-hub-v2/* .

# Créer docker-compose.yml
nano docker-compose.yml
```

```yaml
version: '3.8'
services:
  app:
    build: .
    container_name: ai-hub
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    networks:
      - ai-hub

networks:
  ai-hub:
    driver: bridge
```

```bash
# Lancer
docker compose up -d
```

Puis configurer Nginx pour pointer vers le container :
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    ...
}
```

---

## Étape 6 : Gérer les Fichiers

### Option 1 : File Manager intégré (HestiaCP)

```
Files → (naviguer dans /home/admin/web/)
```

Interface drag-and-drop, éditeur de texte intégré.

### Option 2 : FTP / SFTP

```bash
# Dans HestiaCP
Users → admin → Add FTP Access
```

Se connecter avec FileZilla :
- Host : `IP_DE_TON_VPS` (ou `sftp://IP_DE_TON_VPS`)
- Port : 22 (SFTP) ou 21 (FTP)
- User : le user FTP créé
- Password : le mot de passe

### Option 3 : SSH direct (le plus rapide)

```bash
# Se connecter
ssh root@IP_DE_TON_VPS

# Naviguer
cd /home/admin/web/ton-domaine.com/public_html/

# Éditer un fichier
nano fichier.txt

# Uploader un fichier (depuis ton PC)
scp fichier.txt root@IP_DE_TON_VPS:/home/admin/web/ton-domaine.com/public_html/

# Télécharger un fichier (vers ton PC)
scp root@IP_DE_TON_VPS:/home/admin/web/ton-domaine.com/public_html/fichier.txt .
```

---

## Étape 7 : Base de Données

### Créer une DB

```
DB → Add Database
```
- Database : `ai_hub`
- User : `ai_hub_user`
- Password : (générer un fort)
- Type : PostgreSQL (ou MySQL)

### Se connecter à la DB

```bash
# En SSH
psql -U ai_hub_user -d ai_hub -h localhost

# Ou avec un client graphique (TablePlus, DBeaver, pgAdmin)
Host : IP_DE_TON_VPS
Port : 5432 (PostgreSQL) ou 3306 (MySQL)
User : ai_hub_user
Password : (celui créé)
Database : ai_hub
```

---

## Étape 8 : SSL / HTTPS (Let's Encrypt)

### Automatique avec HestiaCP

```
Web → ton-domaine.com → Edit
→ cocher "Enable SSL for this domain"
→ cocher "Use Let's Encrypt to obtain SSL certificate"
→ Save
```

**Renouvellement automatique** tous les 60 jours.

### Vérifier

```bash
# Vérifier le certificat
curl -I https://ton-domaine.com
# Doit afficher : HTTP/2 200 + strict-transport-security
```

---

## Étape 9 : Backup Automatique

### Dans HestiaCP

```
Server → Configure → Backup → Enable
```

- Fréquence : Daily
- Rétention : 7 jours
- Destination : Local + Remote (S3, SFTP, Google Drive)

### Backup manuel (avant une mise à jour)

```bash
# Backup HestiaCP complet
v-backup-user admin

# Le backup est dans /backup/
ls -la /backup/
```

---

## Étape 10 : Monitoring

### Dans HestiaCP

```
Server → CPU / Memory / Disk
```

Graphiques temps réel.

### Netdata (plus détaillé, gratuit)

```bash
# Installer Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Accès
https://IP_DE_TON_VPS:19999
```

Interface web avec :
- CPU / RAM / Disque en temps réel
- Processus
- Réseau
- Docker containers
- Alertes

---

## Tableau comparatif : cPanel vs HestiaCP vs CloudPanel

| Fonction | cPanel (payant) | HestiaCP (gratuit) | CloudPanel (gratuit) |
|---|---|---|---|
| Prix | 15-50$/mois | Gratuit | Gratuit |
| Interface | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Facilité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Node.js | Via EasyApache | PM2 manuel | Natif |
| Docker | ❌ | ❌ | ✅ |
| Let's Encrypt | ✅ Auto | ✅ Auto | ✅ Auto |
| Email | ✅ Complet | ✅ Complet | Basique |
| FTP | ✅ | ✅ | SFTP seulement |
| DNS | ✅ | ✅ | ✅ |
| Multi-PHP | ✅ | ✅ | ✅ |
| PostgreSQL | ✅ | ✅ | ❌ |

---

## Récapitulatif des commandes essentielles

```bash
# Connexion SSH
ssh root@IP_DE_TON_VPS

# Mise à jour
apt update && apt upgrade -y

# Redémarrer un service
systemctl restart nginx
systemctl restart hestia

# Voir les logs
journalctl -u hestia -f

# Voir les processus
htop

# Espace disque
df -h

# Tailles des dossiers
du -sh /home/admin/web/*

# Backup
v-backup-user admin

# Redémarrer le VPS
reboot
```

---

> **Coût total** : VPS (5-10€/mois) + Domaine (1€/mois) = **6-11€/mois pour héberger autant de sites que tu veux.**

> **Temps de setup** : 1-2 heures la première fois, puis 5 minutes par nouveau site.
