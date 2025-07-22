// lib/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';

// Configure the S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(file: File): Promise<string> {
  // 1. Read the file into a buffer
  const fileBuffer = await file.arrayBuffer();

  // 2. Create a unique file name to avoid overwrites
  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;

  // 3. Prepare the parameters for the S3 upload
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `tour-images/${uniqueFileName}`, // We'll store images in a 'tour-images' folder
    Body: Buffer.from(fileBuffer),
    ContentType: file.type,
  };

  // 4. Create and send the upload command
  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  // 5. Construct and return the public URL of the uploaded file
  const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
  
  console.log(`✅ Successfully uploaded ${file.name} to ${fileUrl}`);
  return fileUrl;
}