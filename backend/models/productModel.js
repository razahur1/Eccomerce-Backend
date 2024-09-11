import mongoose from "mongoose";

const reviewModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const sizeStockModel = new mongoose.Schema({
  size: {
    type: String,
    enum: ["S", "M", "L", "XL"],
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
});

const productModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    tags: [{ type: String }],
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      required: true,
    },
    sizes: {
      type: [sizeStockModel],
      required: true,
    },
    reviews: [reviewModel],
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    isOnSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
      default: null,
    },
    isBestSelling: {
      type: Boolean,
      default: false,
    },
    // isNew: {
    //   type: Boolean,
    //   default: false,
    // },
    // isTopRated: {
    //   type: Boolean,
    //   default: false,
    // },
    // isMostPopular: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("products", productModel);
