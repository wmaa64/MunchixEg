import React from "react";
import Link from "next/link";
import { AiOutlineShopping } from "react-icons/ai";
import toast from "react-hot-toast";
import { useStateContext } from "../../context/StateContext";
//import { urlFor } from "../../lib/client";
import getStripe from "../../lib/getStripe";
import { eUSLocale } from "../../lib/utils";
import EmptyCart from "./Cart/EmptyCart";


const MiniCart = () => {
const { totalPrice, totalQuantities, cartItems } = useStateContext();

    const handleCheckout = async () => {
        const stripe = await getStripe();
        
        const response = await fetch("/api/stripe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(cartItems),
        });

        if (response.statusCode === 500) return;
        const data = await response.json();
        toast.loading("Redirecting...");
        stripe.redirectToCheckout({
            sessionId: data.id
        });
    };

return (
    <div className="mini-cart-container">
        <span className="heading">
            Your Cart contains {totalQuantities} item{totalQuantities > 1 || totalQuantities === 0 ? "s" : ""}
        </span>
        { cartItems.length < 1 &&   <EmptyCart/> }

        <div className="product-container">
            {cartItems.length >= 1 &&
                cartItems.map((item) => (
                    <div className="product" key={item._id}>
                        <span>
                            <img src={(item?.image)} className="mini-cart-image" />
                        </span>
                        <span className="item-desc">
                            <span>{item.name.en}</span>
                            <span className="totals">
                                <span>{item.quantity}</span>
                                <span className="multiply">x</span>
                                    <span>
                                        جنيه مصرى
                                        {eUSLocale(item.price)}
                                    </span>
                            </span>
                        </span>
                    </div>
            ))}
        </div>

    </div>
);
};

export default MiniCart;
