import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,  // Changed from String to ObjectId
        ref: "Product",  // Add reference - make sure this matches your Product model name
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    productTitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
    },
    discount: {
        type: Number,
    },
    size: {
        type: String,
    },
    weight: {
        type: String,
    },
    rams: {
        type: String,
    },
    subTotal: {
        type: Number,
        required: true
    },
    countInStock: {
        type: Number,
        required: true
    },
    brand: {
        type: String,
    },
},
    { timestamps: true }
)

const CartProductModel = mongoose.model('cart', cartProductSchema);

export default CartProductModel;