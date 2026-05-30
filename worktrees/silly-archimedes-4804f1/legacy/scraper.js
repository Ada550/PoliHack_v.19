const { chromium } = require('playwright');
const fs = require('fs');

const SITES = {
    "ZARA": {
        url: "https://www.zara.com/ro/en/man-shirts-l1.html",
        selectors: [
            { product: ".product-card", name: ".product-name", price: ".price", image: "img" },
            { product: "[data-qa-product]", name: "[data-qa-product-name]", price: "[data-qa-product-price]", image: "img" },
            { product: ".product-list-item", name: ".name", price: ".price", image: "img" },
        ]
    },
    "H&M": {
        url: "https://www2.hm.com/ro_ro/barbati-produse/toti-produsele.html",
        selectors: [
            { product: ".product-item", name: ".product-name", price: ".price", image: "img" },
            { product: ".product", name: ".title", price: ".price", image: "img" },
            { product: "[class*='product']", name: "[class*='name']", price: "[class*='price']", image: "img" },
        ]
    },
    "Stradivarius": {
        url: "https://www.stradivarius.com/ro/en/man/",
        selectors: [
            { product: "[class*='product']", name: "[class*='name']", price: "[class*='price']", image: "img" },
            { product: ".product-card", name: ".product-name", price: ".price", image: "img" },
        ]
    }
};

function parsePrice(text) {
    if (!text) return 0;
    const numbers = text.match(/[\d.,]+/g);
    if (numbers) {
        try {
            return parseFloat(numbers[0].replace(',', '.'));
        } catch (e) {
            return 0;
        }
    }
    return 0;
}

async function scrapeSite(siteName, config, browser) {
    const products = [];
    const page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
    });
    
    try {
        console.log(`[${siteName}] Navigating to ${config.url}`);
        await page.goto(config.url, { 
            timeout: 60000, 
            waitUntil: "networkidle",
            retries: 3 
        });
        
        // Try each selector set
        for (const sel of config.selectors) {
            try {
                await page.waitForSelector(sel.product, { timeout: 5000 });
                const productCards = await page.$$(sel.product);
                
                if (productCards.length > 0) {
                    console.log(`[${siteName}] Found ${productCards.length} products with selector: ${sel.product}`);
                    
                    const cardsToProcess = productCards.slice(0, 5);
                    
                    for (const card of cardsToProcess) {
                        try {
                            const nameElem = await card.$(sel.name);
                            const priceElem = await card.$(sel.price);
                            const imgElem = await card.$(sel.image);
                            
                            const name = nameElem ? await nameElem.innerText() : "";
                            const priceText = priceElem ? await priceElem.innerText() : "";
                            const image = imgElem ? (await imgElem.getAttribute('src') || await imgElem.getAttribute('data-src')) : "";
                            
                            if (name && priceText) {
                                products.push({
                                    name: name.trim(),
                                    price: parsePrice(priceText),
                                    site: siteName,
                                    image: image || ""
                                });
                            }
                        } catch (e) {
                            // continue to next card
                        }
                    }
                    
                    if (products.length > 0) break;
                }
            } catch (e) {
                console.log(`[${siteName}] Selector ${sel.product} failed: ${e.message}`);
            }
        }
        
    } catch (e) {
        console.log(`[${siteName}] Error: ${e.message}`);
    } finally {
        await page.close();
    }
    
    return products;
}

async function scrapeAll() {
    let allProducts = [];
    let productId = 1;
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-blink-features=AutomationControlled']
    });
    
    for (const [siteName, config] of Object.entries(SITES)) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`Scraping ${siteName}...`);
        console.log(`${'='.repeat(50)}`);
        
        const products = await scrapeSite(siteName, config, browser);
        
        for (const prod of products) {
            prod.id = `${siteName.toLowerCase()}_${productId}`;
            productId++;
        }
        
        allProducts = allProducts.concat(products);
        console.log(`[${siteName}] Found ${products.length} products`);
    }
    
    await browser.close();
    
    return allProducts;
}

function getMockData() {
    return [
        { id: "zara_1", name: "Slim Fit Blazer - Navy", category: "upper_body", price: 299.99, site: "ZARA", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400" },
        { id: "zara_2", name: "Oversized Shirt - White", category: "upper_body", price: 149.99, site: "ZARA", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400" },
        { id: "zara_3", name: "Straight Jeans - Black", category: "lower_body", price: 249.99, site: "ZARA", image: "https://images.unsplash.com/photo-1542272604-787c3835535a?w=400" },
        { id: "zara_4", name: "Wool Blend Coat - Beige", category: "outerwear", price: 449.99, site: "ZARA", image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400" },
        { id: "zara_5", name: "Linen Trousers - Grey", category: "lower_body", price: 199.99, site: "ZARA", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8dbfe?w=400" },
        { id: "hm_1", name: "Regular Fit Shirt", category: "upper_body", price: 129.90, site: "H&M", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400" },
        { id: "hm_2", name: "Slim Stretch Jeans", category: "lower_body", price: 199.90, site: "H&M", image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400" },
        { id: "hm_3", name: "Cotton Hoodie", category: "upper_body", price: 89.90, site: "H&M", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400" },
        { id: "hm_4", name: "Classic Blazer", category: "upper_body", price: 349.90, site: "H&M", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400" },
        { id: "hm_5", name: "Chino Trousers", category: "lower_body", price: 179.90, site: "H&M", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400" },
        { id: "stradivarius_1", name: "Cropped Jacket", category: "upper_body", price: 179.99, site: "Stradivarius", image: "https://images.unsplash.com/photo-1594938328625-1c7f4e8845a8?w=400" },
        { id: "stradivarius_2", name: "High Waist Jeans", category: "lower_body", price: 159.99, site: "Stradivarius", image: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400" },
        { id: "stradivarius_3", name: "Basic T-Shirt", category: "upper_body", price: 39.99, site: "Stradivarius", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" },
        { id: "stradivarius_4", name: "Leather Belt", category: "accessories", price: 59.99, site: "Stradivarius", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
        { id: "stradivarius_5", name: "Oversized Blouse", category: "upper_body", price: 119.99, site: "Stradivarius", image: "https://images.unsplash.com/photo-1604176354204-a92664222f9e?w=400" },
    ];
}

function guessCategory(name) {
    const lower = name.toLowerCase();
    if (lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer')) return 'upper_body';
    if (lower.includes('jeans') || lower.includes('trousers') || lower.includes('pants')) return 'lower_body';
    if (lower.includes('belt') || lower.includes('hat') || lower.includes('scarf')) return 'accessories';
    return 'upper_body';
}

async function main() {
    let products = await scrapeAll();
    
    // Fallback to mock data if nothing scraped
    if (products.length < 3) {
        console.log("\n[!] No products scraped, using mock data");
        products = getMockData();
    } else {
        // Add category to scraped products
        products = products.map(p => ({
            ...p,
            category: guessCategory(p.name)
        }));
    }
    
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log(`\n[✓] Saved ${products.length} products to products.json`);
    
    console.log("\n--- Products ---");
    for (const p of products) {
        console.log(`[${p.site}] ${p.name} - ${p.price} RON`);
    }
}

main().catch(console.error);