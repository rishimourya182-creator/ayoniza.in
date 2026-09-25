let cart = [];

// DOM Elements
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.getElementById('cartCount');
const upiPayBtn = document.getElementById('upiPayBtn');
const checkoutBtn = document.getElementById('checkoutBtn');

// Open / Close Cart Drawer
function openCart() {
  if(cartDrawer && cartOverlay) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }
}

function closeCart() {
  if(cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
}

if (openCartBtn) openCartBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Update Cart UI & UPI Payment Link
function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  let total = 0;
  let itemCount = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--gray); font-size: 13px; margin: 20px 0;">Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      itemCount += item.quantity;

      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.style.cssText = 'display: flex; gap: 10px; margin-bottom: 12px; align-items: center; border-bottom: 1px dashed #eee; padding-bottom: 8px;';
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 2px;">
        <div style="flex: 1;">
          <h4 style="font-size: 12px; margin: 0; font-weight: 600;">${item.name}</h4>
          <p style="font-size: 11px; color: var(--gray); margin: 2px 0;">₹${item.price} x ${item.quantity}</p>
        </div>
        <button onclick="removeItem(${index})" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 16px; font-weight: bold;">×</button>
      `;
      cartItemsContainer.appendChild(itemElement);
    });
  }

  cartTotalElement.innerText = `₹${total}`;
  cartCountElement.innerText = itemCount;

  // Clean Standard UPI Deep Link (Resolves "This request type is not supported" Error)
  const upiID = "9589790094-2@ybl";
  const payeeName = "AYONIZA";
  
  if (total > 0) {
    const upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR`;
    upiPayBtn.setAttribute('href', upiUrl);
  } else {
    upiPayBtn.setAttribute('href', '#');
  }
}

// Remove Item from Cart
window.removeItem = function(index) {
  cart.splice(index, 1);
  updateCartUI();
};

// Category Filtering
const categoryBtns = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selectedCategory = btn.getAttribute('data-category');

    productCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      if (selectedCategory === 'all' || cardCategory === selectedCategory) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// Event Delegation for ADD TO CART & BUY NOW Buttons
document.addEventListener('click', function(event) {
  const target = event.target;

  // Handle Add To Cart
  if (target.classList.contains('add-cart-btn')) {
    event.preventDefault();
    const id = target.getAttribute('data-id');
    const name = target.getAttribute('data-name');
    const price = parseInt(target.getAttribute('data-price'));
    const image = target.getAttribute('data-image');

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
    }

    updateCartUI();
    openCart();
  }

  // Handle Buy Now
  if (target.classList.contains('buy-now-btn')) {
    event.preventDefault();
    const id = target.getAttribute('data-id');
    const name = target.getAttribute('data-name');
    const price = parseInt(target.getAttribute('data-price'));
    const image = target.getAttribute('data-image');

    cart = [{ id, name, price, image, quantity: 1 }];
    updateCartUI();
    openCart();
  }
});

// Checkout via WhatsApp
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (!name || !phone || !address) {
      alert('Please fill all delivery details (Name, Phone, and Address).');
      return;
    }

    let itemsText = cart.map(item => `- ${item.name} (x${item.quantity}) = ₹${item.price * item.quantity}`).join('\n');
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let message = `*New Order - AYONIZA*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Address: ${address}\n\n` +
      `*Order Details:*\n${itemsText}\n\n` +
      `*Total Amount:* ₹${total}\n\n` +
      `I have completed the payment via UPI. Please confirm my order.`;

    let waUrl = `https://wa.me/919203703177?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  });
}
