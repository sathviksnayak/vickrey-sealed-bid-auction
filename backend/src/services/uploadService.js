import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

function uploadBuffer(file, folder, resourceType = "image") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

export async function uploadImage(file) {
  const result = await uploadBuffer(file, "auction-images");

  return result.secure_url;
}

export async function uploadDocument(file) {
  const result = await uploadBuffer(file, "auction-documents", "raw");

  return {
    name: file.originalname,
    url: result.secure_url,
  };
}
