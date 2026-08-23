import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const MyOrders = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");

      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      }
    } catch (error) {
      console.error("Error reading userInfo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;

    setSelectedDate(date);
    
    fetchMyOrders(date);
    
    console.log("Selected date:", date);
  };

const fetchMyOrders = async (date) => {
  if (!date || !userInfo?.email) {
    setOrders([]);
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `/api/orders?date=${encodeURIComponent(date)}&email=${encodeURIComponent(
        userInfo.email
      )}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    const data = await response.json();

    setOrders(data);
  } catch (error) {
    console.error("Error fetching my orders:", error);
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userInfo) {
    return (
      <div>
        <h1>My Orders</h1>
        <p>Please sign in to view your orders.</p>
      </div>
    );
  }

    const isRTL = i18n.language === "ar"; // true if Arabic

  return (
    <div dir={ isRTL ? "rtl" : "ltr" } >
        {/*<h1>My Orders</h1>

        <p>Welcome, {userInfo.name}</p>

        <p>Email: {userInfo.email}</p>

        <p>Mobile: {userInfo.mobile || userInfo.telephone}</p>

        <hr />
        */}

        <div  className="my-orders-select-date"  >
            <label htmlFor="order-date">
                {isRTL ? "اختار تاريخ الطلب:" : "Select order date:"}
            </label>

            <input
                id="order-date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
            />
        </div>

        {selectedDate && !loading && orders.length > 0 && (
            <div className="my-orders-list">

                <h2>{isRTL ? "الطلبات فى " : "Orders on " } {selectedDate} </h2>

                {orders.map((order) => (
                <div className="my-order-card" key={order._id}>

                    {/* ORDER HEADER */}
                    <div className="my-order-header">

                        <div>
                            <h3>
                                Order #{order._id.slice(-6).toUpperCase()}
                            </h3>

                            <p>
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                        </div>

                        <span className="my-order-status">
                            {order.orderStatus}
                        </span>

                    </div>

                    {/* ORDER ITEMS */}
                    <div className="my-order-items">

                    {order.items?.map((item, index) => (
                        <div  className="my-order-item"   key={index} >

                            <img
                                src={item.image}
                                alt={item.name?.en || "Product"}
                            />

                            <div className="my-order-item-info">

                                <h4>
                                    {isRTL ? item.name?.ar : item.name?.en || "Product"}
                                </h4>

                                {item.displayName && (
                                <p>{item.displayName}</p>
                                )}

                                <p>
                                    Quantity: {item.quantity}
                                </p>

                                <p>
                                    Price: {Number(item.price || 0).toFixed(2)} EGP
                                </p>

                            </div>

                            <strong>
                                {(
                                Number(item.price || 0) *
                                Number(item.quantity || 0)
                                ).toFixed(2)}{" "}
                                EGP
                            </strong>

                        </div>
                    ))}

                    </div>

                    {/* ORDER DETAILS */}
                    <div className="my-order-details">

                        <p>
                            <span>Subtotal:</span>
                            <strong>
                                {Number(order.subtotal || 0).toFixed(2)} EGP
                            </strong>
                        </p>

                        <p>
                            <span>Delivery:</span>
                            <strong>
                                {Number(order.deliveryFee || 0).toFixed(2)} EGP
                            </strong>
                        </p>

                        <p className="my-order-total">
                            <span>Total:</span>
                            <strong>
                                {Number(order.totalPrice || 0).toFixed(2)} EGP
                            </strong>
                        </p>

                        <p>
                            <span>Delivery method:</span>
                            <strong>
                                {order.deliveryMethod || "N/A"}
                            </strong>
                        </p>

                        <p>
                            <span>Payment method:</span>
                            <strong>
                                {order.paymentMethod || "N/A"}
                            </strong>
                        </p>

                        <p>
                            <span>Payment status:</span>
                            <strong>
                                {order.paymentStatus || "N/A"}
                            </strong>
                        </p>

                        </div>

                    </div>
                    ))}

            </div>
        )}

        {loading && <p>Loading orders...</p>}

        {selectedDate && !loading && orders.length === 0 && (
            <p>No orders found for this date.</p>
        )}


    </div>
  );
};

export default MyOrders;