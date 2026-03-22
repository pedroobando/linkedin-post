'use server';

import { tryCatch } from '@/utils';
import { getMinioClient } from '@/lib/minio-client';

export const delFileFromR2 = async (fileName: string, bucketName: string) => {
  let minioClient;
  try {
    minioClient = getMinioClient();
  } catch (error) {
    console.error('Error al inicializar el cliente MinIO: ', error);
    throw new Error('Error al inicializar el cliente de almacenamiento');
  }

  // Verificar si el bucket existe
  const [bucketExists, checkError] = await tryCatch(minioClient.bucketExists(bucketName));

  if (checkError) {
    console.error('Error al verificar existencia del bucket: ', checkError.message);
    throw new Error(`Error al verificar si el bucket ${bucketName} existe`);
  }

  if (!bucketExists) {
    throw new Error(`El bucket ${bucketName} no existe`);
  }

  if (fileName.length <= 4) throw new Error(`Error al remover archivo ${bucketName}/${fileName}`);

  const [dataDown, errorDown] = await tryCatch(minioClient.removeObject(bucketName, fileName));
  if (errorDown) {
    console.error('Error al eliminar archivo: ', errorDown.message);
    throw new Error(`Error al remover archivo ${bucketName}/${fileName}`);
  }
  return dataDown;
};
