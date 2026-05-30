from playwright.sync_api import sync_playwright
import json
import re

SITES = {
    "ZARA": {
        "url": "https://www.zara.com/ro/en/man-shirts-l1.html",
        "product_selector": ".product-card",
        "name_selector": ".product-name",
        "price_selector": ".price",
        "image_selector": "img"
    },
    "H&M": {
        "url": "https://www2.hm.com/ro_ro/barbati-produse/toti-produsele.html",
        "product_selector": ".product-item",
        "name_selector": ".product-name",
        "price_selector": ".price",
        "image_selector": "img"
    },
    "Stradivarius": {
        "url": "https://www.stradivarius.com/ro/en/man/",
        "product_selector": "[class*='product']",
        "name_selector": "[class*='name']",
        "price_selector": "[class*='price']",
        "image_selector": "img"
    }
}

def parse_price(text):
    if not text:
        return 0
    numbers = re.findall(r'[\d.,]+', text)
    if numbers:
        try:
            return float(numbers[0].replace(',', '.'))
        except:
            return 0
    return 0

def scrape_site(site_name, config, browser):
    products = []
    page = browser.new_page()
    
    try:
        print(f"[{site_name}] Navigating to {config['url']}")
        page.goto(config['url'], timeout=30000, wait_until="domcontentloaded")
        
        # Wait for products to load
        page.wait_for_selector(config['product_selector'], timeout=10000)
        
        # Get product cards
        product_cards = page.query_selector_all(config['product_selector'])[:5]
        
        for card in product_cards:
            try:
                name_elem = card.query_selector(config['name_selector'])
                price_elem = card.query_selector(config['price_selector'])
                img_elem = card.query_selector(config['image_selector'])
                
                name = name_elem.inner_text().strip() if name_elem else ""
                price_text = price_elem.inner_text().strip() if price_elem else ""
                image = img_elem.get_attribute("src") or img_elem.get_attribute("data-src") if img_elem else ""
                
                if name and price_text:
                    products.append({
                        "name": name,
                        "price": parse_price(price_text),
                        "site": site_name,
                        "image": image
                    })
            except Exception as e:
                print(f"[{site_name}] Error parsing product: {e}")
                continue
                
    except Exception as e:
        print(f"[{site_name}] Error: {e}")
    finally:
        page.close()
    
    return products

def scrape_all():
    all_products = []
    product_id = 1
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for site_name, config in SITES.items():
            print(f"\n{'='*50}")
            print(f"Scraping {site_name}...")
            print(f"{'='*50}")
            
            products = scrape_site(site_name, config, browser)
            
            for prod in products:
                prod["id"] = f"{site_name.lower()}_{product_id}"
                product_id += 1
            
            all_products.extend(products)
            print(f"[{site_name}] Found {len(products)} products")
        
        browser.close()
    
    return all_products

def save_to_json(filename="products.json"):
    products = scrape_all()
    
    # Fallback to mock data if nothing scraped
    if len(products) < 3:
        print("\n[!] No products scraped, using mock data")
        products = get_mock_data()
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"\n[✓] Saved {len(products)} products to {filename}")
    return products

def get_mock_data():
    return [
        {"id": "zara_1", "name": "Slim Fit Blazer - Navy", "category": "upper_body", "price": 299.99, "site": "ZARA", "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400"},
        {"id": "zara_2", "name": "Oversized Shirt - White", "category": "upper_body", "price": 149.99, "site": "ZARA", "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"},
        {"id": "zara_3", "name": "Straight Jeans - Black", "category": "lower_body", "price": 249.99, "site": "ZARA", "image": "https://images.unsplash.com/photo-1542272604-787c3835535a?w=400"},
        {"id": "hm_1", "name": "Regular Fit Shirt", "category": "upper_body", "price": 129.90, "site": "H&M", "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400"},
        {"id": "hm_2", "name": "Slim Stretch Jeans", "category": "lower_body", "price": 199.90, "site": "H&M", "image": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"},
        {"id": "hm_3", "name": "Cotton Hoodie", "category": "upper_body", "price": 89.90, "site": "H&M", "image": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400"},
        {"id": "stradivarius_1", "name": "Cropped Jacket", "category": "upper_body", "price": 179.99, "site": "Stradivarius", "image": "https://images.unsplash.com/photo-1594938328625-1c7f4e8845a8?w=400"},
        {"id": "stradivarius_2", "name": "High Waist Jeans", "category": "lower_body", "price": 159.99, "site": "Stradivarius", "image": "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400"},
        {"id": "stradivarius_3", "name": "Basic T-Shirt", "category": "upper_body", "price": 39.99, "site": "Stradivarius", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"},
    ]

if __name__ == "__main__":
    products = save_to_json()
    
    print("\n--- Scraped Products ---")
    for p in products:
        print(f"[{p['site']}] {p['name']} - {p['price']} RON")