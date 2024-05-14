const express = require("express");
const router = express.Router();
const pageController = require("../page.controller/page.controller.js");
const authController = require("../page.controller/auth.controller.js");
const mw = require("../middlewares/mw.js");


/* - AUTH ISLEMLERI - */
router.post("/api/auth/signin", mw.checkUserNotLoggedIn, authController.signin); 
router.post("/api/auth/signup", mw.checkUserNotLoggedIn, authController.signup);
router.post("/api/auth/logout", mw.verifyJWT, mw.checkUserLoggedIn, authController.logout);
router.get("/api/auth/verify/:code", mw.checkUserNotLoggedIn, authController.verify);


/* - PAGE ISLEMLERI - */
router.get("/api/articles", pageController.getArticles);

module.exports = router;