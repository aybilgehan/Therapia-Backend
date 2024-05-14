const express = require("express");
const router = express.Router();
const mw = require("../middlewares/mw.js");
const analyzeMW = require("../middlewares/analyze.mw.js");
const analyzeController = require("../page.controller/analyze.controller.js");


/* - AUTH ISLEMLERI - */
router.post("/api/analyze", analyzeMW.checkTextLength, analyzeMW.verifyJWT, analyzeMW.checkAnalyzeCount, analyzeController.analyze ); 



module.exports = router;