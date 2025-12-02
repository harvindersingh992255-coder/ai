const onSubmit = async (data: InterviewSettings) => {
  setIsLoading(true);

  const demoQuestions = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths?",
    "What are your weaknesses?",
    "Where do you see yourself in 5 years?",
    "Tell me about a challenge you faced and how you handled it."
  ];

  // Encode questions into the URL
  const q = encodeURIComponent(JSON.stringify(demoQuestions));

  router.push(`/interview/active?q=${q}`);
};

