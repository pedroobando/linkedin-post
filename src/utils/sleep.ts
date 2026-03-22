/**
 * Pausa la ejecución asíncrona por el tiempo especificado
 * @param ms Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo especificado
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// // Ejemplo de uso
// async function ejemplo() {
//   console.log('Inicio');
//   await sleep(2000); // Espera 2 segundos
//   console.log('Después de 2 segundos');
// }
