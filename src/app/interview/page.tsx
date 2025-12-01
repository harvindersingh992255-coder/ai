const onSubmit = async (data: InterviewSettings) => {
  setIsLoading(true);
  const mappedExperience = Math.ceil(data.difficulty / 2);
  const settingsWithExperience = { ...data, experienceLevel: mappedExperience };

  dispatch({ type: 'SET_SETTINGS', payload: settingsWithExperience });
  try {
    const result = await generateInterviewQuestions({
      dreamCompany: settingsWithExperience.dreamCompany,
      industry: settingsWithExperience.industry,
      jobRole: settingsWithExperience.jobRole,
      experienceLevel: settingsWithExperience.experienceLevel,
      focusSkills: settingsWithExperience.focusSkills,
      numQuestions: settingsWithExperience.numQuestions,
    });
    if (!result.questions || result.questions.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'No questions generated.' });
      setIsLoading(false);
      return;
    }
    const sessionId = `session_${Date.now()}`;
    dispatch({ type: 'QUESTIONS_GENERATED', payload: { questions: result.questions, sessionId } });
    router.push('/interview/active');
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: 'Failed to generate questions.' });
    setIsLoading(false);
  }
}
