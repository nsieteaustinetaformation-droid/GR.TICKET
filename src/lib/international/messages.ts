export type Locale = "fr" | "en";

type Messages = Record<string, string>;

export const messages: Record<Locale, Messages> = {
  fr: {
    "guarantee.badge": "Billet garanti GR Ticket",
    "guarantee.promise": "Ton billet entre à la porte, sinon tu es remboursé.",
    "guarantee.claim": "Déposer une réclamation",
    "split.cta": "Payer à plusieurs",
    "split.title": "Paiement de groupe",
    "split.tracking": "Suivi du paiement",
    "split.paid": "Payé",
    "split.waiting": "En attente",
    "split.invite": "{name} vous invite à payer votre place : {link}",
    "split.sms": "Payez votre place GR Ticket : {link}",

    /* Liens partageables : texte déjà rédigé, photo fournie par l'aperçu Open Graph */
    "share.group.message": "{name} vous invite à payer votre place pour « {event} » sur GR Ticket. Lien du groupe : {link}",
    "share.payment.message": "Bonjour {name}, {initiator} vous invite à payer {amount} pour « {event} » sur GR Ticket. Payez votre place ici : {link}",
    "share.ticket.message": "Votre billet GR Ticket — {event}\nTitulaire : {holder}\nNuméro : {code}\nBillet et QR dynamique : {link}",
    "share.copyLink": "Copier le lien",
    "share.copied": "Lien copié",
    "share.whatsapp": "WhatsApp",
    "share.sms": "SMS",
    "share.paymentLink": "Lien de cette place",
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

    /* Confiance avant paiement */
    "trust.noHiddenFees": "Prix total à payer, sans frais cachés",
    "trust.securePayment": "Paiement sécurisé",
    "trust.verifiedOrganizer": "Organisateur vérifié",
    "trust.conditions": "Voir les conditions",
    "trust.qrAfterPayment": "QR généré après paiement",
    "trust.commissionToOrganizer": "Reversé à l'organisateur",
    "trust.subtotal": "Sous-total",
    "trust.tax": "Taxes",
    "trust.total": "Total",
    "trust.dateLabel": "Date et heure",
    "trust.venueLabel": "Lieu",
    "trust.placeholderName": "Votre nom",
    "trust.ticketNumberPending": "APRÈS PAIEMENT",
    "trust.presentQrInApp": "Présentez le QR dynamique dans l'app GR Ticket",
    "trust.preview": "Aperçu du billet que vous recevrez",
    "trust.flipHint": "Retournez le billet pour le contrôle",
    "trust.accessControl": "Contrôle d'accès",

    /* Page « Comment ça marche » */
    "how.title": "Comment ça marche",
    "how.lead": "De la réservation à l'entrée, quatre étapes simples.",
    "how.step1.title": "Créez ou choisissez un événement",
    "how.step1.desc": "L'organisateur publie son événement et ses tarifs. Vous choisissez la catégorie de place qui vous convient.",
    "how.step2.title": "Payez seul ou à plusieurs",
    "how.step2.desc": "Réglez votre place avec un moyen de paiement disponible dans votre pays, ou partagez un lien pour payer à plusieurs.",
    "how.step3.title": "Recevez votre billet garanti",
    "how.step3.desc": "Votre billet nominatif est disponible dans l'app GR Ticket, avec la garantie GR Ticket.",
    "how.step4.title": "Scannez à l'entrée",
    "how.step4.desc": "Présentez le QR dynamique dans l'app : il se renouvelle toutes les 30 secondes et une capture d'écran ne passe pas.",
    "how.conditionsLink": "Lire les conditions de la garantie",
    "how.support": "Une question ? Écrivez-nous à {email}.",
    "how.backHome": "Retour à l'accueil",

    /* Page « Garantie » */
    "guarantee.short": "Si votre billet ne passe pas, vous êtes remboursé.",
    "guarantee.title": "La garantie GR Ticket",
    "guarantee.lead": "Notre promesse, en clair : si votre billet ne vous fait pas entrer, vous êtes remboursé.",
    "guarantee.promiseTitle": "La promesse",
    "guarantee.promiseBody": "Un billet acheté sur GR Ticket doit vous ouvrir les portes de l'événement. Sinon, vous êtes remboursé.",
    "guarantee.conditionsTitle": "Conditions de la promesse",
    "guarantee.qrDynamic": "QR dynamique 30 s",
    "guarantee.qrDynamic.desc": "Le QR affiché dans l'app GR Ticket se renouvelle toutes les 30 secondes. Seul le QR actif au moment du contrôle est valable.",
    "guarantee.antiCapture": "Anti-capture",
    "guarantee.antiCapture.desc": "Une capture d'écran ou une photo du QR ne peut pas être scannée : le contrôle utilise le QR actif de l'app.",
    "guarantee.doubleScan": "Double scan",
    "guarantee.doubleScan.desc": "Le contrôle vérifie le QR et le statut du billet. Une seconde utilisation du même billet est détectée.",
    "guarantee.claimTitle": "Réclamation",
    "guarantee.claim.desc": "Si l'entrée vous est refusée avec un billet valide, déposez une réclamation depuis votre billet dans l'app GR Ticket.",
    "guarantee.refundTitle": "Remboursement",
    "guarantee.refund.desc": "Après vérification de la réclamation, le montant payé pour la place concernée est remboursé.",
    "guarantee.support": "Besoin d'aide ? Écrivez-nous à {email}.",
    "guarantee.howLink": "Voir comment ça marche",
    "guarantee.backHome": "Retour à l'accueil",

    /* Page événement */
    "event.from": "À partir de",
    "event.buy": "Acheter un billet",
    "event.split": "Payer à plusieurs",
  },
  en: {
    "guarantee.badge": "GR Ticket guaranteed ticket",
    "guarantee.promise": "Your ticket gets you through the door, or you get refunded.",
    "guarantee.claim": "File a claim",
    "split.cta": "Split payment",
    "split.title": "Group payment",
    "split.tracking": "Payment tracking",
    "split.paid": "Paid",
    "split.waiting": "Pending",
    "split.invite": "{name} invites you to pay for your seat: {link}",
    "split.sms": "Pay for your GR Ticket seat: {link}",

    /* Shareable links: pre-written text, photo provided by the Open Graph preview */
    "share.group.message": "{name} invites you to pay for your seat for “{event}” on GR Ticket. Group link: {link}",
    "share.payment.message": "Hi {name}, {initiator} invites you to pay {amount} for “{event}” on GR Ticket. Pay your seat here: {link}",
    "share.ticket.message": "Your GR Ticket — {event}\nHolder: {holder}\nNumber: {code}\nTicket and dynamic QR: {link}",
    "share.copyLink": "Copy link",
    "share.copied": "Link copied",
    "share.whatsapp": "WhatsApp",
    "share.sms": "SMS",
    "share.paymentLink": "Link for this seat",
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

    /* Confidence before payment */
    "trust.noHiddenFees": "Total price to pay, with no hidden fees",
    "trust.securePayment": "Secure payment",
    "trust.verifiedOrganizer": "Verified organizer",
    "trust.conditions": "See the terms",
    "trust.qrAfterPayment": "QR generated after payment",
    "trust.commissionToOrganizer": "Paid to the organizer",
    "trust.subtotal": "Subtotal",
    "trust.tax": "Tax",
    "trust.total": "Total",
    "trust.dateLabel": "Date and time",
    "trust.venueLabel": "Venue",
    "trust.placeholderName": "Your name",
    "trust.ticketNumberPending": "AFTER PAYMENT",
    "trust.presentQrInApp": "Present the dynamic QR code in the GR Ticket app",
    "trust.preview": "Preview of the ticket you will receive",
    "trust.flipHint": "Flip the ticket for admission",
    "trust.accessControl": "Admission control",

    /* « How it works » page */
    "how.title": "How it works",
    "how.lead": "From booking to the door, in four simple steps.",
    "how.step1.title": "Create or choose an event",
    "how.step1.desc": "The organizer publishes the event and its prices. You choose the ticket category that suits you.",
    "how.step2.title": "Pay alone or together",
    "how.step2.desc": "Pay for your seat with a method available in your country, or share a link to split the payment.",
    "how.step3.title": "Receive your guaranteed ticket",
    "how.step3.desc": "Your named ticket is available in the GR Ticket app, covered by the GR Ticket guarantee.",
    "how.step4.title": "Scan at the entrance",
    "how.step4.desc": "Present the dynamic QR code in the app: it refreshes every 30 seconds and a screenshot will not work.",
    "how.conditionsLink": "Read the guarantee terms",
    "how.support": "Have a question? Write to us at {email}.",
    "how.backHome": "Back to home",

    /* « Guarantee » page */
    "guarantee.short": "If your ticket does not get you in, you get refunded.",
    "guarantee.title": "The GR Ticket guarantee",
    "guarantee.lead": "Our promise, in plain words: if your ticket does not get you through the door, you get refunded.",
    "guarantee.promiseTitle": "The promise",
    "guarantee.promiseBody": "A ticket bought on GR Ticket must get you into the event. If it does not, you get refunded.",
    "guarantee.conditionsTitle": "Terms of the promise",
    "guarantee.qrDynamic": "Dynamic 30s QR code",
    "guarantee.qrDynamic.desc": "The QR code shown in the GR Ticket app refreshes every 30 seconds. Only the active QR at the time of the check is valid.",
    "guarantee.antiCapture": "Anti-screenshot",
    "guarantee.antiCapture.desc": "A screenshot or photo of the QR code cannot be scanned: the check uses the active QR in the app.",
    "guarantee.doubleScan": "Double scan",
    "guarantee.doubleScan.desc": "The check verifies the QR code and the ticket status. A second use of the same ticket is detected.",
    "guarantee.claimTitle": "Claim",
    "guarantee.claim.desc": "If entry is refused with a valid ticket, file a claim from your ticket in the GR Ticket app.",
    "guarantee.refundTitle": "Refund",
    "guarantee.refund.desc": "After the claim is reviewed, the amount paid for the affected seat is refunded.",
    "guarantee.support": "Need help? Write to us at {email}.",
    "guarantee.howLink": "See how it works",
    "guarantee.backHome": "Back to home",

    /* Event page */
    "event.from": "From",
    "event.buy": "Buy a ticket",
    "event.split": "Split payment",
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
