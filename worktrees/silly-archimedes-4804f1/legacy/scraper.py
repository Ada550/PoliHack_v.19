import json
import random
import os

SITES = ["ZARA", "H&M", "Stradivarius"]

CATEGORIES = {
    "ZARA": [
        {"name": "Slim Fit Blazer - Navy", "category": "upper_body", "price": 299.99},
        {"name": "Oversized Shirt - White", "category": "upper_body", "price": 149.99},
        {"name": "Straight Jeans - Black", "category": "lower_body", "price": 249.99},
        {"name": "Wool Blend Coat - Beige", "category": "outerwear", "price": 449.99},
        {"name": "Linen Trousers - Grey", "category": "lower_body", "price": 199.99},
    ],
    "H&M": [
        {"name": "Regular Fit Shirt", "category": "upper_body", "price": 129.90},
        {"name": "Slim Stretch Jeans", "category": "lower_body", "price": 199.90},
        {"name": "Cotton Hoodie", "category": "upper_body", "price": 89.90},
        {"name": "Classic Blazer", "category": "upper_body", "price": 349.90},
        {"name": "Chino Trousers", "category": "lower_body", "price": 179.90},
    ],
    "Stradivarius": [
        {"name": "Cropped Jacket", "category": "upper_body", "price": 179.99},
        {"name": "High Waist Jeans", "category": "lower_body", "price": 159.99},
        {"name": "Basic T-Shirt", "category": "upper_body", "price": 39.99},
        {"name": "Leather Belt", "category": "accessories", "price": 59.99},
        {"name": "Oversized Blouse", "category": "upper_body", "price": 119.99},
    ],
}

IMAGES = {
    "ZARA": [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400",
        "https://images.unsplash.com/photo-1542272604-787c3835535a?w=400",
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400",
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8dbfe?w=400",
    ],
    "H&M": [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400",
    ],
    "Stradivarius": [
        "https://images.unsplash.com/photo-1594938328625-1c7f4e8845a8?w=400",
        "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        "https://images.unsplash.com/photo-1604176354204-a92664222f9e?w=400",
    ],
}

def generate_products():
    products = []
    product_id = 1
    
    for site in SITES:
        categories = CATEGORIES[site]
        images = IMAGES[site]
        
        for i, item in enumerate(categories):
            products.append({
                "id": f"{site.lower()}_{product_id}",
                "name": item["name"],
                "category": item["category"],
                "price": item["price"],
                "site": site,
                "image": images[i],
            })
            product_id += 1
    
    random.shuffle(products)
    return products

def save_to_json(filename="products.json"):
    products = generate_products()
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(products)} products to {filename}")
    return products

def load_from_json(filename="products.json"):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return save_to_json(filename)

if __name__ == "__main__":
    products = save_to_json()
    print("\n--- Generated Products ---")
    for p in products:
        print(f"[{p['site']}] {p['name']} - {p['price']} RON")