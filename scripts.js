document.addEventListener("DOMContentLoaded", () => {
  fetchProducts(); // Tải sản phẩm khi trang được tải
});

// Danh sách sản phẩm
let products = [];

// Giỏ hàng (lấy từ Local Storage, Session Storage hoặc Cookies)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Hàm lưu trữ giỏ hàng vào Local Storage, Session Storage và Cookies
function saveCart() {
  // Lưu vào Local Storage
  localStorage.setItem("cart", JSON.stringify(cart));
  // Lưu vào Session Storage
  sessionStorage.setItem("cart", JSON.stringify(cart));
  // Lưu vào Cookies (7 ngày)
  document.cookie = `cart=${JSON.stringify(cart)};path=/;max-age=${
    60 * 60 * 24 * 7
  }`;
}

// Hàm hiển thị trang chủ
function showHomePage() {
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
        <div class="product-content">
            <div class="product-info">
                <h3>Bán Coffee Ngoại Nhập</h3>
                <p>Khám phá ngay các loại cà phê ngoại nhập, chất lượng cao của chúng tôi. 
                Với thiết kế bao bì tinh tế và đa dạng về hương vị, chúng tôi cam kết mang
                 đến cho bạn những trải nghiệm cà phê tuyệt vời nhất.</p>
                <button>Tìm Hiểu Thêm</button>
            </div>
        </div>
        
        <div class="filter">
            <label for="filterName">Lọc theo tên:</label>
            <input type="text" id="filterName" oninput="filterProducts()">
            
            <label for="filterPrice">Lọc theo giá:</label>
            <input type="number" id="filterPrice" oninput="filterProducts()">
        </div>
        <div id="productList" class="product-list"></div>
    `;
  displayProducts(products);
}

// Hàm hiển thị trang giỏ hàng
function showCartPage() {
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
        <div class="cart">
            <h1>Giỏ hàng</h1>
            <div id="cartItems"></div>
            <div class="cart-total">
                <p>Tổng: <span id="cartTotal"></span> VND</p>
                <button onclick="checkout()">Thanh Toán</button>
            </div>
        </div>
    `;
  displayCart();
}

// Hàm hiển thị danh sách sản phẩm
function displayProducts(products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  products.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.className = "product-item";
    productItem.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Giá: ${product.price.toLocaleString()} VND</p>
            <button onclick="addToCart(${product.id})">Mua Ngay</button>
        `;
    productList.appendChild(productItem);
  });
}

// Hàm lọc sản phẩm
function filterProducts() {
  const filterName = document.getElementById("filterName").value.toLowerCase();
  const filterPrice = document.getElementById("filterPrice").value;
  const filteredProducts = products.filter((product) => {
    return (
      product.title.toLowerCase().includes(filterName) &&
      (!filterPrice || product.price <= filterPrice)
    );
  });
  displayProducts(filteredProducts);
}

// Hàm lấy danh sách sản phẩm từ API
function fetchProducts() {
  fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((data) => {
      // Replace product details with coffee product details
      products = data.map((product, index) => {
        const coffeeImages = ["ca-phe.png", "ca-phe.png", "ca-phe.png"];
        return {
          id: product.id,
          title: `Coffee Ngoại Nhập ${index + 1}`,
          price: product.price,
          image: coffeeImages[index % coffeeImages.length], // Cycle through coffee images
        };
      });
      console.log("Products:", products); // In ra danh sách sản phẩm để kiểm tra
      showHomePage(); // Hiển thị trang chủ sau khi lấy được sản phẩm
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
}

// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(); // Cập nhật giỏ hàng trong bộ nhớ
  updateCartTotal(); // Cập nhật tổng giá trị giỏ hàng
  displayCart(); // Hiển thị lại giỏ hàng
}

// Hàm xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart(); // Cập nhật giỏ hàng trong bộ nhớ
  updateCartTotal(); // Cập nhật tổng giá trị giỏ hàng
  displayCart(); // Hiển thị lại giỏ hàng
}

// Hàm cập nhật số lượng sản phẩm trong giỏ hàng
function updateCart(productId, quantity) {
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) {
    cartItem.quantity = parseInt(quantity);
    if (isNaN(cartItem.quantity) || cartItem.quantity <= 0) {
      removeFromCart(productId); // Nếu số lượng <= 0 thì xóa sản phẩm
    } else {
      saveCart(); // Cập nhật giỏ hàng trong bộ nhớ
      updateCartTotal(); // Cập nhật tổng giá trị giỏ hàng
    }
    displayCart(); // Hiển thị lại giỏ hàng
  }
}

// Hàm hiển thị giỏ hàng
function displayCart() {
  const cartItemsElement = document.getElementById("cartItems");
  cartItemsElement.innerHTML = "";
  if (cart.length === 0) {
    cartItemsElement.innerHTML = "<p>Giỏ hàng của bạn đang trống.</p>";
    document.getElementById("cartTotal").textContent = "0 VND";
    return;
  }
  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
            <p>${item.title}</p>
            <p>Giá: ${item.price.toLocaleString()} VND</p>
            <p>Số lượng: <input type="number" value="${
              item.quantity
            }" min="0" onchange="updateCart(${item.id}, this.value)"></p>
            <button onclick="removeFromCart(${item.id})">Xóa</button>
        `;
    cartItemsElement.appendChild(cartItem);
  });
  updateCartTotal(); // Cập nhật tổng giá trị giỏ hàng sau khi hiển thị các mục
}

// Hàm cập nhật tổng giá trị giỏ hàng
function updateCartTotal() {
  let total = 0;
  cart.forEach((item) => {
    total += item.price * item.quantity;
  });
  document.getElementById("cartTotal").textContent =
    total.toLocaleString() + " VND";
}

// Hàm xử lý thanh toán
function checkout() {
  const mainContent = document.getElementById("mainContent");
  mainContent.innerHTML = `
        <div class="checkout">
            <h1>Thanh Toán</h1>
            <form id="checkoutForm">
                <label for="name">Họ và Tên:</label>
                <input type="text" id="name" required>
                
                <label for="email">Email:</label>
                <input type="email" id="email" required>
                
                <label for="address">Địa chỉ:</label>
                <input type="text" id="address" required>
                
                <label for="phone">Số điện thoại:</label>
                <input type="tel" id="phone" required>
                
                <button type="submit">Xác Nhận Thanh Toán</button>
            </form>
        </div>
    `;

  const checkoutForm = document.getElementById("checkoutForm");
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    processPayment();
  });
}

// Hàm xử lý đơn giản việc thanh toán
function processPayment() {
  alert("Thanh toán thành công! Cảm ơn bạn đã mua sắm.");
  cart = []; // Xóa giỏ hàng sau khi thanh toán thành công
  saveCart(); // Cập nhật giỏ hàng trong bộ nhớ
  showHomePage(); // Quay lại trang chủ
}

// Điều khiển menu hamburger
const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");

hamburger.addEventListener("click", () => {
  menu.classList.toggle("active");
});
