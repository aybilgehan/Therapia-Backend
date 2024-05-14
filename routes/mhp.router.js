const express = require("express");
const router = express.Router();
const path = require("path");
const mhpController = require("../page.controller/mhp.controller.js");
const mw = require("../middlewares/mw.js");

const multer = require("multer");

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 1024 * 1024 * 1},
    fileFilter: (req, file, cb) => {
        // Yalnızca belirli dosya türlerine izin ver
        const allowedFileTypes = ['.pdf', '.png', '.jpg', '.jpeg'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedFileTypes.includes(extname)) {
            return cb(null, true);
        } else {
            return cb(new Error('Yalnızca PDF dosyalarına izin verilir.'));
        }
    }
});

router.get("/api/results/evaluation", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsMHP, mhpController.getEvaluationResults);
router.post("/api/results/evaluation", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsMHP, mhpController.evaluateResult);
router.post("/api/upload", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsMHP ,upload.fields( [ {name: 'image', maxCount: 1}, { name: 'content', maxCount: 1}]), mhpController.uploadArticle);
// Application for the mhp role

router.post("/deneme", mw.deneme, upload.fields( [ {name: 'image', maxCount: 1}, { name: 'content', maxCount: 1}]), mhpController.testUpload);


module.exports = router;  