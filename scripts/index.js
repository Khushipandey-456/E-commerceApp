// Fetch products dynamically
window.onload = async function() {
    const res = await fetch('/api/products');
    const products = await res.json();
  
    const productList = document.getElementById('product-list');
    products.forEach(product => {
      const productDiv = document.createElement('div');
      productDiv.classList.add('product-card');
      productDiv.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p>$${product.price}</p>
        <button onclick="addToCart(${product._id}, '${product.name}', ${product.price})">Add to Cart</button>
      `;
      productList.appendChild(productDiv);
    });
  };
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  function addToCart(productId, name, price) {
    const product = { productId, name, price };
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart');
  }
  
  async function checkout() {
    const totalAmount = cart.reduce((total, item) => total + item.price, 0);
  
    const response = await fetch('/api/orders/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: totalAmount })
    });
    const data = await response.json();
    const clientSecret = data.clientSecret;
  
    const stripe = Stripe('your-public-key');
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: 'Customer' }
      }
    });
  
    if (result.error) {
      alert('Payment failed: ' + result.error.message);
    } else {
      alert('Payment successful');
      const orderResponse = await fetch('/api/orders/order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products: cart })
      });
      const orderData = await orderResponse.json();
      alert('Order placed successfully');
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
  