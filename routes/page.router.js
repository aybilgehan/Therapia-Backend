const express = require("express");
const router = express.Router();
const path = require("path");
const pageController = require("../page.controller/page.controller.js");
const mw = require("../middlewares/mw.js");


/* - WEBSITE GET ISLEMLERI - */
router.get("/", pageController.getMainPage);
router.get("/login", mw.checkUserNotLoggedIn, pageController.getLoginPage);
router.get("/register", mw.checkUserNotLoggedIn ,pageController.getRegisterPage);
router.get("/logout", mw.checkUserLoggedIn, pageController.getLogoutPage);


/* - WEBSITE POST ISLEMLERI - */
router.post("/login", pageController.postLoginPage);
router.post("/register", pageController.postRegisterPage);

/* - TEST ISLEMLERI - */

router.post("/testArticle",pageController.testArticle)

module.exports = router;