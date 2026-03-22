/**
 * Convierte una cadena a formato de palabras con la primera letra en mayúscula
 * y el resto en minúscula (por ejemplo: "juan perez" -> "Juan Perez")
 * 
 * @param str - La cadena a convertir
 * @returns La cadena con cada palabra capitalizada
 */
export const capitalizeWords = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};