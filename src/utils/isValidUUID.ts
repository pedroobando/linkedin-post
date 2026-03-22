export const isValidUUID = (id: string): boolean => {
  if (typeof id !== 'string' || id.length !== 36) {
    return false;
  }

  // Patrón para UUID v4
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
};
