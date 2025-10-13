const { Client } = require("pg");
const fs = require("fs");
const fastcsv = require("fast-csv");

// PostgreSQL Connection
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "intellix",
  password: "1234",
  port: 5432,
});

client.connect();

const csvFilePath = "students.csv";
const stream = fs.createReadStream(csvFilePath);
const csvData = [];

const csvStream = fastcsv
  .parse()
  .on("data", (row) => {
    csvData.push(row);
  })
  .on("end", async () => {
    csvData.shift(); // Remove header row

    const query =
      "INSERT INTO students (course_id, batch_id, enrollment_id, name, address, adhar_no, pancard_no, email, contact_no,father_name, mother_name, parent_adhar_no, parent_account_no, ifsc_no, count_emi,discount_amount, final_amount, status, invoice_status, dob, serial_no, rt, gender, ex_school,created_at,updated_at)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10, $11, $12, $13, $14, $15,$16, $17, $18, $19, $20, $21, $22, $23, $24,$25,$26)";

    for (let row of csvData) {
      await client.query(query, row);
    }
    console.log("inserted");

    console.log("CSV Data Inserted Successfully!");
    client.end();
  });

stream.pipe(csvStream);
