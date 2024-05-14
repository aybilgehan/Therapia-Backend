const express = require("express");
const router = express.Router();

const userController = require("../page.controller/user.controller.js");
const mhpController = require("../page.controller/mhp.controller.js");
const mw = require("../middlewares/mw.js");

const multer = require("multer");

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 1024 * 1024 * 1},
    fileFilter: (req, file, cb) => {
        // Yalnızca belirli dosya türlerine izin ver
        const allowedFileTypes = ['.pdf'];
        const extname = path.extname(file.originalname).toLowerCase();
        if (allowedFileTypes.includes(extname)) {
            return cb(null, true);
        } else {
            return cb(new Error('Yalnızca PDF dosyalarına izin verilir.'));
        }
    }
});

router.get("/api/results", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsUser, userController.getResults) // Get Results
router.get("/api/testresult", mw.verifyJWT, userController.getResults)
router.put("/api/information", mw.verifyJWT, mw.checkUserLoggedIn, userController.updateInformation) // Information Update
router.put("/api/result/permission/:id", mw.verifyJWT, mw.checkUserLoggedIn, mw.checkIsUser, userController.updateEvaluationPermission) // Evaluation Update

// Application for the user role and upload multiple files
router.post("/api/apply", mw.verifyJWT, mw.checkUserLoggedIn, upload.any('files'), userController.apply);






module.exports = router;