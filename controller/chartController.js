
const categoryCollection = require('../models/category')
 const collection = require('../models/user')
const orderCollection = require('../models/order')
const productCollection = require('../models/product');
 



const chart = async (req, res) => {
     if (req.session.admin) {
        try {
            // Aggregate data for the daily chart
            const dayChart = await orderCollection.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderTime" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 } // Sort by date in ascending order
                },
                {
                    $limit: 30 // Limit to the last 30 days
                }
            ]);

            // Aggregate data for the monthly chart
            const monthChart = await orderCollection.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$orderTime" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 } // Sort by month in ascending order
                }
            ]);

            // Aggregate data for the yearly chart
            const yearChart = await orderCollection.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y", date: "$orderTime" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 } // Sort by year in ascending order
                }
            ]);

            // Aggregate data for the payment method chart
            const paymentMethodChart = await orderCollection.aggregate([
                {
                    $group: {
                        _id: "$paymentMethod",
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Aggregate data for today's orders
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaysOrder = await orderCollection.countDocuments({
                orderTime: { $gte: today }
            });

            // Aggregate data for total orders
            const totalOrder = await orderCollection.countDocuments();

            // Aggregate data for average order count in the current year
            const avgOrder = await orderCollection.aggregate([
                {
                    $match: {
                        orderTime: { $gte: new Date(`${new Date().getFullYear()}-01-01`) }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgOrder: { $avg: 1 }
                    }
                }
            ]);

            // Aggregate data for average revenue
            const totalRevenue = await orderCollection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$orderTotal" },
                        count: { $sum: 1 }  
                    }
                }
            ]);

            console.log("totalRevenue aggregation result:", totalRevenue);

            console.log("todaysOrder is:", todaysOrder);
            console.log("totalOrder is:", totalOrder);
            console.log("avgOrder is:", avgOrder);
            console.log("totalRevenue is:", totalRevenue);

            console.log(dayChart);
            console.log(monthChart);
            console.log(yearChart);
            console.log(paymentMethodChart);
            console.log("todaysOrder is:", todaysOrder);
            console.log("totalOrder is:", totalOrder);
            console.log("avgOrder is:", avgOrder);
            console.log("totalRevenue is:", totalRevenue);

            const datesDay = dayChart.map(item => item._id);
            const orderCountsDay = dayChart.map(item => item.count);
            let dayData = { dates: datesDay, orderCounts: orderCountsDay };

            const datesMonth = monthChart.map(item => item._id);
            const orderCountsMonth = monthChart.map(item => item.count);
            let monthData = { dates: datesMonth, orderCounts: orderCountsMonth };

            const datesYear = yearChart.map(item => item._id);
            const orderCountsYear = yearChart.map(item => item.count);
            let yearData = { dates: datesYear, orderCounts: orderCountsYear };

            const paymentMethodLabels = paymentMethodChart.map(item => item._id);
            const orderCountsByPaymentMethod = paymentMethodChart.map(item => item.count);
            let paymentMethodData = { labels: paymentMethodLabels, orderCounts: orderCountsByPaymentMethod };

            // Send data as JSON response
            res.json({
                dayData,
                monthData,
                yearData,
                paymentMethodData,
                todaysOrder,
                totalOrder,
                avgOrder: avgOrder.length > 0 ? avgOrder[0].avgOrder : 0,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0
            });

            console.log("dayData is:", dayData);
            console.log("monthData is:", monthData);
            console.log("yearData is:", yearData);
            console.log("paymentMethodData is:", paymentMethodData);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
};


  module.exports={
    chart,
  }
