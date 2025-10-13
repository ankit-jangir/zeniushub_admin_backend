const { where } = require("sequelize");
const customError = require("../utils/error.handler");
const { Banner } = require("../models/");
const { bannerRepositories } = require("../repositories/banner.repo");
const fs = require("fs");
const { uploadFileToAzure } = require("../utils/azureUploader");


const bannerRepository = new bannerRepositories(Banner)

const bannerService = {

    addBanner: async (data, file) => {
        const filePath = file.path;
        const buffer = fs.readFileSync(filePath);
        const blobName = `banners/${file.filename}`;

        const result = await uploadFileToAzure(buffer, blobName);

        if (!result.success) {

            throw new customError(`Azure upload failed: ${result.error}`, 502);
        }
        const fullUrl = result.url;
        const imagePath = fullUrl.split('/').slice(-2).join('/');
        data.image_path = imagePath;

        await bannerRepository.create(data);
    }
    ,
    getAllBanner: async () => {
        return await bannerRepository.getData();
    },

    getBannerById: async (id) => {
        return await bannerRepository.getDataById(id);
    },

    updateBanner: async (data, file, id) => {
        let check = await bannerRepository.getOneData({ id: id.id });
        if (!check) {
            throw new customError("Banner not found", 404);
        }

        if (file) {
            const filePath = file.path;
            const buffer = fs.readFileSync(filePath);
            const blobName = `banners/${file.filename}`;

            const result = await uploadFileToAzure(buffer, blobName);

            if (!result.success) {
                throw new customError(`Azure upload failed: ${result.error}`, 502);

            }

            const fullUrl = result.url;
            const imagePath = fullUrl.split('/').slice(-2).join('/');
            data.image_path = imagePath;
        }

        await bannerRepository.update(data, id);
    }
    ,

    deleteBanner: async (id) => {
        return await bannerRepository.deleteData(id);
    },




}

module.exports = bannerService