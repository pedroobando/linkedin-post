'use server';

import { tryCatch } from '@/utils';
import { getMinioClient } from '@/lib/minio-client';

export const dnloadFileFromR2 = async (fileName: string, bucketName: string) => {
  let minioClient;
  try {
    minioClient = getMinioClient();
  } catch (error) {
    console.error('Error al inicializar el cliente MinIO: ', error);
    throw new Error('Error al inicializar el cliente de almacenamiento');
  }

  // Verify if the bucket exists
  const [bucketExists, checkError] = await tryCatch(minioClient.bucketExists(bucketName));

  if (checkError) {
    console.error('Error al verificar existencia del bucket: ', checkError.message);
    throw new Error(`Error al verificar si el bucket ${bucketName} existe`);
  }

  if (!bucketExists) {
    throw new Error(`El bucket ${bucketName} no existe`);
  }

  // Get the object data stream
  const [dataStream, errorDown] = await tryCatch(minioClient.getObject(bucketName, fileName));

  if (errorDown) {
    console.error('Error al descargar archivo: ', errorDown.message);
    throw new Error(`Error al descargar archivo ${bucketName}/${fileName}`);
  }

  return dataStream;
};
