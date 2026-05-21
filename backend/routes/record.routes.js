import express from "express";
import {
  createRecord,
  getStudentRecords,
  getContractorRecords,
  getMonthlyBill,
  deleteRecord,
  getContractorStats,
} from "../controllers/record.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.use(isAuth);

router.post("/", createRecord);
router.get("/student", getStudentRecords);
router.get("/contractor", getContractorRecords);
router.get("/bill", getMonthlyBill);
router.get("/stats", getContractorStats);
router.delete("/:id", deleteRecord);

export default router;
