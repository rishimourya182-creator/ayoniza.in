let cart = [];

// Elements
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

// Open / Close Cart
function openCart() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
}

function closeCart() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
}

if (openCartBtn) openCartBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Update Cart UI & Payment Links
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
      itemElement.style.cssText = 'display: flex; gap: 10px; margin-bottom: 15px; align-items: center;';
      itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
        <div style="flex: 1;">
          <h4 style="font-size: 12px; margin: 0;">${item.name}</h4>
          <p style="font-size: 11px; color: var(--gray); margin: 2px 0;">₹${item.price} x ${item.quantity}</p>
        </div>
        <button onclick="removeItem(${index})" style="background: none; border: none; color: red; cursor: pointer; font-size: 14px;">×</button>
      `;
      cartItemsContainer.appendChild(itemElement);
    });
  }

  cartTotalElement.innerText = `₹${total}`;
  cartCountElement.innerText = itemCount;

  // FIX: Clean UPI Link (Resolves "This request type is not supported" error)
  const upiID = "9589790094-2@ybl";
  const payeeName = "AYONIZA";
  
  if (total > 0) {
    const upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(payeeName)}&am=${total}&cu=INR`;
    upiPayBtn.setAttribute('href', upiUrl);
  } else {
    upiPayBtn.setAttribute('href', '#');
  }
}

// Remove Item
window.removeItem = function(index) {
  cart.splice(index, 1);
  updateCartUI();
};

// Add to Cart Buttons
document.querySelectorAll('.add-cart-btn').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));
    const image = button.getAttribute('data-image');

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, image, quantity: 1 });
    }

    updateCartUI();
    openCart();
  });
});

// Buy Now Buttons
document.querySelectorAll('.buy-now-btn').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));
    const image = button.getAttribute('data-image');

    cart = [{ id, name, price, image, quantity: 1 }];
    updateCartUI();
    openCart();
  });
});

// Place Order via WhatsApp
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
