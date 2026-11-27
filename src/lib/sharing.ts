import { absoluteUrl } from "./app-url";
import { translate, type Locale } from "./international/messages";

/** Liens publics partageables. Ils pointent toujours vers le domaine canonique. */
export function groupLink(token: string): string {
  return absoluteUrl(`/groupe/${token}`);
}

export function paymentLink(token: string, shareId: string): string {
  return absoluteUrl(`/payer/${token}/${shareId}`);
}

export function ticketLink(ticketId: string): string {
  return absoluteUrl(`/billet/${ticketId}`);
}

/** wa.me n'accepte que du texte : la photo est fournie par l'image Open Graph du lien. */
export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function smsUrl(text: string): string {
  return `sms:?body=${encodeURIComponent(text)}`;
}

export function paymentInviteMessage(params: {
  locale: Locale;
  name: string;
  initiator: string;
  amount: string;
  eventTitle: string;
  link: string;
}): string {
  return translate(params.locale, "share.payment.message", {
    name: params.name,
    initiator: params.initiator,
    amount: params.amount,
    event: params.eventTitle,
    link: params.link,
  });
}

export function ticketShareMessage(params: {
  locale: Locale;
  eventTitle: string;
  holderName: string;
  code: string;
  link: string;
}): string {
  return translate(params.locale, "share.ticket.message", {
    event: params.eventTitle,
    holder: params.holderName,
    code: params.code,
    link: params.link,
  });
}
