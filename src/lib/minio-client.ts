import { Client } from 'minio';

// Lazy initialization of the MinIO client to avoid build-time instantiation
let _minioClient: Client | null = null;

function getMinioClient(): Client {
  if (!_minioClient) {
    const minioConfig = {
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9100', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    };

    // During build time, we might not have proper env variables, so we'll just return a client
    // with default configuration. In production, ensure these are properly set.
    _minioClient = new Client(minioConfig);
  }

  // console.log(_minioClient);
  return _minioClient;
}

export { getMinioClient };

// export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;
