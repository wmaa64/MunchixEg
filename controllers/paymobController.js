import Order from "../models/Order";

// controllers/paymobController.js
// Uses native fetch and process.env (no axios, no dotenv import)

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;

if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID) {
  console.warn("PAYMOB env vars missing: check PAYMOB_API_KEY and PAYMOB_INTEGRATION_ID");
}

/* ---------------------------------------------
   STEP 1 – Authenticate with Paymob
---------------------------------------------- */
const paymobAuth = async () => {
  const res = await fetch("https://accept.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => ({}));
    console.error("Paymob auth failed:", err);
    throw new Error("Paymob authentication failed");
  }

  const data = await res.json();
  return data.token;
};

/* ---------------------------------------------
   STEP 2 – Create Paymob order
   - orderItems: array of { productId: {name, price}, quantity }
   - amountCents: integer
---------------------------------------------- */
const createPaymobOrder = async ({orderId,  email,  mobile,}) => {
  try {
    // --------------------------------
    // Get our MongoDB order
    // --------------------------------

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    // --------------------------------
    // Make sure order is still pending
    // --------------------------------

    if (order.paymentStatus !== "pending") {
      throw new Error(
        "This order is no longer available for payment."
      );
    }

    // --------------------------------
    // Use SERVER-SIDE order total
    // --------------------------------

    const amountCents = Math.round(order.totalPrice * 100);

    // --------------------------------
    // Paymob authentication
    // --------------------------------

    const authResponse = await fetch("https://accept.paymob.com/api/auth/tokens",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: process.env.PAYMOB_API_KEY,
        }),
      }
    );

    if (!authResponse.ok) {
      const errorData =  await authResponse.json().catch(() => ({}));

      throw new Error(
        errorData.detail ||
        errorData.message ||
        "Paymob authentication failed."
      );
    }

    const authData = await authResponse.json();

    // --------------------------------
    // Create Paymob order
    // --------------------------------

    const paymobOrderResponse = await fetch("https://accept.paymob.com/api/ecommerce/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_token: authData.token,
          delivery_needed: false,
          amount_cents: amountCents,
          currency: "EGP",
          items: [],
        }),
      }
    );

    if (!paymobOrderResponse.ok) {
      const errorData =
        await paymobOrderResponse
          .json()
          .catch(() => ({}));

      throw new Error(
        errorData.detail ||
        errorData.message ||
        "Failed to create Paymob order."
      );
    }

    const paymobOrder =  await paymobOrderResponse.json();

    // --------------------------------
    // Save Paymob order ID
    // --------------------------------

    order.paymobOrderId = String(paymobOrder.id   );

    await order.save();

    console.log(
      "✅ Paymob order created:",
      paymobOrder.id
    );

    // --------------------------------
    // Create payment key
    // --------------------------------

    const billingData = {
      first_name: order.name || "Customer",
      last_name: "Customer",
      email: order.email,
      phone_number: mobile || order.mobile,

      apartment: "NA",
      floor: "NA",
      street: order.address || "NA",
      building: "NA",
      shipping_method: "NA",
      postal_code: "NA",
      city: "Cairo",
      state: "Cairo",
      country: "EG",
    };

    const paymentKeyResponse = await fetch("https://accept.paymob.com/api/acceptance/payment_keys",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_token: authData.token,

          amount_cents: amountCents,

          expiration: 3600,

          order_id: paymobOrder.id,

          billing_data: billingData,

          currency: "EGP",

          integration_id:
            process.env.PAYMOB_INTEGRATION_ID,

          lock_order_when_paid: true,
        }),
      }
    );

    if (!paymentKeyResponse.ok) {
      const errorData =
        await paymentKeyResponse
          .json()
          .catch(() => ({}));

      throw new Error(
        errorData.detail ||
        errorData.message ||
        "Failed to create Paymob payment key."
      );
    }

    const paymentKeyData =  await paymentKeyResponse.json();

    console.log(
      "✅ Paymob payment key created."
    );

    return {
      paymentKey: paymentKeyData.token,
      paymobOrderId: paymobOrder.id,
      amount: order.totalPrice,
    };

  } catch (error) {
    console.error(
      "❌ Error creating Paymob order:",
      error
    );

    throw error;
  }
};

export { paymobAuth, createPaymobOrder };

