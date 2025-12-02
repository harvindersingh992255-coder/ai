import { questionsDB } from "@/data/questions";

const onSubmit = async (data: InterviewSettings) => {
  setIsLoading(true);

  try {
    // Select questions according to jobRole
    const role = data.jobRole || "Software Engineer";

    const availableQuestions = questionsDB[role] || questionsDB["Software Engineer"];

    const selectedQuestions = availableQuestions.slice(0, data.numQuestions);

    if (selectedQuestions.length === 0) {
      dispatch({ type: "SET_ERROR", payload: "No questions available for this role." });
      setIsLoading(false);
      return;
    }

    const sessionId = `session_${Date.now()}`;

    dispatch({
      type: "QUESTIONS_GENERATED",
      payload: { questions: selectedQuestions, sessionId }
    });

    router.push("/interview/active");
  } catch (error) {
    console.error(error);
    dispatch({ type: "SET_ERROR", payload: "Something went wrong." });
  } finally {
    setIsLoading(false);
  }
};

