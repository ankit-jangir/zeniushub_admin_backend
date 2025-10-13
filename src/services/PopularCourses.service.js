const fs = require('fs');
const { PopularCourse } = require('../models/index.js');
const { uploadFileToAzure } = require('../utils/azureUploader');
const customError = require('../utils/error.handler');
const { popularCourseRepo } = require('../repositories/PopularCourses.repo.js');

const popularCourseRep = new popularCourseRepo(popularCourseRepo)

module.exports = {
  // ✅ CREATE
  addPopularCourse: async (data, file) => {
    try {
      if (!file || !file.path) {
        throw new customError('No file uploaded', 400);
      }

      const filePath = file.path;
      const buffer = fs.readFileSync(filePath);
      const blobName = `popularCourse/${Date.now()}-${file.originalname}`;

      const result = await uploadFileToAzure(buffer, blobName);

      if (!result.success) {
        throw new customError(`Azure upload failed: ${result.error}`, 502);
      }

      // const imagePath = result.url.split('/').slice(-2).join('/');
      data.image = blobName;

      const created = await popularCourseRep.create(data);
      return created;
    } catch (error) {
      console.error("Error in addPopularCourse:", error);
      throw new customError(error.message || 'Error adding popular course', 500);
    }
  },

  // ✅ READ ALL
  getPopularCourse: async () => {
    try {
      const result = await popularCourseRep.findAll();
      return result;
    } catch (error) {
      console.error("Error in getPopularCourse:", error);
      throw new customError('Error retrieving popular courses', 500);
    }
  },

  // ✅ READ BY ID
  getPopularCourseById: async (courseId) => {
    try {
      const result = await popularCourseRep.findOne({ id: courseId });

      if (!result) {
        throw new customError('Popular course not found', 404);
      }

      return result;
    } catch (error) {
      console.error("Error in getPopularCourseById:", error);
      throw new customError('Error retrieving popular course by ID', 500);
    }
  },

  // ✅ UPDATE
  updatePopularCourse: async (courseId, data, file) => {
    try {
      if (file && file.path) {
        const blobName = `popularCourse/${Date.now()}-${file.originalname}`;
        const buffer = fs.readFileSync(file.path);

        const result = await uploadFileToAzure(buffer, blobName);
        if (!result.success) {
          throw new customError(`Azure upload failed: ${result.error}`, 502);
        }

        const imagePath = result.url.split('/').slice(-2).join('/');
        data.image = imagePath;
      }

      const [updatedRows] = await popularCourseRep.update(data, { where: { id: courseId } });

      if (updatedRows === 0) {
        throw new customError('No course found to update', 404);
      }

      return { message: 'Popular course updated successfully' };
    } catch (error) {
      console.error("Error in updatePopularCourse:", error);
      throw new customError(error.message || 'Error updating popular course', 500);
    }
  },

  // ✅ DELETE
  deletePopularCourse: async (courseId) => {
    try {
      const deleted = await popularCourseRep.deleteData(courseId);

      if (!deleted) {
        throw new customError('No course found to delete', 404);
      }

      return { message: 'Popular course deleted successfully' };
    } catch (error) {
      console.error("Error in deletePopularCourse:", error);
      throw new customError(error.message || 'Error deleting popular course', 500);
    }
  }
};