const express = require("express");
const router = express.Router();

const userController = require("../page.controller/user.controller.js");
const mw = require("../middlewares/mw.js");


router.get("/api/results", mw.checkUserLoggedIn, mw.checkIsUser, userController.getResults) // Get Results
router.put("/api/information", mw.checkUserLoggedIn, userController.updateInformation) // Information Update






module.exports = router;