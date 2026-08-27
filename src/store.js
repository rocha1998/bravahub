const path = require("path");
const { readJson, writeJson, slugify, trackingCode } = require("./utils");

const DATA_FILE = path.join(__dirname, "..", "data", "store.json");

function getState() {
  return readJson(DATA_FILE);
}

function saveState(state) {
  writeJson(DATA_FILE, state);
}

function getProductBySlug(slug) {
  const state = getState();
  return state.products.find((product) => product.slug === slug);
}

function getProductById(id) {
  const state = getState();
  return state.products.find((product) => product.id === id);
}

function createOrder(payload) {
  const state = getState();
  const orderNumber = state.orders.length + 1002;
  const code = trackingCode();
  const order = {
    id: `ORD-${orderNumber}`,
    trackingCode: code,
    customer: payload.customer,
    address: payload.address,
    items: payload.items,
    subtotal: payload.subtotal,
    shipping: payload.shipping,
    discount: payload.discount,
    total: payload.total,
    paymentMethod: payload.paymentMethod,
    status: "Pedido confirmado",
    createdAt: new Date().toISOString()
  };

  state.orders.unshift(order);
  state.trackingEvents.unshift({
    trackingCode: code,
    events: [
      {
        status: "Pedido confirmado",
        description: "Seu pedido foi confirmado e entrou na fila de separacao.",
        date: order.createdAt
      }
    ]
  });
  saveState(state);
  return order;
}

function addTrackingEvent(trackingCodeValue, status, description) {
  const state = getState();
  const tracking = state.trackingEvents.find((item) => item.trackingCode === trackingCodeValue);
  if (!tracking) {
    return null;
  }
  tracking.events.unshift({
    status,
    description,
    date: new Date().toISOString()
  });
  const order = state.orders.find((entry) => entry.trackingCode === trackingCodeValue);
  if (order) {
    order.status = status;
  }
  saveState(state);
  return tracking;
}

function addEntity(type, payload) {
  const state = getState();
  if (!Array.isArray(state[type])) {
    return null;
  }

  if (type === "products") {
    payload.id = payload.id || slugify(payload.name);
    payload.slug = payload.slug || payload.id;
    payload.images = payload.images?.length ? payload.images : ["box"];
    payload.tags = payload.tags || [];
    payload.specs = payload.specs || [];
    payload.rating = Number(payload.rating || 4.6);
    payload.reviews = Number(payload.reviews || 0);
    payload.stock = Number(payload.stock || 0);
  }

  if (type === "categories") {
    payload.id = payload.id || slugify(payload.name);
  }

  payload.id = payload.id || `${type}-${Date.now()}`;
  state[type].unshift(payload);
  saveState(state);
  return payload;
}

module.exports = {
  getState,
  saveState,
  getProductBySlug,
  getProductById,
  createOrder,
  addTrackingEvent,
  addEntity
};
