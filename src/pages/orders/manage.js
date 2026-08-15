import React, { useState } from "react";

const ManageOrders = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusOptions = ["Pending", "Processing", "OutForDelivery", "Delivered"];

  // 🔍 Fetch orders created on the selected date
  const fetchOrdersByDate = async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?date=${date}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 🚚 Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (res.ok){
        alert(`Order Updated, orderStatus become: ${newStatus}`);
      } else {
        throw new Error("Failed to update order status");
      };

      // ✅ Update order in state
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (error) {
      console.error("❌ Error updating order status:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Daily Orders</h1>

      {/* 📅 Date selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Date: </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            const date = e.target.value;
            setSelectedDate(date);
            fetchOrdersByDate(date);
          }}
        />
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found for this date.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "15px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h3>📦 Order #{order._id.slice(-6)}</h3>
              <p>
                <strong>Email:</strong> {order.email} <br />
                <strong>Mobile:</strong> {order.mobile} <br />
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()} <br />
                <strong>Total:</strong> {order.totalPrice} EGP <br />
                <strong>Payment:</strong> {order.paymentStatus} <br />
                <strong>Status:</strong>{" "}
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </p>

              {/* 🧾 Order Items */}
              <div>
                <h4>Items:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        listStyleType: "none",
                        marginBottom: "10px",
                        borderBottom: "1px solid #eee",
                        paddingBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={item.image}
                          alt={item.name.en}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginRight: "10px",
                          }}
                        />
                        <div>
                          <p style={{ margin: 0 }}>
                            <strong>{item.name.en}</strong> ({item.name.ar})
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>{(item.selectedCategories.length > 0) ? item.displayName : ""}  </strong>
                          </p>
                          <p style={{ margin: 0 }}>
                            Qty: {item.quantity} × {item.price} EGP ={" "}
                            {item.quantity * item.price} EGP
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
