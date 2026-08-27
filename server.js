const fs = require("fs");
const path = require("path");
const http = require("http");
const { URL } = require("url");
const {
  getState,
  getProductBySlug,
  createOrder,
  addTrackingEvent,
  addEntity
} = require("./src/store");
const {
  homePage,
  productPage,
  cartPage,
  checkoutPage,
  trackingPage,
  adminPage,
  favoritesPage
} = require("./src/templates");
const { mimeType } = require("./src/utils");

const publicDir = path.join(__dirname, "public");

function send(res, status, body, type = "text/html; charset=utf-8", headers = {}) {
  res.writeHead(status, { "Content-Type": type, ...headers });
  res.end(body);
}

function staticCacheHeaders(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"].includes(extension)) {
    return { "Cache-Control": "public, max-age=2592000, immutable" };
  }

  if ([".css", ".js"].includes(extension)) {
    return { "Cache-Control": "public, max-age=604800" };
  }

  return { "Cache-Control": "public, max-age=3600" };
}

function htmlCacheHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0"
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    req.on("data", (chunk) => {
      buffer += chunk.toString();
    });
    req.on("end", () => {
      if (!buffer) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(buffer));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function notFound(res) {
  send(res, 404, "<h1>Página não encontrada</h1>");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  if (pathname.startsWith("/public/")) {
    const filePath = path.join(publicDir, pathname.replace("/public/", ""));
    if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) {
      notFound(res);
      return;
    }
    send(res, 200, fs.readFileSync(filePath), mimeType(filePath), staticCacheHeaders(filePath));
    return;
  }

  if (req.method === "GET" && pathname === "/") {
    send(
      res,
      200,
      homePage(getState(), {
        q: url.searchParams.get("q") || "",
        category: url.searchParams.get("categoria") || ""
      }),
      "text/html; charset=utf-8",
      htmlCacheHeaders()
    );
    return;
  }

  if (req.method === "GET" && pathname === "/favoritos") {
    send(res, 200, favoritesPage(getState()), "text/html; charset=utf-8", htmlCacheHeaders());
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/produto/")) {
    const slug = pathname.split("/produto/")[1];
    const product = getProductBySlug(slug);
    if (!product) {
      notFound(res);
      return;
    }
    send(res, 200, productPage(getState(), product), "text/html; charset=utf-8", htmlCacheHeaders());
    return;
  }

  if (req.method === "GET" && pathname === "/carrinho") {
    send(res, 200, cartPage(getState()), "text/html; charset=utf-8", htmlCacheHeaders());
    return;
  }

  if (req.method === "GET" && pathname === "/checkout") {
    send(res, 200, checkoutPage(getState()), "text/html; charset=utf-8", htmlCacheHeaders());
    return;
  }

  if (req.method === "GET" && pathname === "/admin") {
    send(res, 200, adminPage(getState()), "text/html; charset=utf-8", htmlCacheHeaders());
    return;
  }

  if (req.method === "GET" && pathname === "/rastreamento") {
    const trackingCode = url.searchParams.get("codigo");
    const state = getState();
    const tracking = trackingCode
      ? state.trackingEvents.find((item) => item.trackingCode === trackingCode)
      : null;
    send(res, 200, trackingPage(state, tracking), "text/html; charset=utf-8", htmlCacheHeaders());
    return;
  }

  if (req.method === "GET" && pathname === "/api/state") {
    send(res, 200, JSON.stringify(getState()), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/api/tracking/")) {
    const code = pathname.split("/api/tracking/")[1];
    const tracking = getState().trackingEvents.find((item) => item.trackingCode === code);
    if (!tracking) {
      send(res, 404, JSON.stringify({ error: "Tracking não encontrado" }), "application/json; charset=utf-8");
      return;
    }
    send(res, 200, JSON.stringify(tracking), "application/json; charset=utf-8");
    return;
  }

  if (req.method === "POST" && pathname === "/api/orders") {
    try {
      const payload = await readBody(req);
      const order = createOrder(payload);
      send(res, 201, JSON.stringify(order), "application/json; charset=utf-8");
    } catch (error) {
      send(res, 400, JSON.stringify({ error: "Falha ao criar pedido" }), "application/json; charset=utf-8");
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/admin/tracking-event") {
    try {
      const payload = await readBody(req);
      const tracking = addTrackingEvent(payload.trackingCode, payload.status, payload.description);
      if (!tracking) {
        send(res, 404, JSON.stringify({ error: "Código não encontrado" }), "application/json; charset=utf-8");
        return;
      }
      send(res, 200, JSON.stringify(tracking), "application/json; charset=utf-8");
    } catch (error) {
      send(res, 400, JSON.stringify({ error: "Falha ao atualizar rastreio" }), "application/json; charset=utf-8");
    }
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/admin/create/")) {
    try {
      const type = pathname.split("/api/admin/create/")[1];
      const payload = await readBody(req);
      const item = addEntity(type, payload);
      if (!item) {
        send(res, 400, JSON.stringify({ error: "Tipo invalido" }), "application/json; charset=utf-8");
        return;
      }
      send(res, 201, JSON.stringify(item), "application/json; charset=utf-8");
    } catch (error) {
      send(res, 400, JSON.stringify({ error: "Falha ao salvar item" }), "application/json; charset=utf-8");
    }
    return;
  }

  notFound(res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`BravaHub online em http://localhost:${PORT}`);
});
