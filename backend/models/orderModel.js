import mongoose from "mongoose";
import { generateRandomHexCode } from "../helpers/codeHelper.js";

const orderItemModel = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    label: String,
    customSize: Object,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const shippingAddressModel = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  postalCode: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const orderModel = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    orderItems: [orderItemModel],
    shippingInfo: shippingAddressModel,
    mobileNumber: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD",
    },
    paymentInfo: {
      id: String,
      status: String,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderModel.pre("save", async function (next) {
  if (!this.code) {
    let isUnique = false;
    let newCode;

    while (!isUnique) {
      const randomHex = generateRandomHexCode(6);
      newCode = `O${randomHex}`;

      // Check if the code already exists
      const existingCategory = await mongoose
        .model("orders")
        .findOne({ code: newCode });
      if (!existingCategory) {
        isUnique = true;
      }
    }

    this.code = newCode;
  }
  next();
});

export default mongoose.model("orders", orderModel);
