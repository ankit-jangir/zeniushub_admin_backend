const { CoursesRepositories } = require("../repositories/courses.repo");
const { SubjectRepositories } = require("../repositories/Subject.repo");
const {
  SubjectCoursesRepositories,
} = require("../repositories/Subject_courses.repo");
const {
  mystuaccessRepositories,
} = require("../repositories/studentEmrollment.repo");
const { Sequelize, Op, where } = require("sequelize");
const customError = require("../utils/error.handler");
const { batchesRepositories } = require("../repositories/Batches.repo");

const CoursesRepositorie = new CoursesRepositories();
const SubjectCoursesRepositorie = new SubjectCoursesRepositories();
const SubjectRepositorie = new SubjectRepositories();
const batchesRepositorie = new batchesRepositories();
const mystuaccessRepositorie = new mystuaccessRepositories();

const coursesService = {
  addcourses: async (data) => {
    console.log("Received course_duration:", data.course_duration);

    const durationInMonths = Number(data.course_duration);

    if (isNaN(durationInMonths)) {
      throw new customError("Invalid course duration format");
    }

    // ✅ Validate that course is not more than 48 months (4 years)
    if (durationInMonths > 48) {
      throw new customError(
        "Course duration must be less than or equal to 4 years (48 months)"
      );
    }

    // ✅ Validate course_name length (max 255 characters)
    if (data.course_name.length > 255) {
      throw new customError("Course name must not exceed 255 characters");
    }

    // 🔍 Check if course already exists (case-insensitive)
    let check = await CoursesRepositorie.getOneData({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("course_name")),
        data.course_name.toLowerCase()
      ),
    });

    if (check) {
      throw new customError("Course already exists");
    }
    return await CoursesRepositorie.create(data);
  },

  updatecoursesService: async (id, course_Name) => {
    // 1. Check if course exists
    const existingCourse = await CoursesRepositorie.getDataById(id);
    if (!existingCourse) {
      throw new customError("Course not found.", 404);
    }

    // 2. Same name check
    if (existingCourse.course_name === course_Name) {
      throw new customError("The course already has this name.", 400);
    }

    // 3. Duplicate name check (excluding current id)
    const duplicate = await CoursesRepositorie.getOneData({
      course_name: course_Name,
      id: { [Op.ne]: id },
    });

    if (duplicate) {
      throw new customError(
        "Another course with the same name already exists.",
        400
      );
    }

    // 4. Proceed with update using correct where condition
    const [updatedCount] = await CoursesRepositorie.update(
      { course_name: course_Name },
      { id: id } // ✅ This matches { where: { id: 4 } } expected by repo
    );

    if (updatedCount === 0) {
      throw new customError("Update failed.", 400);
    }

    // 5. Return updated result
    const updatedCourse = await CoursesRepositorie.getDataById(id);
    return updatedCourse;
  },

  deletecoursesservice: async (id) => {
    // Fetch the course data by ID
    const data = await CoursesRepositorie.getDataById(id);
    // Check if the course exists
    if (!data) {
      throw new customError("Course not found", 404); // Added status code for clarity
    }

    if (data.status === "inactive") {
      throw new customError("Course is already deleted", 400); // More descriptive message
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const formattedDate = `${year}-${month}-${day}`;

    const getStudent = await mystuaccessRepositorie.getAllStudent(id);

    for (const enrollment of getStudent) {
      if (
        enrollment.student_id &&
        formattedDate <= enrollment.ending_course_date
      ) {
        throw new customError(
          "The student is in this course and the course duration is til. so you cannot inactive it " +
            enrollment.ending_course_date,
          400
        );
      }
    }

    // Update the course status to inactive
    const updated = await CoursesRepositorie.update(
      { status: "inactive" },
      { id: id }
    );
    // Check if the update was successful
    if (!updated) {
      throw new customError("Failed to update course status", 500);
    }
    return { message: `Course status changed to inactive` };
  },

  markAsActive: async (id) => {
    if (!id) throw new Error("Course ID is required");

    console.log("Activating course with ID:", id);

    // Step 1: Fetch course by ID
    const course = await CoursesRepositorie.getOneData({ id: id });
    if (!course) throw new Error("Course not found");

    // Step 2: Check if already active
    if (course.status === "active") {
      return {
        message: "Course was already active",
        wasAlreadyActive: true,
      };
    }

    console.log("Course data:", course.dataValues);

    // Step 3: Update status
    try {
      const updated = await CoursesRepositorie.update(
        { status: "active" },
        { id: id }
      );

      console.log("Update result:", updated);

      if (!updated[0]) throw new Error("Update returned 0 rows");

      return {
        message: "Course activated successfully",
        previousStatus: course.status,
      };
    } catch (err) {
      console.error("Update error:", err);
      throw new Error(`Failed to mark course as active: ${err.message}`);
    }
  },
  getallcoursesservices: async () => {
    const data = await CoursesRepositorie.getData();
    const activeData = data.filter((item) => item.status === "active");

    return activeData;
  },
  Searchbycoursesnameservice: async (
    name,
    page = 1,
    limit = 6,
    course_type,
    status
  ) => {
    const offset = (page - 1) * limit;
    const whereCondition = {};

    if (name?.trim()) {
      whereCondition.course_name = {
        [Op.iLike]: `%${name.trim()}%`,
      };
    }

    if (course_type?.trim()) {
      whereCondition.course_type = {
        [Op.iLike]: `%${course_type.trim().toLowerCase()}%`,
      };
    }
    if (status?.trim()) {
      whereCondition.status = status.trim().toLowerCase();
    }

    console.log("where ", whereCondition);

    const { rows: data, count } = await CoursesRepositorie.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    return { data, count };
  },

  coursenotmatch: async (id) => {
    const findbysubcourse = await SubjectCoursesRepositorie.findAll({
      course_id: id,
    });
    const subjectIds = findbysubcourse.map((i) => i.subject_id);
    console.log(subjectIds);
    const query = subjectIds.length ? { id: { [Op.notIn]: subjectIds } } : {};
    const subwaladata = await SubjectRepositorie.findAll(query);

    return { findbysubcourse, subwaladata };
  },
  coursecountbatch: async (id) => {
    const data = await CoursesRepositorie.accessdata(id);
    return data;
  },
  coursefilterdata: async (offline) => {
    const data = await CoursesRepositorie.findAll({
      course_type: offline,
    });
    return data;
  },
};

module.exports = coursesService;
