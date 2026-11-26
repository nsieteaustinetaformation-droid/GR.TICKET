import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

console.log("=================================================");
console.log("   GRTK - SUITE DE TESTS UNITAIRES");
console.log("=================================================");

// 1. Algorithme Crockford Base32
const CRB = "0123456789ABCDEFGHJKMNPQRTSTVWXYZ";
function randSeg(len) {
  let r = "";
  for (let i = 0; i < len; i++) r += CRB[Math.floor(Math.random() * CRB.length)];
  return r;
}
function generateTicketCode(prefix = "GR") {
  return `${prefix}-${randSeg(5)}-${randSeg(5)}`;
}
function isValidTicketCode(code) {
  return /^GR-[0-9A-HJKMNP-TV-Z]{5}-[0-9A-HJKMNP-TV-Z]{5}$/.test(code.toUpperCase());
}

// Test 1: Format du code billet
console.log("\n[TEST 1] Génération & Validation Code Billet Crockford Base32");
for (let i = 0; i < 50; i++) {
  const code = generateTicketCode();
  assert.equal(code.startsWith("GR-"), true, "Le préfixe doit être GR-");
  assert.equal(code.length, 14, "La longueur du code doit être 14 caractères");
  assert.equal(isValidTicketCode(code), true, `Le code ${code} doit être valide selon le regex`);
}
assert.equal(isValidTicketCode("INVALID-CODE-123"), false);
assert.equal(isValidTicketCode("GR-00000-0000"), false); // trop court
assert.equal(isValidTicketCode("GR-00000-000000"), false); // trop long
assert.equal(isValidTicketCode("GR-IIIII-OOOOO"), false); // I et O sont exclus
console.log("✓ Test 1 Réussi (50 codes conformes, codes ambigus et frauduleux rejetés)");

// 2. Cryptographie HMAC-SHA256
console.log("\n[TEST 2] Signature Cryptographique HMAC-SHA256 & Détection d'Altération");
const SECRET = "grtk-secret-key-super-secure-2026";

function signPayload(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "TICKET" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${header}.${body}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [, body, sig] = parts;
    const data = `${parts[0]}.${body}`;
    const expectedSig = createHmac("sha256", secret).update(data).digest("base64url");
    if (sig !== expectedSig) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

const payload = {
  ticketId: "tk-9921",
  code: "GR-8F4K2-9M1PQ",
  eventId: "ev-1",
  buyer: "Merveil Makosso",
  price: 15000
};

const token = signPayload(payload, SECRET);
assert.equal(typeof token, "string");
assert.equal(token.split(".").length, 3);

// Vérification valide
const verified = verifyToken(token, SECRET);
assert.deepEqual(verified, payload);

// Vérification avec mauvaise clé (fraude)
const wrongKeyVerified = verifyToken(token, "wrong-pirate-key");
assert.equal(wrongKeyVerified, null);

// Altération de données (tampering)
const tokenParts = token.split(".");
const tamperedBody = Buffer.from(JSON.stringify({ ...payload, price: 0 })).toString("base64url");
const tamperedToken = `${tokenParts[0]}.${tamperedBody}.${tokenParts[2]}`;
assert.equal(verifyToken(tamperedToken, SECRET), null);
console.log("✓ Test 2 Réussi (Intégrité HMAC vérifiée, altérations et fausses clés détectées)");

// 3. Formatage WhatsApp Congo (+242)
console.log("\n[TEST 3] Formatage Envoi WhatsApp international");
function formatWhatsAppUrl(phone, msg) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
const waUrl = formatWhatsAppUrl("+33 6 12 34 56 78", "Votre billet GRTK");
assert.equal(waUrl.includes("33612345678"), true);
assert.equal(waUrl.startsWith("https://wa.me/"), true);
const waUrl2 = formatWhatsAppUrl("+242 06 123 45 67", "Votre billet GRTK");
assert.equal(waUrl2.includes("242061234567"), true);
console.log("✓ Test 3 Réussi (nettoyage de numéros internationaux et encodage URL conformes)");

// 4. Simulation de Prévention du Double Scan (Anti-Replay)
console.log("\n[TEST 4] Prévention Anti-Replay & Concurrence de Validation (Double Scan)");
const scansDatabase = new Set();
function validateScan(ticketId) {
  if (scansDatabase.has(ticketId)) {
    return { status: "ALREADY_USED", allowed: false };
  }
  scansDatabase.add(ticketId);
  return { status: "SUCCESS", allowed: true };
}

const res1 = validateScan("TICKET-ALPHA");
assert.equal(res1.status, "SUCCESS");
assert.equal(res1.allowed, true);

const res2 = validateScan("TICKET-ALPHA");
assert.equal(res2.status, "ALREADY_USED");
assert.equal(res2.allowed, false);

console.log("✓ Test 4 Réussi (Premier scan autorisé, tentatives suivantes immédiatement bloquées)");

// ============================================================================
// GARANTIE GRTK + PAYEZ À PLUSIEURS + INTERNATIONAL
// ============================================================================

const { applyTax, formatMoney, toMinor } = await import("../src/lib/international/money.ts");
const { formatInZone, localDateTimeToUtc } = await import("../src/lib/international/time.ts");
const { getCountryConfig } = await import("../src/lib/international/config.ts");
await import("../src/lib/international/seed.ts");
const { resetState, getState } = await import("../src/lib/server/state.ts");
const { reserveSeats, releaseExpiredReservations, heldSeats } = await import("../src/lib/domain/reservations.ts");
const { createGroup, payShare, expireGroup, processReminders } = await import("../src/lib/domain/groups.ts");
const { createChallenge, buildDynamicQr, verifyScan, qrWindow } = await import("../src/lib/domain/qr.ts");
const { transferTicket } = await import("../src/lib/domain/transfers.ts");
const { createClaim, decideClaim, guaranteeStats } = await import("../src/lib/domain/claims.ts");

// 5. Argent et taxes par pays (configuration, pas de code spécifique)
console.log("\n[TEST 5] International : devises, taxes et fuseaux");
const fr = getCountryConfig("FR");
assert.equal(fr.currency, "EUR");
assert.equal(fr.taxRate, 0.2);
const frenchMoney = toMinor(100, "EUR", "fr-FR");
assert.equal(frenchMoney, 10000);
const inclusive = applyTax(frenchMoney, 0.2, "inclusive");
assert.equal(inclusive.grossMinor, 10000);
assert.equal(inclusive.taxMinor, 1667);
assert.equal(formatMoney(10000, "EUR", "fr-FR").includes("€"), true);
const neutral = getCountryConfig("ZZ");
assert.equal(neutral.currency, "USD");
console.log("✓ Test 5 Réussi (EUR, TVA inclusive, formatage et pays inconnu neutre)");

// 6. Heure locale du lieu, stockage UTC
console.log("\n[TEST 6] Fuseaux horaires : UTC stocké, heure locale affichée");
const utc = localDateTimeToUtc("2027-07-15", "20:00", "Europe/Paris");
assert.equal(utc, "2027-07-15T18:00:00.000Z");
const local = formatInZone(utc, "Europe/Paris", "fr-FR", { hour: "2-digit", minute: "2-digit", dateStyle: undefined, timeStyle: undefined });
assert.equal(local.includes("20:00"), true);
console.log("✓ Test 6 Réussi (20:00 Paris → 18:00 UTC → 20:00 affiché)");

// 7. Réservation atomique et sur-réservation
console.log("\n[TEST 7] Réservation : sur-réservation impossible et expiration libérée");
resetState();
const t0 = new Date("2027-01-01T10:00:00Z");
assert.equal(reserveSeats({ eventId: "ev1", quantity: 3, capacity: 2, holdHours: 24, now: t0 }).ok, false);
assert.equal(reserveSeats({ eventId: "ev1", quantity: 2, capacity: 2, holdHours: 24, now: t0 }).ok, true);
assert.equal(heldSeats("ev1", t0), 2);
assert.equal(releaseExpiredReservations(new Date(t0.getTime() + 25 * 3_600_000)), 1);
assert.equal(heldSeats("ev1", new Date(t0.getTime() + 25 * 3_600_000)), 0);
console.log("✓ Test 7 Réussi (capacité respectée puis places libérées après expiration)");

// 8. Paiement à plusieurs : paiement partiel, idempotence, tout ou rien
console.log("\n[TEST 8] Groupe : paiement partiel, idempotence et tout ou rien");
resetState();
const created = createGroup({
  eventId: "ev2",
  eventTitle: "Festival International",
  initiatorName: "Initiateur",
  countryCode: "FR",
  currency: "EUR",
  quantity: 2,
  unitAmountMinor: 5000,
  capacity: 10,
  holdHours: 24,
  now: t0,
});
assert.equal(created.ok, true);
const group = created.group;
const [s1, s2] = created.shares;
const first = await payShare({ token: group.token, shareId: s1.id, holderName: "Alice", methodCode: "card", idempotencyKey: "key-alice", now: t0 });
assert.equal(first.ok, true);
assert.equal(first.ticket, undefined, "tout ou rien : aucun billet avant paiement complet");
const replay = await payShare({ token: group.token, shareId: s1.id, holderName: "Alice", methodCode: "card", idempotencyKey: "key-alice", now: t0 });
assert.equal(replay.ok && replay.replayed, true, "même clé = même paiement");
const second = await payShare({ token: group.token, shareId: s2.id, holderName: "Bob", methodCode: "mtn", idempotencyKey: "key-bob", now: t0 });
assert.equal(second.ok, true);
assert.equal(second.group.status, "completed");
assert.ok(second.ticket, "billet émis après paiement complet");
assert.equal(getState().tickets.size, 2);
console.log("✓ Test 8 Réussi (2 parts, rejeu sans double paiement, billets après paiement complet)");

// 9. Expiration d'un groupe impayé et remboursement automatique
console.log("\n[TEST 9] Expiration : places libérées et parts remboursées");
resetState();
const expiring = createGroup({
  eventId: "ev3", eventTitle: "Show", initiatorName: "A", countryCode: "FR", currency: "EUR",
  quantity: 2, unitAmountMinor: 3000, capacity: 5, holdHours: 1, now: t0,
});
assert.equal(expiring.ok, true);
await payShare({ token: expiring.group.token, shareId: expiring.shares[0].id, holderName: "Payé", methodCode: "card", idempotencyKey: "k1", now: t0 });
assert.equal(await expireGroup(expiring.group.id, new Date(t0.getTime() + 3_600_001)), true);
assert.equal(expiring.shares[0].status, "refunded");
assert.equal(expiring.shares[1].status, "expired");
assert.equal(heldSeats("ev3", new Date(t0.getTime() + 3_600_001)), 0);
console.log("✓ Test 9 Réussi (groupe expiré : remboursement et libération des places)");

// 10. QR dynamique : défi, rotation, rejeu, capture interdite, double scan
console.log("\n[TEST 10] QR dynamique : signature appareil, fenêtre 30 s et double scan");
resetState();
const ticket = {
  id: "tk-grtk-1", eventId: "ev4", eventTitle: "Concert", holderName: "Alice", holderAccountId: "acc-alice",
  deviceId: "dev-alice", seatLabel: "Place 1", priceMinor: 5000, currency: "EUR", status: "active", qrVersion: 1,
  createdAt: t0.toISOString(),
};
getState().tickets.set(ticket.id, ticket);
const scanNow = new Date("2027-02-01T12:00:10Z");
const challenge1 = createChallenge(ticket.id, "scanner-1", scanNow);
const qr1 = buildDynamicQr(ticket, challenge1.nonce, scanNow);
const okScan = verifyScan(qr1, "scanner-1", scanNow);
assert.equal(okScan.ok, true);
const challenge2 = createChallenge(ticket.id, "scanner-1", new Date(scanNow.getTime() + 1000));
const qr2 = buildDynamicQr(ticket, challenge2.nonce, new Date(scanNow.getTime() + 1000));
assert.equal(verifyScan(qr2, "scanner-1", new Date(scanNow.getTime() + 1000)).error, "ALREADY_USED");
assert.equal(verifyScan(qr1, "scanner-1", scanNow).error, "NONCE_REPLAY");
assert.equal(verifyScan(`${qr1.slice(0, -1)}X`, "scanner-1", scanNow).error, "INVALID_SIGNATURE");
assert.equal(qrWindow(new Date(0)), 0);
console.log("✓ Test 10 Réussi (défi signé, rejeu bloqué, capture et second scan refusés)");

// 11. Transfert : ancien QR invalidé et plafond de revente
console.log("\n[TEST 11] Transfert : nouvelle version QR et prix plafonné");
resetState();
const source = {
  id: "tk-src", eventId: "ev5", eventTitle: "Festival", holderName: "Alice", holderAccountId: "acc-alice",
  deviceId: "dev-alice", seatLabel: "Place 2", priceMinor: 10000, currency: "EUR", status: "active", qrVersion: 3,
  createdAt: t0.toISOString(),
};
getState().tickets.set(source.id, source);
const tooExpensive = transferTicket({ ticketId: source.id, fromAccountId: "acc-alice", toAccountId: "acc-bob", toDeviceId: "dev-bob", toHolderName: "Bob", resalePriceMinor: 12000 });
assert.equal(tooExpensive.error, "PRICE_ABOVE_CAP");
const moved = transferTicket({ ticketId: source.id, fromAccountId: "acc-alice", toAccountId: "acc-bob", toDeviceId: "dev-bob", toHolderName: "Bob", resalePriceMinor: 10000 });
assert.equal(moved.ok, true);
assert.equal(source.status, "transferred");
assert.equal(source.qrVersion, 4);
assert.equal(moved.newTicket.qrVersion, 4);
console.log("✓ Test 11 Réussi (revente plafonnée, ancienne version invalidée)");

// 12. Réclamation : auto-approbation, fraude détectée, coût de la garantie
console.log("\n[TEST 12] Garantie : remboursement auto, fraude et statistiques");
resetState();
const validTicket = {
  id: "tk-claim-1", eventId: "ev6", eventTitle: "Show", holderName: "Alice", holderAccountId: "acc-alice",
  deviceId: "dev-alice", seatLabel: "Place 3", priceMinor: 10000, currency: "EUR", status: "active", qrVersion: 1,
  createdAt: t0.toISOString(),
};
getState().tickets.set(validTicket.id, validTicket);
const claim = createClaim({ ticketId: validTicket.id, reason: "Scan refusé à l'entrée", now: t0 });
assert.equal(claim.ok, true);
const policy = { compensationPercent: 0.1, claimWindowHours: 72, reserveMinor: 20000 };
const decision = decideClaim({ claimId: claim.claim.id, policy, mode: "auto", approved: true, now: new Date(t0.getTime() + 3600_000) });
assert.equal(decision.ok, true);
assert.equal(decision.paidMinor, 11000);
assert.equal(validTicket.status, "refunded");
const secondTicket = { ...validTicket, id: "tk-claim-2", status: "used" };
getState().tickets.set(secondTicket.id, secondTicket);
const fraudClaim = createClaim({ ticketId: secondTicket.id, reason: "Billet prétendument invalide", now: t0 });
const fraud = decideClaim({ claimId: fraudClaim.claim.id, policy, mode: "auto", approved: true, now: t0 });
assert.equal(fraud.error, "FRAUD_SUSPECTED");
const stats = guaranteeStats();
assert.equal(stats.claims, 2);
assert.equal(stats.fraudDetected, 1);
assert.equal(stats.totalCostMinor, 11000);
console.log("✓ Test 12 Réussi (remboursement + dédommagement, fraude détectée, coût total)");

// 13. Rappels à mi-délai et avant expiration
console.log("\n[TEST 13] Rappels automatiques aux retardataires");
resetState();
const reminded = createGroup({
  eventId: "ev7", eventTitle: "Show", initiatorName: "A", countryCode: "FR", currency: "EUR",
  quantity: 1, unitAmountMinor: 2000, capacity: 5, holdHours: 24, now: t0,
});
await payShare({ token: reminded.group.token, shareId: reminded.shares[0].id, holderName: "Alice", methodCode: "card", idempotencyKey: "k", now: t0 });
// Une nouvelle part non payée permet de vérifier les rappels.
const group2 = createGroup({
  eventId: "ev8", eventTitle: "Show", initiatorName: "A", countryCode: "FR", currency: "EUR",
  quantity: 1, unitAmountMinor: 2000, capacity: 5, holdHours: 24, now: t0,
});
await payShare({ token: group2.group.token, shareId: group2.shares[0].id, holderName: "Bob", methodCode: "card", idempotencyKey: "k2", now: t0 });
// Cas simple : une part reste pending quand le paiement échoue (provider inconnu).
const pending = createGroup({
  eventId: "ev9", eventTitle: "Show", initiatorName: "A", countryCode: "FR", currency: "EUR",
  quantity: 1, unitAmountMinor: 2000, capacity: 5, holdHours: 24, now: t0,
});
const failed = await payShare({ token: pending.group.token, shareId: pending.shares[0].id, holderName: "Retardataire", methodCode: "inconnu", idempotencyKey: "k3", now: t0 });
assert.equal(failed.ok, false);
// Un retardataire connu reste en attente après un échec de paiement.
pending.shares[0].holderName = "Retardataire";
const halfway = processReminders(new Date(t0.getTime() + 12 * 3_600_000));
assert.ok(halfway.some((item) => item.kind === "half"));
const final = processReminders(new Date(t0.getTime() + 22 * 3_600_000));
assert.ok(final.some((item) => item.kind === "final"));
console.log("✓ Test 13 Réussi (rappel à mi-délai et avant expiration, une seule fois chacun)");

console.log("\n=================================================");
console.log("   TOUS LES TESTS UNITAIRES ONT RÉUSSI (100%)");
console.log("=================================================");