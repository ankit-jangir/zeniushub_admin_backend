const { Student_Enrollment, Student, Emi, Batches,Course } = require("../models/index");
const { CrudRepository } = require("./crud.repo");

class mystuaccessRepositories extends CrudRepository {
    constructor() {
        super(Student_Enrollment);
    }

    // ✅ Get one enrollment record by ID
    async getEnrollmentById(id) {
        return await Student_Enrollment.findByPk(id, {
            attributes: [
                'id',
                'student_id',
                'course_id',
                'batch_id',
                'session_id',
                'fees',
                'discount_amount',
                'number_of_emi',
                'status',
                'createdAt',
                'updatedAt'
            ],
            raw: true
        });
    }
    async OneStudentPayment(id) {
        const data = await Student_Enrollment.findAll({
            where: { id: id },
            include: [
                {
                    model: Student,
                    attributes: ["enrollment_id"]
                },
                {
                    model: Emi
                }
            ]
        })
        return data
    }

    // ✅ Update enrollment status (optional override, already inherited from CrudRepository if implemented)
    async update(data, whereClause) {
        return await Student_Enrollment.update(data, { where: whereClause });
    }

        async   getfundata(batch_id) {
            const data = await Student_Enrollment.findAll({
                where: { batch_id: batch_id }, // ✅ FIXED
                include: [
                    {
                        model: Student,
                        attributes: ['id', 'name']
                    },
                    {
                        model: Batches
                    },
                    {
                        model: Course,
                        attributes: ['course_name'],
                    },
                ]
            })
            // console.log('====================================');
            // console.log(data);
            // console.log('====================================)))))))PPPPPP');
            return data
        }

    async getAllStudent(course_id){
        const data = await Student_Enrollment.findAll({
            where:{course_id:course_id},
            include:[
                {
                    model:Student
                }
            ]
        })
        return data;
    }

    

}

module.exports = {
    mystuaccessRepositories,
};
