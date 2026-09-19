import {
            getSalesOverview, 
            getProductSalesStatistics, 
            getSalesByDeliveryZone, 
            getSalesByDay 
        } 
    from "../../../../controllers/statisticsController";


export default async function handler(req, res) {

  // ========================================
  // Only GET is allowed
  // ========================================

  if (req.method !== "GET") {

    return res.status(405).json({
      message: "Method not allowed",
    });

  }

    try {

    const { from, to } = req.query;


    // ========================================
    // Sales overview
    // ========================================

    const salesOverview =  await getSalesOverview( from,  to  );

    // ========================================
    // Product statistics
    // ========================================

    const productSales =   await getProductSalesStatistics( from,  to  );

    // ========================================
    // Delivery zone statistics
    // ========================================

    const deliveryZoneSales =  await getSalesByDeliveryZone(    from,    to  );

    // ========================================
    // Sales by day
    // ========================================

    const salesByDay = await getSalesByDay(from, to);

    // ========================================
    // Return all statistics
    // ========================================

    return res.status(200).json({ ...salesOverview,  productSales, deliveryZoneSales, salesByDay });


    } catch (error) {

    console.error(
        "❌ Error fetching statistics:",
        error
    );


    return res.status(500).json({

        message: "Failed to fetch statistics",

        error: error.message,

    });

    }

}