# Aplicación de Cuestionarios de Criptografía

Una aplicación web interactiva desarrollada en Vue 3 para practicar cuestionarios de criptografía. La aplicación carga preguntas desde un archivo JSON, proporciona retroalimentación instantánea y permite navegación fácil entre todas las preguntas.

## 🚀 Características

- **Múltiples tipos de preguntas**: Selección única, selección múltiple, verdadero/falso, rellenar espacios y emparejar
- **Navegación intuitiva**: Panel lateral con cuadrícula de preguntas numeradas
- **Retroalimentación instantánea**: Feedback inmediato sobre respuestas correctas e incorrectas
- **Filtrado por unidades**: Organización de preguntas por unidades temáticas
- **Estadísticas en tiempo real**: Contador de preguntas respondidas, correctas e incorrectas
- **Diseño responsivo**: Optimizado para dispositivos móviles y desktop
- **Interfaz moderna**: UI limpia con animaciones y transiciones suaves

## 🏗️ Arquitectura de Componentes

### `App.vue` - Componente Principal
**Responsabilidades:**
- Orquesta toda la aplicación
- Gestiona el estado global (preguntas, respuestas, progreso)
- Controla la navegación entre preguntas
- Maneja la lógica de evaluación de respuestas

**Estado Reactivo:**
```javascript
const questions = ref(questionsData.banco_de_preguntas)
const currentQuestionIndex = ref(0)
const userAnswers = ref([])           // Respuestas del usuario
const questionStates = ref([])        // Estado: null, true, false
```

### `NavigationGrid.vue` - Panel de Navegación
**Características:**
- Cuadrícula de botones numerados (uno por pregunta)
- Filtros por unidad temática
- Indicadores visuales de estado:
  - 🔵 Azul: Pregunta actual
  - 🟢 Verde: Respondida correctamente
  - 🔴 Rojo: Respondida incorrectamente
  - ⚪ Gris: Sin responder
- Estadísticas en tiempo real
- Leyenda de colores

### `QuizView.vue` - Vista Principal del Cuestionario
**Funcionalidades:**
- Muestra información de la pregunta (ID, unidad, tipo)
- Renderiza el componente `QuestionDisplay`
- Maneja la lógica de evaluación de respuestas
- Proporciona controles de navegación (Anterior/Siguiente)
- Muestra retroalimentación y respuestas correctas
- Botones de "Revisar Respuesta" y "Resetear"

### `QuestionDisplay.vue` - Renderizado Dinámico de Preguntas
**Tipos de preguntas soportados:**

1. **Selección Única** (`seleccion_unica`)
   - Radio buttons para opciones
   - Una sola respuesta permitida

2. **Selección Múltiple** (`seleccion_multiple`)
   - Checkboxes para opciones
   - Múltiples respuestas permitidas

3. **Verdadero/Falso** (`verdadero_falso`)
   - Radio buttons para "Verdadero" y "Falso"

4. **Rellenar Espacio** (`rellenar_espacio`)
   - Input de texto libre
   - Comparación insensible a mayúsculas/minúsculas

5. **Emparejar** (`emparejar`)
   - Conceptos emparejados con definiciones
   - Menús desplegables para asociaciones
   - Soporte para estructura de array de objetos

## 📊 Estructura de Datos

### Formato de Preguntas en JSON
```javascript
{
  "banco_de_preguntas": [
    {
      "id": "U1P1",
      "unidad": 1,
      "enunciado": "¿Cuál de las siguientes ciencias...",
      "tipo": "seleccion_multiple",
      "opciones": ["Opción 1", "Opción 2", ...],
      "respuesta_correcta": ["Respuesta 1", "Respuesta 2"]
    }
  ]
}
```

### Tipos de Respuestas Correctas
- **String**: Para selección única, verdadero/falso, rellenar espacio
- **Array**: Para selección múltiple, rellenar espacio (múltiples opciones)
- **Array de objetos**: Para emparejar
  ```javascript
  [
    { "concepto": "Concepto 1", "definicion": "Definición 1" },
    { "concepto": "Concepto 2", "definicion": "Definición 2" }
  ]
  ```

## 🎨 Sistema de Estilos

### Variables CSS Personalizadas
```css
:root {
  --primary-color: #667eea;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  /* ... más variables */
}
```

### Clases de Utilidad
- Espaciado: `mt-1`, `mb-2`, `p-3`, etc.
- Flexbox: `d-flex`, `justify-content-center`, etc.
- Texto: `text-center`, `text-primary`, etc.
- Componentes: `.btn`, `.card`, `.badge`, `.alert`

### Diseño Responsivo
- Grid layout para desktop (navegación + contenido)
- Stack layout para móviles
- Breakpoints: 576px, 768px, 992px

## 🔧 Instalación y Configuración

### Requisitos Previos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run serve

# Compilar para producción
npm run build
```

### Estructura de Archivos
```
src/
├── components/
│   ├── NavigationGrid.vue
│   ├── QuizView.vue
│   └── QuestionDisplay.vue
├── data/
│   └── questions.json
├── assets/
│   └── main.css
├── App.vue
└── main.js
```

## 🧪 Funcionalidades de Testing

### Lógica de Evaluación
La aplicación incluye lógica robusta para evaluar diferentes tipos de respuestas:

```javascript
// Selección múltiple: orden independiente
const sortedUser = [...userAnswer].sort()
const sortedCorrect = [...correctAnswer].sort()
return sortedUser.every((item, index) => item === sortedCorrect[index])

// Rellenar espacio: insensible a mayúsculas
return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()

// Emparejar: validación de todas las asociaciones
return Object.keys(correctMatches).every(concepto => 
  userAnswer[concepto] === correctMatches[concepto]
)
```

## 📱 Experiencia de Usuario

### Flujo de Navegación
1. **Inicio**: La aplicación carga en la primera pregunta
2. **Respuesta**: El usuario selecciona/escribe su respuesta
3. **Revisión**: Clic en "Revisar Respuesta" para evaluar
4. **Retroalimentación**: Mensaje de correcto/incorrecto + respuesta correcta
5. **Navegación**: Uso de botones o panel lateral para cambiar pregunta
6. **Progreso**: Visualización del progreso en tiempo real

### Características de Accesibilidad
- Navegación por teclado
- Colores contrastantes
- Textos descriptivos en tooltips
- Estructura semántica HTML

## 🔄 Gestión de Estado

### Estados de Pregunta
- `null`: Sin responder
- `true`: Respondida correctamente
- `false`: Respondida incorrectamente

### Persistencia
- Las respuestas se mantienen al navegar entre preguntas
- Posibilidad de resetear respuestas individuales
- Estado visual consistente en el panel de navegación

## 🎯 Casos de Uso Educativos

### Para Estudiantes
- Práctica autodirigida de conceptos de criptografía
- Retroalimentación inmediata para el aprendizaje
- Navegación flexible para revisar temas específicos
- Seguimiento del progreso personal

### Para Educadores
- Herramienta de evaluación formativa
- Análisis de áreas problemáticas por unidad
- Estructura modular para agregar nuevas preguntas
- Formato estandarizado de preguntas

## 🚀 Posibles Extensiones

### Funcionalidades Futuras
- **Temporizador**: Límite de tiempo por pregunta
- **Guardado local**: Persistencia en localStorage
- **Reportes**: Generación de reportes de progreso
- **Modo examen**: Desactivar navegación hacia atrás
- **Categorías**: Filtros adicionales por dificultad
- **Sonidos**: Feedback auditivo
- **Modo oscuro**: Tema alternativo
- **Exportar resultados**: PDF o CSV

### Integraciones
- Backend para almacenamiento de resultados
- Sistema de autenticación de usuarios
- API para carga dinámica de preguntas
- Analytics de uso y rendimiento

## 📄 Licencia

Este proyecto está desarrollado para fines educativos en el contexto de la Universidad Central del Ecuador (UCE).

---

**Desarrollado con ❤️ usando Vue 3 + Composition API**
