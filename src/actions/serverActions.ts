import { UploadResponse } from '../types';

export async function uploadFile(file: File): Promise<UploadResponse> {
  // This is a placeholder for the actual API call
  // Replace with your actual API endpoint and implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'File uploaded successfully!',
        fileUrl: 'https://example.com/files/document.pdf'
      });
    }, 2000);
  });
}