# GODMAN RECORDS TIKET

> **SaaS de billetterie événementielle et musicale de nouvelle génération pour la République du Congo (Brazzaville & Pointe-Noire).**

Plateforme professionnelle taillée pour le label musical **Godman Records** et les organisateurs d'événements. Elle permet la création d'événements, la vente de billets en ligne et au guichet via **MTN Mobile Money** et **Airtel Money** (XAF / FCFA), la délivrance instantanée par **WhatsApp**, et le contrôle d'accès haute vitesse avec scan de QR code sécurisé (y compris en mode hors-ligne sans connexion internet).

---

## 🌟 Points Forts du Produit

1. **Design System « Noir & Or » Haut Contraste :**
   - Palette exclusive `#0A0A0B` (fond), `#121214` (surface), `#D4A22A` (or principal), `#F0C75E` (or survol).
   - Thème sombre par défaut et thème clair disponibles.
   - Conformité stricte aux standards d'accessibilité **WCAG AA** (contraste 4.5:1 minimum).
   - Typographies d'impact : *Big Shoulders Display* (titres majuscules), *DM Sans* (texte UI), *JetBrains Mono* (chiffres tabulaires et codes billets).
   - Cibles tactiles minimum de 44 px pour le terrain.

2. **Billets Infalsifiables :**
   - Code court lisible `GR-XXXXX-XXXXX` encodé sur l'alphabet Crockford anti-ambiguïté (sans 0/O, 1/I/L).
   - QR code cryptographique contenant un jeton signé **HMAC-SHA256**.
   - Verrou transactionnel en base de données empêchant le double scan et le surbooking.

3. **Paiements Locaux (XAF / FCFA) :**
   - Couche d'abstraction `PaymentProvider` avec support multi-prestataires (Sandbox de simulation, Guichet manuel avec vérification d'unicité SMS, et connecteurs MTN / Airtel).

4. **Distribution WhatsApp Immédiate :**
   - Mode direct sans frais via lien `wa.me` prérempli (+242 Congo-Brazzaville).
   - Mode automatisé par WhatsApp Business Cloud API.

5. **Contrôle d'Accès PWA :**
   - Application installable sur smartphone contrôleur.
   - Fonctionne avec ou sans connexion internet grâce à IndexedDB et synchronisation intelligente des conflits.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+ ou 24+
- npm 10+

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/nsieteaustinetaformation-droid/GR.TICKET.git
cd GR.TICKET

# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev -- --port 3010
```

Accéder à l'application :
- **Page d'accueil :** [http://localhost:3010](http://localhost:3010)
- **Vitrine Design System :** [http://localhost:3010/design-system](http://localhost:3010/design-system)

---

## 🗄️ Connexion Supabase

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécute le contenu de `supabase/schema.sql`.
3. Copie `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` depuis **Project Settings → API**.
4. Ajoute ces deux variables dans `.env.local` et dans **Vercel → Settings → Environment Variables**.
5. Redéploie. Au premier chargement, les événements de démonstration sont insérés automatiquement dans Supabase.

> `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur uniquement (jamais exposé au navigateur).

---

## 🎨 Composants du Design System (Étape 1)

Le projet intègre une bibliothèque complète de composants personnalisés :
- `Button` : Dégradé or, contour or, secondaire, danger, ghost, états de chargement (44px min-touch).
- `Input` : Champs haute lisibilité avec icônes gauche/droite, anneau or 2px au focus, gestion d'erreurs bilingues.
- `Badge` : Double encodage couleur + icône obligatoire (Succès, Alerte, Erreur, Information, Or VIP, Neutre).
- `Alert` : Bannières contextuelles d'état avec icône dédiée et actions.
- `Card` : Cartes surface, surélevées et interactives avec rayon de 12px.
- `Modal` : Boîte de dialogue accessible avec accent doré et touche Échap.
- `Table` : Tableau avec chiffres tabulaires pour montants XAF et dates Brazzaville.
- `Ticket` : Le composant d'exception (corps noir, filigrane Godman, découpe perforée, talon or avec QR haute résolution).
- `ThemeToggle` : Bascule instantanée entre thème sombre et thème clair.

---

## 🛠️ Stack Technique
- **Framework :** Next.js 16 (App Router, Turbopack)
- **Langage :** TypeScript strict
- **Styling :** Tailwind CSS v4 + Variables CSS dynamiques
- **Icônes :** Lucide React
- **Validation :** Zod & React Hook Form
- **Génération QR :** qrcode (correction d'erreur High)
- **Base de Données & Auth :** PostgreSQL (Supabase RLS)

---

## 📄 Licence
Propriétaire • Godman Records © 2026. Tous droits réservés.
