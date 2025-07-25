<template>
  <div class="quiz-view">
    <!-- Información de la pregunta -->
    <div class="question-header">
      <div class="question-meta">
        <span class="question-id">{{ question.id }}</span>
        <span class="question-unit">Unidad {{ question.unidad }}</span>
        <span class="question-type">{{
          getTypeDisplayName(question.tipo)
        }}</span>
      </div>
    </div>

    <!-- Componente para mostrar la pregunta -->
    <QuestionDisplay
      :question="question"
      :user-answer="userAnswer"
      :is-reviewed="questionState !== null"
      :is-correct="questionState"
      @answer-changed="handleAnswerChange"
    />

    <!-- Retroalimentación -->
    <div v-if="questionState !== null" class="feedback">
      <div
        :class="['feedback-message', questionState ? 'correct' : 'incorrect']"
      >
        <i :class="questionState ? 'icon-check' : 'icon-cross'"></i>
        <span>{{ questionState ? "¡Correcto!" : "¡Incorrecto!" }}</span>
      </div>

      <div v-if="!questionState" class="correct-answer">
        <h4>Respuesta correcta:</h4>
        <div class="correct-answer-content">
          {{ formatCorrectAnswer(question.respuesta_correcta, question.tipo) }}
        </div>
      </div>
    </div>

    <!-- Controles de navegación y envío -->
    <div class="controls">
      <div class="navigation-controls">
        <button
          @click="goToPrevious"
          :disabled="!canGoPrevious"
          class="nav-btn prev-btn"
        >
          <i class="icon-arrow-left"></i>
          Anterior
        </button>

        <button
          @click="goToNext"
          :disabled="!canGoNext"
          class="nav-btn next-btn"
        >
          Siguiente
          <i class="icon-arrow-right"></i>
        </button>
      </div>

      <div class="action-controls">
        <button
          v-if="questionState === null"
          @click="submitAnswer"
          :disabled="!canSubmit"
          class="submit-btn"
        >
          <i class="icon-check"></i>
          Revisar Respuesta
        </button>

        <button v-else @click="resetAnswer" class="reset-btn">
          <i class="icon-refresh"></i>
          Resetear
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import QuestionDisplay from "./QuestionDisplay.vue";

export default {
  name: "QuizView",
  components: {
    QuestionDisplay,
  },
  props: {
    question: {
      type: Object,
      required: true,
    },
    userAnswer: {
      default: null,
    },
    questionState: {
      default: null,
    },
    canGoPrevious: {
      type: Boolean,
      default: false,
    },
    canGoNext: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["answer-submitted", "next-question", "previous-question"],
  setup(props, { emit }) {
    const currentUserAnswer = ref(null);

    // Computed para determinar si se puede enviar la respuesta
    const canSubmit = computed(() => {
      if (!currentUserAnswer.value) return false;

      const answer = currentUserAnswer.value;

      // Verificar según el tipo de pregunta
      switch (props.question.tipo) {
        case "seleccion_multiple":
          return Array.isArray(answer) && answer.length > 0;
        case "emparejar":
          return (
            Object.keys(answer).length > 0 &&
            Object.values(answer).every((val) => val !== null && val !== "")
          );
        default:
          return answer !== null && answer !== "";
      }
    });

    // Obtener nombre amigable del tipo de pregunta
    const getTypeDisplayName = (tipo) => {
      const typeNames = {
        seleccion_unica: "Selección Única",
        seleccion_multiple: "Selección Múltiple",
        verdadero_falso: "Verdadero/Falso",
        rellenar_espacio: "Rellenar Espacio",
        emparejar: "Emparejar",
      };
      return typeNames[tipo] || tipo;
    };

    // Formatear respuesta correcta para mostrar
    const formatCorrectAnswer = (correctAnswer, tipo) => {
      if (Array.isArray(correctAnswer)) {
        if (tipo === "emparejar") {
          // Estructura: array de objetos con concepto y definicion
          return correctAnswer
            .map((item) =>
              item.concepto && item.definicion
                ? `${item.concepto} → ${item.definicion}`
                : JSON.stringify(item)
            )
            .join("\n");
        }
        return correctAnswer.join(", ");
      }
      if (typeof correctAnswer === "object" && correctAnswer !== null) {
        return JSON.stringify(correctAnswer, null, 2);
      }
      return correctAnswer;
    };

    // Manejar cambio de respuesta
    const handleAnswerChange = (newAnswer) => {
      currentUserAnswer.value = newAnswer;
    };

    // Verificar si la respuesta es correcta
    const checkAnswer = (userAnswer, correctAnswer, questionType) => {
      switch (questionType) {
        case "seleccion_multiple":
          if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
            return false;
          }
          if (userAnswer.length !== correctAnswer.length) {
            return false;
          }
          const sortedUser = [...userAnswer].sort();
          const sortedCorrect = [...correctAnswer].sort();
          return sortedUser.every(
            (item, index) => item === sortedCorrect[index]
          );

        case "emparejar":
          // Manejo especial para la estructura del JSON
          let correctMatches = {};

          if (Array.isArray(correctAnswer)) {
            // Estructura: array de objetos con concepto y definicion
            correctAnswer.forEach((item) => {
              if (item.concepto && item.definicion) {
                correctMatches[item.concepto] = item.definicion;
              }
            });
          } else if (typeof correctAnswer === "object") {
            correctMatches = correctAnswer;
          }

          // Verificar que todas las respuestas del usuario coincidan
          return Object.keys(correctMatches).every(
            (concepto) => userAnswer[concepto] === correctMatches[concepto]
          );

        case "rellenar_espacio":
          if (Array.isArray(correctAnswer)) {
            return correctAnswer.some(
              (answer) =>
                userAnswer.toLowerCase().trim() === answer.toLowerCase().trim()
            );
          }
          return (
            userAnswer.toLowerCase().trim() ===
            correctAnswer.toLowerCase().trim()
          );

        default:
          return userAnswer === correctAnswer;
      }
    };

    // Enviar respuesta
    const submitAnswer = () => {
      if (!canSubmit.value) return;

      const isCorrect = checkAnswer(
        currentUserAnswer.value,
        props.question.respuesta_correcta,
        props.question.tipo
      );

      emit("answer-submitted", {
        userAnswer: currentUserAnswer.value,
        isCorrect,
      });
    };

    // Resetear respuesta
    const resetAnswer = () => {
      currentUserAnswer.value = null;
      emit("answer-submitted", {
        userAnswer: null,
        isCorrect: null,
      });
    };

    // Navegación
    const goToPrevious = () => {
      emit("previous-question");
    };

    const goToNext = () => {
      emit("next-question");
    };

    // Observar cambios en userAnswer prop
    watch(
      () => props.userAnswer,
      (newAnswer) => {
        currentUserAnswer.value = newAnswer;
      },
      { immediate: true }
    );

    // Resetear respuesta cuando cambia la pregunta
    watch(
      () => props.question.id,
      () => {
        if (props.questionState === null) {
          currentUserAnswer.value = props.userAnswer;
        }
      }
    );

    return {
      currentUserAnswer,
      canSubmit,
      getTypeDisplayName,
      formatCorrectAnswer,
      handleAnswerChange,
      submitAnswer,
      resetAnswer,
      goToPrevious,
      goToNext,
    };
  },
};
</script>

<style scoped>
.quiz-view {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

.question-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.question-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.question-id {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.question-unit {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.question-type {
  background: #6c757d;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.feedback {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.feedback-message.correct {
  color: #28a745;
}

.feedback-message.incorrect {
  color: #dc3545;
}

.correct-answer {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #dc3545;
}

.correct-answer h4 {
  color: #dc3545;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.correct-answer-content {
  color: #333;
  font-weight: 500;
  white-space: pre-wrap;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.navigation-controls {
  display: flex;
  gap: 0.75rem;
}

.action-controls {
  display: flex;
  gap: 0.75rem;
}

.nav-btn,
.submit-btn,
.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.nav-btn {
  background: #6c757d;
  color: white;
}

.nav-btn:hover:not(:disabled) {
  background: #545b62;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.reset-btn {
  background: #ffc107;
  color: #212529;
}

.reset-btn:hover {
  background: #e0a800;
  transform: translateY(-1px);
}

/* Iconos simulados con CSS */
.icon-check::before {
  content: "✓";
}
.icon-cross::before {
  content: "✗";
}
.icon-arrow-left::before {
  content: "←";
}
.icon-arrow-right::before {
  content: "→";
}
.icon-refresh::before {
  content: "↻";
}

@media (max-width: 768px) {
  .quiz-view {
    padding: 1.5rem;
  }

  .controls {
    flex-direction: column;
    gap: 1rem;
  }

  .navigation-controls,
  .action-controls {
    width: 100%;
    justify-content: center;
  }

  .question-meta {
    justify-content: center;
    text-align: center;
  }
}
</style>
