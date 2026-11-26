import { registerPaymentProvider } from "./registry";
import { cardProvider } from "./providers/card";
import { mobileMoneyProvider } from "./providers/mobile-money";

// Point d'enregistrement unique. Pour ajouter un moyen de paiement :
// créer un adaptateur respectant PaymentProvider et l'enregistrer ici.
registerPaymentProvider(cardProvider);
registerPaymentProvider(mobileMoneyProvider);

export * from "./provider";
export * from "./registry";
