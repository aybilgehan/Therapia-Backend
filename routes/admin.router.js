const express = require("express");
const router = express.Router();
const path = require("path");
const adminController = require("../page.controller/admin.controller.js");
const mw = require("../middlewares/mw.js");


/* - ADMIN ISLEMLERI - */
router.get("/api/applicants", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsAdmin, adminController.getApplicants); // mw eklenecek
router.get("/api/applicants/:id", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsAdmin, adminController.getApplicant); // mw eklenecek

router.post("/api/approveApplicant/:id",mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsAdmin, adminController.approveApplicant); // mw eklenecek

module.exports = router;  