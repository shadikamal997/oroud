# SSL Certificates Directory

This directory should contain your SSL certificates for HTTPS.

## For Let's Encrypt Certificates

After running `certbot`, your certificates will be at:
```
/etc/letsencrypt/live/your-domain.com/
```

Copy them here:
```bash
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/
```

Or create symbolic links:
```bash
sudo ln -s /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/fullchain.pem
sudo ln -s /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/privkey.pem
```

## For Self-Signed Certificates (Development/Testing Only)

Generate self-signed certificate:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Required Files

- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## Security Notes

⚠️ **NEVER commit actual SSL certificates to git!**

This directory is in `.gitignore` to prevent accidental commits.

## Permissions

Ensure proper permissions:
```bash
chmod 600 ./ssl/privkey.pem
chmod 644 ./ssl/fullchain.pem
```

## Docker Volume Mount

The nginx container mounts this directory as:
```yaml
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

The `:ro` flag mounts it as read-only for security.
