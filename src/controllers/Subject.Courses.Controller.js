const subCorses_services = require("../services/SubjectCourses.service");
const customError = require("../utils/error.handler");
const { try_catch } = require("../utils/tryCatch.handler");

const subcoursesController = {
    addsubcourses: try_catch(async (req, res) => {
        const { course_id, subject_id } = req.body;

        if (!course_id || !subject_id) {
            throw new customError("Course ID and Subject ID are required.", 400);
        }

        const data = await subCorses_services.addsubcourses(req.body);

        if (!data) {
            throw new customError("Failed to add subject to course.", 500);
        } 
        res.status(201).json({
            status: "success",
            message: "Subject added to course successfully",
            data: data
        });
    }),
    getallsubcoursecontroller: try_catch(async (req, res) => {
        
        const data = await subCorses_services.getallsubcourseservice(req.query.course_id);

        if (!data) {
            throw new customError("Failed to fetch subjects for courses.", 500);
        } 
        res.status(200).json({
            status: "success",
            message: "Subjects for courses retrieved successfully",
            data: data
        });
    }),
    getCourse: try_catch(async (req, res) => {
        
        const data = await subCorses_services.getCourse(req.query.subject_id);

        if (!data) {
            throw new customError("Failed to fetch subjects for courses.", 500);
        } 
        res.status(200).json({
            status: "success",
            message: "Subjects for courses retrieved successfully",
            data: data
        });
    }),
    // updatesubcoursescontroller: try_catch(async (req,res) => {
    //     const {id,course_id ,subject_id } = req.body
    //     const data = await subCorses_services.updatesubcourseservice( id,course_id ,subject_id );
    //     if (!data) {
    //         throw new customError("Failed to add subject to course.", 500);
    //     }
    //     console.log("your data : ", data);
    //     res.status(200).json({
    //         status: "success",
    //         data: data
    //     });
    // }),
    deletesubcoursescontroller : try_catch (async (req,res)=>{
        const { id } = req.body;

        if (!id) {
            throw new customError("Subject Course ID is required.", 400);
        }
        const data = await subCorses_services.deletesubcoursesservice(id)
        if (!data) {
            throw new customError("Failed to delete subject from course.", 500);
        }
        
        res.status(200).json({
            status: "success",
            message: "Subject removed from course successfully",
            data: data
        });
    })
}

module.exports = subcoursesController