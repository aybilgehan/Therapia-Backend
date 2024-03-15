const express = require("express");
const router = express.Router();
const path = require("path");
const pageController = require("../page.controller/page.controller.js");
const authController = require("../page.controller/auth.controller.js");
const mw = require("../middlewares/mw.js");


/* - AUTH ISLEMLERI - */
router.post("/api/auth/signin", mw.checkUserNotLoggedIn, authController.signin); 
router.post("/api/auth/signup", mw.checkUserNotLoggedIn, authController.signup);
router.post("/api/auth/logout", mw.checkUserLoggedIn, authController.logout);
router.get("/api/auth/verify/:code", mw.checkUserNotLoggedIn, authController.verify);

/* - TEST ISLEMLERI - */

router.post("/testArticle",pageController.testArticle)

module.exports = router;