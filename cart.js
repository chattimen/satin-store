// ===========================
// Shopping Cart Functionality
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    setupCheckoutButton();
});

// Load and display cart items
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    
    const cartItems = getCartItems();
    cartItemsContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Votre panier est vide</p><a href="index.html" class="btn btn-primary">Continuer les Achats</a></div>';
        updateCartSummary();
        return;
    }
    
    cartItems.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        const colorDisplay = item.selectedColor && item.selectedColor !== 'N/A' ? `<div class="cart-item-color">Couleur: ${item.selectedColor}</div>` : '';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${colorDisplay}
                <div class="cart-item-price">${item.price.toFixed(2)} TND</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1}, '${item.selectedColor}')" class="btn btn-secondary">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, parseInt(this.value), '${item.selectedColor}')">
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1}, '${item.selectedColor}')" class="btn btn-secondary">+</button>
            </div>
            <div style="font-weight: bold; margin: 0 1rem;">${(item.price * item.quantity).toFixed(2)} TND</div>
            <button class="icon-button" title="Supprimer" aria-label="Supprimer" onclick="removeFromCart(${item.id}, '${item.selectedColor}'); loadCartItems();">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7H3a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1zm1 2v1h4V5h-4zM7 7v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7H7zm3 3a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1zm4 0a1 1 0 0 1 1 1v7a1 1 0 1 1-2 0v-7a1 1 0 0 1 1-1z"/>
                </svg>
            </button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartSummary();
}

// Update cart item quantity
function updateQuantity(productId, quantity, selectedColor) {
    if (quantity < 1) {
        if (confirm('Retirer cet article du panier ?')) {
            removeFromCart(productId, selectedColor);
        }
        loadCartItems();
        return;
    }
    
    updateCartQuantity(productId, quantity, selectedColor);
    loadCartItems();
}

// Update cart summary (totals)
function updateCartSummary() {
    const cartItems = getCartItems();
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const totalEl = document.getElementById('total');
    
    if (totalEl) totalEl.textContent = total.toFixed(2) + ' TND';
}

// Setup checkout button
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;
    
    checkoutBtn.addEventListener('click', function() {
        const cartItems = getCartItems();
        
        if (cartItems.length === 0) {
            alert('Votre panier est vide');
            return;
        }
        
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderSummary = cartItems
            .map(item => {
                const colorInfo = item.selectedColor && item.selectedColor !== 'N/A' ? ` (${item.selectedColor})` : '';
                return `- ${item.name}${colorInfo} x${item.quantity}: ${(item.price * item.quantity).toFixed(2)} TND`;
            })
            .join('\n');
        
        const message = `Résumé de Commande:\n\n${orderSummary}\n\nTotal: ${total.toFixed(2)} TND\n\nPasser la commande ?`;
        
        if (confirm(message)) {
            // Simulate checkout
            alert('Merci pour votre achat !\n\nLa confirmation de commande a été envoyée à votre email.');
            
            // Clear cart
            localStorage.setItem(CART_KEY, JSON.stringify([]));
            updateCartCount();
            loadCartItems();
        }
    });
}
