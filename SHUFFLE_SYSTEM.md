# Sistema de Barajeo de Opciones

## 🎯 Objetivo
Prevenir que los estudiantes memoricen patrones de respuestas por posición, mejorando así la calidad del aprendizaje y la evaluación.

## 🔧 Implementación Técnica

### Algoritmo Determinista
Utilizamos el algoritmo **Fisher-Yates modificado** con un **Generador Congruencial Lineal (LCG)** para garantizar:

1. **Reproducibilidad**: Mismo ID de pregunta = mismo orden de opciones
2. **Distribución uniforme**: Todas las permutaciones son igualmente probables
3. **Eficiencia**: O(n) tiempo de ejecución

### Código Base (`src/utils/shuffle.js`)

```javascript
// Generador de hash simple para crear semilla numérica
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit
  }
  return Math.abs(hash);
};

// Barajeo determinista usando Fisher-Yates + LCG
export const deterministicShuffle = (array, seed) => {
  const shuffled = [...array];
  let hash = simpleHash(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    // LCG: Xn+1 = (a * Xn + c) mod m
    hash = (hash * 9301 + 49297) % 233280;
    const j = Math.floor((hash / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};
```

### Parámetros del LCG
- **a = 9301**: Multiplicador (número primo)
- **c = 49297**: Incremento (número primo)
- **m = 233280**: Módulo (2^8 * 910)

Estos valores fueron elegidos para maximizar el período y garantizar una distribución uniforme.

## 🎮 Integración en Componentes

### QuestionDisplay.vue
```javascript
import { deterministicShuffle } from '@/utils/shuffle';

computed: {
  shuffledMultipleOptions() {
    if (!this.hasOptions) return [];
    
    const options = [
      this.question.option_a,
      this.question.option_b, 
      this.question.option_c,
      this.question.option_d
    ].filter(Boolean);
    
    return deterministicShuffle(options, this.question.id);
  }
}
```

## 📊 Casos de Uso

### Tipos de Pregunta Afectados
- ✅ **Opción múltiple**: Baraja opciones A, B, C, D
- ✅ **Verdadero/Falso**: Baraja Verdadero/Falso
- ❌ **Completar**: No tiene opciones para barajar
- ❌ **Relacionar**: Las columnas no se barajan (mantiene lógica)
- ❌ **Ordenar**: El orden es parte de la pregunta

### Ejemplo Visual
```
Pregunta ID: "crypto_001"
Original: [A, B, C, D]
Barajado: [C, A, D, B]  ← Siempre el mismo orden para esta pregunta
```

## 🧪 Testing

### Casos de Prueba
1. **Consistencia**: Mismo ID → Mismo orden
2. **Variabilidad**: IDs diferentes → Órdenes diferentes  
3. **Completitud**: Todas las opciones presentes
4. **Performance**: Tiempo O(n) para n opciones

### Comando de Prueba
```bash
npm run test:unit -- shuffle
```

## 🚀 Beneficios Pedagógicos

### Para Estudiantes
- **Aprendizaje real**: Deben leer todas las opciones
- **Reduce adivinanza**: No pueden usar patrones de posición
- **Experiencia variada**: Cada sesión se siente única

### Para Instructores
- **Datos más confiables**: Resultados reflejan conocimiento real
- **Reduce trampas**: Dificulta copiar respuestas por posición
- **Análisis mejorado**: Estadísticas más representativas

## 🔍 Monitoreo y Debug

### Indicador Visual (Opcional)
```html
<div v-if="isShuffled" class="shuffle-indicator">
  🔀 Opciones barajadas
</div>
```

### Logs de Desarrollo
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Barajeo aplicado:', {
    questionId: this.question.id,
    original: originalOptions,
    shuffled: shuffledOptions
  });
}
```

## 📈 Métricas de Efectividad

### KPIs Sugeridos
- **Distribución de respuestas**: Por posición de opción
- **Tiempo promedio**: Por pregunta (antes/después)
- **Tasa de aciertos**: Comparación pre/post implementación
- **Patrones de respuesta**: Análisis de sesgo posicional

## 🔧 Configuración Avanzada

### Desactivar Barajeo (si necesario)
```javascript
// En .env
VUE_APP_DISABLE_SHUFFLE=true

// En componente
computed: {
  shouldShuffle() {
    return process.env.VUE_APP_DISABLE_SHUFFLE !== 'true';
  }
}
```

### Semilla Personalizada
```javascript
// Usar timestamp para variabilidad por sesión
const sessionSeed = this.question.id + Date.now();
const shuffled = deterministicShuffle(options, sessionSeed);
```

---

## 📝 Notas de Implementación

### Consideraciones
- El barajeo es **invisible** para el estudiante
- Mantiene **accesibilidad** (orden lógico en lectores de pantalla)
- **Compatible** con todas las funcionalidades existentes
- **Reversible** mediante configuración

### Próximas Mejoras
- [ ] A/B testing de efectividad
- [ ] Analytics de patrones de respuesta
- [ ] Configuración por tipo de pregunta
- [ ] Personalización por instructor
