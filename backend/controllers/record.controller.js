import Record from "../models/record.model.js";

// POST /api/record - create a record (contractors only)
export const createRecord = async (req, res) => {
  try {
    const { studentId, mealType, items, cost, recordDate } = req.body;

    if (!studentId || !mealType || !items || !cost || !recordDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const type =
      req.user.role === "MESS_CONTRACTOR" ? "MESS" : "CANTEEN";

    const record = await Record.create({
      student: studentId,
      contractor: req.user._id,
      type,
      mealType,
      items,
      cost,
      recordDate: new Date(recordDate),
    });

    const populated = await record.populate([
      { path: "student", select: "name email" },
      { path: "contractor", select: "name email" },
    ]);

    res.status(201).json({ message: "Record created successfully", record: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/record/student - get records for logged-in student
export const getStudentRecords = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { student: req.user._id };
    if (type) query.type = type.toUpperCase();

    const records = await Record.find(query)
      .populate("contractor", "name email")
      .sort({ recordDate: -1 });

    res.status(200).json({ records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/record/contractor - get records uploaded by logged-in contractor
export const getContractorRecords = async (req, res) => {
  try {
    const records = await Record.find({ contractor: req.user._id })
      .populate("student", "name email")
      .populate("contractor", "name email")
      .sort({ recordDate: -1 });

    res.status(200).json({ records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/record/bill - get monthly bill for student
export const getMonthlyBill = async (req, res) => {
  try {
    const { type, year, month } = req.query;

    if (!type || !year || !month) {
      return res.status(400).json({ message: "type, year, and month are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await Record.find({
      student: req.user._id,
      type: type.toUpperCase(),
      recordDate: { $gte: startDate, $lte: endDate },
    })
      .populate("contractor", "name email")
      .sort({ recordDate: 1 });

    const total = records.reduce((sum, r) => sum + r.cost, 0);

    res.status(200).json({ records, total, month, year, type });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/record/:id - delete a record (contractor only, own records)
export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOne({
      _id: req.params.id,
      contractor: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found or not authorized" });
    }

    await record.deleteOne();
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/record/stats - contractor stats
export const getContractorStats = async (req, res) => {
  try {
    const records = await Record.find({ contractor: req.user._id }).populate(
      "student",
      "name"
    );

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRecords = records.length;
    const todayRecords = records.filter((r) => new Date(r.recordDate) >= todayStart).length;
    const weeklyRecords = records.filter((r) => new Date(r.recordDate) >= weekAgo).length;

    const totalEarnings = records.reduce((s, r) => s + r.cost, 0);
    const monthlyEarnings = records
      .filter((r) => new Date(r.recordDate) >= monthStart)
      .reduce((s, r) => s + r.cost, 0);
    const weeklyEarnings = records
      .filter((r) => new Date(r.recordDate) >= weekAgo)
      .reduce((s, r) => s + r.cost, 0);
    const avgMealCost = totalRecords > 0 ? totalEarnings / totalRecords : 0;

    // Meal type breakdown
    const mealTypeCounts = {};
    const mealTypeEarnings = {};
    records.forEach((r) => {
      mealTypeCounts[r.mealType] = (mealTypeCounts[r.mealType] || 0) + 1;
      mealTypeEarnings[r.mealType] = (mealTypeEarnings[r.mealType] || 0) + r.cost;
    });

    // Student spending
    const studentSpending = {};
    records.forEach((r) => {
      const name = r.student?.name || "Unknown";
      studentSpending[name] = (studentSpending[name] || 0) + r.cost;
    });

    // Monthly breakdown
    const monthlyBreakdown = {};
    records.forEach((r) => {
      const d = new Date(r.recordDate);
      const key = `${d.toLocaleString("default", { month: "long" })} ${d.getFullYear()}`;
      if (!monthlyBreakdown[key]) monthlyBreakdown[key] = { records: 0, earnings: 0 };
      monthlyBreakdown[key].records += 1;
      monthlyBreakdown[key].earnings += r.cost;
    });

    // Recent activity (last 10)
    const recentActivity = [...records]
      .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))
      .slice(0, 10)
      .map((r) => ({
        studentName: r.student?.name,
        mealType: r.mealType,
        cost: r.cost,
        date: r.recordDate,
        items: r.items,
      }));

    res.status(200).json({
      stats: {
        totalRecords,
        todayRecords,
        weeklyRecords,
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        avgMealCost,
        mealTypeCounts,
        mealTypeEarnings,
        studentSpending,
      },
      recentActivity,
      monthlyBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
