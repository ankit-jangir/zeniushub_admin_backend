const { logger } = require("sequelize/lib/utils/logger");
const adminService = require("../services/admin.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const adminValidationSchema = require("../validators/admin.validation");

const admin = {

    addAdmin: try_catch(
        async (req, res) => {

            const result = adminValidationSchema.pick({ full_name: true, email: true, password: true, m_number: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await adminService.addAdmin(req.body);


            return res.status(201).send({ status: "001", message: "Admin added successfully" });
        }
    ),

    getAllAdmin: try_catch(
        async (req, res) => {
            const admins = await adminService.getAllAdmin();

            return res.status(200).send({ status: "001", admins });
        }
    ),

    getAdminById: try_catch(
        async (req, res) => {

            const result = adminValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const admin = await adminService.getAdminById(req.params.id);
            if (!admin) {

                throw new customError("Admin not found", 404);

            }
            return res.status(200).send({ status: "001", admin });
        }
    ),

    viewProfile: try_catch(
        async (req, res) => {

            const result = adminValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.adminId) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const admin = await adminService.viewProfile(req.adminId);
            if (!admin) {

                throw new customError("Admin not found", 404);

            }
            return res.status(200).send({ status: "001", admin });
        }
    ),

    
  updateAdmin: try_catch(
        async (req, res) => {
            const data = { id: req.adminId, ...req.body.data };


            const result = adminValidationSchema.pick({  full_name: true, email: true,  m_number: true }).safeParse(data);

            if (!result.success) {

            
                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await adminService.updateAdmin(req.body.data, { id: req.adminId});

            return res.status(200).send({ status: "001", message: "Details updated successfully" });
        }
    ),

    deleteAdmin: try_catch(
        async (req, res) => {

            const result = adminValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const deleted = await adminService.deleteAdmin(req.params.id);
            if (!deleted) {


                throw new customError("Admin not found", 404);
            }

            return res.status(200).send({ status: "001", message: "Admin details deleted successfully" });
        }
    ),

    changePassword: try_catch(
        async (req, res) => {
            const data = { id: parseInt(req.adminId), ...req.body };


            const result = adminValidationSchema.pick({ id: true, current_password: true, new_password: true, confirm_password: true }).safeParse(data);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await adminService.changePassword(req.body, { id: req.adminId });

            return res.status(200).send({ status: "001", message: "Password change successfully" });
        }
    ),

    resetPassword: try_catch(
        async (req, res) => {
            const result = adminValidationSchema.pick({ id: true, new_password: true }).safeParse({ id: parseInt(req.body.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await adminService.resetPassword({ new_password: req.body.new_password }, { id: req.body.id });

            return res.status(200).send({ status: "001", message: "Password reset successfully" });
        }
    ),

    otpSend: try_catch(
        async (req, res) => {
            const result = adminValidationSchema.pick({ m_number: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const order_ID = await adminService.otpSend(req.body.m_number);


            return res.status(200).send({ status: "001", message: "OTP send successfully", order_ID });


        }
    ),

    otpResend: try_catch(
        async (req, res) => {
            const result = adminValidationSchema.pick({ order_ID: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }


            const order_ID = await adminService.otpResend(req.body.order_ID);


            return res.status(200).send({ status: "001", message: "OTP resend successfully", order_ID });
        }
    ),

    emailVerify: try_catch(
        async (req, res) => {
            const result = adminValidationSchema.pick({ order_ID: true, m_number: true, otp: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const response = await adminService.emailVerify(req.body);

            if (response.isOTPVerified) {
                return res.status(200).send({ status: "001", message: "OTP verified successfully" });

            }

            else {

                throw new customError("Given details are incorrect.", 400);
            }
        }
    ),

    adminLogin: try_catch(
        async (req, res) => {
            const result = adminValidationSchema.pick({ email: true, password: true }).safeParse(req.body);

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const token = await adminService.adminLogin(req.body);
            return res.status(200).send({ status: "001", message: "Login successfully", token: token });
        }
    ),

    adminLogout: try_catch(
        async (req, res) => {
            const result = adminValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.adminId) });

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await adminService.adminLogout(req.adminId);
            return res.status(200).send({ status: "001", message: "Logout successfully" });
        }
    ),

    statusUpdate: try_catch(
        async (req, res) => {
            req.body.id = parseInt(req.body.id);
            const result = adminValidationSchema.pick({ id: true, status: true }).safeParse(req.body);

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            await adminService.statusUpdate({ status: req.body.status }, { id: req.body.id });

            return res.status(200).send({ status: "001", message: "Status updated successfully" });
        }
    )

}
module.exports = { admin }



