<template>
  <div id="app">
    <header class="app-header">
      <h1>Cuestionario de Criptografía</h1>
      <div class="progress-info">
        <span
          >Pregunta {{ currentQuestionIndex + 1 }} de
          {{ questions.length }}</span
        >
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Panel de navegación lateral -->
      <NavigationGrid
        :questions="questions"
        :question-states="questionStates"
        :current-index="currentQuestionIndex"
        @question-selected="goToQuestion"
        @reset-answers="resetAllAnswers"
      />

      <!-- Vista principal del cuestionario -->
      <QuizView
        v-if="currentQuestion"
        :question="currentQuestion"
        :user-answer="userAnswers[currentQuestionIndex]"
        :question-state="questionStates[currentQuestionIndex]"
        @answer-submitted="handleAnswerSubmission"
        @next-question="nextQuestion"
        @previous-question="previousQuestion"
        :can-go-previous="currentQuestionIndex > 0"
        :can-go-next="currentQuestionIndex < questions.length - 1"
      />
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import NavigationGrid from "./components/NavigationGrid.vue";
import QuizView from "./components/QuizView.vue";
import questionsData from "./data/questions.json";

export default {
  name: "App",
  components: {
    NavigationGrid,
    QuizView,
  },
  setup() {
    // Estado reactivo principal
    const questions = ref(questionsData.banco_de_preguntas);
    const currentQuestionIndex = ref(0);
    const userAnswers = ref([]);
    const questionStates = ref([]); // null = sin responder, true = correcta, false = incorrecta

    // Computed properties
    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value];
    });

    const progressPercentage = computed(() => {
      const answeredQuestions = questionStates.value.filter(
        (state) => state !== null
      ).length;
      return (answeredQuestions / questions.value.length) * 100;
    });

    // Inicializar arrays de respuestas y estados
    const initializeArrays = () => {
      userAnswers.value = new Array(questions.value.length).fill(null);
      questionStates.value = new Array(questions.value.length).fill(null);
    };

    // Navegar a una pregunta específica
    const goToQuestion = (index) => {
      if (index >= 0 && index < questions.value.length) {
        currentQuestionIndex.value = index;
      }
    };

    // Navegación secuencial
    const nextQuestion = () => {
      if (currentQuestionIndex.value < questions.value.length - 1) {
        currentQuestionIndex.value++;
      }
    };

    const previousQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--;
      }
    };

    // Manejar envío de respuesta
    const handleAnswerSubmission = (answerData) => {
      const { userAnswer, isCorrect } = answerData;

      // Guardar la respuesta del usuario
      userAnswers.value[currentQuestionIndex.value] = userAnswer;

      // Actualizar el estado de la pregunta
      questionStates.value[currentQuestionIndex.value] = isCorrect;
    };

    // Resetear todas las respuestas y estados
    const resetAllAnswers = () => {
      // Reinicializar arrays
      userAnswers.value = new Array(questions.value.length).fill(null);
      questionStates.value = new Array(questions.value.length).fill(null);

      // Volver a la primera pregunta
      currentQuestionIndex.value = 0;
    };

    // Lifecycle
    onMounted(() => {
      initializeArrays();
    });

    return {
      questions,
      currentQuestionIndex,
      currentQuestion,
      userAnswers,
      questionStates,
      progressPercentage,
      goToQuestion,
      nextQuestion,
      previousQuestion,
      handleAnswerSubmission,
      resetAllAnswers,
    };
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin-bottom: 1rem;
  font-size: 2rem;
  text-align: center;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
