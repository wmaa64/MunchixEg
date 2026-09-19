import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useTranslation } from "react-i18next";


const Statistics = () => {

    const { i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

  // ========================================
  // State
  // ========================================

  const [statistics, setStatistics] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // ========================================
  // Fetch statistics
  // ========================================

  const fetchStatistics = async (from = "", to = "") => {

    try {

      setLoading(true);
      setError("");


      let url = "/api/statistics";

      const params = new URLSearchParams();


      if (from) {
        params.append("from", from);
      }

      if (to) {
        params.append("to", to);
      }


      if (params.toString()) {
        url += `?${params.toString()}`;
      }


      const response = await fetch(url);


      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }


      const data = await response.json();


      setStatistics(data);


    } catch (error) {

      console.error(
        "❌ Error fetching statistics:",
        error
      );

      setError("Failed to load statistics.");

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // Load statistics when page opens
  // ========================================

  useEffect(() => {

    fetchStatistics();

  }, []);


  // ========================================
  // Apply date filter
  // ========================================

  const handleApplyFilter = () => {

    fetchStatistics(
      fromDate,
      toDate
    );

  };


  // ========================================
  // Clear date filter
  // ========================================

  const handleClearFilter = () => {

    setFromDate("");
    setToDate("");

    fetchStatistics();

  };


  // ========================================
  // Format money
  // ========================================

  const formatMoney = (value) => {

    return Number(value || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };
  // ========================================
  // Format type
  // ========================================

const formatProductType = (type) => {

  if (type === "meal") {
    return "Meal";
  }

  if (type === "item") {
    return "Item";
  }

  return type || "N/A";

};

const getZoneChartGradient = (zones) => {

  if (!zones || zones.length === 0) {
    return "conic-gradient(#ddd 0% 100%)";
  }

  const totalSales = zones.reduce((sum, zone) => sum + Number(zone.sales || 0),   0  );

  if (totalSales <= 0) {
    return "conic-gradient(#ddd 0% 100%)";
  }

  const colors = [
    "#3498db",
    "#27ae60",
    "#f39c12",
    "#8e44ad",
    "#e74c3c",
    "#16a085",
    "#34495e",
    "#d35400",
  ];

  let currentPercentage = 0;

  const segments = zones.map((zone, index) => {

    const percentage =   (Number(zone.sales || 0) / totalSales) * 100;

    const start = currentPercentage;
    const end = currentPercentage + percentage;

    currentPercentage = end;

    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
};

  // ========================================
  // Render
  // ========================================

  return (

    <>
      <Head>
        <title>Statistics</title>
      </Head>


      <div className="statistics-page" dir={isRTL ? "rtl" : "ltr"}>


        {/* ========================================
            Page Header
        ======================================== */}

        <div className="statistics-header">

          <div>

            <h1>{isRTL ? "إحصائيات" : "Statistics"}</h1>

            <p>
              {isRTL ? "نظرة عامة على المبيعات والشراء" : "Sales and purchasing overview"}
            </p>

          </div>

        </div>


        {/* ========================================
            Date Filter
        ======================================== */}

        <div className="statistics-filter">

          <div className="statistics-filter-field">

            <label>{isRTL ? "من" : "From"}</label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />

          </div>


          <div className="statistics-filter-field">

            <label>{isRTL ? "إلى" : "To"}</label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />

          </div>


          <button
            className="statistics-apply-button"
            onClick={handleApplyFilter}
            disabled={loading}
          >
            {loading ? "Loading..." : (isRTL ? "تطبيق" : "Apply") }
          </button>


          <button
            className="statistics-clear-button"
            onClick={handleClearFilter}
            disabled={loading}
          >
            {isRTL ? "مسح" : "Clear"}
          </button>

        </div>


        {/* ========================================
            Error
        ======================================== */}

        {error && (

          <div className="statistics-error">

            {error}

          </div>

        )}


        {/* ========================================
            Loading
        ======================================== */}

        {loading && !statistics && (

          <div className="statistics-loading">

            {isRTL ? "جارٍ تحميل الإحصائيات..." : "Loading statistics..."}

          </div>

        )}


        {/* ========================================
            Statistics Cards
        ======================================== */}

        {statistics && (

          <div className="statistics-cards">


            {/* Total Orders */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "إجمالي الطلبات" : "Total Orders"}

              </div>

              <div className="statistics-card-value">

                {statistics.totalOrders}

              </div>

            </div>


            {/* Sales Orders */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "طلبات البيع" : "Sales Orders"}

              </div>

              <div className="statistics-card-value">

                {statistics.salesOrders}

              </div>

            </div>


            {/* Total Sales */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "إجمالي المبيعات" : "Total Sales"}

              </div>

              <div className="statistics-card-value">

                {formatMoney(
                  statistics.totalSales
                )}{" "}

                {isRTL ? "ج.م" : "EGP"}

              </div>

            </div>


            {/* Subtotal */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "إجمالي الوسيط" : "Total Subtotal"}

              </div>

              <div className="statistics-card-value">

                {formatMoney(
                  statistics.totalSubtotal
                )}{" "}

                {isRTL ? "ج.م" : "EGP"}

              </div>

            </div>


            {/* Delivery Fees */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "رسوم التوصيل" : "Delivery Fees"}

              </div>

              <div className="statistics-card-value">

                {formatMoney(
                  statistics.totalDeliveryFees
                )}{" "}

                {isRTL ? "ج.م" : "EGP"}

              </div>

            </div>


            {/* Average Order Value */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "متوسط قيمة الطلب" : "Average Order Value"}

              </div>

              <div className="statistics-card-value">

                {formatMoney(
                  statistics.averageOrderValue
                )}{" "}

                {isRTL ? "ج.م" : "EGP"}

              </div>

            </div>


            {/* Items Sold */}

            <div className="statistics-card">

              <div className="statistics-card-title">

                {isRTL ? "العناصر المباعة" : "Items Sold"}

              </div>

              <div className="statistics-card-value">

                {statistics.totalItemsSold}

              </div>

            </div>


          </div>

        )}

        {/* ========================================
            Product Sales
        ======================================== */}

        {statistics?.productSales?.products?.length > 0 && (

        <div className="statistics-section">

            <div className="statistics-section-header">

            <h2>
                {isRTL ? "مبيعات المنتج" : "Product Sales"}
            </h2>

            <p>
                {isRTL ? "المنتجات المشتراة خلال الفترة المحددة" : "Products purchased during the selected period"}
            </p>

            </div>


            <div className="statistics-table-wrapper">

            <table className="statistics-table">

                <thead>

                <tr>

                    <th>
                    #
                    </th>

                    <th>
                    {isRTL ? "المنتج" : "Product"}
                    </th>

                    <th>
                    {isRTL ? "النوع" : "Type"}
                    </th>

                    <th>
                    {isRTL ? "الفئة الفرعية" : "Subcategory"}
                    </th>

                    <th>
                    {isRTL ? "الكمية" : "Quantity"}
                    </th>

                    <th>
                    {isRTL ? "الإيرادات" : "Revenue"}
                    </th>

                </tr>

                </thead>


                <tbody>

                {statistics.productSales.products.map(
                    (product, index) => (

                    <tr key={product.productId}>

                        <td>
                        {index + 1}
                        </td>

                        <td>

                        <div className="statistics-product-name">

                            {product.name}

                        </div>

                        </td>

                        <td>

                        <span
                            className={`statistics-type statistics-type-${product.producttype}`}
                        >

                            {formatProductType(
                            product.producttype
                            )}

                        </span>

                        </td>

                        <td>

                        {product.subcategory}

                        </td>

                        <td>

                        {product.quantitySold}

                        </td>

                        <td>

                        <strong>

                            {formatMoney(
                            product.revenue
                            )}{" "}

                            EGP

                        </strong>

                        </td>

                    </tr>

                    )
                )}

                </tbody>

            </table>

            </div>

        </div>

        )}

        {/* ========================================
            Subcategory Sales
        ======================================== */}

        {statistics?.productSales?.subcategories?.length > 0 && (

        <div className="statistics-section">

            <div className="statistics-section-header">

            <h2>
                {isRTL ? "المبيعات حسب نوع المنتج" : "Sales by Subcategory"}
            </h2>

            <p>
                {isRTL ? "المبيعات مجمعة حسب نوع المنتج" : "Sales grouped by product subcategory"}
            </p>

            </div>


            <div className="statistics-table-wrapper">

            <table className="statistics-table">

                <thead>

                <tr>

                    <th>
                    #
                    </th>

                    <th>
                    {isRTL ? "الفئة الفرعية" : "Subcategory"}
                    </th>

                    <th>
                    {isRTL ? "الكمية المباعة" : "Quantity Sold"}
                    </th>

                    <th>
                    {isRTL ? "الإيرادات" : "Revenue"}
                    </th>

                </tr>

                </thead>


                <tbody>

                {statistics.productSales.subcategories.map(
                    (subcategory, index) => (

                    <tr
                        key={subcategory.subcategoryId}
                    >

                        <td>
                        {index + 1}
                        </td>

                        <td>

                        <div className="statistics-product-name">

                            {subcategory.name}

                        </div>

                        </td>

                        <td>

                        {subcategory.quantitySold}

                        </td>

                        <td>

                        <strong>

                            {formatMoney(
                            subcategory.revenue
                            )}{" "}

                            EGP

                        </strong>

                        </td>

                    </tr>

                    )
                )}

                </tbody>

            </table>

            </div>

        </div>

        )}

        {/* ========================================
            Sales by Delivery Zone
        ======================================== */}

        {statistics?.deliveryZoneSales?.length > 0 && (

        <div className="statistics-section">

            <div className="statistics-section-header">

            <h2>{isRTL ? "المبيعات حسب منطقة التسليم" : "Sales by Delivery Zone"}</h2>

            <p>
                {isRTL ? "المبيعات والطلبات مجمعة حسب منطقة التسليم" : "Sales and orders grouped by delivery zone"}
            </p>

            </div>


            {/* ================================
                Pie Chart
            ================================= */}

            <div className="statistics-zone-chart">

                <div
                    className="statistics-pie-chart"
                    style={{ background: getZoneChartGradient(statistics.deliveryZoneSales ),  }}
                >

                    <div className="statistics-pie-center">
                        <strong>{isRTL ? "المبيعات" : "Sales"}</strong>
                        <span>{isRTL ? "حسب المنطقة" : "By Zone"}</span>
                    </div>

                </div>


            {/* ================================
                Chart Legend
            ================================= */}

            <div className="statistics-zone-legend">

                {(() => {

                const totalSales = statistics.deliveryZoneSales.reduce( (sum, zone) => sum + Number(zone.sales || 0), 0);

                const colors = [
                    "#3498db",
                    "#27ae60",
                    "#f39c12",
                    "#8e44ad",
                    "#e74c3c",
                    "#16a085",
                    "#34495e",
                    "#d35400",
                ];

                return statistics.deliveryZoneSales.map( (zone, index) => {

                    const percentage = totalSales > 0  ? ( (Number(zone.sales || 0) / totalSales) * 100).toFixed(1) : 0;

                    return (
                        <div
                        key={zone.zone}
                        className="statistics-zone-legend-item"
                        >

                        <span
                            className="statistics-zone-color"
                            style={{
                            background:
                                colors[
                                index % colors.length
                                ],
                            }}
                        />

                        <div className="statistics-zone-legend-name">

                            <strong>
                            {zone.zone}
                            </strong>

                            <span>
                            {formatMoney(zone.sales)} EGP
                            </span>

                        </div>

                        <strong className="statistics-zone-percentage">
                            {percentage}%
                        </strong>

                        </div>
                    );
                    }
                );

                })()}

            </div>

            </div>


            {/* ================================
                Delivery Zone Table
            ================================= */}

            <div className="statistics-table-wrapper">

            <table className="statistics-table">

                <thead>

                <tr>
                    <th>#</th>
                    <th>{isRTL ? "منطقة التسليم" : "Delivery Zone"}</th>
                    <th>{isRTL ? "الطلبات" : "Orders"}</th>
                    <th>{isRTL ? "العناصر المباعة" : "Items Sold"}</th>
                    <th>{isRTL ? "المبيعات" : "Sales"}</th>
                    <th>{isRTL ? "رسوم التسليم" : "Delivery Fees"}</th>
                </tr>

                </thead>

                <tbody>

                {statistics.deliveryZoneSales.map(
                    (zone, index) => (

                    <tr key={zone.zone}>

                        <td>
                        {index + 1}
                        </td>

                        <td>

                        <div className="statistics-zone-name">
                            {zone.zone}
                        </div>

                        </td>

                        <td>
                        {zone.orders}
                        </td>

                        <td>
                        {zone.itemsSold}
                        </td>

                        <td>
                        <strong>
                            {formatMoney(zone.sales)} EGP
                        </strong>
                        </td>

                        <td>
                        {formatMoney(zone.deliveryFees)} EGP
                        </td>

                    </tr>

                    )
                )}

                </tbody>

            </table>

            </div>

        </div>

        )}
      </div>

    </>

  );

};


export default Statistics;