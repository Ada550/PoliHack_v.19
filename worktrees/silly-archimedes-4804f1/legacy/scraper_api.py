from flask import Flask, jsonify, request
from flask_cors import CORS
from bs4 import BeautifulSoup
import requests
import random
import time

app = Flask(__name__)
CORS(app)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

SCRAPED_PRODUCTS = []

def scrape_zara():
    products = []
    try:
        url = "https://www.zara.com/ro/en/man-shirts-l1.html"
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        for p in soup.select('.product-card')[:5]:
            try:
                name = p.select_one('.product-name')
                price = p.select_one('.price')
                img = p.select_one('img')
                if name and price:
                    products.append({
                        'name': name.get_text(strip=True),
                        'price': int(''.join(filter(str.isdigit, price.get_text()))),
                        'site': 'ZARA',
                        'image': img.get('src') if img else ''
                    })
            except:
                pass
    except Exception as e:
        print(f"Zara error: {e}")
    return products

def scrape_hm():
    products = []
    try:
        url = "https://www2.hm.com/ro_ro/barbati-produse/toti-produsele.html"
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        for p in soup.select('.product-item')[:5]:
            try:
                name = p.select_one('.product-name')
                price = p.select_one('.price')
                img = p.select_one('img')
                if name and price:
                    products.append({
                        'name': name.get_text(strip=True),
                        'price': int(''.join(filter(str.isdigit, price.get_text()))),
                        'site': 'H&M',
                        'image': img.get('data-src') or img.get('src') if img else ''
                    })
            except:
                pass
    except Exception as e:
        print(f"H&M error: {e}")
    return products

def scrape_levis():
    products = []
    try:
        url = "https://www.levi.com/RO/ro/c/men-jeans"
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        for p in soup.select('[class*="product"]')[:5]:
            try:
                name = p.select_one('[class*="name"]')
                price = p.select_one('[class*="price"]')
                img = p.select_one('img')
                if name and price:
                    price_text = price.get_text(strip=True)
                    products.append({
                        'name': name.get_text(strip=True),
                        'price': int(''.join(filter(str.isdigit, price_text))),
                        'site': "Levi's",
                        'image': img.get('src') if img else ''
                    })
            except:
                pass
    except Exception as e:
        print(f"Levi's error: {e}")
    return products

def scrape_uniqlo():
    products = []
    try:
        url = "https://www.uniqlo.com/ro/en/men/"
        r = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        for p in soup.select('[class*="product"]')[:5]:
            try:
                name = p.select_one('[class*="name"]')
                price = p.select_one('[class*="price"]')
                img = p.select_one('img')
                if name and price:
                    products.append({
                        'name': name.get_text(strip=True),
                        'price': int(''.join(filter(str.isdigit, price.get_text()))),
                        'site': 'Uniqlo',
                        'image': img.get('src') if img else ''
                    })
            except:
                pass
    except Exception as e:
        print(f"Uniqlo error: {e}")
    return products

@app.route('/api/scrape', methods=['GET'])
def scrape_all():
    global SCRAPED_PRODUCTS
    SCRAPED_PRODUCTS = []
    
    all_products = []
    
    # Try scraping from multiple sites
    try:
        all_products.extend(scrape_zara())
    except:
        pass
    
    try:
        all_products.extend(scrape_hm())
    except:
        pass
    
    try:
        all_products.extend(scrape_levis())
    except:
        pass
    
    try:
        all_products.extend(scrape_uniqlo())
    except:
        pass
    
    # Fallback to mock data if no products scraped
    if len(all_products) < 3:
        all_products = [
            {"name": "Slim Fit Blazer - Navy", "price": 299, "site": "ZARA", "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200"},
            {"name": "Classic White Shirt", "price": 149, "site": "H&M", "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200"},
            {"name": "Straight Fit Jeans", "price": 249, "site": "Levi's", "image": "https://images.unsplash.com/photo-1542272604-787c3835535a?w=200"},
            {"name": "Cotton T-Shirt Black", "price": 89, "site": "Uniqlo", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"},
            {"name": "Leather Belt", "price": 129, "site": "Mango", "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200"},
        ]
        print("Using fallback mock data")
    
    # Filter valid products
    SCRAPED_PRODUCTS = [p for p in all_products if p.get('name') and p.get('price')]
    random.shuffle(SCRAPED_PRODUCTS)
    
    return jsonify(SCRAPED_PRODUCTS[:10])

@app.route('/api/products', methods=['GET'])
def get_products():
    global SCRAPED_PRODUCTS
    if not SCRAPED_PRODUCTS:
        SCRAPED_PRODUCTS = [
            {"name": "Slim Fit Blazer - Navy", "price": 299, "site": "ZARA", "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200"},
            {"name": "Classic White Shirt", "price": 149, "site": "H&M", "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200"},
            {"name": "Straight Fit Jeans", "price": 249, "site": "Levi's", "image": "https://images.unsplash.com/photo-1542272604-787c3835535a?w=200"},
            {"name": "Cotton T-Shirt Black", "price": 89, "site": "Uniqlo", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200"},
            {"name": "Leather Belt", "price": 129, "site": "Mango", "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200"},
        ]
    return jsonify(SCRAPED_PRODUCTS)

if __name__ == '__main__':
    app.run(debug=True, port=5000)