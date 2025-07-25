<template>
  <div class="question-display">
    <!-- Enunciado de la pregunta -->
    <div class="question-statement">
      <h3>{{ question.enunciado }}</h3>
    </div>

    <!-- Renderizado dinámico según el tipo de pregunta -->
    <div class="question-content">
      <!-- Selección única y Verdadero/Falso -->
      <div
        v-if="
          question.tipo === 'seleccion_unica' ||
          question.tipo === 'verdadero_falso'
        "
        class="radio-group"
      >
        <label
          v-for="opcion in availableOptions"
          :key="opcion"
          class="radio-option"
          :class="{ disabled: isReviewed }"
        >
          <input
            type="radio"
            :value="opcion"
            v-model="localAnswer"
            :disabled="isReviewed"
            @change="emitAnswer"
          />
          <span class="radio-label">{{ opcion }}</span>
        </label>
      </div>

      <!-- Selección múltiple -->
      <div
        v-else-if="question.tipo === 'seleccion_multiple'"
        class="checkbox-group"
      >
        <label
          v-for="opcion in question.opciones"
          :key="opcion"
          class="checkbox-option"
          :class="{ disabled: isReviewed }"
        >
          <input
            type="checkbox"
            :value="opcion"
            v-model="localAnswer"
            :disabled="isReviewed"
            @change="emitAnswer"
          />
          <span class="checkbox-label">{{ opcion }}</span>
        </label>
      </div>

      <!-- Rellenar espacio -->
      <div
        v-else-if="question.tipo === 'rellenar_espacio'"
        class="text-input-group"
      >
        <input
          type="text"
          v-model="localAnswer"
          :disabled="isReviewed"
          @input="emitAnswer"
          class="text-input"
          placeholder="Escriba su respuesta aquí..."
        />
      </div>

      <!-- Emparejar -->
      <div v-else-if="question.tipo === 'emparejar'" class="matching-group">
        <div class="matching-instructions">
          <p>Asocie cada concepto con su definición correspondiente:</p>
        </div>

        <div class="matching-pairs">
          <div
            v-for="concepto in concepts"
            :key="concepto"
            class="matching-pair"
          >
            <div class="concept">
              <span class="concept-label">{{ concepto }}</span>
            </div>
            <div class="arrow">→</div>
            <div class="definition-selector">
              <select
                v-model="localAnswer[concepto]"
                :disabled="isReviewed"
                @change="emitAnswer"
                class="definition-select"
              >
                <option value="">Seleccione una definición</option>
                <option
                  v-for="definicion in definitions"
                  :key="definicion"
                  :value="definicion"
                >
                  {{ definicion }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipo no soportado -->
      <div v-else class="unsupported-type">
        <p>Tipo de pregunta no soportado: {{ question.tipo }}</p>
        <pre>{{ JSON.stringify(question, null, 2) }}</pre>
      </div>
    </div>

    <!-- Mostrar respuesta actual (para debug) -->
    <div v-if="showDebugInfo" class="debug-info">
      <details>
        <summary>Debug Info</summary>
        <pre>{{
          JSON.stringify(
            { localAnswer, userAnswer, questionData: question },
            null,
            2
          )
        }}</pre>
      </details>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";

export default {
  name: "QuestionDisplay",
  props: {
    question: {
      type: Object,
      required: true,
    },
    userAnswer: {
      default: null,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    isCorrect: {
      default: null,
    },
    showDebugInfo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["answer-changed"],
  setup(props, { emit }) {
    const localAnswer = ref(null);

    // Inicializar respuesta local según el tipo de pregunta
    const initializeAnswer = () => {
      switch (props.question.tipo) {
        case "seleccion_multiple":
          localAnswer.value = Array.isArray(props.userAnswer)
            ? [...props.userAnswer]
            : [];
          break;
        case "emparejar":
          localAnswer.value = props.userAnswer ? { ...props.userAnswer } : {};
          break;
        default:
          localAnswer.value = props.userAnswer || "";
      }
    };

    // Opciones disponibles para selección única y verdadero/falso
    const availableOptions = computed(() => {
      if (props.question.tipo === "verdadero_falso") {
        return ["Verdadero", "Falso"];
      }
      return props.question.opciones || [];
    });

    // Extraer conceptos y definiciones para emparejar
    const concepts = computed(() => {
      if (props.question.tipo !== "emparejar" || !props.question.opciones) {
        return [];
      }

      // Estructura del JSON: opciones.conceptos array
      if (props.question.opciones.conceptos) {
        return props.question.opciones.conceptos;
      }

      if (Array.isArray(props.question.opciones)) {
        return props.question.opciones;
      }

      // Si respuesta_correcta es un array de objetos con concepto y definicion
      if (Array.isArray(props.question.respuesta_correcta)) {
        return props.question.respuesta_correcta
          .map((item) => item.concepto)
          .filter(Boolean);
      }

      return [];
    });

    const definitions = computed(() => {
      if (props.question.tipo !== "emparejar" || !props.question.opciones) {
        return [];
      }

      // Estructura del JSON: opciones.definiciones array
      if (props.question.opciones.definiciones) {
        return props.question.opciones.definiciones;
      }

      // Si respuesta_correcta es un array de objetos con concepto y definicion
      if (Array.isArray(props.question.respuesta_correcta)) {
        return props.question.respuesta_correcta
          .map((item) => item.definicion)
          .filter(Boolean);
      }

      // Fallback: usar conceptos como definiciones
      return concepts.value;
    });

    // Obtener la respuesta correcta como objeto para emparejar
    const getCorrectMatches = computed(() => {
      if (props.question.tipo !== "emparejar") return {};

      if (Array.isArray(props.question.respuesta_correcta)) {
        const matches = {};
        props.question.respuesta_correcta.forEach((item) => {
          if (item.concepto && item.definicion) {
            matches[item.concepto] = item.definicion;
          }
        });
        return matches;
      }

      return props.question.respuesta_correcta || {};
    });

    // Emitir cambio de respuesta
    const emitAnswer = () => {
      emit("answer-changed", localAnswer.value);
    };

    // Observar cambios en userAnswer prop
    watch(
      () => props.userAnswer,
      () => {
        initializeAnswer();
      },
      { immediate: true }
    );

    // Observar cambios en la pregunta
    watch(
      () => props.question.id,
      () => {
        initializeAnswer();
      }
    );

    // Inicializar el matching object cuando cambian los conceptos
    watch(
      concepts,
      (newConcepts) => {
        if (props.question.tipo === "emparejar" && newConcepts.length > 0) {
          if (!localAnswer.value || typeof localAnswer.value !== "object") {
            localAnswer.value = {};
          }

          // Inicializar con valores vacíos si no existen
          newConcepts.forEach((concepto) => {
            if (!(concepto in localAnswer.value)) {
              localAnswer.value[concepto] = "";
            }
          });
        }
      },
      { immediate: true }
    );

    return {
      localAnswer,
      availableOptions,
      concepts,
      definitions,
      getCorrectMatches,
      emitAnswer,
    };
  },
};
</script>

<style scoped>
.question-display {
  margin-bottom: 2rem;
}

.question-statement {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.question-statement h3 {
  color: #333;
  font-size: 1.25rem;
  line-height: 1.5;
  margin: 0;
}

.question-content {
  padding: 1rem 0;
}

/* Estilos para radio buttons */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.radio-option:hover:not(.disabled) {
  border-color: #667eea;
  background: #f8f9ff;
}

.radio-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.radio-option input[type="radio"] {
  width: 20px;
  height: 20px;
  accent-color: #667eea;
}

.radio-label {
  font-size: 1rem;
  color: #333;
  flex: 1;
}

/* Estilos para checkboxes */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.checkbox-option:hover:not(.disabled) {
  border-color: #28a745;
  background: #f8fff9;
}

.checkbox-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-option input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #28a745;
}

.checkbox-label {
  font-size: 1rem;
  color: #333;
  flex: 1;
}

/* Estilos para input de texto */
.text-input-group {
  margin: 1rem 0;
}

.text-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: white;
}

.text-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.text-input:disabled {
  background: #f8f9fa;
  opacity: 0.6;
}

/* Estilos para emparejar */
.matching-group {
  margin: 1rem 0;
}

.matching-instructions {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
  color: #1565c0;
}

.matching-pairs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.matching-pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
}

.concept {
  background: #667eea;
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.concept-label {
  display: block;
}

.arrow {
  font-size: 1.5rem;
  color: #6c757d;
  font-weight: bold;
}

.definition-selector {
  width: 100%;
}

.definition-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.definition-select:focus {
  outline: none;
  border-color: #667eea;
}

.definition-select:disabled {
  background: #f8f9fa;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Tipo no soportado */
.unsupported-type {
  padding: 2rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  text-align: center;
}

.unsupported-type p {
  color: #856404;
  font-weight: 600;
  margin-bottom: 1rem;
}

.unsupported-type pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  text-align: left;
  font-size: 0.875rem;
  overflow-x: auto;
}

/* Debug info */
.debug-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.875rem;
}

.debug-info pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .matching-pair {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    text-align: center;
  }

  .arrow {
    transform: rotate(90deg);
  }

  .radio-option,
  .checkbox-option {
    padding: 0.75rem;
  }

  .question-statement {
    padding: 1rem;
  }

  .question-statement h3 {
    font-size: 1.125rem;
  }
}
</style>
