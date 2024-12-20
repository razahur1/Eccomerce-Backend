import mongoose from "mongoose";

const cartItemModel = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    label: {
      type: String,
      required: true,  
    },
    customSize: {
      type: Object, 
      default: null, 
    },
  },
});

const cartModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    items: [cartItemModel],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("cart", cartModel);
