import streamlit as st
from PIL import Image
import io

st.set_page_config(page_title="Outfit Reseller", page_icon="👕", layout="wide")

if 'page' not in st.session_state:
    st.session_state.page = 1
if 'user_photo' not in st.session_state:
    st.session_state.user_photo = None
if 'measurements' not in st.session_state:
    st.session_state.measurements = {}
if 'outfit_results' not in st.session_state:
    st.session_state.outfit_results = []
if 'cart' not in st.session_state:
    st.session_state.cart = []

MOCK_PRODUCTS = [
    {"name": "Slim Fit Blazer - Navy", "price": 299, "site": "ZARA", "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop"},
    {"name": "Classic White Shirt", "price": 149, "site": "H&M", "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop"},
    {"name": "Straight Fit Jeans", "price": 249, "site": "Levi's", "image": "https://images.unsplash.com/photo-1542272604-787c3835535a?w=300&h=400&fit=crop"},
    {"name": "Cotton T-Shirt Black", "price": 89, "site": "Uniqlo", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop"},
    {"name": "Leather Belt", "price": 129, "site": "Mango", "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop"},
    {"name": "Canvas Sneakers", "price": 199, "site": "Converse", "image": "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=400&fit=crop"},
]

STYLE_OPTIONS = ["Casual", "Formal", "Business", "Sport", "Streetwear"]

def go_to_page(page_num):
    st.session_state.page = page_num

def calculate_compatibility(product, measurements, style):
    score = 80
    if measurements.get('body_type') == 'athletic':
        if 'fit' in product['name'].lower() or 'slim' in product['name'].lower():
            score += 15
    if style.lower() in product['name'].lower():
        score += 10
    return min(98, score)

# Page 1: Upload & Measurements
if st.session_state.page == 1:
    st.title("👕 Outfit Reseller")
    st.markdown("### Complete your profile to find the perfect outfit")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown("#### 📸 Upload Your Photo")
        uploaded_file = st.file_uploader("Choose a photo", type=['jpg', 'jpeg', 'png'])
        if uploaded_file is not None:
            image = Image.open(uploaded_file)
            st.session_state.user_photo = image
            st.image(image, caption="Your Photo", use_container_width=True)
    
    with col2:
        st.markdown("#### 📏 Your Measurements")
        
        col_h, col_w = st.columns(2)
        with col_h:
            height = st.number_input("Height (cm)", min_value=100, max_value=220, value=175)
        with col_w:
            weight = st.number_input("Weight (kg)", min_value=30, max_value=200, value=70)
        
        shoulder = st.slider("Shoulder Width (cm)", 30, 60, 45)
        hip = st.slider("Hip Width (cm)", 60, 140, 95)
        
        budget = st.slider("Budget (RON)", 100, 5000, 500)
        
        style = st.selectbox("Select Your Style", STYLE_OPTIONS)
        
        body_type = st.radio("Body Type", ["Slim", "Athletic", "Average", "Plus"])
        
        if st.button("Next →", type="primary", use_container_width=True):
            st.session_state.measurements = {
                'height': height,
                'weight': weight,
                'shoulder': shoulder,
                'hip': hip,
                'budget': budget,
                'style': style,
                'body_type': body_type
            }
            st.session_state.outfit_results = MOCK_PRODUCTS[:5]
            go_to_page(2)

# Page 2: Results
elif st.session_state.page == 2:
    st.title("👔 Your Perfect Outfit")
    
    col_left, col_right = st.columns([1, 1])
    
    with col_left:
        st.markdown("#### Your Photo")
        if st.session_state.user_photo is not None:
            st.image(st.session_state.user_photo, caption="You", use_container_width=True)
        else:
            st.info("No photo uploaded")
        
        st.markdown("### 🎯 Matching Outfit")
        for i, prod in enumerate(st.session_state.outfit_results):
            with st.container():
                st.image(prod['image'], width=150)
                st.caption(f"{prod['name']} from {prod['site']}")
    
    with col_right:
        st.markdown("#### 🛍️ Available Products")
        
        for i, prod in enumerate(st.session_state.outfit_results):
            compat = calculate_compatibility(prod, st.session_state.measurements, st.session_state.measurements.get('style', 'Casual'))
            
            with st.container():
                c1, c2, c3 = st.columns([3, 1, 1])
                with c1:
                    st.markdown(f"**{prod['name']}**")
                    st.caption(f"From {prod['site']} • Match: {compat}%")
                with c2:
                    st.markdown(f"### {prod['price']} RON")
                with c3:
                    if st.button(f"🛒 Add", key=f"add_{i}", use_container_width=True):
                        if prod not in st.session_state.cart:
                            st.session_state.cart.append(prod)
                            st.success("Added!")
                
                if prod['price'] > st.session_state.measurements.get('budget', 500):
                    st.warning(f"⚠️ Over budget!")
                st.divider()
        
        st.markdown("---")
        
        c1, c2 = st.columns(2)
        with c1:
            if st.button("🔄 Change Outfit", use_container_width=True):
                import random
                random.shuffle(st.session_state.outfit_results)
                st.rerun()
        with c2:
            if st.button("Next → Cart", type="primary", use_container_width=True):
                go_to_page(3)

# Page 3: Cart
elif st.session_state.page == 3:
    st.title("🛒 Your Cart")
    
    col_left, col_right = st.columns([1, 1])
    
    with col_left:
        st.markdown("#### Your Photo")
        if st.session_state.user_photo is not None:
            st.image(st.session_state.user_photo, caption="You", use_container_width=True)
        
        st.markdown("#### 📏 Your Measurements")
        m = st.session_state.measurements
        st.markdown(f"""
        - Height: {m.get('height', '-')} cm
        - Weight: {m.get('weight', '-')} kg  
        - Shoulder: {m.get('shoulder', '-')} cm
        - Hip: {m.get('hip', '-')} cm
        - Budget: {m.get('budget', '-')} RON
        - Style: {m.get('style', '-')}
        """)
    
    with col_right:
        st.markdown("#### 🛍️ Cart Items")
        
        if not st.session_state.cart:
            st.info("Your cart is empty")
            products = MOCK_PRODUCTS[:4]
        else:
            products = st.session_state.cart
        
        total = 0
        for i, prod in enumerate(products):
            c1, c2, c3 = st.columns([3, 1, 1])
            with c1:
                st.markdown(f"**{prod['name']}**")
                st.caption(f"From {prod['site']}")
            with c2:
                st.markdown(f"**{prod['price']} RON**")
            with c3:
                if st.button(f"❌ Remove", key=f"rem_{i}", use_container_width=True):
                    if prod in st.session_state.cart:
                        st.session_state.cart.remove(prod)
                    st.rerun()
            total += prod['price']
            st.divider()
        
        st.markdown("---")
        st.markdown(f"### 💰 Total: {total} RON")
        
        if total > st.session_state.measurements.get('budget', 500):
            st.warning(f"⚠️ Over budget by {total - st.session_state.measurements.get('budget', 500)} RON!")
        
        st.markdown("---")
        
        col_b1, col_b2 = st.columns(2)
        with col_b1:
            if st.button("← Back", use_container_width=True):
                go_to_page(2)
        with col_b2:
            if st.button("📦 ORDER NOW", type="primary", use_container_width=True):
                st.balloons()
                st.success("Order placed successfully! 🎉")
                st.markdown("### Thank you for your order!")
                st.markdown("You will receive a confirmation email shortly.")