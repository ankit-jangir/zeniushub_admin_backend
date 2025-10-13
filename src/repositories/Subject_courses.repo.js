const { SubjectCourse, Course, Subject } = require("../models/index");
const { CrudRepository } = require("./crud.repo");

class SubjectCoursesRepositories extends CrudRepository {
    constructor() {
        super(SubjectCourse);
    }
    async getDatacourse(course_id) {
        return await SubjectCourse.findAll({
            where: { course_id: course_id },
            include: [
                {
                    model: Course,
                    required: true,
                    where: { status: 'active' },
                    attributes: ['course_name']
                },
                {
                    model: Subject,
                    required: true,
                    where: { status: 'active' },
                    attributes: ['subject_name']
                }
            ]
        })
    }

    async bulkCreate(dataArray) {
        return this.model.bulkCreate(dataArray); // ✅ Add this
    }
}

module.exports = { SubjectCoursesRepositories }