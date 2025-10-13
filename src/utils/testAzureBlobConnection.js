const containerClient = require('../config/azureBlobConfig'); // update the path as needed

async function testAzureConnection() {
  try {
    const exists = await containerClient.exists();
    if (!exists) {
      console.log('⚠️ Container does not exist.');
      return;
    }

    console.log('✅ Connected! Container exists:', containerClient.containerName);

    console.log('📦 Listing blobs:');
    for await (const blob of containerClient.listBlobsFlat()) {
      console.log(`- ${blob.name}`);
    }
  } catch (error) {
    console.error('❌ Azure Blob Storage connection failed:', error.message);
  }
}

testAzureConnection();
