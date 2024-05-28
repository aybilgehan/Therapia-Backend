const express = require("express");
const router = express.Router();
const userController = require("../page.controller/user.controller.js");
const mw = require("../middlewares/mw.js");
const path = require("path");
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

router.get("/api/results", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsUser, userController.getResults) // Get Results
router.get("/api/result/:id", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsUser, userController.getResult) // Get Result
//router.get("/api/testresult", mw.verifyJWT, userController.getResults)
router.get("/api/information", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsMHP, userController.getInformation) // Get Information
router.put("/api/information", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsMHP, userController.updateInformation) // Information Update
router.put("/api/result/permission/:id", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsUser, userController.updateEvaluationPermission) // Evaluation Update

// Application for the user role and upload multiple files
router.post("/api/apply", mw.verifyJWT, mw.checkUserLoggedIn, upload.array('file', 5), userController.applyProfessional);

router.post("/api/test",  upload.fields( [  { name: 'file', maxCount: 5}, {name: 'photo', maxCount: 1}]), userController.applyProfessional);







module.exports = router;