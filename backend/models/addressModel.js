import mongoose from "mongoose";

const addressModel = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    firstName:{
      type: String,
      required: true,
    },
    lastName:{
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
    // state: {
    //   type: String,
    // },
    country: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("address", addressModel);
