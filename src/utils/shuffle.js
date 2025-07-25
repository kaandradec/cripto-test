/**
 * Utilidades para barajear arrays y generar shuffles deterministas
 */

/**
 * Barajea un array usando el algoritmo Fisher-Yates
 * @param {Array} array - Array a barajear
 * @returns {Array} - Nuevo array barajado
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Barajea un array de forma determinista usando un seed
 * Esto garantiza que el mismo seed siempre produzca el mismo orden
 * @param {Array} array - Array a barajear
 * @param {string} seed - Cadena usada como semilla para el shuffle
 * @returns {Array} - Nuevo array barajado deterministicamente
 */
export const deterministicShuffle = (array, seed) => {
  if (!array || array.length <= 1) return [...array];

  const shuffled = [...array];
  let hash = 0;

  // Crear un hash simple del seed
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }

  // Usar el hash como seed para el shuffle (implementación de LCG)
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280; // Generador congruencial lineal
    const j = Math.floor((hash / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/**
 * Genera un hash simple de una cadena
 * @param {string} str - Cadena a hashear
 * @returns {number} - Hash numérico
 */
export const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

/**
 * Barajea las opciones de una pregunta basándose en su ID
 * @param {Object} question - Objeto pregunta con id y opciones
 * @returns {Array} - Opciones barajadas
 */
export const shuffleQuestionOptions = (question) => {
  if (!question || !question.opciones) return [];

  const seed = question.id || Math.random().toString(36).substr(2, 9);
  return deterministicShuffle(question.opciones, seed);
};

/**
 * Verifica si dos arrays tienen los mismos elementos (sin importar el orden)
 * Útil para verificar respuestas de selección múltiple
 * @param {Array} arr1 - Primer array
 * @param {Array} arr2 - Segundo array
 * @returns {boolean} - True si contienen los mismos elementos
 */
export const arraysEqual = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((item, index) => item === sorted2[index]);
};
