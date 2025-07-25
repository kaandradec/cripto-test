<template>
  <div class="navigation-grid">
    <h3 class="grid-title">Navegación</h3>

    <!-- Filtros por unidad -->
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
  emits: ["question-selected"],
  setup(props, { emit }) {
    const selectedUnit = ref(null);

    // Obtener unidades disponibles
    const availableUnits = computed(() => {
      const units = [...new Set(props.questions.map((q) => q.unidad))];
      return units.sort((a, b) => a - b);
    });

    // Filtrar preguntas por unidad
    const filteredQuestions = computed(() => {
      let filtered = props.questions.map((question, index) => ({
        ...question,
        originalIndex: index,
      }));

      if (selectedUnit.value !== null) {
        filtered = filtered.filter((q) => q.unidad === selectedUnit.value);
      }

      return filtered;
    });

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

      return `${question.id} - ${statusText}\nTipo: ${question.tipo}\nUnidad: ${question.unidad}`;
    };

    // Seleccionar pregunta
    const selectQuestion = (index) => {
      emit("question-selected", index);
    };

    return {
      selectedUnit,
      availableUnits,
      filteredQuestions,
      stats,
      getQuestionButtonClass,
      getQuestionTooltip,
      selectQuestion,
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

.unit-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.unit-filter {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.unit-filter:hover {
  background: #f0f0f0;
}

.unit-filter.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
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

@media (max-width: 768px) {
  .navigation-grid {
    position: static;
    margin-bottom: 1rem;
  }

  .questions-grid {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }

  .question-btn {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }
}
</style>
