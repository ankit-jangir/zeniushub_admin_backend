const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const { uploadFileToAzure } = require("./azureUploader");
const customError = require("./error.handler");

/* ---------- helpers ---------- */

// Format dates like "30-Nov-2025"
function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Parse a user-supplied string → Date|null
function parseDateSafe(str) {
  if (!str || typeof str !== "string") return null;
  const parsed = new Date(str.trim());
  return isNaN(parsed) ? null : parsed;
}

/**
 * Creates a certificate JPEG and uploads it directly to Azure.
 *
 * @param {object}  student             Sequelize Student instance
 * @param {string?} overrideEndDateStr  Optional ISO date provided by user
 * @returns {{ success: boolean, url: string }}
 */
async function generateCertificateImage(student, overrideEndDateStr) {
  /* 1️⃣ background ------------------------------------------------------- */
  const template = await loadImage(
    path.join(__dirname, "../assets/certificate/company1.jpg")
  );

  /* 2️⃣ canvas ----------------------------------------------------------- */
  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(template, 0, 0);

  /* 3️⃣ dynamic text ----------------------------------------------------- */
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  const centerX = template.width / 2;

  // Student name
  ctx.font = "bold 40px sans-serif";
  ctx.fillText(student.name, centerX, 540);

  // Course name
  const courseName = student.Course ? student.Course.course_name : "";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText(` ${courseName}`, template.width - 500, 580);

  // Start date
  ctx.font = "bold 20px sans-serif";
  const startDateFormatted = student.Batch
    ? formatDate(student.Batch.StartDate)
    : "";
  ctx.fillText(` ${startDateFormatted}`, template.width - 820, 620);

  // End date → use override only if it parses correctly
  const overrideDateObj = parseDateSafe(overrideEndDateStr);
  const endDateObj =
    overrideDateObj || (student.Batch ? student.Batch.EndDate : null);
  const endDateFormatted = formatDate(endDateObj);

  ctx.fillText(`${endDateFormatted}`, template.width - 590, 620);

  /* 4️⃣ upload ----------------------------------------------------------- */
  const buffer = canvas.toBuffer("image/jpeg");
  const certName = `${student.name.replace(/ /g, "")}_certificate.jpg`;

  const uploadResult = await uploadFileToAzure(
    buffer,
    `certificates/${certName}`,
    "image/jpeg"
  );

  if (!uploadResult.success) {
    throw new customError("Failed to upload certificate");
  }
  return uploadResult; // { success: true, url: "…" }
}

module.exports = { generateCertificateImage };