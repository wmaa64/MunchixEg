import React, { useEffect } from "react";
import Link from "next/link";
import { BsBagCheckFill } from "react-icons/bs";
import { useRouter } from "next/router";

import { useStateContext } from "../../context/StateContext";
import { runFireworks } from "../../lib/utils";

const Success = () => {
  const { setCartItems, setTotalPrice,  setTotalQuantities, } = useStateContext();

  const router = useRouter();

  const {
    id,              // Paymob transaction ID
    success,         // Paymob payment result
    orderId,
    paymobOrderId,
    paymentMethod,
  } = router.query;

useEffect(() => {
  if (!router.isReady) return;

  // --------------------------------
  // Online payment
  // --------------------------------

  if (paymentMethod === "online" || id) {
    console.log("✅ Paymob payment returned");
    console.log("Paymob Transaction ID:", id);
    console.log("MongoDB Order ID:", orderId);
    console.log("Paymob Order ID:", paymobOrderId);

    // Clear cart after returning from Paymob
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);

    localStorage.removeItem("cartBackup");

    runFireworks();

    return;
  }

  // --------------------------------
  // Cash / Visa on delivery
  // --------------------------------

  if ( paymentMethod === "cash_on_delivery" ||  paymentMethod === "card_on_delivery"  ) {

    if (!orderId) {
      console.warn("Missing MongoDB orderId for delivery payment."  );
      return;
    }

    console.log("✅ Delivery order created"  );

    console.log("MongoDB Order ID:",  orderId);

    // Clear cart
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);

    localStorage.removeItem("cartBackup");

    runFireworks();
  }

}, [router.isReady, id, orderId, paymobOrderId, paymentMethod, success, setCartItems, setTotalPrice, setTotalQuantities,]);

  return (
    <div className="success-wrapper">
      <div className="success">

        <p className="icon">
          <BsBagCheckFill />
        </p>

        <h2>
          Thank you for your order!
        </h2>

        {success === "true" ? (
          <>
            <p className="email-msg">
              {paymentMethod === "cash_on_delivery"  ? "Your order has been placed successfully." : 
                paymentMethod === "card_on_delivery" ? "Your order has been placed successfully." : 
                  "Your payment was successful."}
            </p>

            <p className="description">
              Your order has been received successfully.
              <br />

              Order ID: {orderId || "N/A"}

              {id && (
                <>
                  <br />
                  Payment Transaction ID: {id}
                </>
              )}

            </p>

          </>
        ) : (
          <>
            <p className="email-msg">
              Your payment was not successful.
            </p>

            <p className="description">
              Please try again or choose another payment method.
            </p>
          </>
        )}

        <Link href="/">
          <button  type="button"   className="btn"      >
            Continue Shopping
          </button>
        </Link>

      </div>
    </div>
  );
};

export default Success;