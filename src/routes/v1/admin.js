const express = require("express");
const { admin } = require("../../controllers/admin");
const adminRoute = express.Router();
const rateLimit = require('express-rate-limit');
const authenticate = require("../../middleware/admin.auth");


const otpRateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,  // 2 minutes window
    max: 4,  // Allow only 4 request per window per IP
    handler: (req, res) => {
        const retryAfter = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000);
        const minutes = Math.floor(retryAfter / 60);
        const seconds = retryAfter % 60;

        let timeMsg = "";
        if (minutes > 0) timeMsg += `${minutes} minute${minutes > 1 ? "s" : ""} `;
        if (seconds > 0) timeMsg += `${seconds} second${seconds > 1 ? "s" : ""}`;

        return res.status(429).json({
            status: "429",
            message: `Too many requests. Please try again after ${timeMsg.trim()}.`
        });
    }
});


adminRoute.post("/add", admin.addAdmin);
adminRoute.get("/get",  admin.getAllAdmin);
adminRoute.get("/getbyid/:id", authenticate, admin.getAdminById);
adminRoute.patch("/update", authenticate, admin.updateAdmin);
adminRoute.delete("/delete/:id", authenticate, admin.deleteAdmin);
adminRoute.get("/profile/view", authenticate, admin.viewProfile);
adminRoute.patch("/password/change", authenticate, admin.changePassword);
adminRoute.patch("/password/reset", authenticate, admin.resetPassword);
adminRoute.get("/logout", authenticate, admin.adminLogout);
adminRoute.patch("/status/update", authenticate, admin.statusUpdate);
adminRoute.post("/login", otpRateLimiter, admin.adminLogin);
adminRoute.post("/email/otp/send", authenticate, otpRateLimiter, admin.otpSend);
adminRoute.post("/email/otp/resend", authenticate, otpRateLimiter, admin.otpResend);
adminRoute.post("/email/otp/verify", authenticate, otpRateLimiter, admin.emailVerify);

module.exports = { adminRoute }

