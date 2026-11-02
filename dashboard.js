
import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

// ===================================
// DAMMY LAW SUPABASE CONNECTION
// ===================================

const SUPABASE_URL = "https://eumwjtfcodcocextnedx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_OT1em8jqN_65QYjZbnhV0g_zSJOnZyE";

// Enter the exact administrator email you registered.
const ADMIN_EMAIL = "adebayokabirha@gmail.com";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ===================================
// PAGE ELEMENTS
// ===================================

const logoutButton = document.getElementById("logoutButton");

const productForm = document.getElementById("productForm");
const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productCategory = document.getElementById("productCategory");
const productImage = document.getElementById("productImage");

const saveProductButton = document.getElementById("saveProductButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const productMessage = document.getElementById("productMessage");
const imageMessage = document.getElementById("imageMessage");

const productsList = document.getElementById("productsList");
const productsLoading = document.getElementById("productsLoading");

const totalProducts = document.getElementById("totalProducts");
const publishedProducts = document.getElementById("publishedProducts");
const unpublishedProducts = document.getElementById("unpublishedProducts");

let currentAdmin = null;

// ===================================
// SECURITY: CHECK ADMIN SESSION
// ===================================

async function checkAdminAccess() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    window.location.replace("admin.html");
    return false;
  }

  const user = data.session.user;

  if (
    !user.email ||
    user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()
  ) {
    await supabase.auth.signOut();
    window.location.replace("admin.html");
    return false;
  }

  currentAdmin = user;
  return true;
}

// ===================================
// HELPER: FORMAT PRICE
// ===================================

function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2
  }).format(Number(price));
}

// ===================================
// HELPER: SAFE HTML TEXT
// ===================================

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function(character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

// ===================================
// LOAD PRODUCTS
// ===================================

async function loadProducts() {
  productsLoading.textContent = "Loading products...";

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    productsLoading.textContent =
      "Could not load products: " + error.message;
    return;
  }

  productsLoading.textContent = "";

  totalProducts.textContent = data.length;

  publishedProducts.textContent =
    data.filter(product => product.is_published).length;

  unpublishedProducts.textContent =
    data.filter(product => !product.is_published).length;

  if (data.length === 0) {
    productsList.innerHTML =
      "<p>No products yet. Add your first product above.</p>";
    return;
  }

  productsList.innerHTML = data.map(product => {
    const status = product.is_published
      ? "Published"
      : "Unpublished";

    const image = product.image_url
      ? `<img src="${escapeHTML(product.image_url)}"
           alt="${escapeHTML(product.name)}">`
      : "";

    return `
      <article class="product-card">

        ${image}

        <div class="product-card-content">

          <h3>${escapeHTML(product.name)}</h3>

          <p>${escapeHTML(product.description || "No description")}</p>

          <p>${escapeHTML(product.category)}</p>

          <p class="product-price">
            ${formatPrice(product.price)}
          </p>

          <p>Status: ${status}</p>

        </div>

        <div class="product-actions">

          <button
            type="button"
            class="edit-button"
            data-action="edit"
            data-id="${escapeHTML(product.id)}">
            EDIT
          </button>

          <button
            type="button"
            class="publish-button"
            data-action="publish"
            data-id="${escapeHTML(product.id)}">
            ${product.is_published ? "UNPUBLISH" : "PUBLISH"}
          </button>

          <button
            type="button"
            class="delete-button"
            data-action="delete"
            data-id="${escapeHTML(product.id)}">
            DELETE
          </button>

        </div>

      </article>
    `;
  }).join("");

  // Save product records for the edit and publish buttons.
  window.dammyProducts = data;
}

// ===================================
// UPLOAD PRODUCT IMAGE
// ===================================

async function uploadProductImage(file) {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG or WEBP image.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Your image must not exceed 5 MB.");
  }

  const extension = file.name.split(".").pop().toLowerCase();

  const fileName =
    Date.now() + "-" +
    Math.random().toString(36).slice(2) +
    "." + extension;

  const filePath = currentAdmin.id + "/" + fileName;

  const { error } = await supabase.storage
    .from("dammy-product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("dammy-product-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ===================================
// ADD OR EDIT PRODUCT
// ===================================

productForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const name = productName.value.trim();
  const description = productDescription.value.trim();
  const price = Number(productPrice.value);
  const category = productCategory.value;
  const imageFile = productImage.files[0];

  if (!name || !category || productPrice.value === "") {
    productMessage.textContent = "Please complete all required fields.";
    return;
  }

  if (!Number.isFinite(price) || price < 0) {
    productMessage.textContent = "Enter a valid product price.";
    return;
  }

  if (!productId.value && !imageFile) {
    productMessage.textContent = "Please choose a product image.";
    return;
  }

  saveProductButton.disabled = true;
  saveProductButton.textContent = "SAVING...";

  productMessage.textContent = "Please wait...";

  try {
    let imageURL = null;

    // Preserve the existing image when editing without a new upload.
    if (productId.value) {
      const existingProduct = window.dammyProducts.find(
        item => String(item.id) === String(productId.value)
      );

      imageURL = existingProduct?.image_url || null;
    }

    // Upload a new image if one was selected.
    if (imageFile) {
      imageURL = await uploadProductImage(imageFile);
    }

    const productData = {
      name,
      description,
      price,
      category,
      image_url: imageURL
    };

    let result;

    if (productId.value) {
      result = await supabase
        .from("products")
        .update(productData)
        .eq("id", productId.value);
    } else {
      result = await supabase
        .from("products")
        .insert([productData]);
    }

    if (result.error) {
      throw result.error;
    }

    productMessage.textContent = productId.value
      ? "Product updated successfully!"
      : "Product added successfully!";

    productMessage.style.color = "#65d68a";

    resetProductForm();
    await loadProducts();

  } catch (error) {
    productMessage.textContent =
      error.message || "Something went wrong.";

    productMessage.style.color = "#ff7070";

  } finally {
    saveProductButton.disabled = false;
    saveProductButton.textContent = "SAVE PRODUCT";
  }
});

// ===================================
// RESET PRODUCT FORM
// ===================================

function resetProductForm() {
  productForm.reset();
  productId.value = "";
  saveProductButton.textContent = "SAVE PRODUCT";
  cancelEditButton.style.display = "none";
  imageMessage.textContent =
    "Choose a product picture from your phone.";
}

// ===================================
// CANCEL EDITING
// ===================================

cancelEditButton.addEventListener("click", function() {
  resetProductForm();
  productMessage.textContent = "";
});

// Hide cancel button until editing starts.
cancelEditButton.style.display = "none";

// ===================================
// PRODUCT ACTIONS
// ===================================

productsList.addEventListener("click", async function(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  const product = window.dammyProducts.find(
    item => String(item.id) === String(id)
  );

  if (!product) return;

  // EDIT PRODUCT
  if (action === "edit") {
    productId.value = product.id;
    productName.value = product.name;
    productDescription.value = product.description || "";
    productPrice.value = product.price;
    productCategory.value = product.category;

    productImage.value = "";

    imageMessage.textContent =
      "Leave the image empty to keep the current picture.";

    saveProductButton.textContent = "UPDATE PRODUCT";
    cancelEditButton.style.display = "block";

    productForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // PUBLISH OR UNPUBLISH
  if (action === "publish") {
    button.disabled = true;

    const { error } = await supabase
      .from("products")
      .update({
        is_published: !product.is_published
      })
      .eq("id", product.id);

    if (error) {
      alert("Could not update publication status: " + error.message);
    } else {
      await loadProducts();
    }
  }

  // DELETE PRODUCT
  if (action === "delete") {
    const confirmed = confirm(
      "Are you sure you want to delete " +
      product.name + "?"
    );

    if (!confirmed) return;

    button.disabled = true;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert("Could not delete product: " + error.message);
      button.disabled = false;
    } else {
      alert("Product deleted successfully.");
      await loadProducts();
    }
  }
});

// ===================================
// ADMIN LOGOUT
// ===================================

logoutButton.addEventListener("click", async function() {
  const confirmed = confirm("Do you want to log out?");

  if (!confirmed) return;

  const { error } = await supabase.auth.signOut();

  if (error) {
    alert("Logout failed: " + error.message);
    return;
  }

  window.location.replace("admin.html");
});

// ===================================
// START DASHBOARD
// ===================================

async function startDashboard() {
  const hasAccess = await checkAdminAccess();

  if (!hasAccess) return;

  await loadProducts();
}

startDashboard();

// Recheck access if the authentication session changes.
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT" || !session) {
    window.location.replace("admin.html");
  }
});
    
