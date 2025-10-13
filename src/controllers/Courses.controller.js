const coursesService = require("../services/Courses.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");
const courseSchema = require("../validators/Courses.Validators");

const coursescontroller = {
  addcours: try_catch(async (req, res) => {
    // console.log("Incoming request data:", req.body);
    const parsedData = courseSchema.safeParse(req.body);
    if (!parsedData.success) {
      const errors = parsedData.error.errors.map((err) => ({
        field: err.path.join("."), // Convert array path to string
        message: err.message,
      }));
      return res.status(400).json({
        status: "error",
        errors: errors,
      });
    }
    console.log("parsedData.data : : : : ", parsedData.data);
    const getValidateData = await coursesService.addcourses(req.body);
    if (!getValidateData) {
      throw new customError("Failed to create course.", 400);
    }

    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      data: getValidateData,
    });
  }),

  updatecoursesController: try_catch(async (req, res) => {
    const { id, course_Name } = req.body;

    console.log("1111111111111111111111111");


    if (!id || !course_Name) {
      throw new customError("Missing required field: id or course_Name", 400);
    }

    // Call the service method to update the course name
    const updatedCourse = await coursesService.updatecoursesService(
      id,
      course_Name
    );

    if (!updatedCourse) {
      throw new customError("Course not found or update failed.", 400);
    }

    // Respond with the updated course
    res.status(200).json({
      status: "success",
      message: "Course name updated successfully",
      data: updatedCourse,
    });
  }),

  deletecoursecontroller: try_catch(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new customError("Course ID is required.", 400);
    }

    const data = await coursesService.deletecoursesservice(id);

    if (!data) {
      throw new customError("Failed to delete course.", 400);
    }
    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  }),

  markAsActive: try_catch(async (req, res) => {
    const { id } = req.query;

    if (!id) {
      throw new customError("Course ID is required.", 400);
    }
    console.log('====================================');
    console.log(id);
    console.log('====================================');

    const data = await coursesService.markAsActive(id).catch(err => {
      throw new customError("Failed to mark course as active: " + err.message, 500);
    });

    if (!data) {
      throw new customError("Failed to mark course as active.", 400);
    }
    console.log('====================================');
    console.log(data);
    console.log('====================================');

    res.status(200).json({
      status: "success",
      message: "Course updated successfully",
      // data: data,
    });
  }),

  getallcoursescontroller: try_catch(async (req, res) => {
    const data = await coursesService.getallcoursesservices();
    if (!data) {
      throw new customError("Failed to fetch courses.", 400);
    }
    res.status(200).json({
      status: "success",
      message: "Courses retrieved successfully",
      data: data,
    });
  }),
  Searchbycoursesnamecontroller: try_catch(async (req, res) => {
    const {
      course_name,
      status,
      page = 1,
      limit = 6,
      course_type
    } = req.query;

    const { data, count } = await coursesService.Searchbycoursesnameservice(
      course_name,
      Number(page),
      Number(limit),
      course_type,
      status,
    );

    if (!data || data.length === 0) {
      throw new customError("No courses found.", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Courses found successfully",
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCourses: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  }),

  coursenotmatchcontroller: try_catch(async (req, res) => {
    const { id } = req.body
    const data = await coursesService.coursenotmatch(id)
    if (!data) {
      throw new customError("No courses found.", 400);
    }
    res.status(200).json({
      status: "success",
      message: "Courses found successfully",
      data: data,
    });
  }),
  coursecountercontroller: try_catch(async (req, res) => {
    const id = req.params;
    console.log(id);

    const data = await coursesService.coursecountbatch(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Count successfully",
      data: data,
    });

  }),
  coursefilter: try_catch(async (req, res) => {
    const data = await coursesService.coursefilterdata(req.query.courssetype)
    res.status(201).json({
      status: "success",
      data: data
    });
  })
  // paginactionbycontroller : try_catch(async(req,res)=>{
  //   const {page, pageSize} = req.body
  //   const data = await coursesService.paginactionbyservice(page, pageSize)
  //   res.status(201).json({
  //     status: "success",
  //     data: data
  //   });
  // })
};
module.exports = coursescontroller;
