const API_URL = "https://fakestoreapi.com/products";

const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const submitLogin = document.getElementById("submitLogin");
const usernameInput = document.getElementById("username");
const userStatus = document.getElementById("userStatus");

const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const clearCartBtn = document.getElementById("clearCart");

const newProductName = document.getElementById("newProductName");
const newProductPrice = document.getElementById("newProductPrice");
const addProductBtn = document.getElementById("addProductBtn");
const managementList = document.getElementById("managementList");

let products = [];
let cart = JSON.parse(localStorage.getItem("shopCart")) || [];
let currentUser = localStorage.getItem("shopUser") || "";

// ------------------------------
// Authentication Simulation
// ------------------------------

function updateUserInterface() {
    if (currentUser) {
        userStatus.textContent = `Welcome, ${currentUser}!`;
        loginBtn.hidden = true;
        logoutBtn.hidden = false;
        usernameInput.value = currentUser;
    } else {
        userStatus.textContent = "Please login to continue shopping.";
        loginBtn.hidden = false;
        logoutBtn.hidden = true;
    }
}

submitLogin.addEventListener("click", () => {
    const username = usernameInput.value.trim();

    if (!username) {
        alert("Please enter your name.");
        return;
    }

    currentUser = username;
    localStorage.setItem("shopUser", currentUser);
    updateUserInterface();
});

loginBtn.addEventListener("click", () => {
    usernameInput.focus();
});

logoutBtn.addEventListener("click", () => {
    currentUser = "";
    localStorage.removeItem("shopUser");
    updateUserInterface();
});

// ------------------------------
// API Data
// ------------------------------

async function loadProducts() {
    loading.hidden = false;
    errorMessage.hidden = true;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        products = await response.json();

        loadCategories();
        displayProducts();
        displayManagementProducts();

    } catch (error) {
        errorMessage.textContent =
            "Unable to load products. Please refresh and try again.";
        errorMessage.hidden = false;

    } finally {
        loading.hidden = true;
    }
}

// ------------------------------
// Categories
// ------------------------------

function loadCategories() {
    const categories = [
        ...new Set(products.map(product => product.category))
    ];

    categorySelect.innerHTML =
        '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categorySelect.appendChild(option);
    });
}

// ------------------------------
// Product Display
// ------------------------------

function displayProducts() {
    let filteredProducts = [...products];

    const searchTerm = searchInput.value
        .toLowerCase()
        .trim();

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm)
        );
    }

    if (categorySelect.value !== "all") {
        filteredProducts = filteredProducts.filter(
            product => product.category === categorySelect.value
        );
    }

    if (sortSelect.value === "price-low") {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sortSelect.value === "price-high") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (sortSelect.value === "name") {
        filteredProducts.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    productList.innerHTML = "";

    if (filteredProducts.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement("article");

        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.category}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button onclick="addToCart(${product.id})">
                Add to Cart
            </button>
        `;

        productList.appendChild(card);
    });
}

// ------------------------------
// Search / Filter / Sort
// ------------------------------

searchInput.addEventListener("input", displayProducts);

categorySelect.addEventListener("change", displayProducts);

sortSelect.addEventListener("change", displayProducts);

// ------------------------------
// Cart CRUD
// ------------------------------

function addToCart(productId) {
    cart.push(productId);

    localStorage.setItem(
        "shopCart",
        JSON.stringify(cart)
    );

    updateCart();
}

function updateCart() {
    cartCount.textContent = cart.length;

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach((productId, index) => {
        const product = products.find(
            item => item.id === productId
        );

        if (!product) return;

        const item = document.createElement("div");

        item.className = "cart-item";

        item.innerHTML = `
            <strong>${product.title}</strong>
            - $${product.price.toFixed(2)}
            <button onclick="removeFromCart(${index})">
                Remove
            </button>
        `;

        cartItems.appendChild(item);
    });
}

function removeFromCart(index) {
    cart.splice(index, 1);

    localStorage.setItem(
        "shopCart",
        JSON.stringify(cart)
    );

    updateCart();
}

clearCartBtn.addEventListener("click", () => {
    cart = [];

    localStorage.setItem(
        "shopCart",
        JSON.stringify(cart)
    );

    updateCart();
});

// ------------------------------
// Product CRUD
// ------------------------------

function displayManagementProducts() {
    managementList.innerHTML = "";

    products.forEach(product => {
        const item = document.createElement("div");

        item.className = "management-item";

        item.innerHTML = `
            ${product.title} - $${product.price.toFixed(2)}
            <button onclick="deleteProduct(${product.id})">
                Delete
            </button>
        `;

        managementList.appendChild(item);
    });
}

function deleteProduct(productId) {
    products = products.filter(
        product => product.id !== productId
    );

    displayProducts();
    displayManagementProducts();
}

addProductBtn.addEventListener("click", () => {
    const name = newProductName.value.trim();
    const price = Number(newProductPrice.value);

    if (!name || price <= 0) {
        alert("Enter a valid product name and price.");
        return;
    }

    const newProduct = {
        id: Date.now(),
        title: name,
        price: price,
        category: "Custom Product",
        image: "https://via.placeholder.com/300"
    };

    products.push(newProduct);

    newProductName.value = "";
    newProductPrice.value = "";

    displayProducts();
    displayManagementProducts();
});

// ------------------------------
// Start Application
// ------------------------------

updateUserInterface();
updateCart();
loadProducts();
