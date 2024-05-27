const Application = require('../db.handler/application.model');
const User = require('../db.handler/user.model');
const transporter = require('../services/mail.service');


/**
 * @swagger
 * /admin/api/applicants:
 *   get:
 *     summary: Get applicants
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       information:
 *                         type: object
 *                       document:
 *                         type: array
 *                         items:
 *                           type: string
 *                       approved:
 *                         type: boolean
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *
 * admin/api/approveApplicant/{id}:
 *   post:
 *     summary: Approve applicant
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Applicant approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *       500:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 */

exports.getApplicants = async (req, res) => {
    try {
        let applicants = await Application.find({});
        res.status(200).send({
            data: applicants,
            message: "Applicants fetched successfully",
            success: true
        });
        return;
    } catch (error) {
        res.status(500).send({ 
            data: null,
            message: error,
            success: false 
        });
        return;
    }
}

exports.getApplicant = async (req, res) => {
    try {
        let applicant = await Application.findOne({ userId: req.params.id });
        res.status(200).send({
            data: applicant,
            message: "Applicant fetched successfully",
            success: true
        });
        return;
    } catch (error) {
        res.status(400).send({ 
            data: null,
            message: error,
            success: false 
        });
        return;
    }
}

exports.approveApplicant = async (req, res) => {
    try {
        let application = await Application.findOneAndUpdate(
            { userId: req.params.id },
            { approved: req.body.approved },
            { new: true }
        );

        await User.findOneAndUpdate(
            { _id: application.userId },
            { role: "mhp" },
            { new: true }
        );

        let user = await User.findOne({ _id: req.params.id });
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: "Application Approved",
            text: "Your application has been approved. You are now a mental health professional."
        });

        res.status(200).send({ 
            data: null,
            message: "Applicant approved",
            success: true 
        });
    } catch (error) {
        res.status(500).send({ 
            data: null,
            message: error,
            success: false
        });
    }
}

