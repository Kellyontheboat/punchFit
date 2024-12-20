const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } = require('@aws-sdk/client-s3')
const dotenv = require('dotenv')
dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  requestTimeout: 600000 // 5 minutes timeout
})

const multipartUpload = async (fileName, fileBuffer, mimetype) => {
  // Step 1: Create a multipart upload session
  const createMultipartParams = {
    Bucket: bucketName,
    Key: fileName,
    ContentType: mimetype
  }

  const { UploadId } = await s3Client.send(new CreateMultipartUploadCommand(createMultipartParams))

  const partSize = 5 * 1024 * 1024 // 5MB per part
  const parts = []
  let partNumber = 1

  for (let start = 0; start < fileBuffer.length; start += partSize) {
    const end = Math.min(start + partSize, fileBuffer.length)
    const partBuffer = fileBuffer.slice(start, end)

    // Step 2: Upload the current part
    const uploadPartParams = {
      Bucket: bucketName,
      Key: fileName,
      PartNumber: partNumber,
      UploadId,
      Body: partBuffer
    }

    const part = await s3Client.send(new UploadPartCommand(uploadPartParams))
    console.log(`Uploaded part #${partNumber}`)

    parts.push({ PartNumber: partNumber, ETag: part.ETag })
    partNumber += 1
  }

  // Step 3: Complete the multipart upload
  const completeMultipartParams = {
    Bucket: bucketName,
    Key: fileName,
    UploadId,
    MultipartUpload: { Parts: parts }
  }

  return s3Client.send(new CompleteMultipartUploadCommand(completeMultipartParams))
}

module.exports = { multipartUpload }
