import Order from '../models/Order';
import Product from '../models/Product';

const getOrders = async () => {
    // Fetch products from the database
    const orders = await Order.find()
    return orders;
};

// 🟩 Get orders by date
const getOrdersByDate = async (date) => {
  if (!date)  throw new Error("Date parameter is required");

  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const orders = await Order.find({
    createdAt: { $gte: start, $lt: end },
  }).sort({ createdAt: -1 });

  return orders;
};

// 🟩 Get orders by date
const getOrdersByDateAndEmail = async (date, email) => {
  if (!date)  throw new Error("Date parameter is required");
  if (!email) throw new Error("Email parameter is required");

  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const orders = await Order.find({
    email: email,
    createdAt: { $gte: start, $lt: end },
  }).sort({ createdAt: -1 });

  return orders;
};

//-----------
const createOrder = async (data) => {
  try {
    const {name,email,mobile, items, deliveryMethod, deliveryZone, address, deliveryInstructions, paymentMethod,} = data;

    // --------------------------------
    // Validate customer
    // --------------------------------

    if (!name || !email || !mobile) {
      throw new Error("Name, email and mobile are required.");
    }

    // --------------------------------
    // Validate items
    // --------------------------------

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    // --------------------------------
    // Validate delivery
    // --------------------------------

    if (!["delivery", "pickup"].includes(deliveryMethod)) {
      throw new Error("Invalid delivery method.");
    }

    if (deliveryMethod === "delivery") {
      if (!deliveryZone) {
        throw new Error("Delivery zone is required.");
      }

      if (!address?.trim()) {
        throw new Error("Delivery address is required.");
      }
    }

    // --------------------------------
    // Validate payment
    // --------------------------------

    const allowedPaymentMethods = ["online", "cash_on_delivery", "card_on_delivery",   ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      throw new Error("Invalid payment method.");
    }

// --------------------------------
// Get actual products from MongoDB To Calculate Total
// --------------------------------

const productIds = items.map(
  (item) => item.productId || item._id
);

const products = await Product.find({
  _id: { $in: productIds },
});

if (products.length !== productIds.length) {
  throw new Error("One or more products were not found.");
}

    // --------------------------------
    // Build order items
    // --------------------------------
// --------------------------------
// Build order items + calculate prices
// --------------------------------

const orderItems = [];

for (const item of items) {
  const productId = item.productId || item._id;

  const product = products.find(
    (p) => p._id.toString() === productId.toString()
  );

  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(
      `Invalid quantity for product: ${productId}`
    );
  }

  let unitPrice = 0;

  // ========================================
  // NORMAL PRODUCT
  // ========================================

  if (product.producttype === "item") {

    unitPrice = Number(product.price) || 0;

  }

  // ========================================
  // MEAL
  // ========================================

  else if (product.producttype === "meal") {

    const mealPrice = Number(product.price) || 0;
    const overprice = Number(product.overprice) || 0;

    // ----------------------------------------
    // CASE 1:
    // Meal has its own price
    // ----------------------------------------

    if (mealPrice > 0) {

      unitPrice = mealPrice + overprice;

    }

    // ----------------------------------------
    // CASE 2:
    // Meal price = 0
    // Calculate from selected products
    // ----------------------------------------

    else {

      const selectedCategories =
        item.selectedCategories || [];

      let selectedItemsTotal = 0;

      for (const category of selectedCategories) {

        const selectedItems =
          category.selectedItems || [];

        for (const selectedItem of selectedItems) {

          const selectedProductId =
            selectedItem.product?._id ||
            selectedItem.productId ||
            selectedItem._id;

          const selectedQuantity =
            Number(selectedItem.quantity);

          if (!selectedProductId) {
            throw new Error(
              `Selected item in meal ${productId} has no product ID.`
            );
          }

          if (
            !Number.isInteger(selectedQuantity) ||
            selectedQuantity < 1
          ) {
            throw new Error(
              `Invalid selected item quantity in meal ${productId}.`
            );
          }

          const selectedProduct = await Product.findById(
            selectedProductId
          );

          if (!selectedProduct) {
            throw new Error(
              `Selected product not found: ${selectedProductId}`
            );
          }

          const selectedItemPrice =
            Number(selectedProduct.price) || 0;

          selectedItemsTotal +=
            selectedItemPrice * selectedQuantity;
        }
      }

      unitPrice =
        selectedItemsTotal + overprice;
    }
  }

  else {
    throw new Error(
      `Invalid product type for product: ${productId}`
    );
  }

  // --------------------------------
  // Calculate item subtotal
  // --------------------------------

  const itemSubtotal = unitPrice * quantity;

  console.log("🧾 Order item calculation:", {
    product: product.name?.en,
    producttype: product.producttype,
    quantity,
    unitPrice,
    itemSubtotal,
  });

  orderItems.push({
    productId: product._id,

    name: {
      en: product.name.en,
      ar: product.name.ar,
    },

    displayName:
      item.displayName || product.name.en,

    // IMPORTANT:
    // Save the calculated unit price,
    // not the price coming from the browser.
    price: unitPrice,

    quantity,

    image:
      item.image || product.image,

    selectedCategories:
      item.selectedCategories || [],
  });
}

// --------------------------------
// Calculate subtotal
// --------------------------------

const subtotal = orderItems.reduce(
  (sum, item) => {
    return sum + (item.price * item.quantity);
  },
  0
);

    /*
const orderItems = items.map((item) => {
  const productId = item.productId || item._id;

  const product = products.find(
    (p) => p._id.toString() === productId.toString()
  );

  if (!product) {
    throw new Error(
      `Product not found: ${productId}`
    );
  }

  const quantity = Number(item.quantity);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(
      `Invalid quantity for product: ${productId}`
    );
  }

  return {
    productId: product._id,

    name: {
      en: product.name.en,
      ar: product.name.ar,
    },

    displayName:
      item.displayName || product.name.en,

    price: product.price,

    quantity,

    image:  item.image ||  product.image,

    selectedCategories:  item.selectedCategories || [],
  };
});

const subtotal = orderItems.reduce( (sum, item) => { return sum + item.price * item.quantity;  },  0);
*/

const DELIVERY_ZONES = {
  "maadi-degla": 25,
  "old-maadi": 30,
  "zahraa-maadi": 35,
};

let deliveryFee = 0;

if (deliveryMethod === "delivery") {
  deliveryFee = DELIVERY_ZONES[deliveryZone];

  if (deliveryFee === undefined) {
    throw new Error(
      "Invalid delivery zone."
    );
  }
}

const totalPrice = subtotal + deliveryFee;





    /*
    const orderItems = items.map((item) => ({
      productId: item._id || item.productId,

      name: {
        en: item.name?.en || item.name || "",
        ar: item.name?.ar || "",
      },

      displayName:
        item.displayName ||
        item.name?.en ||
        item.name ||
        "",

      price: Number(item.price),

      quantity: Number(item.quantity),

      image: item.image,

      // Preserve meal selections
      selectedCategories:
        item.selectedCategories || [],
    }));
*/

    // --------------------------------
    // Create order
    // --------------------------------

    const newOrder = new Order({
      name,
      email,
      mobile,

      items: orderItems,

      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee || 0),
      totalPrice: Number(totalPrice),

      deliveryMethod,

      deliveryZone:
        deliveryMethod === "delivery"  ? deliveryZone : null,

      address:
        deliveryMethod === "delivery"  ? address : null,

      deliveryInstructions:
        deliveryMethod === "delivery"  ? deliveryInstructions || ""  : "",

      paymentMethod,

      // Every new order starts pending.
      // Online payment will change this to paid
      // after Paymob confirms success.
      paymentStatus: "pending",

      orderStatus: "Pending",

      // Will be filled after Paymob initialization
      paymentIntentId: null,
      paymobOrderId: null,
    });

    const savedOrder = await newOrder.save();

    console.log("✅ order saved:", savedOrder._id);

    return savedOrder;

  } catch (error) {
    console.error("❌ createOrder error:", error);
    throw error;
  }
};


// 🟩 Update order status
const updateOrder = async (id, data) => {
  return await Order.findByIdAndUpdate(id, { $set: data }, { new: true } );
};

// 🟩 Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId || !newStatus) throw new Error("Missing parameters");

  const updated = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: newStatus },
    { new: true }
  );

  if (!updated) throw new Error("Order not found");

  console.log(`✅ Updated order ${orderId} → ${newStatus}`);
  return updated;
};

export  { getOrders, getOrdersByDate, getOrdersByDateAndEmail, createOrder, updateOrder, updateOrderStatus };
