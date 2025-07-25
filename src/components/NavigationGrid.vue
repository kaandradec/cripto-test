<template>
  <div class="navigation-grid">
    <h3 class="grid-title">Navegación</h3>

    <!-- Filtros por unidad -->
    <div class="filter-section">
      <h4 class="filter-title">Filtrar por Unidad:</h4>
      <div class="unit-filters">
        <button
          v-for="unit in availableUnits"
          :key="unit"
          @click="selectedUnit = unit"
          :class="['unit-filter', { active: selectedUnit === unit }]"
        >
          Unidad {{ unit }}
        </button>
        <button
          @click="selectedUnit = null"
          :class="['unit-filter', { active: selectedUnit === null }]"
        >
          Todas
        </button>
      </div>
    </div>

    <!-- Filtros por tipo de pregunta -->
    <div class="filter-section">
      <h4 class="filter-title">Filtrar por Tipo:</h4>
      <div class="type-filters">
        <button
          v-for="type in availableTypes"
          :key="type.value"
          @click="selectedType = type.value"
          :class="['type-filter', { active: selectedType === type.value }]"
          :title="type.description"
        >
          {{ type.label }}
        </button>
        <button
          @click="selectedType = null"
          :class="['type-filter', { active: selectedType === null }]"
        >
          Todos
        </button>
      </div>
    </div>

    <!-- Estadísticas de filtros aplicados -->
    <div v-if="filtersApplied" class="filter-info">
      <small>
        📊 Mostrando <strong>{{ filteredQuestions.length }}</strong> de
        <strong>{{ questions.length }}</strong> preguntas
        <span v-if="selectedUnit">
          • <strong>Unidad {{ selectedUnit }}</strong></span
        >
        <span v-if="selectedType">
          • <strong>{{ getTypeLabel(selectedType) }}</strong></span
        >
      </small>
      <button
        @click="clearAllFilters"
        class="clear-filters-btn"
        title="Limpiar todos los filtros"
      >
        ✖️ Limpiar filtros
      </button>
    </div>

    <!-- Botón de reset general -->
    <div class="reset-section">
      <button
        @click="resetAllAnswers"
        class="reset-btn"
        title="Restablecer todas las respuestas a estado sin responder"
      >
        🔄 Reiniciar Respuestas
      </button>
    </div>

    <!-- Cuadrícula de preguntas -->
    <div class="questions-grid">
      <button
        v-for="question in filteredQuestions"
        :key="question.id"
        @click="selectQuestion(question.originalIndex)"
        :class="getQuestionButtonClass(question.originalIndex)"
        :title="getQuestionTooltip(question, question.originalIndex)"
      >
        {{ question.originalIndex + 1 }}
      </button>
    </div>

    <!-- Estadísticas -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Sin responder:</span>
        <span class="stat-value">{{ stats.unanswered }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Correctas:</span>
        <span class="stat-value correct">{{ stats.correct }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Incorrectas:</span>
        <span class="stat-value incorrect">{{ stats.incorrect }}</span>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="legend">
      <h4>Leyenda:</h4>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-color unanswered"></div>
          <span>Sin responder</span>
        </div>
        <div class="legend-item">
          <div class="legend-color correct"></div>
          <span>Correcta</span>
        </div>
        <div class="legend-item">
          <div class="legend-color incorrect"></div>
          <span>Incorrecta</span>
        </div>
        <div class="legend-item">
          <div class="legend-color current"></div>
          <span>Actual</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  name: "NavigationGrid",
  props: {
    questions: {
      type: Array,
      required: true,
    },
    questionStates: {
      type: Array,
      required: true,
    },
    currentIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ["question-selected", "reset-answers"],
  setup(props, { emit }) {
    const selectedUnit = ref(null);
    const selectedType = ref(null);

    // Definir tipos de preguntas disponibles con labels descriptivos
    const questionTypes = {
      seleccion_unica: {
        label: "Opción Única",
        description: "Una sola respuesta correcta",
        icon: "⚪",
      },
      seleccion_multiple: {
        label: "Múltiple",
        description: "Varias respuestas correctas",
        icon: "☑️",
      },
      verdadero_falso: {
        label: "V/F",
        description: "Verdadero o Falso",
        icon: "✓✗",
      },
      rellenar_espacio: {
        label: "Completar",
        description: "Rellenar espacios en blanco",
        icon: "📝",
      },
      emparejar: {
        label: "Emparejar",
        description: "Relacionar conceptos",
        icon: "🔗",
      },
    };

    // Obtener unidades disponibles
    const availableUnits = computed(() => {
      const units = [...new Set(props.questions.map((q) => q.unidad))];
      return units.sort((a, b) => a - b);
    });

    // Obtener tipos de preguntas disponibles
    const availableTypes = computed(() => {
      const types = [...new Set(props.questions.map((q) => q.tipo))];
      return types
        .filter((type) => questionTypes[type]) // Solo tipos conocidos
        .map((type) => ({
          value: type,
          label: questionTypes[type].label,
          description: questionTypes[type].description,
          icon: questionTypes[type].icon,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    });

    // Verificar si hay filtros aplicados
    const filtersApplied = computed(() => {
      return selectedUnit.value !== null || selectedType.value !== null;
    });

    // Filtrar preguntas por unidad y tipo
    const filteredQuestions = computed(() => {
      let filtered = props.questions.map((question, index) => ({
        ...question,
        originalIndex: index,
      }));

      // Aplicar filtro de unidad
      if (selectedUnit.value !== null) {
        filtered = filtered.filter((q) => q.unidad === selectedUnit.value);
      }

      // Aplicar filtro de tipo
      if (selectedType.value !== null) {
        filtered = filtered.filter((q) => q.tipo === selectedType.value);
      }

      return filtered;
    });

    // Obtener label del tipo de pregunta
    const getTypeLabel = (type) => {
      return questionTypes[type]?.label || type;
    };

    // Calcular estadísticas
    const stats = computed(() => {
      const unanswered = props.questionStates.filter(
        (state) => state === null
      ).length;
      const correct = props.questionStates.filter(
        (state) => state === true
      ).length;
      const incorrect = props.questionStates.filter(
        (state) => state === false
      ).length;

      return { unanswered, correct, incorrect };
    });

    // Obtener clase CSS para cada botón de pregunta
    const getQuestionButtonClass = (index) => {
      const baseClass = "question-btn";
      const state = props.questionStates[index];
      const isCurrent = index === props.currentIndex;

      return [
        baseClass,
        {
          current: isCurrent,
          correct: !isCurrent && state === true,
          incorrect: !isCurrent && state === false,
          unanswered: !isCurrent && state === null,
        },
      ];
    };

    // Obtener tooltip para cada pregunta
    const getQuestionTooltip = (question, index) => {
      const state = props.questionStates[index];
      let statusText = "Sin responder";

      if (state === true) statusText = "Correcta";
      if (state === false) statusText = "Incorrecta";
      if (index === props.currentIndex) statusText = "Pregunta actual";

      const typeInfo = questionTypes[question.tipo];
      const typeIcon = typeInfo?.icon || "❓";
      const typeLabel = typeInfo?.label || question.tipo;

      return `${question.id} - ${statusText}\nTipo: ${typeIcon} ${typeLabel}\nUnidad: ${question.unidad}`;
    };

    // Seleccionar pregunta
    const selectQuestion = (index) => {
      emit("question-selected", index);
    };

    // Limpiar todos los filtros
    const clearAllFilters = () => {
      selectedUnit.value = null;
      selectedType.value = null;
    };

    // Resetear todas las respuestas
    const resetAllAnswers = () => {
      if (
        confirm(
          "¿Estás seguro de que quieres reiniciar todas las respuestas? Esta acción no se puede deshacer."
        )
      ) {
        emit("reset-answers");
      }
    };

    return {
      selectedUnit,
      selectedType,
      availableUnits,
      availableTypes,
      filtersApplied,
      filteredQuestions,
      stats,
      getQuestionButtonClass,
      getQuestionTooltip,
      getTypeLabel,
      selectQuestion,
      clearAllFilters,
      resetAllAnswers,
    };
  },
};
</script>

<style scoped>
.navigation-grid {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.grid-title {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  text-align: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-title {
  color: #555;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.unit-filters,
.type-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.unit-filter,
.type-filter {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;
}

.unit-filter:hover,
.type-filter:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.unit-filter.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.type-filter.active {
  background: #764ba2;
  color: white;
  border-color: #764ba2;
}

.filter-info {
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #1565c0;
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.clear-filters-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.question-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.question-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question-btn.current {
  border-color: #2196f3;
  background: #2196f3;
  color: white;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
}

.question-btn.correct {
  border-color: #4caf50;
  background: #4caf50;
  color: white;
}

.question-btn.incorrect {
  border-color: #f44336;
  background: #f44336;
  color: white;
}

.question-btn.unanswered {
  border-color: #ddd;
  background: white;
  color: #666;
}

.stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
}

.stat-value.correct {
  color: #4caf50;
}

.stat-value.incorrect {
  color: #f44336;
}

.legend {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.legend h4 {
  color: #333;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.legend-color.unanswered {
  background: white;
}

.legend-color.correct {
  background: #4caf50;
}

.legend-color.incorrect {
  background: #f44336;
}

.legend-color.current {
  background: #2196f3;
}

/* Estilos para la sección de reset */
.reset-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reset-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #ff5252, #e53935);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.reset-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.2);
}

@media (max-width: 768px) {
  .navigation-grid {
    position: static;
    margin-bottom: 1rem;
  }

  .filter-section {
    margin-bottom: 1rem;
  }

  .unit-filters,
  .type-filters {
    gap: 0.25rem;
  }

  .unit-filter,
  .type-filter {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }

  .questions-grid {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }

  .question-btn {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }

  .filter-info {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
