import fs from 'fs';
import path from 'path';
import { minioClient, BUCKET_NAME } from '@/lib/minio';

async function uploadSystemLogo() {
  try {
    // Path to the logo file
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const fileBuffer = fs.readFileSync(logoPath);

    // Generate filename
    const filename = 'system/logo.png';

    // Upload to MinIO
    await minioClient.putObject(
      BUCKET_NAME,
      filename,
      fileBuffer,
      fileBuffer.length,
      { 'Content-Type': 'image/png' }
    );

    // Generate public URL
    const url = `https://boop-minioboop.dpbdp1.easypanel.host/${BUCKET_NAME}/${filename}`;
    console.log('Logo uploaded successfully');
    console.log('URL:', url);

    return url;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}

uploadSystemLogo(); 