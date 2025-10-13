const { Op } = require("sequelize");
const { Course } = require("../models/");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { SubjectRepositories } = require("../repositories/Subject.repo");
const { SubjectCoursesRepositories } = require("../repositories/Subject_courses.repo");

const SubjectCoursesRepositorie = new SubjectCoursesRepositories();
const CoursesRepositorie = new CoursesRepositories();
const SubjectRepositorie = new SubjectRepositories()
const subCorses_services = {
    addsubcourses: async (data) => {
        // const exists = await SubjectCoursesRepositorie.getOneData({
        //     course_id: data.course_id,
        //     subject_id: data.subject_id
        // });

        // const courseExist = await CoursesRepositorie.getOneData({ id: data.course_id });
        // const subjectExist = await SubjectRepositorie.getOneData({ id: data.subject_id });

        // if (!courseExist) {
        //     throw new customError("Course ID not found", 400);
        // }

        // if (!subjectExist) {
        //     throw new customError("Subject ID not found", 400);
        // }

        // if (exists) {
        //     return { message: "Data already exists", success: false };
        // }

        const created = await SubjectCoursesRepositorie.create(data);

        return {
            message: "Subcourse added successfully",
            success: true,
            data: created
        };
    },
    getallsubcourseservice: async (course_id) => {
        return await SubjectCoursesRepositorie.getDatacourse(course_id);
    },
    getCourse: async (subject_id) => {
        let excludeCourses = await SubjectCoursesRepositorie.getAllWithCondition({ subject_id: subject_id }, ['course_id']);
        console.log(excludeCourses);
        // const excludeCourses = [ { course_id: 8 }, { course_id: 17 } ];

        // Step 1: Extract only the course_id values into an array
        const excludedIds = excludeCourses.map(course => course.course_id);

        // Step 2: Use Sequelize to fetch courses excluding those IDs
        // const { Op } = require('sequelize');


        return await CoursesRepositorie.findAll({
            id: {
                [Op.notIn]: excludedIds
            }

        });
    },
    deletesubcoursesservice: async (id) => {
        console.log(id)
        return await SubjectCoursesRepositorie.deleteData({ id: id })
    }
}

module.exports = subCorses_services