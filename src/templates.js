const { money, escapeHtml, formatDate } = require("./utils");

function stars(rating) {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }, (_, index) =>
    `<span class="star ${index < rounded ? "filled" : ""}">*</span>`
  ).join("");
}

function icon(name) {
  const icons = {
    tag: "TAG",
    flash: "OFF",
    fridge: "FRIO",
    oven: "AIR",
    tv: "TV",
    phone: "PRO",
    mobile: "5G",
    sofa: "CASA",
    fan: "AR"
  };
  return icons[name] || "SHOP";
}

const imageAssets = {
  smarttv43: { src: "/public/images/smarttv43.webp", width: 1448, height: 1086, inset: "wide" },
  airfryer: { src: "/public/images/air-fryei.webp", width: 1448, height: 1086, inset: "standard" },
  vacuum: { src: "/public/images/aspirador.webp", width: 1448, height: 1086, inset: "standard" },
  fridge: { src: "/public/images/geladeira.webp", width: 1448, height: 1086, inset: "standard" },
  wardrobe: { src: "/public/images/gardaroupa.webp", width: 1448, height: 1086, inset: "standard" },
  console: { src: "/public/images/console.webp", width: 1448, height: 1086, inset: "standard" },
  orangephone: { src: "/public/images/iphone17.webp", width: 1374, height: 1145, inset: "standard" },
  moto: { src: "/public/images/motog47.webp", width: 1448, height: 1086, inset: "standard" },
  laptop: { src: "/public/images/notebook.webp", width: 1374, height: 1145, inset: "standard" },
  sofa: { src: "/public/images/sofa.webp", width: 1374, height: 1145, inset: "standard" },
  bed: { src: "/public/images/cama.webp", width: 1374, height: 1145, inset: "standard" },
  blender: { src: "/public/images/liquidificador.webp", width: 1374, height: 1145, inset: "standard" }
};

const heroImageAssets = [
  {
    desktop: "/public/images/bainner1.webp",
    mobile: "/public/images/bainner1-mobile.webp",
    width: 1600,
    height: 600,
    mobileWidth: 1080,
    mobileHeight: 1350
  },
  {
    desktop: "/public/images/bainner2.webp",
    mobile: "/public/images/bainner2-mobile.webp",
    width: 1600,
    height: 600,
    mobileWidth: 1080,
    mobileHeight: 1350
  },
  {
    desktop: "/public/images/bainner3.webp",
    mobile: "/public/images/bainner3-mobile.webp",
    width: 1600,
    height: 600,
    mobileWidth: 1080,
    mobileHeight: 1350
  }
];

function renderProductAsset(imageName, alt, options = {}) {
  const asset = imageAssets[imageName];
  if (!asset) {
    return "";
  }

  const loading = options.loading || "eager";
  const className = options.className ? ` ${options.className}` : "";
  return `
    <img
      class="product-media product-media-${asset.inset}${className}"
      src="${asset.src}"
      alt="${escapeHtml(alt)}"
      width="${asset.width}"
      height="${asset.height}"
      loading="${loading}"
      decoding="async"
    />
  `;
}

function renderHeroBannerImage(index, alt) {
  const asset = heroImageAssets[index];
  if (!asset) {
    return "";
  }

  return `
    <picture class="hero-picture">
      ${asset.mobile ? `<source media="(max-width: 600px)" srcset="${asset.mobile}" />` : ""}
      <img
        class="hero-banner-image"
        src="${asset.desktop}"
        alt="${escapeHtml(alt)}"
        width="${asset.width}"
        height="${asset.height}"
        decoding="async"
      />
    </picture>
  `;
}

function productCard(product) {
  const tags = product.tags
    .map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="product-card">
      <a class="product-link" href="/produto/${escapeHtml(product.slug)}">
        <div class="product-image image-${escapeHtml(product.images[0])}">
          ${renderProductAsset(product.images[0], product.name, { loading: "lazy" })}
          <span class="badge badge-discount">${escapeHtml(product.badge)}</span>
        </div>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <div class="rating-row">${stars(product.rating)} <span>(${product.reviews})</span></div>
        <div class="price-old">${money(product.oldPrice)}</div>
        <div class="price-main">${money(product.price)}</div>
        <div class="pix-line">${escapeHtml(product.pixText)}</div>
        <div class="tag-row">${tags}</div>
      </a>
      <button class="btn btn-card" data-add-to-cart="${escapeHtml(product.id)}">Adicionar</button>
    </article>
  `;
}

function productCarousel(title, products, subtitle = "") {
  return `
    <section class="section-block">
      <div class="section-head">
        <div class="section-head-copy">
          <h2>${escapeHtml(title)}</h2>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
        </div>
        <div class="section-head-actions">
          <a class="see-all-link" href="/">Ver todos</a>
          <div class="carousel-controls">
            <button class="carousel-arrow" data-carousel-dir="-1">&lt;</button>
            <button class="carousel-arrow" data-carousel-dir="1">&gt;</button>
          </div>
        </div>
      </div>
      <div class="carousel-track" data-carousel>
        ${products.map(productCard).join("")}
      </div>
    </section>
  `;
}

function categoryStrip(categories) {
  return `
    <section class="category-strip">
      <button class="carousel-arrow category-arrow left" data-carousel-dir="-1">&lt;</button>
      <div class="category-track" data-carousel>
        ${categories
          .map(
            (category) => `
          <a class="category-card category-card-${escapeHtml(category.id)}" href="/?categoria=${escapeHtml(category.id)}">
            <span class="category-icon">${
              category.id === "dia"
                ? `
                  <span class="category-art category-art-dia">
                    <span class="category-art-dia-panel">
                      <span class="category-art-dia-top"></span>
                      <span class="category-art-dia-middle">
                        <span class="category-art-dia-text">OFERTA</span>
                        <span class="category-art-dia-text">DIA</span>
                      </span>
                      <span class="category-art-dia-bottom"></span>
                    </span>
                  </span>
                `
                : icon(category.icon)
            }</span>
            <span class="category-label">${escapeHtml(category.name)}</span>
          </a>
        `
          )
          .join("")}
      </div>
      <button class="carousel-arrow category-arrow right" data-carousel-dir="1">&gt;</button>
    </section>
  `;
}

function header(state) {
  return `
    <header class="site-header">
      <div class="promo-bar">
        <div class="promo-copy"><strong>Receba</strong> ofertas exclusivas</div>
        <form class="promo-form">
          <input type="email" placeholder="Digite seu e-mail" />
          <input type="tel" placeholder="Digite seu telefone" />
          <button type="button" class="btn btn-accent">Receber</button>
        </form>
        <div class="promo-privacy">Privacidade respeitada. Cancele quando quiser.</div>
      </div>
      <div class="topbar">
        <button class="mobile-menu-button" type="button" aria-label="Abrir menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <a href="/" class="brand">
          <span class="brand-mark">B</span>
          <div class="brand-copy">
            <strong>${escapeHtml(state.store.name)}</strong>
            <small>loja online</small>
          </div>
        </a>
        <label class="searchbar">
          <input id="search-input" type="search" placeholder="O que você está procurando?" />
          <span class="search-icon" aria-hidden="true"></span>
        </label>
        <nav class="quick-actions">
          <a href="/admin" class="quick-link quick-link-account"><span class="quick-icon" aria-hidden="true"></span><span>Minha conta</span></a>
          <a href="/favoritos" class="quick-link quick-link-favorites"><span class="quick-icon" aria-hidden="true"></span><span>Favoritos</span></a>
          <a href="/carrinho" class="quick-link quick-link-cart"><span class="quick-icon" aria-hidden="true"></span><span>Carrinho</span><strong id="cart-count">0</strong></a>
        </nav>
      </div>
      <div class="nav-row">
        <div class="nav-links">
          <a href="/">Departamentos</a>
          <a href="/?categoria=smartphones">Telefonia</a>
          <a href="/?categoria=eletro">Eletrodomésticos</a>
          <a href="/?categoria=tvs">TVs e Vídeo</a>
          <a href="/?categoria=moveis">Móveis</a>
          <a href="/?categoria=portateis">Eletroportáteis</a>
          <a href="/?categoria=portateis">Informática</a>
          <a href="/" class="offers-pill">Ofertas</a>
        </div>
        <div class="nav-support">
          <a href="/rastreamento">Rastreamento</a>
          <a href="/admin">Compra corporativa</a>
        </div>
      </div>
    </header>
  `;
}

function footer(state) {
  return `
    <footer class="site-footer">
      <section class="support-grid">
        <div class="support-box"><strong>Central de Vendas</strong><span>Fale pelo WhatsApp</span></div>
        <div class="support-box"><strong>Central de Atendimento</strong><span>Telefone / WhatsApp</span></div>
        <div class="support-box"><strong>Para Outras Regiões</strong><span>${escapeHtml(state.store.company.supportPhone)}</span></div>
      </section>
      <section class="link-cloud">
        <h3>Produtos mais buscados</h3>
        <div class="link-columns">
          ${[
            "Air fryer",
            "Ar condicionado",
            "Armário de cozinha",
            "Bicicleta",
            "Cama",
            "Celular",
            "Celular Motorola",
            "Celular Samsung",
            "Colchão",
            "Computador",
            "Cooktop",
            "Fogão",
            "Geladeira",
            "Guarda-roupa",
            "iPhone",
            "Notebook",
            "Pneu",
            "Smart TV",
            "Smartphone",
            "Sofá",
            "Tablet",
            "Ventilador",
            "Xbox",
            "PS5"
          ]
            .map((item) => `<a href="/">${escapeHtml(item)}</a>`)
            .join("")}
        </div>
      </section>
      <section class="glossary">
        <h3>Glossário</h3>
        <div>0-9 | A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X | Y | Z</div>
      </section>
      <section class="footer-columns">
        <div>
          <h4>Meus pedidos</h4>
          <a href="/rastreamento">Acompanhe seus pedidos</a>
          <a href="/admin">Editar cadastro</a>
        </div>
        <div>
          <h4>Marketplace</h4>
          <a href="/admin">Cadastro</a>
          <a href="/admin">Venda seus produtos</a>
          <a href="/admin">Serviços</a>
        </div>
        <div>
          <h4>Nossa empresa</h4>
          <a href="/">Quem somos</a>
          <a href="/">Serviços</a>
          <a href="/">Trabalhe conosco</a>
          <a href="/">Blog</a>
          <a href="/">Venda seus produtos</a>
        </div>
        <div>
          <h4>Ajuda</h4>
          <a href="/">Mapa do site</a>
          <a href="/">Atendimento</a>
          <a href="/">Prazos de entrega</a>
          <a href="/">Política de troca</a>
          <a href="/">Portal de privacidade</a>
          <a href="/">Termos de uso</a>
        </div>
      </section>
      <section class="payment-row">
        <div>
          <h4>Formas de pagamento</h4>
          <div class="pay-list">
            <span>Pix</span>
          </div>
        </div>
        <div>
          <h4>Acompanhe nas redes sociais</h4>
          <div class="socials"><span>Facebook</span><span>Instagram</span><span>YouTube</span><span>X</span></div>
        </div>
        <div>
          <h4>Baixe nosso app</h4>
          <div class="app-buttons"><span>Google Play</span><span>App Store</span></div>
        </div>
      </section>
      <div class="legal-bar">
        <p>Preços e condições exclusivos para o site, podendo sofrer alterações sem prévia notificação.</p>
        <small>${escapeHtml(state.store.company.legalName)} | ${escapeHtml(state.store.company.address)} | CNPJ ${escapeHtml(state.store.company.cnpj)}</small>
      </div>
    </footer>
  `;
}

function pageLayout({ title, state, content, bodyClass = "" }) {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body class="${escapeHtml(bodyClass)}">
        ${header(state)}
        ${content}
        ${footer(state)}
        <script>window.__INITIAL_STATE__ = ${JSON.stringify(state)};</script>
        <script src="/public/app.js" defer></script>
      </body>
    </html>
  `;
}

function inlineBanner(theme, title, copy, cta) {
  return `
    <section class="inline-banner inline-banner-${escapeHtml(theme)}">
      <div class="inline-banner-copy">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(copy)}</span>
      </div>
      <a href="/" class="inline-banner-cta">${escapeHtml(cta)}</a>
    </section>
  `;
}

function homePage(state, options = {}) {
  const products = state.products;
  const q = (options.q || "").trim().toLowerCase();
  const category = options.category || "";
  const filteredProducts = products.filter((product) => {
    const textMatch = !q || product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
    const categoryMatch = !category || product.category === category;
    return textMatch && categoryMatch;
  });

  const section = (title, ids, subtitle = "") =>
    productCarousel(
      title,
      ids
        .map((id) => filteredProducts.find((product) => product.id === id) || products.find((product) => product.id === id))
        .filter(Boolean),
      subtitle
    );

  const heroSlides = state.banners
    .map(
      (banner, index) => `
      <article class="hero-slide theme-${escapeHtml(banner.theme)} ${index <= 2 ? `hero-slide-banner hero-slide-banner-${index + 1}` : ""}">
        ${index <= 2 ? renderHeroBannerImage(index, banner.title) : ""}
        <div class="hero-copy">
          <span class="eyebrow">BravaHub Prime</span>
          <h1>${escapeHtml(banner.title)}</h1>
          <p>${escapeHtml(banner.subtitle)}</p>
          <a href="/" class="btn btn-light">${escapeHtml(banner.cta)}</a>
        </div>
        <div class="hero-art ${index <= 2 ? `hero-art-banner hero-art-banner-${index + 1}` : ""}">
          <div class="shape one"></div>
          <div class="shape two"></div>
          <div class="shape three"></div>
          <div class="shape four"></div>
        </div>
      </article>
    `
    )
    .join("");

  return pageLayout({
    title: `${state.store.name} | Inicio`,
    state,
    bodyClass: "home-page-body",
    content: `
      <main class="page-home">
        <section class="mobile-cep-bar mobile-only">
          <div class="mobile-cep-copy">
            <span class="mobile-cep-icon" aria-hidden="true"></span>
            <strong>Informe seu CEP</strong>
          </div>
          <button class="mobile-cep-action" type="button" aria-label="Acessibilidade"></button>
        </section>
        ${categoryStrip(state.categories)}
        ${
          q || category
            ? `
          <section class="active-filters">
            <strong>${filteredProducts.length}</strong>
            <span>produtos encontrados${q ? ` para "${escapeHtml(options.q)}"` : ""}${category ? ` em ${escapeHtml(category)}` : ""}</span>
          </section>
        `
            : ""
        }
        <section class="hero-carousel" data-hero>
          <div class="hero-track">${heroSlides}</div>
          <button class="hero-side-arrow left" data-hero-dir="-1">&lt;</button>
          <button class="hero-side-arrow right" data-hero-dir="1">&gt;</button>
          <div class="hero-controls">
            <button class="carousel-arrow" data-hero-toggle>||</button>
          </div>
          <div class="hero-dots">
            ${state.banners.map((_, index) => `<button data-hero-dot="${index}"></button>`).join("")}
          </div>
        </section>
        <section class="mobile-finance-strip mobile-only">
          <strong>Carnê CasasBahia</strong>
          <span>Parcelas que cabem no bolso sem usar o limite do cartão.</span>
        </section>
        <section class="mobile-finance-card mobile-only">
          <div class="mobile-finance-brand">Carnê<br />Digital</div>
          <a href="/checkout" class="btn btn-primary">Consultar pré-aprovado</a>
        </section>
        <section class="mini-banner">
          <div class="mini-banner-copy">
            <strong>Compre hoje e receba rápido</strong>
            <span>Retirada ágil, rastreamento claro e ofertas renovadas diariamente.</span>
          </div>
          <div class="mini-banner-chip">Entrega expressa</div>
        </section>
        <section class="benefits-box">
          <div class="benefit-brand">Pix BravaHub</div>
          <div class="benefit-item">Pagamento instantâneo</div>
          <div class="benefit-item">Aprovação mais rápida</div>
          <div class="benefit-item">Compra simples e segura</div>
          <div class="benefit-item">Desconto aplicado no Pix</div>
          <button class="btn btn-primary">Pagar com Pix</button>
        </section>
        <section class="flash-head">
          <div>
          <h2>Ofertas Relâmpago <span>+</span></h2>
          </div>
          <div class="countdown-box">
            <span>As ofertas se encerram em:</span>
            <strong id="countdown">20H 41M 04S</strong>
          </div>
        </section>
        ${section("Ofertas Relâmpago", ["smart-tv-aoc-43", "guarda-roupa-villa", "air-fryer-oven-12l", "geladeira-frost-455l", "aspirador-1400w"])}
        ${inlineBanner("navy", "Compre online com entrega ágil", "Seleção diária com retirada rápida e rastreio simples.", "Explorar ofertas")}
        ${section("Compre hoje e receba rápido", ["air-fryer-oven-12l", "moto-g47-5g", "smart-tv-aoc-43", "geladeira-frost-455l", "aspirador-1400w"])}
        ${section("Indicados para você", ["guarda-roupa-villa", "geladeira-frost-455l", "console-nextgen-825", "iphone-cosmico-256", "sofa-retratil-verona"])}
        ${inlineBanner("ruby", "Tecnologia e casa em campanhas exclusivas", "Ofertas renovadas com visual de vitrine completa.", "Ver campanha")}
        ${section("Ofertas Mais Vendidas do Mes", ["liquidificador-turbo", "console-nextgen-825", "smart-tv-aoc-43", "air-fryer-oven-12l", "moto-g47-5g"])}
        ${section("Mais Vendidos de Tecnologia", ["iphone-cosmico-256", "moto-g47-5g", "smart-tv-aoc-43", "notebook-bookgo-14", "console-nextgen-825"])}
        ${inlineBanner("sky", "Móveis, eletro e portáteis no mesmo lugar", "Uma home mais cheia, densa e com cara de grande varejo.", "Comprar agora")}
        ${section("Tudo para sua Casa", ["guarda-roupa-villa", "geladeira-frost-455l", "sofa-retratil-verona", "cama-box-bau", "aspirador-1400w"])}
        ${section("Aproveite nossas ofertas de móveis", ["guarda-roupa-villa", "sofa-retratil-verona", "cama-box-bau", "geladeira-frost-455l", "air-fryer-oven-12l"])}
        ${section("Produtos Patrocinados", ["moto-g47-5g", "iphone-cosmico-256", "notebook-bookgo-14", "liquidificador-turbo", "smart-tv-aoc-43"], "Patrocinado")}
      </main>
    `
  });
}

function favoritesPage(state) {
  return pageLayout({
    title: `Favoritos | ${state.store.name}`,
    state,
    content: `
      <main class="simple-page">
        <section class="tracking-page">
          <h1>Favoritos</h1>
          <p>Esta área está pronta para evoluir com conta e lista salva. Por enquanto, use o carrinho para simular sua seleção.</p>
        </section>
      </main>
    `
  });
}

function productPage(state, product) {
  const related = state.products.filter((item) => item.id !== product.id).slice(0, 5);
  return pageLayout({
    title: `${product.name} | ${state.store.name}`,
    state,
    content: `
      <main class="product-page simple-page">
        <section class="product-layout">
          <div class="product-gallery">
            <div class="product-image product-detail image-${escapeHtml(product.images[0])}">
              ${renderProductAsset(product.images[0], product.name)}
            </div>
            <div class="thumb-row">
              ${product.images
                .map(
                  (image) => `
                    <button class="thumb image-${escapeHtml(image)}" type="button" aria-label="Miniatura de ${escapeHtml(product.name)}">
                      ${renderProductAsset(image, `Miniatura de ${product.name}`, { className: "product-media-thumb" })}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
          <div class="product-info">
            <h1>${escapeHtml(product.name)}</h1>
            <div class="rating-row">${stars(product.rating)} <span>${product.reviews} avaliações</span></div>
            <div class="price-old">${money(product.oldPrice)}</div>
            <div class="detail-pricing">
              <strong>${money(product.price)}</strong>
              <span>${escapeHtml(product.badge)}</span>
            </div>
            <p class="pix-line">${escapeHtml(product.pixText)}</p>
            <div class="buy-box">
              <label>Quantidade <input id="product-quantity" type="number" min="1" value="1" /></label>
              <label>CEP <input type="text" placeholder="Digite seu CEP" /></label>
              <div class="product-actions">
                <button class="btn btn-primary" data-add-to-cart="${escapeHtml(product.id)}">Adicionar ao carrinho</button>
                <button class="btn btn-accent" data-buy-now="${escapeHtml(product.id)}">Comprar agora</button>
              </div>
            </div>
            <div class="spec-list">
              <h3>Características</h3>
              ${product.specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join("")}
            </div>
          </div>
        </section>
        <section class="description-card">
          <h2>Descrição</h2>
          <p>${escapeHtml(product.description)}</p>
          <h3>Especificações</h3>
          <ul>${product.specs.map((spec) => `<li>${escapeHtml(spec)}</li>`).join("")}</ul>
        </section>
        ${productCarousel("Produtos relacionados", related)}
      </main>
    `
  });
}

function cartPage(state) {
  return pageLayout({
    title: `Carrinho | ${state.store.name}`,
    state,
    content: `
      <main class="simple-page">
        <section class="cart-layout">
          <div>
            <h1>Seu carrinho</h1>
            <div id="cart-items" class="cart-items"></div>
          </div>
          <aside class="summary-card">
            <h2>Resumo</h2>
            <div class="summary-row"><span>Subtotal</span><strong id="summary-subtotal">R$ 0,00</strong></div>
            <div class="summary-row"><span>Frete</span><strong id="summary-shipping">R$ 0,00</strong></div>
            <div class="summary-row"><span>Desconto</span><strong id="summary-discount">R$ 0,00</strong></div>
            <div class="summary-row total"><span>Total</span><strong id="summary-total">R$ 0,00</strong></div>
            <a class="btn btn-primary full" href="/checkout">Continuar compra</a>
          </aside>
        </section>
      </main>
    `,
    bodyClass: "cart-page-body"
  });
}

function checkoutPage(state) {
  return pageLayout({
    title: `Checkout | ${state.store.name}`,
    state,
    content: `
      <main class="simple-page">
        <section class="checkout-header">
          <h1>Checkout</h1>
          <ol class="steps">
            <li>Identificação</li>
            <li>Endereço</li>
            <li>Entrega</li>
            <li>Pagamento</li>
            <li>Confirmação</li>
          </ol>
        </section>
        <form id="checkout-form" class="checkout-form">
          <div class="form-grid">
            <input name="name" placeholder="Nome completo" required />
            <input name="cpf" placeholder="CPF" required />
            <input name="email" type="email" placeholder="E-mail" required />
            <input name="phone" placeholder="Telefone" required />
            <input name="cep" placeholder="CEP" required />
            <input name="street" placeholder="Rua" required />
            <input name="number" placeholder="Número" required />
            <input name="complement" placeholder="Complemento" />
            <input name="district" placeholder="Bairro" required />
            <input name="city" placeholder="Cidade" required />
            <input name="state" placeholder="Estado" required />
          </div>
          <input name="paymentMethod" type="hidden" value="Pix" />
          <div class="checkout-note">Pagamento exclusivo via Pix. A confirmação do pedido acontece após o envio do pagamento.</div>
          <button class="btn btn-accent" type="submit">Confirmar pedido</button>
          <div id="checkout-result" class="checkout-result"></div>
        </form>
      </main>
    `
  });
}

function trackingPage(state, tracking) {
  const events = tracking?.events || [];
  return pageLayout({
    title: `Rastreamento | ${state.store.name}`,
    state,
    content: `
      <main class="simple-page">
        <section class="tracking-page">
          <h1>Rastreamento</h1>
          <form id="tracking-form" class="tracking-search">
            <input name="trackingCode" placeholder="Digite seu código de rastreio" />
            <button class="btn btn-primary" type="submit">Buscar</button>
          </form>
          <div id="tracking-result" data-code="${escapeHtml(tracking?.trackingCode || "")}">
            ${
              tracking
                ? `
              <h2>${escapeHtml(tracking.trackingCode)}</h2>
              <div class="timeline">
                ${events
                  .map(
                    (event) => `
                  <article class="timeline-item">
                    <strong>${escapeHtml(event.status)}</strong>
                    <span>${escapeHtml(event.description)}</span>
                    <small>${formatDate(event.date)}</small>
                  </article>
                `
                  )
                  .join("")}
              </div>
            `
                : `<p>Busque um pedido para ver as atualizações.</p>`
            }
          </div>
        </section>
      </main>
    `
  });
}

function adminPage(state) {
  return pageLayout({
    title: `Admin | ${state.store.name}`,
    state,
    content: `
      <main class="simple-page admin-page">
        <section class="admin-hero">
          <h1>Dashboard administrativo</h1>
          <div class="admin-stats">
            <article><strong>${state.products.length}</strong><span>Produtos</span></article>
            <article><strong>${state.orders.length}</strong><span>Pedidos</span></article>
            <article><strong>${state.categories.length}</strong><span>Categorias</span></article>
            <article><strong>${state.coupons.length}</strong><span>Cupons</span></article>
          </div>
        </section>
        <section class="admin-grid">
          <article class="admin-card">
            <h2>Novo produto</h2>
            <form class="admin-form" data-admin-create="products">
              <input name="name" placeholder="Nome do produto" required />
              <input name="category" placeholder="Categoria" required />
              <input name="price" placeholder="Preço" required />
              <input name="oldPrice" placeholder="Preço antigo" required />
              <input name="badge" placeholder="Badge" required />
              <input name="pixText" placeholder="Texto Pix" value="No Pix" required />
              <textarea name="description" placeholder="Descrição"></textarea>
              <button class="btn btn-primary" type="submit">Salvar produto</button>
            </form>
          </article>
          <article class="admin-card">
            <h2>Novo banner</h2>
            <form class="admin-form" data-admin-create="banners">
              <input name="title" placeholder="Título" required />
              <input name="subtitle" placeholder="Subtítulo" required />
              <input name="cta" placeholder="CTA" required />
              <input name="theme" placeholder="Tema" required />
              <button class="btn btn-primary" type="submit">Salvar banner</button>
            </form>
          </article>
          <article class="admin-card">
            <h2>Novo cupom</h2>
            <form class="admin-form" data-admin-create="coupons">
              <input name="code" placeholder="Código" required />
              <input name="title" placeholder="Titulo" required />
              <input name="discount" placeholder="Desconto decimal ex: 0.1" required />
              <button class="btn btn-primary" type="submit">Salvar cupom</button>
            </form>
          </article>
          <article class="admin-card">
            <h2>Atualizar rastreio</h2>
            <form class="admin-form" id="tracking-update-form">
              <input name="trackingCode" placeholder="Código de rastreio" required />
              <input name="status" placeholder="Status" required />
              <textarea name="description" placeholder="Descrição" required></textarea>
              <button class="btn btn-accent" type="submit">Adicionar evento</button>
            </form>
          </article>
        </section>
        <section class="orders-table">
          <h2>Pedidos recentes</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Pagamento</th><th>Rastreio</th><th>Status</th></tr>
              </thead>
              <tbody>
                ${state.orders
                  .map(
                    (order) => `
                  <tr>
                    <td>${escapeHtml(order.id)}</td>
                    <td>${escapeHtml(order.customer.name)}</td>
                    <td>${money(order.total)}</td>
                    <td>${escapeHtml(order.paymentMethod)}</td>
                    <td>${escapeHtml(order.trackingCode)}</td>
                    <td>${escapeHtml(order.status)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    `
  });
}

module.exports = {
  homePage,
  productPage,
  cartPage,
  checkoutPage,
  trackingPage,
  adminPage,
  favoritesPage
};
