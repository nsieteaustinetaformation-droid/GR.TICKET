export type Locale = "fr" | "en";

type Messages = Record<string, string>;

export const messages: Record<Locale, Messages> = {
  fr: {
    "guarantee.badge": "Billet garanti GRTK",
    "guarantee.promise": "Ton billet entre à la porte, sinon tu es remboursé.",
    "guarantee.claim": "Déposer une réclamation",
    "split.cta": "Payer à plusieurs",
    "split.title": "Paiement de groupe",
    "split.tracking": "Suivi du paiement",
    "split.paid": "Payé",
    "split.waiting": "En attente",
    "split.invite": "{name} vous invite à payer votre place : {link}",
    "split.sms": "Payez votre place GRTK : {link}",
    "ticket.holder": "Titulaire",
    "ticket.price": "Prix payé",
    "ticket.number": "Numéro de billet",
    "ticket.qr": "QR code dynamique",
    "common.continue": "Continuer",
    "common.download": "Télécharger",
    "payment.method.card": "Carte bancaire",
    "payment.method.mtn": "MTN Mobile Money",
    "payment.method.airtel": "Airtel Money",
    "payment.method.mpesa": "M-Pesa",
    "payment.method.orange": "Orange Money",
    "payment.method.wallet": "Portefeuille",
    "payment.method.cash": "Espèces",
  },
  en: {
    "guarantee.badge": "GRTK guaranteed ticket",
    "guarantee.promise": "Your ticket gets you through the door, or you get refunded.",
    "guarantee.claim": "File a claim",
    "split.cta": "Split payment",
    "split.title": "Group payment",
    "split.tracking": "Payment tracking",
    "split.paid": "Paid",
    "split.waiting": "Pending",
    "split.invite": "{name} invites you to pay for your seat: {link}",
    "split.sms": "Pay for your GRTK seat: {link}",
    "ticket.holder": "Holder",
    "ticket.price": "Price paid",
    "ticket.number": "Ticket number",
    "ticket.qr": "Dynamic QR code",
    "common.continue": "Continue",
    "common.download": "Download",
    "payment.method.card": "Bank card",
    "payment.method.mtn": "MTN Mobile Money",
    "payment.method.airtel": "Airtel Money",
    "payment.method.mpesa": "M-Pesa",
    "payment.method.orange": "Orange Money",
    "payment.method.wallet": "Wallet",
    "payment.method.cash": "Cash",
  },
};

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = messages[locale]?.[key] ?? messages.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_match, name: string) => String(vars[name] ?? ""));
}

/** Libellé d'affichage d'un moyen de paiement configuré pour le pays. */
export function paymentMethodLabel(locale: Locale, code: string): string {
  const key = `payment.method.${code.toLowerCase()}`;
  const label = messages[locale]?.[key] ?? messages.en[key];
  return label ?? code.toUpperCase();
}

export function normalizeLocale(value?: string | null): Locale {
  return value?.toLowerCase().startsWith("fr") ? "fr" : "en";
}
