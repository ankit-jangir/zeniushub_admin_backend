const path = require("path");
const fs = require("fs");
const pdf = require("html-pdf-node");
const customError = require("../utils/error.handler");
const { PaymentReceipt, Student, Course, Emi } = require("../models");
const { emisRepositories } = require("../repositories/emis.repo");
const { studentRepositories } = require("../repositories/student.repo");
const { PaymentReceiptRepositories } = require("../repositories/receipt.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { uploadFileToAzure } = require("../utils/azureUploader");
const { Op } = require("sequelize");
// const emisRepositorie = new emisRepositories();

// ────────────────────  Repositories  ────────────────────────────────
const emisRepository = new emisRepositories();
const receiptRepository = new PaymentReceiptRepositories();
const studentRepository = new studentRepositories();
const courseRepository = new CoursesRepositories(Course);

// ────────────────────  Static Logo  ─────────────────────────────────
const logoPath = path.join(__dirname, "..", "assets", "tipsg-logo.jpg");
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logoDataUri = `data:image/jpeg;base64,${logoBase64}`;

// ────────────────────  Helpers  ─────────────────────────────────────
/**
 * Build the HTML that will become the PDF.
 */
const buildHtml = (student) => {
  const amount = Number(student.amount ?? 0);
  const sgst = +(amount * 0.09).toFixed(2);
  const cgst = sgst;
  const subTotal = +(amount - sgst - cgst).toFixed(2);

  const renderCopy = (title) => `
    <div class="copy">
      <div class="header">
        <div class="left">
          <img src="${logoDataUri}" class="logo" alt="TIPS-G Logo" />
          <p><b>GST Number:</b> 08AAWFT6480B1ZP</p>
          <p><b>Address:</b> 101, Chanda Tower,<br/>Girnar Colony,
             Gandhi Path Road,<br/>Vaishali Nagar, Jaipur - 302021</p>
        </div>

        <div class="right">
          <h2>INVOICE</h2>
          <p><b>Invoice #:</b> INV${student.serial_no ?? "1001"}</p>
          <p><b>${title}</b></p>
          <p class="student-name"><b>Student Name:</b> ${student.name}</p>
          <p><b>Student ID:</b> ${student.enrollment_id}</p>
          <p><b>Date:</b> ${student.paymentDate}</p>
        </div>
      </div>

      <table class="table">
        <tr><th>Sn.</th><th>Course Name</th><th>Amount</th></tr>
        <tr><td>1</td><td>${student.course_name}</td>
            <td>₹ ${amount.toFixed(2)}</td></tr>
      </table>

      <table class="summary-table">
        <tr><td>Sub Total</td>     <td class="right">₹ ${subTotal}</td></tr>
        <tr><td>SGST (9%)</td>     <td class="right">₹ ${sgst}</td></tr>
        <tr><td>CGST (9%)</td>     <td class="right">₹ ${cgst}</td></tr>
        <tr class="bold">
            <td>Grand Total</td>   <td class="right">₹ ${amount.toFixed(2)}</td>
        </tr>
      </table>

      <p class="terms">
        I therefore agree to abide by the Terms & Conditions mentioned
        behind this receipt.
      </p>

      <div class="signatures">
        <div><span>Authorised Signature:</span> ________________________</div>
        <div><span>Student Signature:</span> _________________________</div>
      </div>
    </div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Invoice</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; }

        body {
          width: 210mm;
          height: auto; /* auto height so content adjusts */
          background: #fff;
          overflow: hidden;
        }

        .receipt-wrapper {
          width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .copy {
          flex: 1;
          padding: 10px 20px;
          border: 1px solid #ccc;
          margin: 5px 0;
        }

        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .left {
          width: 55%;
        }

        .right {
          width: 40%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .left p, .right p {
          margin: 4px 0;
        }

        .logo {
          max-width: 200px;
          height: auto;
        }

        .table, .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .table th, .table td, .summary-table td {
          border: 1px solid #ccc;
          padding: 6px;
        }

        .summary-table .right {
          text-align: right;
        }

        .summary-table .bold td {
          font-weight: bold;
        }

        .signatures {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
        }

        .terms {
          margin-top: 15px;
          font-style: italic;
        }

        .student-name {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="receipt-wrapper">
        ${renderCopy("Student Copy")}
        ${renderCopy("Center Copy")}
      </div>
    </body>
    </html>`;
};



const htmlToPdf = async (student) => {
  const file = { content: buildHtml(student) };
  const options = {
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  try {
    return await pdf.generatePdf(file, options); // ⇒ Buffer
  } catch (err) {
    throw new customError(err.message || "PDF generation failed", 500);
  }
};

// ────────────────────  Public Service  ──────────────────────────────
const PaymentReceiptService = {
  // async downloadReceipt({ emi_id }) {
  //   const emi = await emisRepository.getOneData({ id: emi_id });
  //   if (!emi) throw new customError("EMI not found", 404);

  //   const student = await studentRepository.getOneData({ id: emi.student_id });
  //   if (!student) throw new customError("Student not found", 404);

  //   const course = await courseRepository.getOneData({ id: student.course_id });
  //   if (!course) throw new customError("Course not found", 404);

  //   return {
  //     id: student.id,
  //     name: student.name,
  //     enrollment_id: student.enrollment_id,
  //     course_name: course.course_name,
  //     amount: Number(emi.amount),
  //     emi_id: emi.id,
  //     paymentDate: (emi.payment_date ?? new Date()).toISOString().split("T")[0], // YYYY-MM-DD
  //   };
  // },

  async createReceipt(id) {
    const existing = await receiptRepository.getDataById( id );
    // console.log("***************************8",id)
    // console.log("************existing***************8",existing)
    // console.log("************existing***************8",existing.receipt_url)
    // if (existing.receipt_url) return  existing.receipt_url;
    console.log("&&&&&&&&&&&&&&&&&&&&&& after if")
    let student=await studentRepository.getDataById(existing.student_id)
      
// console.log(student.Student);    

    const fileName = `${student.Student.name.replace(
      /[^\w-]/g,
      "_"
    )}-${Date.now()}_receipt.pdf`;
    
    console.log('==================================== this is my code');
    console.log(student);  
    console.log( "THis is my data for enrollment id : ",student.Student.enrollment_id);  
    console.log( "THis is my data for enrollment name : ",student.Student.name);  
    console.log('==================================== this is my last output');
  
    const receiptRow = await receiptRepository.update({
      receipt_url: fileName,
    },{id:id});
      const data = {
      id: student.id,
      name: student.Student.name,
      enrollment_id: student.Student.enrollment_id,
      course_name: student.Course.course_name,
      amount: Number(existing.amount),
      // emi_id: emi.id,
      paymentDate: existing.payment_date
    };
    const pdfBuffer = await htmlToPdf({
      ...data,
      serial_no: receiptRow.serial_no ?? receiptRow.id,
    });

    await uploadFileToAzure(
      pdfBuffer,
      `receipts/${fileName}`,
      "application/pdf"
    );
console.log("file  ",fileName);

    return fileName
  },


  async downloadReceiptForManay(id) {
    const emi = await emisRepository.findAll({
      is_paid: "true",
      student_id: id

    });
    console.log("Your Emi Code  : ", emi)
    if (!emi) throw new customError("EMI not found", 404);

    const student = await studentRepository.getOneData(id);
    if (!student) throw new customError("Student not found", 404);
    // console.log("Your student code  :  ", student)

    const course = await courseRepository.getOneData(student.course_id);
    console.log(course,"************************ course id")
    if (!course) throw new customError("Course not found", 404);
    // console.log("course /data : : ", course)
    // return
    const totalPaidAmount = emi.reduce(
      (acc, item) => {
        if (item.is_paid) {
          acc.ids.push(item.id);        // id collect karo
          acc.total += item.amount;     // amount add karo
        }
        return acc;
      },
      { ids: [], total: 0 }             // initial value
    );

    console.log(totalPaidAmount);

    return {
      id: student.id,
      name: student.name,
      enrollment_id: student.enrollment_id,
      course_name: course.course_name,
      amount: totalPaidAmount.total,
      emi_id: totalPaidAmount.ids,
      paymentDate: (emi.payment_date ?? new Date()).toISOString().split("T")[0], // YYYY-MM-DD
    };
  },

  async createReceiptmanay(studentData, emi_id) {
    const existing = await receiptRepository.findAll({ emi_id });
    console.log("existing :  ", existing)
    if (existing.length > 0) return { fileName: existing[0].receipt_url };

    const fileName = `${studentData.name.replace(
      /[^\w-]/g,
      "_"
    )}-${Date.now()}_receipt.pdf`;
    console.log("hello ")
    console.log("fileName :  ", fileName)
    const receiptRow = await receiptRepository.create({
      student_id: studentData.id,
      emi_id:id,
      receipt_url: fileName,
    });

    const pdfBuffer = await htmlToPdf({
      ...studentData,
      serial_no: receiptRow.serial_no ?? receiptRow.id,
    });

    await uploadFileToAzure(
      pdfBuffer,
      `receipts/${fileName}`,
      "application/pdf"
    );

    return { fileName };
  },

  async emiAmountCheck(id, amount, payment_date) {
    if (typeof id !== 'number') {
      throw new Error(`Expected student_id as number, got ${typeof id}`);
    }
const today = new Date(); 

const paymentDate = new Date(payment_date); 

if (paymentDate > today) {
  throw new customError("Future payment date is not allowed", 400);
}
    const totalDue = await Emi.sum('due_amount', {
      where: {
        enrollment_id: id,
      },
    });

    if(amount>totalDue){
     throw new customError("cannot pay more than the due amount of this student") 
    }


    let remainingAmount = amount;
    const messages = [];

    const allEmis = await emisRepository.findAll({
      enrollment_id: id,
    });
    console.log("allEmis : :", allEmis)

    const sortedEmis = allEmis.sort(
      (a, b) => new Date(a.emi_duedate) - new Date(b.emi_duedate)
    );

    // ✅ Step 1: Process partial EMIs first
    for (let emi of sortedEmis) {
      if (emi.is_paid || emi.due_amount === 0) continue;

      if (remainingAmount === 0) break;

      if (remainingAmount >= emi.due_amount) {
        await emisRepository.model.update(
          {
            is_paid: true,
            payment_date: payment_date,
            due_amount: 0,
          },
          { where: { id: emi.id } }
        );
        messages.push(
          `EMI ID ${emi.id} remaining due ₹${emi.due_amount} fully cleared.`
        );
        remainingAmount -= emi.due_amount;
      } else {
        const updatedDue = emi.due_amount - remainingAmount;
        await emisRepository.model.update(
          {
            is_paid: false,
            payment_date: payment_date,
            due_amount: updatedDue,
          },
          { where: { id: emi.id } }
        );
        messages.push(
          `EMI ID ${emi.id} partially paid. ₹${remainingAmount} deducted, ₹${updatedDue} still due.`
        );
        remainingAmount = 0;
      }
    }

    // ✅ Step 2: Process unpaid EMIs
    for (let emi of sortedEmis) {
      if (emi.is_paid || emi.due_amount > 0) continue;

      if (remainingAmount === 0) break;

      if (remainingAmount >= emi.amount) {
        await emisRepository.model.update(
          {
            is_paid: true,
            payment_date: payment_date,
            due_amount: 0,
          },
          { where: { id: emi.id } }
        );
        messages.push(`EMI ID ${emi.id} fully paid. ₹${emi.amount} deducted.`);
        remainingAmount -= emi.amount;
      } else {
        const due = emi.amount - remainingAmount;
        await emisRepository.model.update(
          {
            is_paid: false,
            payment_date: payment_date,
            due_amount: due,
          },
          { where: { id: emi.id } }
        );
        messages.push(
          `EMI ID ${emi.id} partially paid. ₹${remainingAmount} deducted, ₹${due} due.`
        );
        remainingAmount = 0;
      }
    }
 
// return 
    await receiptRepository.create({student_id:id,amount:amount,payment_date:payment_date});
    // let student = await studentRepository.getDataById(id)
    // let data = {
    //   id: student.id,
    //   name: student.name,
    //   enrollment_id: student.enrollment_id,
    //   course_name: student.Course.course_name,
    //   amount: Number(amount),
    //   // emi_id: emi.id,
    //   paymentDate: payment_date
    // };
    // await this.createReceipt(data)
    return {
      success: true,
      message: 'EMI payment processing completed',
      leftOverAmount: remainingAmount,
      details: messages,
    };
  },

  getReciept: async (student_id) => {
    console.log(student_id);

    return await receiptRepository.findAll({ student_id: student_id })
  },
  downloadReciept: async (id) => {
    return receiptRepository.getDataById(id)
  }
};

module.exports = PaymentReceiptService;
