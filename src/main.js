import "./style.css";

// State management
let products = [];
let cart = [];
const TAX_RATE = 0.08875;

// DOM Elements
const productsGrid = document.getElementById("products-grid");
const cartCountHeader = document.getElementById("cart-count-header");
const cartCountParagraph = document.getElementById("cart-count-paragraph");
const cartModal = document.getElementById("cart-modal");
const cartModalBody = document.querySelector(".cart-modal-body");
const cartTotal = document.getElementById("cart-total");
const loadingContainer = document.getElementById("loading-container");
const mainContent = document.getElementById("main-content");
const closeModalBtn = document.querySelector(".close");
const cartIcon = document.querySelector(".cart-icon");
const paymentForm = document.getElementById("payment-form");

// SEO and Analytics helper functions
function updatePageTitle(productCount = 0) {
    const baseTitle =
        "Premium Products Store | Best Quality Items at Great Prices";
    document.title =
        productCount > 0
            ? `${productCount} Premium Products Available | Premium Products Store`
            : baseTitle;
}

function updateMetaDescription(productCount = 0) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && productCount > 0) {
        metaDesc.content = `Shop from our collection of ${productCount} high-quality products including electronics, clothing, jewelry, and home goods. Fast shipping and secure checkout.`;
    }
}

function updateOpenGraphMeta(product) {
    if (!product) return;

    const setMeta = (selector, content) => {
        const el = document.querySelector(selector);
        if (el) el.content = content;
    };

    setMeta(
        'meta[property="og:title"]',
        `${product.title} | Premium Products Store`,
    );
    setMeta(
        'meta[property="og:description"]',
        truncateText(product.description, 160),
    );
    setMeta('meta[property="og:type"]', "product");
    setMeta(
        'meta[property="og:image"]',
        "https://fake-store-products.vercel.app/api/og",
    );
    setMeta(
        'meta[property="og:url"]',
        `https://fake-store-products.vercel.app/product/${product.id}`,
    );
    setMeta('meta[name="description"]', truncateText(product.description, 155));
    document.title = `${product.title} | Premium Products Store`;
}

function resetOpenGraphMeta() {
    const setMeta = (selector, content) => {
        const el = document.querySelector(selector);
        if (el) el.content = content;
    };

    setMeta(
        'meta[property="og:title"]',
        "Premium Products Store | Best Quality Items at Great Prices",
    );
    setMeta(
        'meta[property="og:description"]',
        "Discover our curated collection of high-quality products including electronics, clothing, jewelry, and home goods.",
    );
    setMeta('meta[property="og:type"]', "website");
    setMeta(
        'meta[property="og:url"]',
        "https://fake-store-products.vercel.app/",
    );
    setMeta(
        'meta[property="og:image"]',
        "https://fake-store-products.vercel.app/icons/og-image.png",
    );
    updatePageTitle(products.length);
    updateMetaDescription(products.length);
}

function generateProductStructuredData() {
    if (products.length === 0) return;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Product Catalog",
        description: "Browse our complete collection of premium products",
        numberOfItems: products.length,
        itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
                "@type": "Product",
                "@id": `https://fake-store-products.vercel.app/product/${product.id}`,
                name: product.title,
                description: product.description,
                image: product.image,
                sku: `PROD-${String(product.id).padStart(4, "0")}`,
                category: product.category,
                brand: {
                    "@type": "Brand",
                    name: "Premium Products Store",
                },
                offers: {
                    "@type": "Offer",
                    price: product.price,
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    url: `https://fake-store-products.vercel.app/product/${product.id}`,
                    itemCondition: "https://schema.org/NewCondition",
                    seller: {
                        "@type": "Organization",
                        name: "Premium Products Store",
                    },
                },
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: product.rating?.rate || 4.5,
                    reviewCount: product.rating?.count || 100,
                    bestRating: 5,
                    worstRating: 1,
                },
            },
        })),
    };

    const existingScript = document.getElementById("products-structured-data");
    if (existingScript) {
        existingScript.remove();
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "products-structured-data";
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

async function fetchProducts() {
    try {
        const response = await fetch("https://fakestoreapi.com/products");
        products = await response.json();

        // Update SEO elements
        updatePageTitle(products.length);
        updateMetaDescription(products.length);
        generateProductStructuredData();

        renderProducts();
        hideLoading();
    } catch (error) {
        console.error("Error fetching products:", error);
        // Update page for error state
        updatePageTitle(0);
        hideLoading();
        showErrorMessage();
    }
}

function showErrorMessage() {
    productsGrid.innerHTML = `
    <div class="error-message" role="alert">
      <h2>Unable to load products</h2>
      <p>Please check your internet connection and try again.</p>
      <button onclick="location.reload()" class="retry-button">Retry</button>
    </div>
  `;
}

function getProductQuantity(productId) {
    const cartItem = cart.find((item) => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function truncateText(text, maxLength = 100) {
    return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
}

function renderProducts() {
    productsGrid.innerHTML = products
        .map((product) => {
            const slug = generateSlug(product.title);
            const rating = product.rating?.rate || 0;
            const reviewCount = product.rating?.count || 0;

            return `
        <article class="product-card" id="product-card-${
            product.id
        }" itemscope itemtype="https://schema.org/Product">
            <div class="product-image-container">
                <img
                    src="${product.image}"
                    alt="${product.title}"
                    itemprop="image"
                    loading="lazy"
                    width="200"
                    height="200"
                    onerror="this.onerror=null; this.src='/icons/placeholder-product.png';"
                >
            </div>

            <div class="product-info">
                <h3 itemprop="name">
                    <a href="/product/${product.id}/${slug}"
                       aria-label="View details for ${product.title}"
                       onclick="event.preventDefault(); viewProduct(${
                           product.id
                       })">
                        ${product.title}
                    </a>
                </h3>

                <div class="product-rating" aria-label="Rating: ${rating} out of 5 stars">
                    <span class="stars" aria-hidden="true">${generateStars(
                        rating,
                    )}</span>
                    <span class="rating-text">
                        <span itemprop="ratingValue">${rating}</span>/5
                        (<span itemprop="reviewCount">${reviewCount}</span> reviews)
                    </span>
                </div>

                <p class="price" itemprop="price" content="${product.price}">
                    <span class="currency">$</span>${product.price.toFixed(2)}
                </p>

                <p class="description" itemprop="description">
                    ${truncateText(product.description)}
                </p>

                <meta itemprop="category" content="${product.category}">
                <meta itemprop="availability" content="https://schema.org/InStock">
            </div>

            <div class="product-buttons" role="group" aria-label="Product quantity controls">
                <button
                    onclick="removeFromCart(${product.id})"
                    class="remove-from-cart"
                    aria-label="Remove one ${product.title} from cart"
                    ${getProductQuantity(product.id) === 0 ? "disabled" : ""}
                >
                    <i class="fa-solid fa-minus" aria-hidden="true"></i>
                </button>

                <span
                    class="item-quantity"
                    id="quantity-${product.id}"
                    aria-label="Quantity in cart"
                    role="status"
                    aria-live="polite"
                >
                    ${getProductQuantity(product.id)}
                </span>

                <button
                    onclick="addToCart(${product.id})"
                    class="add-to-cart"
                    aria-label="Add one ${product.title} to cart"
                >
                    <i class="fa-solid fa-plus" aria-hidden="true"></i>
                </button>
            </div>
        </article>
    `;
        })
        .join("");

    productsGrid.setAttribute(
        "aria-label",
        `Product catalog with ${products.length} items`,
    );
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        "★".repeat(fullStars) +
        (hasHalfStar ? "½" : "") +
        "☆".repeat(emptyStars)
    );
}

function viewProduct(productId) {
    const product = products.find((p) => p.id === productId);
    if (product) {
        updateOpenGraphMeta(product);
        console.log("Viewing product:", product.title);
        addToCart(productId);
    }
}

function addToCart(productId) {
    const product = products.find((p) => p.id === productId);
    const existingItem = cart.find((item) => item.id === productId);

    if (product) {
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartUI();
        announceToScreenReader(
            `Added ${product.title} to cart. Quantity: ${getProductQuantity(productId)}`,
        );
    }
}

function removeFromCart(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);

    if (itemIndex > -1) {
        const product = cart[itemIndex];
        product.quantity--;

        if (product.quantity <= 0) {
            cart.splice(itemIndex, 1);
        }

        updateCartUI();
        announceToScreenReader(
            `Removed one ${product.title} from cart. Quantity: ${getProductQuantity(productId)}`,
        );
    }
}

function announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.className = "visually-hidden";
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function updateProductQuantity(productId) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    const removeButton = document.querySelector(
        `#product-card-${productId} .remove-from-cart`,
    );
    const quantity = getProductQuantity(productId);

    if (quantityElement) {
        quantityElement.textContent = quantity;
    }
    if (removeButton) {
        removeButton.disabled = quantity === 0;
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cartCountHeader.textContent = totalItems;
    cartCountParagraph.textContent = totalItems;

    products.forEach((product) => {
        updateProductQuantity(product.id);
    });

    if (cartModal.classList.contains("active")) {
        updateCartModal();
    }
}

function updateCartModal() {
    if (cart.length === 0) {
        cartModalBody.innerHTML = `
      <div class="empty-cart">
        <p>Your cart is empty</p>
        <p>Browse our products and add items to your cart.</p>
      </div>
    `;
        cartTotal.textContent = "0.00";
        return;
    }

    cartModalBody.innerHTML = cart
        .map(
            (item) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.title}" width="80" height="80" loading="lazy">
        <div class="cart-item-details">
          <div class="item-info">
            <h4>${item.title}</h4>
            <p>$${item.price.toFixed(2)} each</p>
          </div>
          <div class="quantity-and-remove">
            <span>Qty: ${item.quantity}</span>
            <button
              class="remove-item-btn"
              onclick="removeItemCompletely(${item.id})"
              aria-label="Remove all ${item.title} from cart"
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    `,
        )
        .join("");

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    cartModalBody.innerHTML += `
    <div class="cart-summary">
      <div class="summary-line">
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-line">
        <span>Tax (8.875%)</span>
        <span>$${tax.toFixed(2)}</span>
      </div>
      <div class="summary-line total">
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>
  `;

    cartTotal.textContent = total.toFixed(2);

    const checkoutButton = document.getElementById("checkout-button");
    if (checkoutButton) {
        checkoutButton.disabled = cart.length === 0;
    }
}

function removeItemCompletely(productId) {
    const itemIndex = cart.findIndex((item) => item.id === productId);
    if (itemIndex > -1) {
        const product = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateCartUI();
        announceToScreenReader(`Removed all ${product.title} from cart`);
    }
}
window.removeItemCompletely = removeItemCompletely;

function hideLoading() {
    loadingContainer.classList.add("hidden");
    const mainElement = document.querySelector(".main-content");
    if (mainElement) {
        mainElement.classList.add("visible");
    }
}

function openModal() {
    cartModal.classList.add("active");
    cartModal.setAttribute("aria-hidden", "false");
    updateCartModal();

    const closeButton = cartModal.querySelector(".close");
    if (closeButton) {
        closeButton.focus();
    }

    setupFocusTrap();
}

function closeModal() {
    cartModal.classList.remove("active");
    cartModal.setAttribute("aria-hidden", "true");

    resetOpenGraphMeta();

    removeFocusTrap();

    cartIcon.focus();
}

let focusableElements = [];
let firstFocusableElement = null;
let lastFocusableElement = null;

function setupFocusTrap() {
    focusableElements = cartModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements.length > 0) {
        firstFocusableElement = focusableElements[0];
        lastFocusableElement = focusableElements[focusableElements.length - 1];
    }
    document.addEventListener("keydown", handleFocusTrap);
}

function handleFocusTrap(e) {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
        }
    } else {
        if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
        }
    }
}

function removeFocusTrap() {
    document.removeEventListener("keydown", handleFocusTrap);
}

function validateForm() {
    const form = paymentForm;
    const inputs = form.querySelectorAll("input[required]");
    let isValid = true;

    inputs.forEach((input) => {
        const errorElement = document.getElementById(input.id + "-error");

        if (!input.value.trim()) {
            showError(input, errorElement, "This field is required");
            isValid = false;
        } else if (
            input.id === "card-number" &&
            !validateCardNumber(input.value)
        ) {
            showError(input, errorElement, "Please enter a valid card number");
            isValid = false;
        } else if (
            input.id === "expiry-date" &&
            !validateExpiryDate(input.value)
        ) {
            showError(input, errorElement, "Please enter a valid date (MM/YY)");
            isValid = false;
        } else if (input.id === "cvv" && !validateCVV(input.value)) {
            showError(input, errorElement, "Please enter a valid CVV");
            isValid = false;
        } else {
            clearError(input, errorElement);
        }
    });

    return isValid;
}

function showError(input, errorElement, message) {
    input.classList.add("error");
    input.setAttribute("aria-invalid", "true");
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(input, errorElement) {
    input.classList.remove("error");
    input.removeAttribute("aria-invalid");
    if (errorElement) {
        errorElement.textContent = "";
    }
}

function validateCardNumber(value) {
    const cleaned = value.replace(/\s/g, "");
    return /^\d{13,19}$/.test(cleaned);
}

function validateExpiryDate(value) {
    return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
}

function validateCVV(value) {
    return /^\d{3,4}$/.test(value);
}

function generateOrderStructuredData() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const total = subtotal * (1 + TAX_RATE);

    const orderData = {
        "@context": "https://schema.org",
        "@type": "Order",
        orderNumber: `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        orderStatus: "https://schema.org/OrderProcessing",
        customer: {
            "@type": "Person",
            name: document.getElementById("card-name")?.value || "Customer",
        },
        acceptedOffer: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: total.toFixed(2),
        },
        orderedItem: cart.map((item) => ({
            "@type": "OrderItem",
            orderedItem: {
                "@type": "Product",
                name: item.title,
                image: item.image,
                offers: {
                    "@type": "Offer",
                    price: item.price,
                    priceCurrency: "USD",
                },
            },
            orderQuantity: item.quantity,
        })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "order-structured-data";
    script.textContent = JSON.stringify(orderData);
    document.head.appendChild(script);
}

paymentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitButton = document.getElementById("checkout-button");
    const originalText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        generateOrderStructuredData();

        const total =
            cart.reduce((sum, item) => sum + item.price * item.quantity, 0) *
            (1 + TAX_RATE);

        alert(
            `Order placed successfully! Total: $${total.toFixed(2)}. Thank you for shopping with us.`,
        );
        cart = [];
        updateCartUI();
        closeModal();
    } catch (error) {
        console.error("Payment error:", error);
        alert("Payment failed. Please try again.");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

paymentForm?.addEventListener("input", (e) => {
    const input = e.target;
    if (input.tagName !== "INPUT") return;

    const errorElement = document.getElementById(input.id + "-error");

    if (input.value.trim()) {
        clearError(input, errorElement);
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartModal.classList.contains("active")) {
        closeModal();
    }
});

cartIcon?.addEventListener("click", openModal);
closeModalBtn?.addEventListener("click", closeModal);

cartModal?.addEventListener("click", (e) => {
    if (e.target === cartModal) {
        closeModal();
    }
});

function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove("lazy");
                    observer.unobserve(img);
                }
            });
        });

        images.forEach((img) => imageObserver.observe(img));
    }
}

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.viewProduct = viewProduct;

// SEO: Add breadcrumb structured data
function addBreadcrumbStructuredData() {
    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://fake-store-products.vercel.app/",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: "https://fake-store-products.vercel.app/",
            },
        ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-structured-data";
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
    addBreadcrumbStructuredData();
    setupLazyLoading();
});

fetchProducts();
