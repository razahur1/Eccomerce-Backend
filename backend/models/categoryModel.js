import mongoose from "mongoose";
import { generateRandomHexCode } from "../helpers/codeHelper.js";

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
    let isUnique = false;
    let newCode;

    // Generate a unique code
    while (!isUnique) {
      // Generate a random 5-character hexadecimal code
      const randomHex = generateRandomHexCode(5); // 5 characters to leave space for the last letter
      newCode = `C${randomHex}${this.name[0].toUpperCase()}`; // Ensure it starts with 'C' and ends with the first letter of the category name

      // Check if the code already exists
      const existingCategory = await mongoose
        .model("categories")
        .findOne({ code: newCode });
      if (!existingCategory) {
        isUnique = true; // Code is unique
      }
    }

    this.code = newCode; // Assign the unique code
  }
  next();
});

export default mongoose.model("categories", categoryModel);
