const Application = require('../db.handler/application.model');
const User = require('../db.handler/user.model');

/**
 * @swagger
 * admin/api/applicants:
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
 *                     $ref: '#/components/schemas/Application'
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
 *         // add other properties here
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

exports.approveApplicant = async (req, res) => {
    try {
        await Application.findOneAndUpdate(
            { userId: req.params.id },
            { approved: req.body.approved },
            { new: true }
        );

        await User.findOneAndUpdate(
            { _id: req.params.id },
            { role: "mhp" },
            { new: true }
        );

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

