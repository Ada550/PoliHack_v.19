import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, '..', 'data', 'products.json');

const PRODUCTS = JSON.parse(readFileSync(dataPath, 'utf8'));

export function getAllProducts() {
  return PRODUCTS;
}

export function filterProducts({ gender, category, maxPrice, site } = {}) {
  return PRODUCTS.filter((p) => {
    if (gender && p.gender !== gender) return false;
    if (category && p.category !== category) return false;
    if (site && p.site.toLowerCase() !== site.toLowerCase()) return false;
    if (maxPrice != null && p.price > maxPrice) return false;
    return true;
  });
}
