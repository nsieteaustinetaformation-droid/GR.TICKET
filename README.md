# GRTK — Billetterie internationale

Plateforme de billetterie internationale pour organisateurs : création d'événements, vente de billets, **Garantie GRTK** et **Payez à plusieurs**.

Aucune valeur propre à un pays, une ville ou une devise n'est codée dans le métier : pays, devise, fuseau, taxe, moyens de paiement et politique de garantie sont des **données de configuration** (`src/lib/international/seed.ts` en développement, tables `countries` / `tax_rules` / `payment_methods` / `guarantee_policies` en production).

---

## Démarrage

```bash
npm install
npm run dev
npm test
npm run build
```

- Accueil : `/` → `/dashboard` (puis `/connexion` si non connecté)
- Connexion : `/connexion`
- Création d'événement : `/evenements/nouveau/infos` → `/billets` → `/commission` → `/apercu`
- Page événement : `/evenements/[slug]`
- Panier : `/panier?event=ID`
- Lien de groupe : `/groupe/[token]`
- Billet : `/billet/[id]`
- Réclamation : `/reclamation?ticket=ID`
- Administration garantie : `/admin/garantie`

Sans Supabase, l'application tourne en **mode démo** (données sur l'appareil).

---

## Socle international

| Sujet | Implémentation |
|---|---|
| Devises | Montants en **unités mineures entières** + code ISO 4217 (`src/lib/international/money.ts`) |
| Taxes | `tax_rules` par pays, mode `inclusive` ou `exclusive` |
| Temps | Stockage **UTC**, affichage dans le fuseau IANA du lieu (`src/lib/international/time.ts`) |
| Langues | `fr` et `en` (`src/lib/international/messages.ts`), structure extensible |
| Paiements | Interface `PaymentProvider` + registre (`src/lib/payments/`). Ajouter un moyen = 1 adaptateur + 1 ligne de config |
| Config pays | `src/lib/international/config.ts` + `seed.ts` (remplaçable par la base) |

---

## Garantie GRTK

> Ton billet entre à la porte, sinon tu es remboursé.

- QR dynamique : le scanner émet un **défi (nonce)** valable 30 s ; l'application GRTK signe le défi avec la **clé privée de l'appareil lié**. Le QR change à chaque fenêtre de 30 s.
- Une capture d'écran ou une photocopie ne peut pas répondre à un nouveau défi.
- Double scan refusé et journalisé (`scan_logs`, `audit_logs`).
- Transfert/revente uniquement via GRTK, prix plafonné ; l'ancienne version du QR est invalidée.
- Réclamation avec motif + photo : décision automatique pour les cas clairs, escalade agent sinon.
- Paramètres : dédommagement, délai de réclamation et réserve financière par pays.
- Admin : réclamations, taux de fraude, coût total de la garantie, journaux d'audit.

Fichiers : `src/lib/domain/{qr,transfers,claims,reservations}.ts`.

## Payez à plusieurs

- L'acheteur choisit N places, reçoit un lien unique et le partage (WhatsApp, SMS, copie).
- Chaque participant paie sa part avec son propre moyen de paiement.
- Réservation temporaire (24 h par défaut, configurable) ; expiration libère les places.
- Règle par défaut : **tout ou rien**. Option `paid_seats` disponible par événement.
- Suivi en direct, rappels automatiques à 50 % et 90 % du délai.
- Chaque participant reçoit son billet garanti nominatif.
- Idempotence des paiements et webhooks ; protection contre la sur-réservation (RPC `reserve_seats`).

Fichiers : `src/lib/domain/groups.ts`, `src/lib/server/state.ts`.

---

## Endpoints API

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/v1/events/:id/reservations` | Réserver des places avec TTL |
| POST | `/api/v1/groups` | Créer un lien de paiement groupé |
| GET | `/api/v1/groups/:token` | Voir le suivi du groupe |
| POST | `/api/v1/groups/:token/shares/:shareId/pay` | Payer une part |
| POST | `/api/v1/payments/webhook/:provider` | Webhook signé et idempotent |
| POST | `/api/v1/tickets/:id/qr/challenge` | Obtenir un défi scanner |
| GET | `/api/v1/tickets/:id/qr/token?nonce=...` | QR dynamique signé (30 s) |
| POST | `/api/v1/scanner/verify` | Vérifier défi + appareil + billet |
| POST | `/api/v1/tickets/:id/transfer` | Transférer/revendre |
| GET | `/api/v1/tickets/:id` | Lire un billet et son audit |
| GET | `/api/v1/tickets/:id/pass?kind=apple\|google` | Point d'intégration Wallet |
| POST | `/api/v1/claims` | Déposer une réclamation |
| PATCH | `/api/v1/admin/claims/:id` | Décision agent |
| GET | `/api/v1/admin/guarantee/stats` | Statistiques garantie |
| GET/POST | `/api/v1/cron/release-expired-groups` | Expiration + rappels |

### Exemples

```bash
# Créer un groupe de 2 places à 50,00 EUR chacune
curl -X POST /api/v1/groups -H 'content-type: application/json' -d '{
  "eventId":"evt_1","eventTitle":"Festival","initiatorName":"Alice",
  "countryCode":"FR","currency":"EUR","unitAmountMinor":5000,
  "quantity":2,"capacity":100,"validationMode":"all_or_nothing"
}'

# Payer sa part (clé d'idempotence unique)
curl -X POST /api/v1/groups/TOKEN/shares/SHARE_ID/pay -H 'content-type: application/json' -d '{
  "holderName":"Bob","methodCode":"card","idempotencyKey":"bob-1"
}'

# Vérifier un scan
curl -X POST /api/v1/scanner/verify -H 'content-type: application/json' -d '{"token":"...","scannerId":"gate-1"}'
```

---

## Design blanc et maquette 3D réaliste

- Toutes les pages utilisent le même thème blanc : fond `#FFFFFF`, cartes blanches bordées `slate-200`, texte `slate-900`, accents violets. Aucune page ne repasse en mode sombre.
- `/maquette-3d` : aperçu du rendu (trois billets, carton épais, reflet holographique, ombre portée et talon perforé).
- Tous les billets 3D sont orientés dans le **même sens** : une seule transformation est définie dans `src/app/globals.css` pour `.grtk-3d` et ses variantes `left`, `flat` et `right`.
- Le vrai billet (`/billet/:id`) utilise le même habillage via `RealisticTicket3D` ; le QR dynamique et les actions PNG/PDF/Wallet restent identiques.
- La couleur de la tranche suit `event.branding.primaryColor` : aucun style n'est figé par événement.

---

## Base de données

`supabase/schema.sql` est idempotent. Il crée notamment :

- configuration : `countries`, `currencies`, `tax_rules`, `payment_providers`, `payment_methods`, `guarantee_policies` ;
- groupes : `reservations`, `group_payments`, `group_shares`, `payment_intents` ;
- garantie : `tickets`, `qr_tokens`, `device_bindings`, `transfers`, `scan_logs`, `refund_claims`, `audit_logs` ;
- fonction `reserve_seats()` (verrou `_FOR UPDATE_` anti-sur-réservation) ;
- fonction `delete_my_data()` (RGPD) et politiques RLS par propriétaire/participant.

Relancer le script après une mise à jour : il ne supprime aucune donnée métier.

### Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
PAYMENT_WEBHOOK_SECRET
CARD_PROVIDER_MODE=live|simulation
MOBILE_MONEY_MODE=live|simulation
GRTK_COMPENSATION_PERCENT=0
GRTK_CLAIM_WINDOW_HOURS=72
GRTK_RESERVE_MINOR=0
GOOGLE_WALLET_ISSUER_ID
GOOGLE_WALLET_SERVICE_ACCOUNT_JSON
APPLE_PASS_CERTIFICATE
APPLE_PASS_KEY
APPLE_PASS_TEAM_ID
```

Les passes Wallet ne sont générés que si les credentials correspondants sont fournis ; sinon l'endpoint répond `501 WALLET_CREDENTIALS_NOT_CONFIGURED`.

---

## Tests

`npm test` exécute 13 suites :

1. Codes billets Crockford anti-ambiguïté
2. Signature HMAC et détection d'altération
3. Formatage WhatsApp international
4. Anti-replay / double scan
5. Devises, taxes et pays inconnu
6. Fuseaux horaires (20:00 local → 18:00 UTC → 20:00 affiché)
7. Sur-réservation et expiration des réservations
8. Paiement partiel, idempotence et tout ou rien
9. Expiration d'un groupe et remboursement
10. QR dynamique : défi, rotation 30 s, rejeu, capture refusée
11. Transfert : prix plafonné et ancien QR invalidé
12. Réclamation : auto-approbation, fraude, coût garantie
13. Rappels à mi-délai et avant expiration

---

## Stack

Next.js 16 (App Router, Turbopack), TypeScript strict, Tailwind CSS v4, Supabase/Postgres + RLS, React Query, Zod, qrcode, Lucide.
