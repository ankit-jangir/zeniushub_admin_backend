const express = require("express");
const {studentRoute} = require("./studentroute");

// const { coursesRoute } = require("./courses.routes");
const { subjectrouter } = require("./Subject.router");
const { departmentrouter } = require("./department.router");

// v1Router.use("/courses",coursesRoute);

const coursesrouter = require("./Courses.router");
const subjectcoursesrouter = require("./Subject_courses_router");
const { sessionRoute } = require("./session");
const { employeeTaskRoute } = require("./employeeTask");
const { adminRoute } = require("./admin");
const { bannerRoute } = require("./banner");
const { schoolImageRoute } = require("./schoolImage");
const batchrouter = require("./Batches.router");
const notifactionrouter = require("./Notification.router");
const categoryrouter = require("./Category.router");
const leadsrouter = require("./Leads.router");
const { employeeRoute } = require("./employee");
// const uploadExcelRoute = require('./uploadExcel.route');
const { popularCourses } = require("./PopularCourses");
const v1Router = express.Router();

const router = require("./excelRoute");
// const uploadExcelRoute = require("./uploadExcel.route");
const categoryexp = require("./categoryExpense.route");
const { emiRoute } = require("./emis.routes");
const receiptRouter = require("./receipt");
const { attendanceroute } = require("./attendance.route");
const Desboardservice = require("./Dashboard.router");
const employeeSalaryRouter = require("./employeeSalary.route");
const { employeeSubjectRoute } = require("./employeeSubject");
const deptSalary = require("./Salary.routes");
const { examCategoryRoute } = require("./examcategory");
const expenserouter = require("./expense.router");

v1Router.use("/subjectrouter", subjectrouter);
v1Router.use("/departmentrouter", departmentrouter);
// v1Router.use("/courses",coursesRoute);

// v1Router.use("/subjectrouter", subjectrouter);
v1Router.use("/coursesrouter", coursesrouter);
v1Router.use("/subjectcoursesrouter", subjectcoursesrouter);
// v1Router.use("/excelSample", router);
// v1Router.use("/excelFileUpload",uploadExcelRoute);
v1Router.use("/student", studentRoute);
v1Router.use("/session", sessionRoute);
v1Router.use("/emi", emiRoute);

v1Router.use("/session", sessionRoute);
v1Router.use("/employee/task", employeeTaskRoute);
v1Router.use("/admin", adminRoute);
v1Router.use("/banner", bannerRoute);
v1Router.use("/schoolImage", schoolImageRoute);
v1Router.use("/employee", employeeRoute);

v1Router.use("/session", sessionRoute);
// v1Router.use("/employee/task", employeeTaskRoute);
v1Router.use("/admin", adminRoute);
v1Router.use("/banner", bannerRoute);
v1Router.use("/schoolImage", schoolImageRoute);

v1Router.use("/excelSample", router);
// v1Router.use("/excelFileUpload",uploadExcelRoute);
// v1Router.use("/employes",employeeRoute)

v1Router.use("/popularCourses", popularCourses);
v1Router.use("/attendence", attendanceroute);
// v1Router.use("/subjectrouter", subjectrouter);
// v1Router.use("/coursesrouter", coursesrouter);
// v1Router.use("/subjectcoursesrouter", subjectcoursesrouter);
// v1Router.use("/subjectrouter", subjectrouter);
v1Router.use("/categoryrouter", categoryrouter);
v1Router.use("/leadsrouter", leadsrouter);
v1Router.use("/Desboardservice", Desboardservice);


// Employee Salary
v1Router.use("/employeeSalary", employeeSalaryRouter);



v1Router.use("/popularCourses", popularCourses);
v1Router.use("/receipt", receiptRouter);
v1Router.use("/notifactionrouter", notifactionrouter);
v1Router.use("/batchrouter", batchrouter);

v1Router.use("/empSubjectRouter",employeeSubjectRoute)

v1Router.use("/Salary-Department", deptSalary);

v1Router.use("/exam/category", examCategoryRoute);
v1Router.use("/categoryexp", categoryexp);
v1Router.use("/expenserouter", expenserouter);

module.exports = { v1Router };

