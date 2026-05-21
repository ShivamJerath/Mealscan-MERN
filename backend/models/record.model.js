import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["MESS", "CANTEEN"],
      required: true,
    },
    mealType: {
      type: String,
      required: [true, "Meal type is required"],
      trim: true,
    },
    items: {
      type: String,
      required: [true, "Items are required"],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: 0.01,
    },
    recordDate: {
      type: Date,
      required: [true, "Record date is required"],
    },
  },
  { timestamps: true }
);

const Record = mongoose.model("Record", recordSchema);
export default Record;
