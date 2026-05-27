const express = require("express");
const {
    lookupIOC,
    getAllIOCs,
    getIOCById,
    updateIOC,
    deleteIOC,
    getDashboardStats,
    bulkLookup,
    exportReport
} = require("../controllers/iocController");

const router = express.Router();

router.post("/lookup", lookupIOC);
router.post("/bulk", bulkLookup);
router.get("/stats", getDashboardStats);
router.get("/", getAllIOCs);
router.get("/:id", getIOCById);
router.put("/:id", updateIOC);
router.delete("/:id", deleteIOC);
router.get("/:id/export", exportReport);

module.exports = router;