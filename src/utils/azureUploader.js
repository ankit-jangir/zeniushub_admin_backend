// require("dotenv").config();
// const {
//   BlobServiceClient,
//   StorageSharedKeyCredential,
// } = require("@azure/storage-blob");
// const path = require("path");
// const fs = require("fs");
// const { log } = require("console");
// const customError = require("./error.handler");

// const account = process.env.AZURE_ACCOUNT_NAME; // "indibaba"
// const accountKey = process.env.AZURE_ACCOUNT_KEY; // your secret key
// const containerName = process.env.AZURE_CONTAINER_NAME; // "indibaba-chat"

// const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
// const blobServiceClient = new BlobServiceClient(
//   `https://${account}.blob.core.windows.net`,
//   sharedKeyCredential
// );
// const containerClient = blobServiceClient.getContainerClient(containerName);

// // Check container connection on start (optional)
// async function checkConnection() {
//   const exists = await containerClient.exists();
//   console.log(
//     exists
//       ? `✅ Connected! Container exists: ${containerName}`
//       : `❌ Container does NOT exist: ${containerName}`
//   );
// }
// checkConnection();

// // Upload function to export and reuse
// // async function uploadFileToAzure(filePath, blobName) {
// //   // try {

// //   // Check if file exists locally
// //   // if (!fs.existsSync(filePath)) {
// //   //   throw new Error(`File not found at path: ${filePath}`);
// //   // }

// //   // Get block blob client for the file (blobName is the name it will have in Azure)
// //   const blobFileName = path.basename(filePath); // Rajat_singh_receipt.pdf

// //   const azurePath = `${blobName}/${blobFileName}`; // receipts/Rajat_singh_receipt.pdf

// //   const blockBlobClient = containerClient.getBlockBlobClient(azurePath);

// //   const uploadResponse = await blockBlobClient.uploadFile(filePath)
// //   console.log("data  ", filePath, blobName)
// //   console.log(`✅ Upload successful! Blob URL: `);
// //   return {
// //     success: true,
// //     url: blockBlobClient.url,
// //     details: uploadResponse,
// //   };
// //   // } catch (error) {
// //   //   console.error('❌ Upload failed:', error.message);
// //   //   return { success: false, error: error.message };
// //   // }
// // }
// async function uploadFileToAzure(buffer, blobPath, mimetype) {
//   try {
//     const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
//     console.log("buffer     ", buffer);

//     const uploadResponse = await blockBlobClient.uploadData(buffer, {
//       blobHTTPHeaders: {
//         blobContentType: `application/${mimetype}`,
//       },
//     });

//     console.log(`✅ Upload successful! Blob: ${uploadResponse}`);
//     return {
//       success: true,
//       url: blockBlobClient.url,
//       details: uploadResponse,
//     };
//   } catch (error) {
//     console.error("❌ Upload failed:", error.message);
//     return { success: false, error: error.message };
//   }
// }
// const getBlob = async (fileName) => {
//   try {
//     // const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);
//     // const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
//     console.log("aaa  ", fileName);

//     const containerExists = await containerClient.exists();
//     if (!containerExists) {
//       throw new customError("Container does not exist in blob storage", 500);
//     }

//     const blobClient = containerClient.getBlobClient(fileName);

//     // Await the blob existence check
//     const blobExists = await blobClient.exists();
//     if (!blobExists) {
//       throw new customError("Resource not found", 404);
//     }

//     const downloadBlockBlobResponse = await blobClient.download();
//     return downloadBlockBlobResponse;
//   } catch (err) {
//     let errcode = err.statusCode || 500
//     throw new customError(err.message, errcode)
//   }
// }

// module.exports = {
//   containerClient,
//   uploadFileToAzure,
//   getBlob
// };

// require("dotenv").config();
// const {
//   BlobServiceClient,
//   StorageSharedKeyCredential,
// } = require("@azure/storage-blob");
// const path = require("path");
// const customError = require("./error.handler");
// const fs = require("fs").promises;
// const account = process.env.AZURE_ACCOUNT_NAME; // "indibaba"
// const accountKey = process.env.AZURE_ACCOUNT_KEY; // your secret key
// const containerName = process.env.AZURE_CONTAINER_NAME; // "indibaba-chat"

// const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
// const blobServiceClient = new BlobServiceClient(
//   `https://${account}.blob.core.windows.net`,
//   sharedKeyCredential
// );
// const containerClient = blobServiceClient.getContainerClient(containerName);

// // Optional container connection check at startup
// async function checkConnection() {
//   const exists = await containerClient.exists();
//   console.log(
//     exists
//       ? `✅ Connected! Container exists: ${containerName}`
//       : `❌ Container does NOT exist: ${containerName}`
//   );
// }
// checkConnection();

// async function uploadFileToAzure(buffer, blobPath, mimetype) {
//   try {
//     const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

//     const uploadResponse = await blockBlobClient.uploadData(buffer, {
//       blobHTTPHeaders: {
//         blobContentType: `application/${mimetype}`,
//       },
//     });

//     console.log(`✅ Upload successful! Blob: ${uploadResponse}`);
//     return {
//       success: true,
//       url: blockBlobClient.url,
//       details: uploadResponse,
//     };
//   } catch (error) {
//     console.error("❌ Upload failed:", error.message);
//     return { success: false, error: error.message };
//   }
// }

// const getBlob = async (fileName) => {
//   try {
//     const containerExists = await containerClient.exists();
//     if (!containerExists) {
//       throw new customError("Container does not exist in blob storage", 500);
//     }

//     const blobClient = containerClient.getBlobClient(fileName);
//     const blobExists = await blobClient.exists();
//     if (!blobExists) {
//       throw new customError("Resource not found", 404);
//     }

//     const downloadBlockBlobResponse = await blobClient.download();
//     return downloadBlockBlobResponse;
//   } catch (err) {
//     let errcode = err.statusCode || 500;
//     throw new customError(err.message, errcode);
//   }
// };

// const deleteFromAzure = async (imageUrl) => {
//   try {
//     const blobName = imageUrl.split("/").pop(); // Extract file name
//     const blobClient = containerClient.getBlobClient(blobName);
//     await blobClient.deleteIfExists();
//     console.log(`🗑️ Deleted blob: ${blobName}`);
//   } catch (err) {
//     console.error("Azure delete error:", err.message);
//   }
// };
// async function deleteAllBlobs() {
//   // Use the already defined credentials and container name
//   const sharedKeyCredential = new StorageSharedKeyCredential(
//     account,
//     accountKey
//   );
//   const blobServiceClient = new BlobServiceClient(
//     `https://${account}.blob.core.windows.net`,
//     sharedKeyCredential
//   );
//   const containerClient = blobServiceClient.getContainerClient(containerName);

//   console.log(`Deleting all blobs in container: ${containerName}`);

//   // List and delete all blobs
//   for await (const blob of containerClient.listBlobsFlat()) {
//     const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
//     await blockBlobClient.deleteIfExists();
//     console.log(`🗑️ Deleted blob: ${blob.name}`);
//   }

//   console.log("✅ All blobs deleted.");
// }

// module.exports = {
//   containerClient,
//   uploadFileToAzure,
//   getBlob,
//   deleteFromAzure,
//   deleteAllBlobs,
// };




module.exports = {
  getBlob: async () => { return { readableStreamBody: null }; },
  deleteAllBlobs: async () => {}
};
