'use server';

import { tryCatch } from '@/utils';
import { getMinioClient } from '@/lib/minio-client';

export const createBucket = async (bucketName: string) => {
  // Validar el nombre del bucket
  if (!bucketName || bucketName.trim().length === 0) {
    throw new Error('El nombre del bucket no puede estar vacío');
  }

  let minioClient;
  try {
    minioClient = getMinioClient();
  } catch (error) {
    console.error('Error al inicializar el cliente MinIO: ', error);
    throw new Error('Error al inicializar el cliente de almacenamiento');
  }

  // Verificar si el bucket ya existe
  const [bucketExists, checkError] = await tryCatch(minioClient.bucketExists(bucketName));

  // if (checkError && !bucketExists) {
  //   console.error('Error al verificar existencia del bucket: ', checkError.message);
  // }

  if (!checkError && bucketExists) {
    // console.log(`El bucket ${bucketName} ya existe`);
    return [true, null];
  }

  // Crear el bucket
  const [, errorCreate] = await tryCatch(minioClient.makeBucket(bucketName));

  if (errorCreate) {
    console.error('Error al crear bucket: ', errorCreate.message);
    throw new Error(`Error al crear el bucket ${bucketName}`);
  }

  return [true, null];
};
