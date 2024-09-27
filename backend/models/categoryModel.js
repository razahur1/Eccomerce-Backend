import mongoose from "mongoose";

const categoryModel = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

categoryModel.pre("save", async function (next) {
  if (!this.code) {
    const lastCategory = await mongoose
      .model("categories")
      .findOne()
      .sort({ code: -1 });

    let nextCode = 1;

    if (lastCategory && lastCategory.code) {
      nextCode = parseInt(lastCategory.code.slice(1)) + 1;
    }

    this.code = `#${nextCode.toString().padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("categories", categoryModel);
