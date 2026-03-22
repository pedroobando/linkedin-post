'use server';

import { unicName, tryCatch } from '@/utils';
import { createBucket } from '@/actions/minio/create-bucket';
import { getMinioClient } from '@/lib/minio-client';

interface Props {
  objectR2: File;
  bucketName: string;
}

export const uploadFileToR2 = async ({ objectR2, bucketName }: Props) => {
  let minioClient;
  try {
    minioClient = getMinioClient();
  } catch (error) {
    console.error('Error al inicializar el cliente MinIO: ', error);
    throw new Error('Error al inicializar el cliente de almacenamiento');
  }

  // Verificar si el bucket existe, si no existe lo creamos
  const [bucketExists, checkError] = await tryCatch(createBucket(bucketName));

  if (checkError && !bucketExists) {
    throw new Error(`Error al verificar si el bucket ${bucketName} existe`);
  }

  const fileName = unicName(objectR2.name);

  const buffer = await objectR2.arrayBuffer();

  const [, erroUpload] = await tryCatch(
    minioClient.putObject(bucketName, fileName, Buffer.from(buffer), objectR2.size, { 'Content-Type': objectR2.type }),
  );

  if (erroUpload) {
    console.error('uploadFileToR2- Error subir imagen: ', erroUpload.message);
    throw new Error('Error al subir el archivo al bucket');
  }
  // if (dataUpload) {
  //   console.log('Éxito bucket: ', dataUpload.etag);
  // }

  return { key: `${bucketName}/${fileName}`, fileName };
};
