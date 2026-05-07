# Collectif des Victimes – MUTADAFP

Plateforme sécurisée de constitution de dossiers et d'entraide.

## Architecture
- **Frontend**: React 19 + Vite + Tailwind CSS 4
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL (SQLite en dev)
- **ORM**: Prisma

## Installation Locale

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Configurer les variables d'environnement (`.env`) :
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="votre-secret"
   ```

3. Initialiser la base de données :
   ```bash
   npx prisma db push
   npx prisma generate
   npm run prisma:seed
   ```

4. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Déploiement Production (VPS)

Utilisez Docker Compose pour un déploiement rapide :
```bash
docker-compose up -d
```

## Sécurité & RGPD
- Chiffrement des documents sensibles.
- Audit logs de toutes les actions administratives.
- Conformité RGPD (Droit à l'oubli, export des données).
- Présomption d'innocence respectée dans tous les contenus.
