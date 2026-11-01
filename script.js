// Replace this with your real WhatsApp business number in international format.
// Example format: 2348012345678 (digits only, no + sign or spaces).
const WHATSAPP_NUMBER = "2348127698469";

const products = [
 {id:1,name:"Elegant Evening Gown",price:45000,category:"women",tag:"Evening edit",image:"https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=85"},
 {id:2,name:"Classic Men's Outfit",price:55000,category:"men",tag:"Modern classic",image:"https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=85"},
 {id:3,name:"Statement Occasion Dress",price:48000,category:"occasion",tag:"Occasion wear",image:"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=85"},
 {id:4,name:"Timeless Traditional Look",price:52000,category:"traditional",tag:"Culture edit",image:"https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=800&q=85"},
 {id:5,name:"Chic Everyday Set",price:32000,category:"women",tag:"Everyday style",image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85"},
 {id:6,name:"Children's Celebration Wear",price:26000,category:"children",tag:"Little moments",image:"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=85"},
 {id:7,name:"Luxury Fashion Handbag",price:28000,category:"accessories",tag:"Finishing touch",image:"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85"},
 {id:8,name:"Tailored Men's Style",price:42000,category:"men",tag:"Smart edit",image:"https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=85"}
];
let cart=[];let activeFilter="all";
const grid=document.getElementById("products-grid");
const money=n=>"₦"+Number(n).toLocaleString("en-NG");

function renderProducts(){
 const term=document.getElementById("search-input").value.trim().toLowerCase();
 const sort=document.getElementById("sort-select").value;
 let list=products.filter(p=>(activeFilter==="all"||p.category===activeFilter)&&(p.name.toLowerCase().includes(term)||p.category.includes(term)));
 if(sort==="low")list.sort((a,b)=>a.price-b.price);
 if(sort==="high")list.sort((a,b)=>b.price-a.price);
 grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-photo"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span><button class="add-button" data-add="${p.id}">＋ ADD TO BAG</button></div><div class="product-info"><h3>${p.name}</h3><div class="product-meta"><span class="product-price">${money(p.price)}</span><span class="product-category">${p.category}</span></div></div></article>`).join("");
 document.getElementById("empty-message").hidden=list.length>0;
}
function addToCart(id){const p=products.find(x=>x.id===id);const found=cart.find(x=>x.id===id);if(found)found.qty++;else cart.push({...p,qty:1});renderCart();openCart();}
function changeQty(id,n){const item=cart.find(x=>x.id===id);if(!item)return;item.qty+=n;if(item.qty<=0)cart=cart.filter(x=>x.id!==id);renderCart();}
function renderCart(){
 document.getElementById("cart-count").textContent=cart.reduce((s,x)=>s+x.qty,0);
 document.getElementById("cart-total").textContent=money(cart.reduce((s,x)=>s+x.price*x.qty,0));
 const area=document.getElementById("cart-items");
 if(!cart.length){area.innerHTML='<p class="cart-empty">Your bag is waiting for something beautiful.</p>';return;}
 area.innerHTML=cart.map(x=>`<div class="cart-item"><img src="${x.image}" alt="${x.name}"><div><h3>${x.name}</h3><span class="item-price">${money(x.price)}</span><div class="quantity-control"><button data-qty="${x.id}" data-change="-1">−</button><span>${x.qty}</span><button data-qty="${x.id}" data-change="1">+</button></div></div><button class="remove-item" data-remove="${x.id}">Remove</button></div>`).join("");
}
function openCart(){document.getElementById("cart-panel").classList.add("open");document.getElementById("cart-overlay").classList.add("open");document.getElementById("cart-panel").setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
function closeCart(){document.getElementById("cart-panel").classList.remove("open");document.getElementById("cart-overlay").classList.remove("open");document.getElementById("cart-panel").setAttribute("aria-hidden","true");document.body.style.overflow="";}
function checkout(){
 if(!cart.length){alert("Your shopping bag is empty. Add a product first.");return;}
 if(WHATSAPP_NUMBER==="+2348127698469"){alert("Add your real WhatsApp number in script.js before receiving orders.");return;}
 const lines=cart.map(x=>`${x.name} x${x.qty} — ${money(x.price*x.qty)}`).join("\n");
 const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
 const message=`Hello Dammy Law Glamour Venture! I would like to place an order:\n\n${lines}\n\nTotal: ${money(total)}\n\nPlease let me know the next steps.`;
 window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank");
}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add));});
document.getElementById("cart-items").addEventListener("click",e=>{const q=e.target.closest("[data-qty]");const r=e.target.closest("[data-remove]");if(q)changeQty(Number(q.dataset.qty),Number(q.dataset.change));if(r){cart=cart.filter(x=>x.id!==Number(r.dataset.remove));renderCart();}});
document.getElementById("cart-toggle").addEventListener("click",openCart);
document.getElementById("cart-close").addEventListener("click",closeCart);
document.getElementById("cart-overlay").addEventListener("click",closeCart);
document.getElementById("checkout-button").addEventListener("click",checkout);
document.getElementById("search-input").addEventListener("input",renderProducts);
document.getElementById("sort-select").addEventListener("change",renderProducts);
document.getElementById("filter-row").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("active",x===b));renderProducts();});
document.querySelectorAll(".department-card").forEach(card=>card.addEventListener("click",()=>{activeFilter=card.dataset.filter;document.querySelectorAll(".filter-chip").forEach(x=>x.classList.toggle("active",x.dataset.filter===activeFilter));renderProducts();}));
const menu=document.getElementById("main-nav"),toggle=document.getElementById("menu-toggle");
toggle.addEventListener("click",()=>menu.classList.toggle("open"));
menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));
document.getElementById("contact-whatsapp").href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Dammy Law Glamour Venture, I would like to make an enquiry.")}`;
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();


// ==================================
// CUSTOM CUSTOMER ORDER SYSTEM
// ==================================

const customImages = document.getElementById("customImages");
const customPreview = document.getElementById("customImagePreview");
const customImageCount = document.getElementById("customImageCount");

let customSelectedImages = [];

if (customImages) {

  customImages.addEventListener("change", function() {

    const newFiles = Array.from(this.files);
    const combined = [...customSelectedImages, ...newFiles];

    if (combined.length > 5) {
      alert("You can upload a maximum of 5 pictures.");
      this.value = "";
      return;
    }

    if (combined.some(file => !file.type.startsWith("image/"))) {
      alert("Please select image files only.");
      this.value = "";
      return;
    }

    if (combined.some(file => file.size > 5 * 1024 * 1024)) {
      alert("Each image must be 5MB or smaller.");
      this.value = "";
      return;
    }

    customSelectedImages = combined;
    renderCustomImages();
    this.value = "";

  });

}

function renderCustomImages() {

  if (!customPreview) return;

  customPreview.innerHTML = "";

  customSelectedImages.forEach((file, index) => {

    const reader = new FileReader();

    reader.onload = function(e) {

      const item = document.createElement("div");
      item.className = "custom-preview-item";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = "Customer design inspiration";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "custom-remove-image";
      remove.textContent = "Remove";

      remove.addEventListener("click", function() {
        customSelectedImages.splice(index, 1);
        renderCustomImages();
      });

      item.appendChild(img);
      item.appendChild(remove);
      customPreview.appendChild(item);

    };

    reader.readAsDataURL(file);

  });

  if (customImageCount) {
    customImageCount.textContent =
      customSelectedImages.length + " picture(s) selected.";
  }

}
 
const customOrderForm = document.getElementById("customOrderForm");

if (customOrderForm) {

  customOrderForm.addEventListener("submit", function(e) {

    e.preventDefault();

    const product = document.getElementById("customProduct").value.trim();
    const phone = document.getElementById("customPhone").value.trim();
    const budget = document.getElementById("customBudget").value;
    const description = document.getElementById("customDescription").value.trim();

    if (!product || !phone || !budget || !description) {
      alert("Please complete all required fields.");
      return;
    }
   
const customImages = document.getElementById("customImages");
const customImagePreview = document.getElementById("customImagePreview");
const customImageCount = document.getElementById("customImageCount");

let customSelectedImages = [];

if (customImages) {
  customImages.addEventListener("change", function() {

    const files = Array.from(this.files);

    if (files.length > 5) {
      alert("You can only upload up to 5 pictures.");
      this.value = "";
      customSelectedImages = [];
      customImagePreview.innerHTML = "";
      customImageCount.textContent = "No pictures selected.";
      return;
    }

    const oversized = files.some(file => file.size > 5 * 1024 * 1024);

    if (oversized) {
      alert("Each picture must be 5MB or less.");
      this.value = "";
      customSelectedImages = [];
      customImagePreview.innerHTML = "";
      customImageCount.textContent = "No pictures selected.";
      return;
    }

    customSelectedImages = files;

    customImagePreview.innerHTML = "";

    files.forEach(file => {
      const image = document.createElement("img");
      const imageURL = URL.createObjectURL(file);

      image.src = imageURL;
      image.style.width = "90px";
      image.style.height = "90px";
      image.style.objectFit = "cover";
      image.style.margin = "5px";
      image.style.borderRadius = "8px";

      customImagePreview.appendChild(image);
    });

    customImageCount.textContent =
      files.length + " picture(s) selected.";

  });
     }
            
   const message =
`HELLO DAMMY LAW GLAMOUR VENTURE!

I WANT TO PLACE A CUSTOM FASHION ORDER.

Product: ${product}

Customer Phone: ${phone}

My Budget: ₦${Number(budget).toLocaleString("en-NG")}

Design Description:
${description}

Design Pictures Selected: ${customSelectedImages.length}

I will attach my design inspiration pictures in this WhatsApp chat.

Thank you!`;

    const CUSTOM_WHATSAPP_NUMBER = "2348127698469";

const whatsappURL =
    "https://wa.me/" +
    CUSTOM_WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

window.location.href = whatsappURL;
