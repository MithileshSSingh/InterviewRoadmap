import javascriptQuizzes from "./javascript";

const quizData = {
  javascript: javascriptQuizzes,
};

export function getQuizForTopic(slug, topicId) {
  return quizData[slug]?.[topicId] || null;
}

export function getQuizzesForPhase(slug, phaseTopicIds) {
  const roadmapQuizzes = quizData[slug];
  if (!roadmapQuizzes) return null;

  const combined = [];
  for (const topicId of phaseTopicIds) {
    const quiz = roadmapQuizzes[topicId];
    if (quiz) {
      combined.push(...quiz.questions.map((q) => ({ ...q, topicId })));
    }
  }
  return combined.length > 0 ? combined : null;
}

export function hasStaticQuiz(slug, topicId) {
  return !!quizData[slug]?.[topicId];
}
