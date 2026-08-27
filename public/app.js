(function () {
  const state = window.__INITIAL_STATE__ || {};
  const storageKey = "bravahub-cart";

  function formatMoney(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function assetByImage(imageName) {
    const assets = {
      smarttv43: { src: "/public/images/smarttv43.webp", width: 1448, height: 1086, variant: "wide" },
      airfryer: { src: "/public/images/air-fryei.webp", width: 1448, height: 1086, variant: "standard" },
      vacuum: { src: "/public/images/aspirador.webp", width: 1448, height: 1086, variant: "standard" },
      fridge: { src: "/public/images/geladeira.webp", width: 1448, height: 1086, variant: "standard" },
      wardrobe: { src: "/public/images/gardaroupa.webp", width: 1448, height: 1086, variant: "standard" },
      console: { src: "/public/images/console.webp", width: 1448, height: 1086, variant: "standard" },
      orangephone: { src: "/public/images/iphone17.webp", width: 1374, height: 1145, variant: "standard" },
      moto: { src: "/public/images/motog47.webp", width: 1448, height: 1086, variant: "standard" },
      laptop: { src: "/public/images/notebook.webp", width: 1374, height: 1145, variant: "standard" },
      sofa: { src: "/public/images/sofa.webp", width: 1374, height: 1145, variant: "standard" },
      bed: { src: "/public/images/cama.webp", width: 1374, height: 1145, variant: "standard" },
      blender: { src: "/public/images/liquidificador.webp", width: 1374, height: 1145, variant: "standard" }
    };
    return assets[imageName] || null;
  }

  function renderProductMedia(imageName, alt, className) {
    const asset = assetByImage(imageName);
    if (!asset) return "";
    return `
      <img
        class="product-media product-media-${asset.variant}${className ? ` ${className}` : ""}"
        src="${asset.src}"
        alt="${escapeHtml(alt)}"
        width="${asset.width}"
        height="${asset.height}"
        loading="eager"
        decoding="async"
      />
    `;
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      return [];
    }
  }

  function setCart(cart) {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) {
      badge.textContent = count;
    }
  }

  function addToCart(productId, quantity) {
    const cart = getCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    setCart(cart);
  }

  function productById(productId) {
    return (state.products || []).find((product) => product.id === productId);
  }

  function renderCart() {
    const container = document.getElementById("cart-items");
    if (!container) return;
    const cart = getCart();
    if (!cart.length) {
      container.innerHTML = '<div class="empty-card">Seu carrinho está vazio.</div>';
      updateSummary(0, 0, 0);
      return;
    }

    let subtotal = 0;
    container.innerHTML = cart
      .map((item) => {
        const product = productById(item.productId);
        if (!product) return "";
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;
        return `
          <article class="cart-row">
            <div class="cart-thumb image-${product.images[0]}">${renderProductMedia(product.images[0], product.name)}</div>
            <div class="cart-copy">
              <strong>${product.name}</strong>
              <span>${formatMoney(product.price)}</span>
            </div>
            <input class="cart-qty" type="number" min="1" data-product-id="${product.id}" value="${item.quantity}" />
            <strong>${formatMoney(lineTotal)}</strong>
            <button class="link-btn" data-remove-id="${product.id}">Remover</button>
          </article>
        `;
      })
      .join("");

    const shipping = subtotal > 0 ? 29.9 : 0;
    const discount = subtotal >= 2000 ? subtotal * 0.05 : 0;
    updateSummary(subtotal, shipping, discount);
  }

  function updateSummary(subtotal, shipping, discount) {
    const total = subtotal + shipping - discount;
    const set = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = formatMoney(value);
    };
    set("summary-subtotal", subtotal);
    set("summary-shipping", shipping);
    set("summary-discount", discount);
    set("summary-total", total);
  }

  function initButtons() {
    document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
      button.addEventListener("click", function () {
        const quantityInput = document.getElementById("product-quantity");
        const quantity = quantityInput ? Number(quantityInput.value || 1) : 1;
        addToCart(button.getAttribute("data-add-to-cart"), quantity);
        if (button.hasAttribute("data-buy-now")) {
          window.location.href = "/checkout";
        } else {
          button.textContent = "Adicionado";
        }
      });
    });

    document.querySelectorAll("[data-buy-now]").forEach((button) => {
      button.addEventListener("click", function () {
        const quantityInput = document.getElementById("product-quantity");
        const quantity = quantityInput ? Number(quantityInput.value || 1) : 1;
        addToCart(button.getAttribute("data-buy-now"), quantity);
        window.location.href = "/checkout";
      });
    });
  }

  function initSearch() {
    const input = document.getElementById("search-input");
    if (!input) return;
    input.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      const query = input.value.trim();
      window.location.href = query ? `/?q=${encodeURIComponent(query)}` : "/";
    });
  }

  function initCartInteractions() {
    document.addEventListener("change", function (event) {
      if (!event.target.classList.contains("cart-qty")) return;
      const cart = getCart();
      const item = cart.find((entry) => entry.productId === event.target.getAttribute("data-product-id"));
      if (item) {
        item.quantity = Math.max(1, Number(event.target.value || 1));
        setCart(cart);
        renderCart();
      }
    });

    document.addEventListener("click", function (event) {
      const button = event.target.closest("[data-remove-id]");
      if (!button) return;
      const next = getCart().filter((item) => item.productId !== button.getAttribute("data-remove-id"));
      setCart(next);
      renderCart();
    });
  }

  function initCheckout() {
    const form = document.getElementById("checkout-form");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const cart = getCart();
      const products = cart
        .map((item) => {
          const product = productById(item.productId);
          return product
            ? {
                productId: product.id,
                quantity: item.quantity,
                unitPrice: product.price
              }
            : null;
        })
        .filter(Boolean);
      const subtotal = products.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const shipping = subtotal ? 29.9 : 0;
      const discount = subtotal >= 2000 ? subtotal * 0.05 : 0;
      const formData = new FormData(form);
      const payload = {
        customer: {
          name: formData.get("name"),
          cpf: formData.get("cpf"),
          email: formData.get("email"),
          phone: formData.get("phone")
        },
        address: {
          cep: formData.get("cep"),
          street: formData.get("street"),
          number: formData.get("number"),
          complement: formData.get("complement"),
          district: formData.get("district"),
          city: formData.get("city"),
          state: formData.get("state")
        },
        items: products,
        subtotal,
        shipping,
        discount,
        total: subtotal + shipping - discount,
        paymentMethod: formData.get("paymentMethod") || "Pix"
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      const feedback = document.getElementById("checkout-result");
      if (response.ok) {
        localStorage.removeItem(storageKey);
        updateCartCount();
        feedback.innerHTML = `
          <strong>Pedido confirmado!</strong>
          <p>Número: ${result.id}</p>
          <p>Rastreio: <a href="/rastreamento?codigo=${result.trackingCode}">${result.trackingCode}</a></p>
        `;
        form.reset();
      } else {
        feedback.textContent = result.error || "Não foi possível concluir o pedido.";
      }
    });
  }

  function initTracking() {
    const form = document.getElementById("tracking-form");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const code = new FormData(form).get("trackingCode");
      const response = await fetch(`/api/tracking/${code}`);
      const result = document.getElementById("tracking-result");
      if (!response.ok) {
        result.innerHTML = "<p>Código não encontrado.</p>";
        return;
      }
      const data = await response.json();
      result.innerHTML = `
        <h2>${data.trackingCode}</h2>
        <div class="timeline">
          ${data.events
            .map(
              (eventItem) => `
            <article class="timeline-item">
              <strong>${eventItem.status}</strong>
              <span>${eventItem.description}</span>
              <small>${new Date(eventItem.date).toLocaleString("pt-BR")}</small>
            </article>
          `
            )
            .join("")}
        </div>
      `;
    });
  }

  function initAdmin() {
    document.querySelectorAll("[data-admin-create]").forEach((form) => {
      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const type = form.getAttribute("data-admin-create");
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        ["price", "oldPrice", "installments", "installmentValue", "discount"].forEach((field) => {
          if (payload[field] !== undefined) payload[field] = Number(payload[field]);
        });
        const response = await fetch(`/api/admin/create/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          form.reset();
          alert("Item salvo com sucesso.");
        }
      });
    });

    const trackingForm = document.getElementById("tracking-update-form");
    if (trackingForm) {
      trackingForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const payload = Object.fromEntries(new FormData(trackingForm).entries());
        const response = await fetch("/api/admin/tracking-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        alert(response.ok ? "Evento adicionado." : result.error);
        if (response.ok) trackingForm.reset();
      });
    }
  }

  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach((track) => {
      const parent = track.closest(".section-block, .category-strip");
      if (!parent) return;
      parent.querySelectorAll("[data-carousel-dir]").forEach((button) => {
        button.addEventListener("click", function () {
          track.scrollBy({ left: Number(button.getAttribute("data-carousel-dir")) * 320, behavior: "smooth" });
        });
      });
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const track = hero.querySelector(".hero-track");
    const slides = Array.from(track.children);
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let index = 0;
    let playing = true;

    function render() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    }

    hero.querySelectorAll("[data-hero-dir]").forEach((button) => {
      button.addEventListener("click", function () {
        index = (index + Number(button.getAttribute("data-hero-dir")) + slides.length) % slides.length;
        render();
      });
    });

    dots.forEach((dot) => {
      dot.addEventListener("click", function () {
        index = Number(dot.getAttribute("data-hero-dot"));
        render();
      });
    });

    const toggle = hero.querySelector("[data-hero-toggle]");
    if (toggle) {
      toggle.addEventListener("click", function () {
        playing = !playing;
        toggle.textContent = playing ? "||" : ">";
      });
    }

    setInterval(function () {
      if (!playing) return;
      index = (index + 1) % slides.length;
      render();
    }, 4500);

    render();
  }

  function initCountdown() {
    const target = document.getElementById("countdown");
    if (!target) return;
    let seconds = 20 * 3600 + 41 * 60 + 4;
    setInterval(function () {
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      target.textContent = `${h}H ${m}M ${s}S`;
      seconds = seconds > 0 ? seconds - 1 : 20 * 3600 + 41 * 60 + 4;
    }, 1000);
  }

  updateCartCount();
  initButtons();
  initCartInteractions();
  renderCart();
  initCheckout();
  initTracking();
  initAdmin();
  initCarousels();
  initHero();
  initCountdown();
  initSearch();
})();
