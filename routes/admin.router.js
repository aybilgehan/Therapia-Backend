const express = require("express");
const router = express.Router();
const path = require("path");
const adminController = require("../page.controller/admin.controller.js");
const mw = require("../middlewares/mw.js");


/* - ADMIN ISLEMLERI - */
router.get("/api/applicants", adminController.getApplicants); // mw eklenecek

router.post("/api/approveApplicant/:id", adminController.approveApplicant); // mw eklenecek

module.exports = router;  