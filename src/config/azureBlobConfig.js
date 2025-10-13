require('dotenv').config();
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const account = process.env.AZURE_ACCOUNT_NAME;          // "indibaba"
const accountKey = process.env.AZURE_ACCOUNT_KEY;        // your secret key
const containerName = process.env.AZURE_CONTAINER_NAME;  // "indibaba-chat"

// Create shared key credential
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

// Create Blob service client using the account and key
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

// Get container client (like a folder)
const containerClient = blobServiceClient.getContainerClient(containerName);

// Export container client
module.exports = containerClient;
