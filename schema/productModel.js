const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
      required: true,
    },
    sizes: {
      type: [String], // Example: ['S', 'M', 'L', 'XL']
      required: true,
    },
    colors: {
      type: [String], // Example: ['Red', 'Blue', 'Green']
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
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
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
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
      },
    ],
    images: {
      type: [String], // Array of image URLs or paths
      required: true,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isBestSelling: {
      type: Boolean,
      default: false,
    },
    isTopRated: {
      type: Boolean,
      default: false,
    },
    isMostPopular: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number, // Sale price, if the product is on sale
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
