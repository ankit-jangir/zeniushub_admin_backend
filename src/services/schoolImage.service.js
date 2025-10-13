const { where } = require("sequelize");
const customError = require("../utils/error.handler");
const { SchoolImage } = require("../models/");
const { schoolImageRepositories } = require("../repositories/schoolImage.repo");
const fs = require("fs");
const { uploadFileToAzure } = require("../utils/azureUploader");


const schoolImageRepository = new schoolImageRepositories(SchoolImage)

const schoolImageService = {

    addSchoolImage: async (data, file) => {
        const filePath = file.path;
        const buffer = fs.readFileSync(filePath);
        const blobName = `schoolImages/${file.filename}`;

        const result = await uploadFileToAzure(buffer, blobName);

        if (!result.success) {
            throw new customError(`Azure upload failed: ${result.error}`, 502);
        }

        const fullUrl = result.url;
        const imagePath = fullUrl.split('/').slice(-2).join('/');
        data.image_path = imagePath;

        await schoolImageRepository.create(data);
    }
    ,

    getAllSchoolImage: async () => {
        return await schoolImageRepository.getData();
    },

    getSchoolImageById: async (id) => {
        return await schoolImageRepository.getDataById(id);
    },

    updateSchoolImage: async (data, id, file) => {
        let check = await schoolImageRepository.getOneData({ id: id.id });
        if (!check) {
            throw new customError("SchoolImage not found", 404);
        }

        if (file) {
            const filePath = file.path;
            const buffer = fs.readFileSync(filePath);
            const blobName = `schoolImages/${file.filename}`;

            const result = await uploadFileToAzure(buffer, blobName);
            if (!result.success) {

                throw new customError(`Azure upload failed: ${result.error}`, 502);
            }

            const fullUrl = result.url;
            const imagePath = fullUrl.split('/').slice(-2).join('/');
            data.image_path = imagePath;
        }

        await schoolImageRepository.update(data, id);
    }
    ,

    deleteSchoolImage: async (id) => {
        return await schoolImageRepository.deleteData(id);
    },




}

module.exports = schoolImageService