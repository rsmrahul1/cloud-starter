const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

async function main() {
  try {
    console.log("Azure Blob storage v12 - JavaScript");

    const AZURE_STORAGE_CONNECTION_STRING =
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error('Azure Storage Connection string not found');
    }

    // Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    console.log('\nListing blobs...');
    const containerName = 'badge-storage';

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await listBlobFiles(containerClient);

    const blobName = 'kk';
   await deleteBlobIfItExists(containerClient, blobName)

   await downloadBlobToFile(containerClient,"11",process.env.LOCAL_PATH)

   await createBlobFromLocalPath(containerClient,"33",process.env.LOCAL_PATH)

  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function listBlobFiles(containerClient) {
  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    // Get Blob Client from name, to get the URL
    const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);

    // Display blob name and URL
    console.log(
      `\n\tname: ${blob.name}\n\tURL: ${tempBlockBlobClient.url}\n`
    );
  }
}

async function deleteBlobIfItExists(containerClient, blobName){

  // include: Delete the base blob and all of its snapshots.
  // only: Delete only the blob's snapshots and not the blob itself.
  const options = {
    deleteSnapshots: 'include' // or 'only'
  }

  // Create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.deleteIfExists(options);

  console.log(`deleted blob ${blobName}`);

}

async function downloadBlobToFile(containerClient, blobName, fileNameWithPath) {

  const blobClient = await containerClient.getBlobClient(blobName);
  
  await blobClient.downloadToFile(fileNameWithPath);
  console.log(`download of ${blobName} success`);
}

async function createBlobFromLocalPath(containerClient, blobName, localFileWithPath, uploadOptions){

  // create blob client from container client
  const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

  // upload file to blob storage
  await blockBlobClient.uploadFile(localFileWithPath, uploadOptions);
  console.log(`${blobName} succeeded`);
}

main()
  .then(() => console.log("Done"))
  .catch((ex) => console.log(ex.message));