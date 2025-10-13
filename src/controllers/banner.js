const { logger } = require("sequelize/lib/utils/logger");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const bannerService = require("../services/banner.service");
const bannerValidationSchema = require("../validators/banner.validation");

const banner = {



    addBanner: try_catch(
        async (req, res) => {

            req.body.image_path = req.file.filename;

            const result = bannerValidationSchema.pick({ image_path: true }).safeParse(req.body);

            if (!result.success) {
                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            await bannerService.addBanner(req.body, req.file);

            return res.status(201).send({ status: "001", message: "Banner added successfully" });
        }
    )
    ,

    getAllBanner: try_catch(
        async (req, res) => {
            const banners = await bannerService.getAllBanner();

            return res.status(200).send({ status: "001", banners });
        }
    ),


    getBannerById: try_catch(
        async (req, res) => {

            const result = bannerValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const banner = await bannerService.getBannerById(req.params.id);
            if (!banner) {

                throw new customError("Banner not found", 404);

            }
            return res.status(200).send({ status: "001", banner });
        }
    ),

    updateBanner: try_catch(
        async (req, res) => {
            const fileData = {
                ...req.body,
                id: parseInt(req.body.id),
            };

            const result = bannerValidationSchema.pick({ id: true }).safeParse(fileData);

            if (!result.success) {
                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            await bannerService.updateBanner(
                { image_path: req.file ? "" : null },
                req.file,
                { id: fileData.id }
            );

            return res.status(200).send({ status: "001", message: "Banner updated successfully" });
        }
    ),


    deleteBanner: try_catch(
        async (req, res) => {

            const result = bannerValidationSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const deleted = await bannerService.deleteBanner(req.params.id);

            if (!deleted) {


                throw new customError("Banner not found", 404);
            }
            return res.status(200).send({ status: "001", message: "Banner deleted successfully" });
        }
    ),



}
module.exports = { banner }


