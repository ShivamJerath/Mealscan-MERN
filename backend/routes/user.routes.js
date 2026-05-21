import express from "express";
import {
  getAllStudents,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// All routes require auth
router.use(isAuth);

router.get("/students", getAllStudents);
router.get("/all", getAllUsers);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
