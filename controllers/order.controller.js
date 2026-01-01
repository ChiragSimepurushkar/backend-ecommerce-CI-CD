// // import paypal from "@paypal/checkout-server-sdk";
// import ProductModel from "../models/product.model.js";
// import OrderModel from "../models/order.model.js";
// import paypal from "@paypal/checkout-server-sdk";

// export const createOrderController = async (request, response) => {
//     try {

//         let order = new OrderModel({
//             userId: request.body.userId,
//             products: request.body.products,
//             paymentId: request.body.paymentId,
//             payment_status: request.body.payment_status,
//             delivery_address: request.body.delivery_address,
//             totalAmt: request.body.totalAmt,
//             date: request.body.date
//         });

//         order = await order.save();

//         if (!order) {
//             response.status(500).json({
//                 error: true,
//                 success: false
//             })
//         }

//         for (let i = 0; i < request.body.products.length; i++) {
//             await ProductModel.findByIdAndUpdate(
//                 request.body.products[i].productId,
//                 {
//                     countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),
//                 },
//                 { new: true }
//             );
//         }

//         return response.status(200).json({
//             error: false,
//             success: true,
//             message: "Order Placed Successfully",
//             order: order
//         });

//     } catch (error) {
//         return response.status(500).json({
//             error: true,
//             success: false,
//             message: error.message
//         });
//     }
// }

// export async function getOrderDetailsController(request, response) {
//     try {
//         const userId = request.userId; // order id

//         const orderlist = await OrderModel.find({ userId: userId }).sort({ createdAt: -1 }).
//         populate('delivery_address', 'User')

//         return response.json({
//             message: "order list",
//             data: orderlist,
//             error: false,
//             success: true
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         })
//     }
// }

// export const createOrderPaypalController = async (request, response) => {
//     try {
//         const req = new paypal.orders.OrdersCreateRequest();
//         req.prefer("return=representation");

//         // Define the transaction details
//         req.requestBody({
//             intent: "CAPTURE",
//             purchase_units: [{
//                 amount: {
//                     currency_code: 'USD',
//                     value: request.query.totalAmount // Amount converted to USD on frontend
//                 }
//             }]
//         });

//         // Execute the request through the PayPal client
//         const client = getPayPalClient();
//         const order = await client.execute(req);

//         // Return the PayPal Order ID to the frontend
//         return response.json({
//             id: order.result.id
//         });

//     } catch (error) {
//         console.error(error);
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// };

// export const captureOrderPaypalController = async (request, response) => {
//     try {
//         const { paymentId } = request.body;

//         // Initialize the capture request
//         const req = new paypal.orders.OrdersCaptureRequest(paymentId);
//         req.requestBody({});

//         // Map request data to the local Order model structure
//         const orderInfo = {
//             userId: request.body.userId,
//             products: request.body.products,
//             paymentId: request.body.paymentId,
//             payment_status: request.body.payment_status,
//             delivery_address: request.body.delivery_address,
//             totalAmt: request.body.totalAmount,
//             date: request.body.date
//         };

//         // Execute the capture and save the order
//         const order = new OrderModel(orderInfo);
//         await order.save();

//         // Update inventory: decrement stock for each purchased product
//         for (let i = 0; i < request.body.products.length; i++) {
//             await ProductModel.findByIdAndUpdate(
//                 request.body.products[i].productId,
//                 {
//                     // Calculate new stock level
//                     countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),
//                 },
//                 { new: true }
//             );
//         }

//         // Return success response to the frontend
//         return response.status(200).json({
//             success: true,
//             error: false,
//             order: order,
//             message:"Order Placed Successfully"
//         });

//     } catch (error) {
//         // Log and return error status
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// };

// function getPayPalClient() {
//     const environment = process.env.PAYPAL_MODE === "live"
//         ? new paypal.core.LiveEnvironment(
//             process.env.PAYPAL_CLIENT_ID_LIVE,
//             process.env.PAYPAL_SECRET_LIVE
//         )
//         : new paypal.core.SandboxEnvironment(
//             process.env.PAYPAL_CLIENT_ID_TEST,
//             process.env.PAYPAL_SECRET_TEST
//         );

//     return new paypal.core.PayPalHttpClient(environment);
// }





import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import paypal from "@paypal/checkout-server-sdk";
import UserModel from '../models/user.model.js'


export const createOrderController = async (request, response) => {
    try {
        let order = new OrderModel({
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: request.body.payment_status,
            delivery_address: request.body.delivery_address,
            totalAmt: request.body.totalAmt,
            date: request.body.date
        });

        order = await order.save();

        if (!order) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        for (let i = 0; i < request.body.products.length; i++) {
            await ProductModel.findByIdAndUpdate(
                request.body.products[i].productId,
                {
                    countInStock: parseInt(request.body.products[i].countInStock - request.body.products[i].quantity),
                },
                { new: true }
            );
        }

        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed Successfully",
            order: order
        });

    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message
        });
    }
}

export async function getOrderDetailsController(request, response) {
    try {
        const { page, limit } = request.query;
        const userId = request.userId;

        const orderlist = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate('userId')  // Populate user info
            .populate('delivery_address') // Populate address info
            .skip((page - 1) * limit).limit(parseInt(limit));

        const total = await OrderModel.countDocuments();

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Get Orders Error:", error);  // Add logging
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const createOrderPaypalController = async (request, response) => {
    try {
        const { totalAmount } = request.query;

        // Validate amount
        if (!totalAmount || isNaN(totalAmount)) {
            return response.status(400).json({
                message: "Invalid amount provided",
                error: true,
                success: false
            });
        }

        // Get PayPal client
        const client = getPayPalClient();

        // Create PayPal order request
        const req = new paypal.orders.OrdersCreateRequest();
        req.prefer("return=representation");

        // Define the transaction details
        req.requestBody({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: parseFloat(totalAmount).toFixed(2)
                }
            }]
        });

        // Execute the request through the PayPal client
        const order = await client.execute(req);

        // Return the PayPal Order ID to the frontend
        return response.json({
            id: order.result.id,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("PayPal Create Order Error:", error);
        return response.status(500).json({
            message: error.message || "Failed to create PayPal order",
            error: true,
            success: false
        });
    }
};

export const captureOrderPaypalController = async (request, response) => {
    try {
        const { paymentId } = request.body;

        if (!paymentId) {
            return response.status(400).json({
                message: "Payment ID is required",
                error: true,
                success: false
            });
        }

        // Get PayPal client
        const client = getPayPalClient();

        // Initialize the capture request
        const req = new paypal.orders.OrdersCaptureRequest(paymentId);
        req.requestBody({});

        // Execute the capture
        const capture = await client.execute(req);

        // Verify capture was successful
        if (capture.result.status !== 'COMPLETED') {
            throw new Error('Payment capture failed');
        }

        // Map request data to the local Order model structure
        const orderInfo = {
            userId: request.body.userId,
            products: request.body.products,
            paymentId: request.body.paymentId,
            payment_status: "COMPLETED",
            delivery_address: request.body.delivery_address,
            totalAmt: request.body.totalAmount,
            date: request.body.date
        };

        // Save the order
        const order = new OrderModel(orderInfo);
        await order.save();

        // Update inventory: decrement stock for each purchased product
        for (let i = 0; i < request.body.products.length; i++) {
            const product = request.body.products[i];
            await ProductModel.findByIdAndUpdate(
                product.productId,
                {
                    countInStock: parseInt(product.countInStock - product.quantity)
                },
                { new: true }
            );
        }

        // Return success response to the frontend
        return response.status(200).json({
            success: true,
            error: false,
            order: order,
            message: "Order Placed Successfully"
        });

    } catch (error) {
        console.error("PayPal Capture Error:", error);
        return response.status(500).json({
            message: error.message || "Failed to capture payment",
            error: true,
            success: false
        });
    }
};

function getPayPalClient() {
    const environment = process.env.PAYPAL_MODE === "live"
        ? new paypal.core.LiveEnvironment(
            process.env.PAYPAL_CLIENT_ID_LIVE,
            process.env.PAYPAL_SECRET_LIVE
        )
        : new paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID_TEST,
            process.env.PAYPAL_SECRET_TEST
        );

    return new paypal.core.PayPalHttpClient(environment);
}


export const updateOrderStatusController = async (request, response) => {
    try {
        const { id, order_status } = request.body;

        const updateOrder = await OrderModel.updateOne(
            {
                _id: id,
            },
            {
                order_status: order_status,
            },
            { new: true }
        )
        return response.status(200).json({
            message: "Updated Order Status successfully",
            success: true,
            error: false,
            data: updateOrder,
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
}

export const getOrderCountController = async (request, response) => {
    try {
        const count = await OrderModel.countDocuments();

        return response.status(200).json({
            success: true,
            error: false,
            count: count
        });

    } catch (error) {
        console.error("Order Count Error:", error);
        return response.status(500).json({
            success: false,
            error: true,
            message: error.message
        });
    }
};


export const totalSalesController = async (request, response) => {
    try {
        const currentYear = new Date().getFullYear();
        const ordersList = await OrderModel.find();

        let totalSales = 0;
        let monthlySales = [
            { name: 'JAN', TotalSales: 0 },
            { name: 'FEB', TotalSales: 0 },
            { name: 'MAR', TotalSales: 0 },
            { name: 'APR', TotalSales: 0 },
            { name: 'MAY', TotalSales: 0 },
            { name: 'JUN', TotalSales: 0 },
            { name: 'JUL', TotalSales: 0 },
            { name: 'AUG', TotalSales: 0 },
            { name: 'SEP', TotalSales: 0 },
            { name: 'OCT', TotalSales: 0 },
            { name: 'NOV', TotalSales: 0 },
            { name: 'DEC', TotalSales: 0 }
        ];

        for (let i = 0; i < ordersList.length; i++) {
            totalSales = totalSales + parseInt(ordersList[i].totalAmt);

            const str = JSON.stringify(ordersList[i]?.createdAt);
            const year = str.substr(1, 4);
            const monthStr = str.substr(6, 8);
            const month = parseInt(monthStr.substr(0, 2));

            if (currentYear == year) {
                // Adjust index as array is 0-based and months are 1-12
                if (month >= 1 && month <= 12) {
                    monthlySales[month - 1].TotalSales += parseInt(ordersList[i].totalAmt);
                }
            }
        }

        return response.status(200).json({
            totalSales: totalSales,
            monthlySales: monthlySales,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


export const totalUsersController = async (request, response) => {
    try {
        // Aggregate users by year and month based on createdAt
        const users = await UserModel.aggregate([
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" }, 
                        month: { $month: "$createdAt" } 
                    },
                    count: { $sum: 1 },
                },
            },
            { 
                $sort: { "_id.year": 1, "_id.month": 1 } 
            },
        ]);

        // Initialize the monthly data structure
        let monthlyUsers = [
            { name: 'JAN', TotalUsers: 0 },
            { name: 'FEB', TotalUsers: 0 },
            { name: 'MAR', TotalUsers: 0 },
            { name: 'APR', TotalUsers: 0 },
            { name: 'MAY', TotalUsers: 0 },
            { name: 'JUN', TotalUsers: 0 },
            { name: 'JUL', TotalUsers: 0 },
            { name: 'AUG', TotalUsers: 0 },
            { name: 'SEP', TotalUsers: 0 },
            { name: 'OCT', TotalUsers: 0 },
            { name: 'NOV', TotalUsers: 0 },
            { name: 'DEC', TotalUsers: 0 }
        ];

        // Map the aggregated data into the monthlyUsers array
        for (let i = 0; i < users.length; i++) {
            const monthIndex = users[i]?._id?.month - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyUsers[monthIndex] = {
                    ...monthlyUsers[monthIndex],
                    TotalUsers: users[i].count
                };
            }
        }

        return response.status(200).json({
            TotalUsers: monthlyUsers,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}