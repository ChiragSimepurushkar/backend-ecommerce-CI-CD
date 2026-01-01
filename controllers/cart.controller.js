import CartProductModel from '../models/cartproduct.model.js';
import UserModel from '../models/user.model.js';

export const addToCartItemController = async (request, response) => {
    try {
        const userId = request.userId; // Retrieved from auth middleware
        const { productId } = request.body;
        if (!productId) {
            // NOTE: Status 402 is Payment Required, 400 Bad Request is typically used for missing fields.
            return response.status(402).json({
                message: "Provide productId",
                error: true,
                success: false
            });
        }

        // --- 2. Check for Existing Item (Duplicate Prevention) ---
        const checkItemCart = await CartProductModel.findOne({
            userId: userId,
            productId: productId
        });

        if (checkItemCart) {
            return response.status(400).json({
                message: "Item already in cart",
                // Note: Adding error/success flags for consistency
                error: true,
                success: false
            });
        }

        // --- 3. Create New Cart Item Document ---
        const cartItem = new CartProductModel({
            quantity: 1,
            userId: userId,
            productId: productId
        });

        const save = await cartItem.save();

        // --- 4. Update User Document (Add to shopping_cart array) ---
        const updateCartUser = await UserModel.updateOne(
            { _id: userId },
            {
                // $push operator adds the productId to the user's shopping_cart array
                $push: {
                    shopping_cart: productId
                }
            }
        );

        // --- 5. Send Success Response ---
        return response.status(200).json({
            data: save, // Returns the newly created cart item document
            message: "Item add successfully",
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
};

export const getCartItemController = async (request, response) => {
    try {
        const userId = request.userId; // Retrieved from auth middleware

        const cartItem = await CartProductModel.find({
            userId: userId
        }).populate('productId');

        return response.json({
            data: cartItem,
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
};

export const updateCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId; // Retrieved from auth middleware
        const { _id, qty,subTotal } = request.body;

        // --- 1. Initial Validation ---
        if (!_id || !qty) {
            return response.status(400).json({
                message: "provide _id, qty",
            });
        }

        // --- 2. Update Cart Item Quantity ---
        const updateCartItem = await CartProductModel.updateOne(
            {
                _id: _id,
                userId: userId // Ensure the user only updates their own item
            },
            {
                quantity: qty,
                subTotal:subTotal
            },{new:true}
        );

        // --- 3. Send Success Response ---
        return response.json({
            message: "Update cart",
            success: true,
            error: false,
            data: updateCartItem
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

// export const deleteCartItemQtyController = async (request, response) => {

//     try {
//         const userId = request.userId; // Retrieved from auth middleware
//         const { id  } = request.params;

//         // --- 1. Initial Validation ---
//         if (!id) {
//             return response.status(400).json({
//                 message: "Provide _id",
//                 error: true,
//                 success: false
//             });
//         }

//         // --- 2. Delete Cart Item ---
//         const deleteCartItem = await CartProductModel.deleteOne({
//             _id: id,
//             userId: userId // CRITICAL: Ensures the user only deletes their own item
//         });

//         // --- 3. Check Deletion Result ---
//         if (!deleteCartItem) { // Check the result object returned by deleteOne
//             return response.status(404).json({
//                 message: "The product in the cart is not found",
//                 error: true,
//                 success: false
//             });
//         }
//         return response.json({
//             message: "Item remove",
//             error: false,
//             success: true,
//             data: deleteCartItem
//         });

//     } catch (error) {
//         return response.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false
//         });
//     }
// };

export const deleteCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId; // Retrieved from auth middleware
        const { id } = request.params;

        // --- 1. Initial Validation ---
        if (!id) {
            return response.status(400).json({
                message: "Provide _id",
                error: true,
                success: false
            });
        }

        // --- 2. Delete Cart Item ---
        const deleteCartItem = await CartProductModel.deleteOne({
            _id: id,
            userId: userId // CRITICAL: Ensures the user only deletes their own item
        });

        // --- 3. Check Deletion Result ---
        if (!deleteCartItem) { // Check the result object returned by deleteOne
            return response.status(404).json({
                message: "The product in the cart is not found",
                error: true,
                success: false
            });
        }
        return response.json({
            message: "Item remove",
            error: false,
            success: true,
            data: deleteCartItem
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};