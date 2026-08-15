// components/Cart.js
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineLeft } from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import { useStateContext } from "../../context/StateContext";
import { eUSLocale } from "../../lib/utils";
import EmptyCart from "./Cart/EmptyCart";
import toast from "react-hot-toast";

const Cart = () => {
  const cartRef = useRef();
  const { totalPrice, totalQuantities, cartItems, setShowCart, userInfo, onRemove, } = useStateContext();

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [address, setAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const [loading, setLoading] = useState(false);

  // Checkout options
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");

  const deliveryZones = [
    {
      id: "maadi-degla",
      name: "Maadi Degla",
      fee: 25,
    },
    {
      id: "old-maadi",
      name: "Old Maadi",
      fee: 30,
    },
    {
      id: "zahraa-maadi",
      name: "Zahraa Maadi",
      fee: 35,
    },
  ];

  useEffect(() => {
  if (userInfo) {
    setCustomerName(userInfo.name || "");
    setEmail(userInfo.email || "");
    setMobile(userInfo.mobile || "");
  }
}, [userInfo]);

  
  const selectedDeliveryZone = deliveryZones.find(
    (zone) => zone.id === deliveryZone
  );

  const deliveryFee = (deliveryMethod === "pickup") ? 0 : selectedDeliveryZone?.fee || 0;

  const finalTotal = totalPrice + deliveryFee;

  // Validate inputs dynamically
  const validateInputs = () => {
    const nameValid = customerName.trim().length >= 2;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const mobileValid = /^\d{11}$/.test(mobile);

    const deliveryValid =
      deliveryMethod === "pickup" ||
      (deliveryZone !== "" && address.trim().length >= 5);

    return (nameValid && emailValid && mobileValid && deliveryValid);
  };

  const canCheckout = validateInputs();

  const handleNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleMobileChange = (e) => {
    setMobile(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleDeliveryInstructionsChange = (e) => {
    setDeliveryInstructions(e.target.value);
  };



  const formatMobileForPaymob = (mobile) => {
    if (!mobile) return "";

    // Remove spaces, hyphens, parentheses
    mobile = mobile.replace(/\D+/g, "");

    // Remove leading zeros to avoid +20010...
    if (mobile.startsWith("0")) {
        mobile = mobile.substring(1);
    }

    // If user enters something like 20100..., remove the starting 20
    if (mobile.startsWith("20")) {
        mobile = mobile.substring(2);
    }

    // Now mobile must be exactly 10 digits (1001234567)
    if (mobile.length !== 10) {
        return null; // Invalid format
    }

  // Rebuild correct Paymob format
  return `+20${mobile}`;
};

  // Paymob Checkout -----------------------
const handleCheckout = async () => {
  
  if (!validateInputs()) {
    toast.error("Please complete all required information.");
    return;
  }

  try {
    setLoading(true);

    // Keep a backup in case we need it after Paymob
    localStorage.setItem("cartBackup", JSON.stringify(cartItems)   );

    const formattedMobile = formatMobileForPaymob(mobile);

    if (!formattedMobile) {
      toast.error(
        "Invalid mobile number. Must be like 01001234567."
      );
      return;
    }

    // --------------------------------
    // 1. Create order in MongoDB
    // --------------------------------

    const orderResponse = await fetch("/api/orders", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name: customerName,

        email,

        mobile: formattedMobile,

        items: cartItems,

        deliveryMethod,

        deliveryZone,

        address,

        deliveryInstructions,

        paymentMethod,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(
        orderData.message || "Failed to create order."
      );
    }

    const orderId = orderData.order._id;

    console.log(
      "✅ order created:",  orderId   );

    // --------------------------------
    // 2. Cash on delivery
    // --------------------------------

    if (paymentMethod === "cash_on_delivery") {
      toast.success(`Order placed successfully! Order ID: ${orderId}`);

      // Go to success page with our MongoDB order ID
      window.location.href =
        `/success?orderId=${encodeURIComponent(orderId)}` +   `&paymentMethod=cash_on_delivery` +  `&success=true`;
      return;
    }

    // --------------------------------
    // 3. Visa on delivery
    // --------------------------------

    if (paymentMethod === "card_on_delivery") {
      toast.success(`Order placed successfully! Order ID: ${orderId}`);

      // Go to success page with our MongoDB order ID
      window.location.href =
        `/success?orderId=${encodeURIComponent(orderId)}` +   `&paymentMethod=card_on_delivery` +  `&success=true`;

      return;
    }

    // --------------------------------
    // 4. Online payment
    // --------------------------------

    if (paymentMethod === "online") {
      
      const paymobResponse = await fetch("/api/paymob",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
          
          body: JSON.stringify({
              orderId,
              email,
              mobile,
            }),

        }
      );

      const paymobData =  await paymobResponse.json();

      if (!paymobResponse.ok) {
        throw new Error(
          paymobData.message || "Payment initialization failed."   );
      }

      if (!paymobData.paymentKey) {
        throw new Error("Payment key was not returned."   );
      }

      toast.loading(
        "Redirecting to payment..."
      );

      const successUrl =
        `${window.location.origin}/success` +
        `?orderId=${encodeURIComponent(orderId)}` +
        `&paymobOrderId=${encodeURIComponent( paymobData.paymobOrderId )}`;

      const paymobUrl =`https://accept.paymob.com/api/acceptance/iframes/872596` + 
                       `?payment_token=${encodeURIComponent( paymobData.paymentKey )}` +
                       `&redirect_url=${encodeURIComponent(successUrl )}`;

      window.location.href = paymobUrl;
    }

  } catch (error) {
    console.error(
      "❌ Checkout error:",
      error
    );

    toast.error(
      error.message ||
      "Checkout failed."
    );

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="cart-wrapper" ref={cartRef}>
      <div className="cart-container">
        <button type="button"  className="cart-heading"  onClick={() => setShowCart(false)}  >
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {cartItems.length < 1 && (
          <EmptyCart>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </EmptyCart>
        )}

        <div className="product-container">
          {cartItems.length >= 1 &&
            cartItems.map((item) => (
              <div className="product" key={item._id}>
                <button
                  type="button"
                  className="remove-item"
                  onClick={() => onRemove(item)}
                >
                  <TiDeleteOutline />
                </button>
                <img src={item?.image} className="cart-product-image" />

                <div className="item-desc">
                  <div>
                    <span style={{ fontWeight: "600", display: "block" }}>
                      {item.displayName || item.name?.en || item.name}
                    </span>

                    {item.producttype === "meal" &&
                      item.selectedCategories?.length > 0 && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "0.9rem",
                            color: "#555",
                            marginLeft: "10px",
                          }}
                        >
                          {item.selectedCategories.map((cat, cIndex) => (
                            <div key={cIndex} style={{ marginBottom: "4px" }}>
                              <strong>{cat.category}:</strong>{" "}
                              {cat.selectedItems.map((si, iIndex) => (
                                <span key={iIndex}>
                                  {si.quantity}x {si.product?.name?.en}
                                  {iIndex < cat.selectedItems.length - 1 ? " + " : ""}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                    <span style={{ display: "block", marginTop: "8px" }}>
                      {item.quantity} @ {item.price} EGP
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            
            {!userInfo && (
              <div className="customer-info">
                <label>Full Name:</label>
                <input className="input-field" type="text"  placeholder="Enter your full name"  value={customerName} required
                  onChange={handleNameChange}
                />

                <label>Enter Valid Email:</label>
                <input className="input-field"  type="email"  placeholder="Enter your email" value={email}  required
                        onChange={handleEmailChange}
                />

                <label>Enter Phone Number (11 digits):</label>
                <input className="input-field"  type="tel"    placeholder="Enter your phone number"  value={mobile} required
                        onChange={handleMobileChange}
                />
              </div>
            )}

            {/* Delivery Method Section */}
            <div className="checkout-section">
              <h3>Delivery Method</h3>

              <label className="checkout-option">
                <input type="radio"  name="deliveryMethod"  value="delivery"  checked={deliveryMethod === "delivery"}
                  onChange={() => setDeliveryMethod("delivery")}
                />
                <span>Delivery</span>
              </label>

              <label className="checkout-option">
                <input  type="radio"  name="deliveryMethod"  value="pickup"  checked={deliveryMethod === "pickup"}
                  onChange={() => {
                    setDeliveryMethod("pickup");
                    setDeliveryZone("");
                    setAddress("");
                    setDeliveryInstructions("");
                  }}
                />
                <span>Pick up</span>
              </label>

              {deliveryMethod === "delivery" && (
                <div className="delivery-details">

                  <label>Delivery Area:</label>

                  <select  className="input-field"  value={deliveryZone}  onChange={(e) => setDeliveryZone(e.target.value)}
                  >
                    <option value="">Select your area</option>

                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name} - {zone.fee} EGP
                      </option>
                    ))}
                  </select>

                  <label>Delivery Address:</label>

                  <textarea  className="input-field"  placeholder="Street, building number, apartment, floor..."
                    value={address}
                    onChange={handleAddressChange}
                    rows={3}
                  />

                  <label>Delivery Instructions (optional):</label>

                  <textarea  className="input-field"  placeholder="Any instructions for the delivery driver?"
                    value={deliveryInstructions}
                    onChange={handleDeliveryInstructionsChange}
                    rows={2}
                  />

                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="checkout-section">
              <h3>Payment Method</h3>

              <label className="checkout-option">
                <input type="radio"   name="paymentMethod"   value="online"   checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                <span>Pay online</span>
              </label>

              <label className="checkout-option">
                <input type="radio"  name="paymentMethod"  value="cash_on_delivery"  
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={() => setPaymentMethod("cash_on_delivery")}
                />
                <span>Cash on delivery</span>
              </label>

              <label className="checkout-option">
                <input type="radio"  name="paymentMethod" value="card_on_delivery"  
                  checked={paymentMethod === "card_on_delivery"}
                  onChange={() => setPaymentMethod("card_on_delivery")}
                />
                <span>Visa on delivery</span>
              </label>
            </div>

            <div className="total">
              <h3>Subtotal:</h3>
              <h3>جنيه {eUSLocale(totalPrice)}</h3>
            </div>

            <div>
                <h3>Delivery:</h3>
                <h3>
                  جنيه {eUSLocale(deliveryFee)}
                </h3>
              </div>

              <div>
                <h3>Total:</h3>
                <h3>
                  جنيه {eUSLocale(finalTotal)}
                </h3>
              </div>
              
            <div className="btn-container">
              <button  type="button"  className="btn"  onClick={handleCheckout} disabled={!canCheckout || loading}
                style={{
                  opacity: !canCheckout || loading ? 0.5 : 1,
                  cursor: !canCheckout || loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
