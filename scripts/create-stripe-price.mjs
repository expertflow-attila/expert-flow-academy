// Stripe Product + Price létrehozása a kurzushoz, és Supabase courses.stripe_price_id beállítása.
// Futtatás: node scripts/create-stripe-price.mjs
// Idempotens: keresi a meglévő terméket név alapján, ha van újra-használja.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8').split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); let v = l.slice(i+1).trim(); if ((v.startsWith('"')&&v.endsWith('"'))||(v.startsWith("'")&&v.endsWith("'"))) v = v.slice(1,-1); return [l.slice(0,i), v]; })
);

const STRIPE_KEY = env.STRIPE_SECRET_KEY;
const SUPA_URL = env.SUPABASE_URL.replace(/\/+$/, '');
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const COURSE_SLUG = 'build-in-public-30nap';
const PRODUCT_NAME = 'Saját AI Operations rendszer 5 nap alatt';
const PRICE_HUF = 49000;

if (!STRIPE_KEY || !STRIPE_KEY.startsWith('sk_')) { console.error('STRIPE_SECRET_KEY hiányzik / rossz formátum'); process.exit(1); }
const TEST_MODE = STRIPE_KEY.startsWith('sk_test_');
console.log(`Stripe mode: ${TEST_MODE ? 'TEST' : 'LIVE'}`);

async function stripe(path, opts = {}) {
  const r = await fetch(`https://api.stripe.com/v1${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', ...(opts.headers || {}) },
  });
  if (!r.ok) throw new Error(`Stripe ${path}: ${r.status} ${await r.text()}`);
  return r.json();
}
function form(obj) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) p.append(k, String(v));
  return p.toString();
}

async function findOrCreateProduct() {
  // Keresés a meglévő termékek közt név alapján
  const list = await stripe(`/products?active=true&limit=100`);
  const existing = list.data.find(p => p.name === PRODUCT_NAME);
  if (existing) {
    console.log(`  Termék már létezik: ${existing.id}`);
    return existing;
  }
  console.log('  Új termék létrehozása...');
  const newProd = await stripe('/products', {
    method: 'POST',
    body: form({
      name: PRODUCT_NAME,
      description: 'Expert Flow Akadémia kurzus — 7 modul, 27 lecke.',
      'metadata[course_slug]': COURSE_SLUG,
    }),
  });
  console.log(`  Új termék: ${newProd.id}`);
  return newProd;
}

async function findOrCreatePrice(product) {
  // Keresés a meglévő price-ok közt: 49000 HUF one-time
  const list = await stripe(`/prices?product=${product.id}&active=true&limit=100`);
  const existing = list.data.find(p => p.unit_amount === PRICE_HUF * 100 && p.currency === 'huf' && p.type === 'one_time');
  if (existing) {
    console.log(`  Price már létezik: ${existing.id} (${existing.unit_amount/100} ${existing.currency.toUpperCase()})`);
    return existing;
  }
  console.log(`  Új price létrehozása: ${PRICE_HUF} HUF one-time...`);
  const newPrice = await stripe('/prices', {
    method: 'POST',
    body: form({
      product: product.id,
      unit_amount: PRICE_HUF * 100, // Stripe a legkisebb egységben kéri, de HUF NULLA decimális, tehát 49000 * 100? Vagy 49000? Lásd alább.
      // FIGYELEM: Stripe HUF zero-decimal-CURRENCY ELLENTÉTBE az iso 4217 standardtal. Stripe docs:
      //   https://stripe.com/docs/currencies#zero-decimal
      //   HUF NEM zero-decimal Stripe-nál — tehát 49000 HUF = 4900000 cent (4 900 000)
      // Tehát a value 49000 * 100 = 4900000 NEM helyes. Helyes a 49000 * 100 = 4900000? Nem.
      // Hivatalos: HUF Stripe-ban 2 decimális (mint az USD), tehát 49000 Ft = 4900000 (49000.00 HUF).
      currency: 'huf',
      // Egyszeri fizetés (nincs recurring)
    }),
  });
  console.log(`  Új price: ${newPrice.id}`);
  return newPrice;
}

async function updateCourse(priceId) {
  const r = await fetch(`${SUPA_URL}/rest/v1/courses?slug=eq.${COURSE_SLUG}`, {
    method: 'PATCH',
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ stripe_price_id: priceId }),
  });
  if (!r.ok) throw new Error(`Supabase PATCH: ${r.status} ${await r.text()}`);
  const c = (await r.json())[0];
  console.log(`  Supabase courses.stripe_price_id frissítve: ${c.stripe_price_id}`);
}

console.log('1. Stripe termék keresés / létrehozás...');
const product = await findOrCreateProduct();

console.log('\n2. Stripe price keresés / létrehozás...');
const price = await findOrCreatePrice(product);

console.log('\n3. Supabase courses frissítés...');
await updateCourse(price.id);

console.log('\nKész.');
console.log(`Termék: ${product.id}`);
console.log(`Price:  ${price.id}`);
console.log(`Mode:   ${TEST_MODE ? 'TEST' : 'LIVE'}`);
