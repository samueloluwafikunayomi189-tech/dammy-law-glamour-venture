// Replace this with your real WhatsApp business number in international format.
import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  "https://eumwjtfcodcocextnedx.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_OT1em8jqN_65QYjZbnhV0g_zSJOnZyE";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Keep your WhatsApp number in international format.
const WHATSAPP_NUMBER = "2348127698469";

// Existing products remain as a fallback if Supabase
// cannot be reached.
const fallbackProducts = [
  {id:1,name:"Elegant Evening Gown",price:45000,category:"women",tag:"Evening edit",image:"https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85"},
  {id:2,name:"Classic Men's Outfit",price:55000,category:"men",tag:"Modern classic",image:"https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=85"},
  {id:3,name:"Statement Occasion Dress",price:48000,category:"occasion",tag:"Occasion wear",image:"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=85"},
  {id:4,name:"Timeless Traditional Look",price:52000,category:"traditional",tag:"Culture edit",image:"https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=85"},
  {id:5,name:"Chic Everyday Set",price:32000,category:"women",tag:"Everyday style",image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85"},
  {id:6,name:"Children's Celebration Wear",price:26000,category:"children",tag:"Little moments",image:"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85"},
  {id:7,name:"Luxury Fashion Handbag",price:28000,category:"accessories",tag:"Finishing touch",image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85"},
  {id:8,name:"Tailored Men's Style",price:42000,category:"men",tag:"Smart edit",image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=85"}
];

let products = [...fallbackProducts];
let cart = [];
let activeFilter = "all";

const grid = document.getElementById("products-grid");
const money = n => "₦" + Number(n).toLocaleString("en-NG");

// ===================================
// LOAD PUBLISHED PRODUCTS FROM SUPABASE
// ===================================

async function loadPublishedProducts() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, category, image_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = data.map(product => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      category: String(product.category || "other").toLowerCase(),
      tag: product.category || "New arrival",
      image: product.image_url || "",
      description: product.description || ""
    }));

    renderProducts();

    console.log("Published Dammy Law products loaded:", products);

  } catch (error) {
    console.error("Could not load Supabase products:", error);

    // Keep the existing products working if the database
    // connection temporarily fails.
    products = [...fallbackProducts];
    renderProducts();
  }
}

// ===================================
// DISPLAY PRODUCTS
// ===================================

function renderProducts() {
  const term = document.getElementById("search-input")
    .value.trim().toLowerCase();

  const sort = document.getElementById("sort-select").value;

  let list = products.filter(p =>
    (activeFilter === "all" || p.category === activeFilter) &&
    (
      p.name.toLowerCase().includes(term) ||
      p.category.includes(term)
    )
  );

  if (sort === "low") {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === "high") {
    list.sort((a, b) => b.price - a.price);
  }

  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-photo">
        <img
          src="${p.image}"
          alt="${p.name}"
          loading="lazy"
        >
        <span class="product-tag">${p.tag}</span>
        <button class="add-button" data-add="${p.id}">
          ＋ ADD TO BAG
        </button>
      </div>

      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-meta">
          <span class="product-price">${money(p.price)}</span>
          <span class="product-category">${p.category}</span>
        </div>
      </div>
    </article>
  `).join("");

  document.getElementById("empty-message").hidden =
    list.length > 0;
}

// ===================================
// SHOPPING CART
// ===================================

function addToCart(id) {
  const p = products.find(x => String(x.id) === String(id));

  if (!p) return;

  const found = cart.find(x => String(x.id) === String(id));

  if (found) {
    found.qty++;
  } else {
    cart.push({...p, qty:1});
  }

  renderCart();
  openCart();
}

function changeQty(id, n) {
  const item = cart.find(x => String(x.id) === String(id));

  if (!item) return;

  item.qty += n;

  if (item.qty <= 0) {
    cart = cart.filter(x => String(x.id) !== String(id));
  }

  renderCart();
}

function renderCart() {
  document.getElementById("cart-count").textContent =
    cart.reduce((s, x) => s + x.qty, 0);

  document.getElementById("cart-total").textContent =
    money(cart.reduce((s, x) => s + x.price * x.qty, 0));

  const area = document.getElementById("cart-items");

  if (!cart.length) {
    area.innerHTML =
      '<p class="cart-empty">Your bag is waiting for something beautiful.</p>';
    return;
  }

  area.innerHTML = cart.map(x => `
    <div class="cart-item">
      <img src="${x.image}" alt="${x.name}">

      <div>
        <h3>${x.name}</h3>
        <span class="item-price">${money(x.price)}</span>

        <div class="quantity-control">
          <button data-qty="${x.id}" data-change="-1">−</button>
          <span>${x.qty}</span>
          <button data-qty="${x.id}" data-change="1">+</button>
        </div>
      </div>

      <button class="remove-item" data-remove="${x.id}">
        Remove
      </button>
    </div>
  `).join("");
}

// ===================================
// CART OPEN AND CLOSE
// ===================================

function openCart() {
  document.getElementById("cart-panel").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");

  document.getElementById("cart-panel")
    .setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cart-panel").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");

  document.getElementById("cart-panel")
    .setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
}

// ===================================
// WHATSAPP CHECKOUT
// ===================================

function checkout() {
  if (!cart.length) {
    alert("Your shopping bag is empty. Add a product first.");
    return;
  }

  const lines = cart.map(x =>
    `${x.name} x${x.qty} — ${money(x.price * x.qty)}`
  ).join("\n");

  const total = cart.reduce(
    (s, x) => s + x.price * x.qty, 0
  );

  const message =
    `Hello Dammy Law Glamour Venture! I would like to place an order:\n\n${lines}\n\nTotal: ${money(total)}\n\nPlease let me know the next steps.`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

// ===================================
// EVENT LISTENERS
// ===================================

grid.addEventListener("click", e => {
  const b = e.target.closest("[data-add]");

  if (b) addToCart(b.dataset.add);
});

document.getElementById("cart-items")
  .addEventListener("click", e => {
    const q = e.target.closest("[data-qty]");
    const r = e.target.closest("[data-remove]");

    if (q) {
      changeQty(q.dataset.qty, Number(q.dataset.change));
    }

    if (r) {
      cart = cart.filter(
        x => String(x.id) !== String(r.dataset.remove)
      );

      renderCart();
    }
  });

document.getElementById("cart-toggle")
  .addEventListener("click", openCart);

document.getElementById("cart-close")
  .addEventListener("click", closeCart);

document.getElementById("cart-overlay")
  .addEventListener("click", closeCart);

document.getElementById("checkout-button")
  .addEventListener("click", checkout);

document.getElementById("search-input")
  .addEventListener("input", renderProducts);

document.getElementById("sort-select")
  .addEventListener("change", renderProducts);

document.getElementById("filter-row")
  .addEventListener("click", e => {
    const b = e.target.closest("[data-filter]");

    if (!b) return;

    activeFilter = b.dataset.filter;

    document.querySelectorAll(".filter-chip")
      .forEach(x => {
        x.classList.toggle("active", x === b);
      });

    renderProducts();
  });

document.querySelectorAll(".department-card")
  .forEach(card => {
    card.addEventListener("click", () => {
      activeFilter = card.dataset.filter;

      document.querySelectorAll(".filter-chip")
        .forEach(x => {
          x.classList.toggle(
            "active",
            x.dataset.filter === activeFilter
          );
        });

      renderProducts();
    });
  });

// Mobile navigation
const menu = document.getElementById("main-nav");
const toggle = document.getElementById("menu-toggle");

toggle.addEventListener("click", () => {
  menu.classList.toggle("open");
});

menu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    menu.classList.remove("open");
  });
});

// WhatsApp contact button
document.getElementById("contact-whatsapp").href =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Dammy Law Glamour Venture, I would like to make an enquiry."
  )}`;

document.getElementById("year").textContent =
  new Date().getFullYear();

// ===================================
// START WEBSITE
// ===================================

// Show the existing products immediately while
// Supabase products are being loaded.
renderProducts();
renderCart();

loadPublishedProducts();
                          
