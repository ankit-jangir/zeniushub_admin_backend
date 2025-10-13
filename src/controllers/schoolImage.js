const { logger } = require("sequelize/lib/utils/logger");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const schoolImageSchema = require("../validators/schoolImage.validation");
const schoolImageService = require("../services/schoolImage.service");

const schoolImage = {

    addSchoolImage: try_catch(
        async (req, res) => {
            const fileData = {
                ...req.body,
                image_path: req.file ? req.file.filename : null,
            };

            const result = schoolImageSchema
                .pick({ image_path: true, school_description: true, school_name: true })
                .safeParse(fileData);

            if (!result.success) {
                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            await schoolImageService.addSchoolImage(fileData, req.file);

            return res.status(201).send({ status: "001", message: "SchoolImage added successfully" });
        }
    ),


    getAllSchoolImage: try_catch(
        async (req, res) => {
            const schoolImages = await schoolImageService.getAllSchoolImage();

            return res.status(200).send({ status: "001", schoolImages });
        }
    ),

    getSchoolImageById: try_catch(
        async (req, res) => {

            const result = schoolImageSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const schoolImage = await schoolImageService.getSchoolImageById(req.params.id);
            if (!schoolImage) {

                throw new customError("SchoolImage not found", 404);

            }
            return res.status(200).send({ status: "001", schoolImage });
        }
    ),

    updateSchoolImage: try_catch(async (req, res) => {
        const fileData = {
            ...req.body,
            id: parseInt(req.body.id),
            image_path: req.file.filename
        };

        const result = schoolImageSchema.pick({ id: true, image_path: true, school_description: true, school_name: true }).safeParse(fileData);

        if (!result.success) {
            throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
        }

        const { school_name, school_description } = fileData;


        await schoolImageService.updateSchoolImage(
            { school_name, school_description },
            { id: req.body.id },
            req.file
        );

        return res.status(200).send({ status: "001", message: "SchoolImage updated successfully" });
    }),


    deleteSchoolImage: try_catch(
        async (req, res) => {

            const result = schoolImageSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const deleted = await schoolImageService.deleteSchoolImage(req.params.id);

            if (!deleted) {


                throw new customError("SchoolImage not found", 404);
            }
            return res.status(200).send({ status: "001", message: "SchoolImage deleted successfully" });
        }
    ),


}
module.exports = { schoolImage }


