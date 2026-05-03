# Configuration GitHub Actions - Crons Fréquents

## Secrets à configurer

Dans ton repo GitHub : **Settings → Secrets and variables → Actions**

Ajoute ces 2 secrets :

| Secret | Valeur | Description |
|--------|--------|-------------|
| `VERCEL_URL` | `https://ai-hub-cnb3.vercel.app` | URL de ton déploiement |
| `CRON_SECRET` | `ton-secret-tres-securise-123` | Même valeur que dans Vercel |

## Comment ça marche

### Cron 15min (Fast)
- Sources critiques : OpenAI, Anthropic, Google, Meta, Mistral, LMSYS
- Ingestion rapide, 3 items par source
- Déclenche les alertes "FLASH"

### Cron 1h (Full)
- Toutes les sources actives
- Ingestion complète, 6 items par source
- Génération des alertes
- Vérification de santé

### Cron Vercel (24h)
- Backup quotidien
- Nettoyage des vieilles données
- Résumé des métriques

## Vérifier que ça fonctionne

1. Va dans **Actions** tab de ton repo
2. Tu dois voir :
   - "Fast Ingestion (Every 15min)"
   - "Full Ingestion (Every Hour)"
3. Clique sur un workflow → "Run workflow" pour tester manuellement

## Surveillance

Les crons GitHub sont gratuits pour les repos publics. Tu peux voir :
- L'historique des exécutions
- Les logs complets
- Les éventuelles erreurs

## Fiabilité des données

### Règle d'or : "Facilité d'information, facilité d'utilisation"

**Garanties mises en place :**

1. **Sources vérifiées uniquement**
   - OpenAI.com, Anthropic.com, Google AI, Meta AI, Mistral.ai
   - ArXiv.org, HuggingFace.co, LMSYS.org
   - Vérification automatique des domaines

2. **Fact-checking automatique**
   - Détection du sensationalisme
   - Vérification des dates (pas de futur, pas de trop vieux)
   - Validation de la qualité du contenu
   - Cross-référence entre sources

3. **Transparence totale**
   - Badge "Vérifié / À vérifier / Non vérifié" sur chaque info
   - Liste des problèmes détectés visible
   - Source originale toujours cliquable
   - Score de confiance affiché

4. **Circuit breaker**
   - Si une source échoue 3x → mise en pause auto
   - Retour après 1h de cooldown
   - Alertes si sources critiques down

## Support

Si un cron échoue, vérifie :
1. Les secrets sont bien configurés
2. L'URL Vercel est correcte
3. Le CRON_SECRET correspond
4. Les logs GitHub Actions pour les erreurs
