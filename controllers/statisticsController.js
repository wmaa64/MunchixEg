import Order from "../models/Order";
import Product from "../models/Product";
import Subcategory from "../models/Subcategory";

// ========================================
// Get Sales Overview
// ========================================

const getSalesOverview = async (from, to) => {

  const match = {};

  // --------------------------------
  // Date filter
  // --------------------------------

  if (from || to) {

    match.createdAt = {};

    if (from) {
      match.createdAt.$gte = new Date(from);
    }

    if (to) {
      const endDate = new Date(to);

      // Include the whole "to" day
      endDate.setDate(endDate.getDate() + 1);

      match.createdAt.$lt = endDate;
    }
  }


  // ========================================
  // Get all orders in the selected period
  // ========================================

  const orders = await Order.find(match).lean();


  // ========================================
  // Total orders
  // ========================================

  const totalOrders = orders.length;


  // ========================================
  // Sales calculations
  // ========================================

  const salesOrders = orders.filter(
    (order) => order.orderStatus !== "Cancelled"
  );


  let totalSales = 0;
  let totalSubtotal = 0;
  let totalDeliveryFees = 0;
  let totalItemsSold = 0;


  for (const order of salesOrders) {

    totalSales += Number(order.totalPrice || 0);

    totalSubtotal += Number(order.subtotal || 0);

    totalDeliveryFees += Number(order.deliveryFee || 0);


    if (Array.isArray(order.items)) {

      for (const item of order.items) {

        totalItemsSold += Number(item.quantity || 0);

      }

    }

  }


  // ========================================
  // Average order value
  // ========================================

  const averageOrderValue =  salesOrders.length > 0 ?  totalSales / salesOrders.length  : 0;


  // ========================================
  // Return result
  // ========================================

  return {

    totalOrders,

    salesOrders: salesOrders.length,

    totalSales: Number(totalSales.toFixed(2)),

    totalSubtotal: Number(totalSubtotal.toFixed(2)),

    totalDeliveryFees: Number(totalDeliveryFees.toFixed(2)),

    averageOrderValue: Number(averageOrderValue.toFixed(2)),

    totalItemsSold,

  };

};

// ========================================
// Get Product & Subcategory Sales Statistics
// ========================================

// ========================================
// Get Product & Subcategory Sales Statistics
// ========================================

const getProductSalesStatistics = async (from, to) => {

  const match = {};

  // --------------------------------
  // Date filter
  // --------------------------------

  if (from || to) {

    match.createdAt = {};

    if (from) {
      match.createdAt.$gte = new Date(from);
    }

    if (to) {

      const endDate = new Date(to);

      // Include the whole "to" day
      endDate.setDate(endDate.getDate() + 1);

      match.createdAt.$lt = endDate;
    }

  }


  // ========================================
  // Get orders
  // ========================================

  const orders = await Order.find({
    ...match,
    orderStatus: { $ne: "Cancelled" }
  }).lean();


  // ========================================
  // Get products
  // ========================================

  const products = await Product.find().lean();


  // ========================================
  // Get subcategories
  // ========================================

  const subcategories =
    await Subcategory.find().lean();


  // ========================================
  // Product lookup
  // ========================================

  const productMap = new Map();

  products.forEach((product) => {

    productMap.set(
      product._id.toString(),
      product
    );

  });


  // ========================================
  // Subcategory lookup
  // ========================================

  const subcategoryMap = new Map();

  subcategories.forEach((subcategory) => {

    subcategoryMap.set(
      subcategory._id.toString(),
      subcategory
    );

  });


  // ========================================
  // Product statistics
  // ========================================

  const productStats = new Map();


  // ========================================
  // Subcategory statistics
  // ========================================

  const subcategoryStats = new Map();


  // ========================================
  // Process orders
  // ========================================

  for (const order of orders) {

    if (!Array.isArray(order.items)) {
      continue;
    }


    for (const item of order.items) {

      if (!item.productId) {
        continue;
      }


      const productId =
        item.productId.toString();


      const product =
        productMap.get(productId);


      if (!product) {
        continue;
      }


      const quantity =
        Number(item.quantity || 0);


      const price =
        Number(item.price || 0);


      const revenue =
        price * quantity;


      // ========================================
      // PRODUCT STATISTICS
      // ========================================

      if (productStats.has(productId)) {

        const existing =
          productStats.get(productId);

        existing.quantitySold += quantity;

        existing.revenue += revenue;

      } else {

        const subcategoryId =
          product.subcategoryId
            ? product.subcategoryId.toString()
            : null;


        const subcategory =
          subcategoryId
            ? subcategoryMap.get(subcategoryId)
            : null;


        productStats.set(productId, {

          productId,

          name:
            product.name?.en || "",

          nameAr:
            product.name?.ar || "",

          producttype:
            product.producttype || "",

          subcategoryId,

          subcategory:
            subcategory?.name?.en || "No Subcategory",

          subcategoryAr:
            subcategory?.name?.ar || "بدون تصنيف فرعي",

          quantitySold: quantity,

          revenue,

        });

      }


      // ========================================
      // SUBCATEGORY STATISTICS
      // ========================================

      const subcategoryId =
        product.subcategoryId
          ? product.subcategoryId.toString()
          : null;


      if (!subcategoryId) {
        continue;
      }


      const subcategory =
        subcategoryMap.get(subcategoryId);


      if (!subcategory) {
        continue;
      }


      if (subcategoryStats.has(subcategoryId)) {

        const existing =
          subcategoryStats.get(subcategoryId);

        existing.quantitySold += quantity;

        existing.revenue += revenue;

      } else {

        subcategoryStats.set(
          subcategoryId,
          {

            subcategoryId,

            name:
              subcategory.name?.en || "",

            nameAr:
              subcategory.name?.ar || "",

            quantitySold:
              quantity,

            revenue,

          }
        );

      }

    }

  }


  // ========================================
  // Convert Maps to arrays
  // ========================================

  const productsStatistics =
    Array.from(
      productStats.values()
    );


  const subcategoriesStatistics =
    Array.from(
      subcategoryStats.values()
    );


  // ========================================
  // Sort
  // ========================================

  productsStatistics.sort(
    (a, b) =>
      b.quantitySold - a.quantitySold
  );


  subcategoriesStatistics.sort(
    (a, b) =>
      b.revenue - a.revenue
  );


  // ========================================
  // Round revenue
  // ========================================

  productsStatistics.forEach(
    (product) => {

      product.revenue =
        Number(
          product.revenue.toFixed(2)
        );

    }
  );


  subcategoriesStatistics.forEach(
    (subcategory) => {

      subcategory.revenue =
        Number(
          subcategory.revenue.toFixed(2)
        );

    }
  );


  // ========================================
  // Return
  // ========================================

  return {

    products:  productsStatistics,

    subcategories:  subcategoriesStatistics,

  };

};

// ========================================
// Get Sales by Delivery Zone
// ========================================

const getSalesByDeliveryZone = async (from, to) => {

  const match = {};

  // --------------------------------
  // Date filter
  // --------------------------------

  if (from || to) {

    match.createdAt = {};

    if (from) {
      match.createdAt.$gte = new Date(from);
    }

    if (to) {

      const endDate = new Date(to);

      // Include the whole "to" day
      endDate.setDate(endDate.getDate() + 1);

      match.createdAt.$lt = endDate;
    }

  }


  // ========================================
  // Get non-cancelled orders
  // ========================================

  const orders = await Order.find({ ...match, orderStatus: { $ne: "Cancelled" } }).lean();

  // ========================================
  // Delivery zone statistics
  // ========================================

  const zoneStats = new Map();


  // ========================================
  // Process orders
  // ========================================

  for (const order of orders) {

    // Pickup orders don't have a delivery zone
    if (!order.deliveryZone) {
      continue;
    }


    const zone =   order.deliveryZone;

    const orderSales =   Number(order.totalPrice || 0);

    const deliveryFee =   Number(order.deliveryFee || 0);

    // --------------------------------
    // Count items
    // --------------------------------

    let itemsQuantity = 0;

    if (Array.isArray(order.items)) {

      for (const item of order.items) {

        itemsQuantity +=   Number(item.quantity || 0);

      }

    }


    // --------------------------------
    // Existing zone
    // --------------------------------

    if (zoneStats.has(zone)) {

      const existing =  zoneStats.get(zone);

      existing.orders += 1;

      existing.itemsSold += itemsQuantity;

      existing.sales += orderSales;

      existing.deliveryFees += deliveryFee;

    }


    // --------------------------------
    // New zone
    // --------------------------------

    else {

      zoneStats.set(zone, {

        zone,

        orders: 1,

        itemsSold: itemsQuantity,

        sales: orderSales,

        deliveryFees: deliveryFee,

      });

    }

  }


  // ========================================
  // Convert Map to array
  // ========================================

  const statistics =   Array.from( zoneStats.values()  );

  // ========================================
  // Sort by sales
  // ========================================

  statistics.sort( (a, b) =>  b.sales - a.sales  );

  // ========================================
  // Format numbers
  // ========================================

  statistics.forEach((zone) => {

    zone.sales =   Number(zone.sales.toFixed(2));

    zone.deliveryFees =  Number(zone.deliveryFees.toFixed(2));

  });


  return statistics;

};

// ========================================
// Get Sales by Day of Week
// ========================================

const getSalesByDay = async (from, to) => {

  const match = {};

  if (from || to) {

    match.createdAt = {};

    if (from) {
      match.createdAt.$gte = new Date(from);
    }

    if (to) {
      const endDate = new Date(to);

      // Include the whole "to" day
      endDate.setDate(endDate.getDate() + 1);

      match.createdAt.$lt = endDate;
    }
  }

  const orders = await Order.find({
    ...match,
    orderStatus: { $ne: "Cancelled" }
  }).lean();


  // Always keep the week in the same order
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];


  // Create all 7 days with zero values
  const dayStats = {};

  days.forEach((day) => {

    dayStats[day] = {
      day,
      orders: 0,
      itemsSold: 0,
      revenue: 0,
    };

  });


  // Process orders
  for (const order of orders) {

    const orderDate = new Date(order.createdAt);

    const day = days[orderDate.getDay()];

    const revenue = Number(order.totalPrice || 0);


    let itemsQuantity = 0;

    if (Array.isArray(order.items)) {

      for (const item of order.items) {

        itemsQuantity += Number(
          item.quantity || 0
        );

      }

    }


    dayStats[day].orders += 1;

    dayStats[day].itemsSold += itemsQuantity;

    dayStats[day].revenue += revenue;

  }


  // Convert object to array
  const statistics = days.map((day) => {

    return {
      day,
      orders: dayStats[day].orders,
      itemsSold: dayStats[day].itemsSold,
      revenue: Number(
        dayStats[day].revenue.toFixed(2)
      ),
    };

  });


  return statistics;
};


export {
  getSalesOverview,
  getProductSalesStatistics,
  getSalesByDeliveryZone,
  getSalesByDay,
};
