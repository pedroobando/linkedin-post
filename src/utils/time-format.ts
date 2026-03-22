/**
 * Convierte minutos a un formato legible
 * @param minutes - Número de minutos a convertir
 * @returns Cadena con el formato legible (ej: '30min', '2h y 40min', '1d con 2h y 30min')
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  if (minutes < 1440) { // Menos de 24 horas (24 * 60 = 1440)
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h y ${remainingMinutes}min`;
  }

  // 24 horas o más
  const days = Math.floor(minutes / 1440);
  const remainingMinutesAfterDays = minutes % 1440;
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const remainingMinutes = remainingMinutesAfterDays % 60;

  if (hours === 0 && remainingMinutes === 0) {
    return `${days}d`;
  }

  if (remainingMinutes === 0) {
    return `${days}d con ${hours}h`;
  }

  return `${days}d con ${hours}h y ${remainingMinutes}min`;
}

/**
 * Convierte formato de 24h a formato de 12h con sufijo a/p
 * @param time24h - Hora en formato 24h (ej: '14:00', '07:30')
 * @returns Hora en formato 12h con sufijo (ej: '2:00p', '7:30a')
 */
export function formatTime12h(time24h: string): string {
  const [hoursStr, minutesStr] = time24h.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;

  const isPm = hours >= 12;
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = isPm ? 'p' : 'a';

  return `${hours12}:${minutes}${suffix}`;
}