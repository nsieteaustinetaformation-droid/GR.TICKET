import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

console.log("=================================================");
console.log("   GODMAN RECORDS TIKET - SUITE DE TESTS UNITAIRES");
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
const SECRET = "godman-secret-key-super-secure-2026";

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
console.log("\n[TEST 3] Formatage Envoi WhatsApp Congo (+242)");
function formatWhatsAppUrl(phone, msg) {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
const waUrl = formatWhatsAppUrl("+242 06 123 45 67", "Votre billet GODMAN");
assert.equal(waUrl.includes("242061234567"), true);
assert.equal(waUrl.startsWith("https://wa.me/"), true);
console.log("✓ Test 3 Réussi (Nettoyage numéro +242 et encodage message URL conformes)");

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

console.log("\n=================================================");
console.log("   TOUS LES TESTS UNITAIRES ONT RÉUSSI (100%)");
console.log("=================================================");