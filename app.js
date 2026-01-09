// ===========================
// LocalStorage Management
// ===========================

const PRODUCTS_KEY = 'ecommerce_products';
const CART_KEY = 'ecommerce_cart';
let productModal = null;

// Build a local inline SVG placeholder (no external network required)
function buildPlaceholder(text, w = 250, h = 200) {
        const bg = '#ecf0f1';
        const fg = '#7f8c8d';
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
            <rect width="100%" height="100%" fill="${bg}"/>
            <text x="50%" y="50%" font-family="Segoe UI, Tahoma, sans-serif" font-size="16" fill="${fg}" dominant-baseline="middle" text-anchor="middle">${text}</text>
        </svg>`;
        const encoded = encodeURIComponent(svg)
                .replace(/'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29');
        return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

// Initialize products in localStorage if empty
function initializeProducts() {
    // Force reset to load new products
    localStorage.removeItem(PRODUCTS_KEY);
    
    if (!localStorage.getItem(PRODUCTS_KEY)) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Bonnet Satin Double Face',
                price: 20,
                description: 'Bonnet satin réversible avec deux couleurs différentes',
                image: 'images/bonnet-satin-double-face.jpg',
                colors: ['Noir/Rose', 'Bleu/Blanc', 'Violet/Beige', 'Rouge/Or']
            },
            {
                id: 2,
                name: 'Taie d\'Oreiller Satin',
                price: 20,
                description: 'Taie d\'oreiller en satin, anti-frisottis et anti-rides',
                image: 'images/taie-oreiller-satin.jpg',
                colors: ['Noir', 'Blanc', 'Rose', 'Gris', 'Champagne']
            },
            {
                id: 3,
                name: 'Chouchou en Satin',
                price: 5,
                description: 'Chouchou en satin doux pour protéger vos cheveux',
                image: 'images/chouchou-satin.jpg',
                colors: ['Noir', 'Rose', 'Bleu', 'Beige', 'Violet']
            },
            {
                id: 4,
                name: 'Pack Taie d\'Oreiller + Bonnet + Chouchou',
                price: 40,
                description: 'Pack complet : taie d\'oreiller, bonnet et chouchou en satin',
                image: 'images/pack-complet.jpg',
                colors: ['Noir', 'Rose', 'Blanc', 'Bleu']
            },
            {
                id: 5,
                name: 'Pack 2 Chouchous',
                price: 7,
                description: 'Pack de 2 chouchous en satin à prix réduit',
                image: 'images/pack-2-chouchous.jpg',
                colors: ['Noir', 'Rose', 'Violet', 'Assorti']
            },
            {
                id: 6,
                name: 'Pack Double Taie d\'Oreiller',
                price: 35,
                description: 'Pack de deux taies d\'oreiller en satin, économisez',
                image: 'images/pack-double-taie.jpg',
                colors: ['Noir', 'Blanc', 'Rose', 'Assorti']
            }
        ];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }
}

// Get all products from localStorage
function getProducts() {
    const products = localStorage.getItem(PRODUCTS_KEY);
    return products ? JSON.parse(products) : [];
}

// Save products to localStorage
function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

// Get all cart items from localStorage
function getCartItems() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Save cart items to localStorage
function saveCartItems(cartItems) {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

// Add product to cart
function addToCart(productId, selectedColor) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // If no color selected and product has colors, alert user
    if (!selectedColor && product.colors && product.colors.length > 0) {
        alert('Veuillez choisir une couleur');
        return;
    }
    
    const cart = getCartItems();
    const existingItem = cart.find(item => item.id === productId && item.selectedColor === selectedColor);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            selectedColor: selectedColor || 'N/A'
        });
    }
    
    saveCartItems(cart);
    updateCartCount();
    showNotification('Produit ajouté au panier !');
}

// Remove product from cart
function removeFromCart(productId, selectedColor) {
    const cart = getCartItems();
    const filtered = cart.filter(item => !(item.id === productId && item.selectedColor === selectedColor));
    saveCartItems(filtered);
    updateCartCount();
}

// Update cart item quantity
function updateCartQuantity(productId, quantity, selectedColor) {
    if (quantity <= 0) {
        removeFromCart(productId, selectedColor);
        return;
    }
    
    const cart = getCartItems();
    const item = cart.find(item => item.id === productId && item.selectedColor === selectedColor);
    
    if (item) {
        item.quantity = quantity;
        saveCartItems(cart);
        updateCartCount();
    }
}

// Update cart count in navbar
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const cart = getCartItems();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

// Show notification
function showNotification(message) {
    // Simple notification (can be enhanced with a toast library)
    alert(message);
}

// ===========================
// Page Initialization
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    initializeProducts();
    updateCartCount();
    setupProductModal();
    
    // Load products on index.html
    if (document.getElementById('products-list')) {
        loadProducts();
    }
});

// ===========================
// Product Display
// ===========================

function loadProducts() {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    const products = getProducts();
    productsList.innerHTML = '';
    
    if (products.length === 0) {
        productsList.innerHTML = '<p>Aucun produit disponible</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        let colorSelector = '';
        if (product.colors && product.colors.length > 0) {
            colorSelector = `
                <div class="color-selector">
                    <label for="color-${product.id}">Couleur:</label>
                    <select id="color-${product.id}" class="color-select">
                        <option value="">Choisir...</option>
                        ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                    </select>
                </div>
            `;
        }
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='${buildPlaceholder(product.name)}'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price.toFixed(2)} TND</div></div>
                <div class="product-description">${product.description}</div>
                ${colorSelector}
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                    Ajouter au Panier
                </button>
            </div>
        `;
        
        productCard.addEventListener('click', () => openProductModal(product));

        const addBtn = productCard.querySelector('.add-to-cart');
        addBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const selectedColor = document.getElementById(`color-${product.id}`)?.value || '';
            addToCart(product.id, selectedColor);
        });

        const colorSelect = productCard.querySelector('.color-select');
        if (colorSelect) {
            colorSelect.addEventListener('click', (event) => event.stopPropagation());
        }

        productsList.appendChild(productCard);
    });
}

// ===========================
// Product Modal
// ===========================

function setupProductModal() {
    productModal = document.createElement('div');
    productModal.id = 'product-modal';
    productModal.className = 'modal hidden';
    productModal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="Fermer">&times;</button>
            <div class="modal-body"></div>
        </div>
    `;
    document.body.appendChild(productModal);

    productModal.querySelector('.modal-overlay').addEventListener('click', closeProductModal);
    productModal.querySelector('.modal-close').addEventListener('click', closeProductModal);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeProductModal();
        }
    });
}

function openProductModal(product) {
    if (!productModal) return;
    const modalBody = productModal.querySelector('.modal-body');

    const colorOptions = product.colors && product.colors.length > 0
        ? `
            <div class="color-selector">
                <label for="modal-color-${product.id}">Couleur:</label>
                <select id="modal-color-${product.id}" class="color-select">
                    <option value="">Choisir...</option>
                    ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
                </select>
            </div>
        `
        : '';

    modalBody.innerHTML = `
        <div class="modal-product">
            <div class="modal-product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}'">
            </div>
            <div class="modal-product-info">
                <h3>${product.name}</h3>
                <p class="modal-price">${product.price.toFixed(2)} TND</p>
                <p class="modal-description">${product.description}</p>
                ${colorOptions}
                <button class="btn btn-primary" id="modal-add-btn">Ajouter au Panier</button>
            </div>
        </div>
    `;

    const addBtn = modalBody.querySelector('#modal-add-btn');
    addBtn.addEventListener('click', () => {
        const selectedColor = document.getElementById(`modal-color-${product.id}`)?.value || '';
        addToCart(product.id, selectedColor);
        closeProductModal();
    });

    productModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeProductModal() {
    if (!productModal) return;
    productModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// ===========================
// Export functions for other scripts
// ===========================
// These are available globally for cart.js and admin.js
