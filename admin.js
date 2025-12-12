// ===========================
// Admin Panel Functionality
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    loadAdminProducts();
    setupProductForm();
});

// Load and display products in admin panel
function loadAdminProducts() {
    const adminProductsList = document.getElementById('admin-products-list');
    if (!adminProductsList) return;
    
    const products = getProducts();
    adminProductsList.innerHTML = '';
    
    if (products.length === 0) {
        adminProductsList.innerHTML = '<p>Aucun produit disponible</p>';
        return;
    }
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'admin-product-item';
        const colorsDisplay = product.colors ? `<p><strong>Couleurs:</strong> ${product.colors.join(', ')}</p>` : '';
        productItem.innerHTML = `
            <h4>${product.name}</h4>
            <p><strong>Prix:</strong> ${product.price.toFixed(2)} TND</p>
            <p><strong>Description:</strong> ${product.description}</p>
            ${colorsDisplay}
            <p><strong>ID:</strong> ${product.id}</p>
            <div class="admin-product-actions">
                <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Supprimer</button>
                <button class="btn btn-primary" onclick="editProduct(${product.id})">Modifier</button>
            </div>
        `;
        adminProductsList.appendChild(productItem);
    });
}

// Setup product form submission
function setupProductForm() {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value.trim();
        const image = document.getElementById('product-image').value.trim();
        
        if (!name || !price) {
            alert('Veuillez remplir le nom et le prix du produit');
            return;
        }
        
        const products = getProducts();
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        
        const newProduct = {
            id: newId,
            name: name,
            price: price,
            description: description,
            image: image || `https://via.placeholder.com/250x200?text=${encodeURIComponent(name)}`
        };
        
        products.push(newProduct);
        saveProducts(products);
        
        // Clear form
        form.reset();
        
        // Reload products display
        loadAdminProducts();
        
        alert('Produit ajouté avec succès !');
    });
}

// Delete a product
function deleteProduct(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        const products = getProducts();
        const filtered = products.filter(p => p.id !== productId);
        saveProducts(filtered);
        loadAdminProducts();
        alert('Produit supprimé avec succès !');
    }
}

// Edit a product (enhanced version could be added)
function editProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const newName = prompt('Nom du Produit:', product.name);
    if (newName === null) return;
    
    const newPrice = prompt('Prix du Produit:', product.price);
    if (newPrice === null) return;
    
    if (!newName.trim() || isNaN(newPrice)) {
        alert('Entrée invalide');
        return;
    }
    
    product.name = newName.trim();
    product.price = parseFloat(newPrice);
    
    saveProducts(products);
    loadAdminProducts();
    alert('Produit mis à jour avec succès !');
}

// Clear all products (admin utility)
function clearAllProducts() {
    if (confirm('Are you sure you want to delete ALL products? This cannot be undone.')) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify([]));
        loadAdminProducts();
        alert('All products have been deleted');
    }
}

// Export products as JSON (for backup)
function exportProducts() {
    const products = getProducts();
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products_backup.json';
    link.click();
}
