import mongoose from "mongoose";

// Review Model
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
    default: 1,
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

// Stock per Size Model
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

// Main Product Model
const productModel = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    intro: {
      type: String,
      required: true,
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
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        required: true,
      },
    ],
    tags: [{ type: String }],
    gender: {
      type: String,
      enum: ["Men", "Women", "Kids", "Unisex"],
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
    highlights: {
      justIn: {
        type: Boolean,
        default: false,
      },
      popular: {
        type: Boolean,
        default: false,
      },
      valued: {
        type: Boolean,
        default: false,
      },
      adored: {
        type: Boolean,
        default: false,
      },
      trendy: {
        type: Boolean,
        default: false,
      },
      sale: {
        type: Boolean,
        default: false,
      },
    },
    salePrice: {
      type: Number,
      default: null,
    },
    saleEndDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

productModel.pre("save", async function (next) {
  if (!this.code) {
    const lastProduct = await mongoose
      .model("products")
      .findOne()
      .sort({ code: -1 });

    let nextCode = 1;

    if (lastProduct && lastProduct.code) {
      nextCode = parseInt(lastProduct.code.slice(1)) + 1;
    }

    this.code = `#${nextCode.toString().padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("products", productModel);
