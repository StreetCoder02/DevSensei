/**
 * Prompt templates for AI requests.
 * Centralizes all prompt engineering in one place for easy tweaking.
 */

export const prompts = {
  riddles: () => [
    'Generate 5 short logical riddles suitable for college students.',
    'Return strictly JSON in this shape:',
    '{ "riddles": [ { "id": "string", "question": "string", "answer": "short string answer" } ] }',
    'Questions should be fun but clear. Answers should be concise single words or short phrases.',
  ].join('\n'),

  codingQuestion: (language: string, difficulty: string) => [
    'Create a beginner-friendly coding challenge for a college student.',
    `Difficulty level: ${difficulty}. For easy: basic loops/conditionals. For medium: arrays/strings/recursion. For hard: dynamic programming/graphs/advanced algorithms.`,
    'Focus on core programming concepts (loops, conditionals, arrays, strings).',
    'Return strictly JSON in this shape:',
    '{ "question": { "id": "string", "title": "string", "description": "string", "language": "string", "functionSignature": "string", "starterCode": "string", "algorithmHint": "string" } }',
    `The target language is: ${language}.`,
    'The algorithmHint field must be one of: ["sort", "binary search", "fibonacci", "stack", "queue", "tree", "graph", "reverse", "none"]. Detect which algorithm the challenge primarily involves.',
    'The description should clearly state the problem and include at least one example.',
    'The functionSignature should be a single line with the function declaration appropriate for the language.',
    'The starterCode should include the functionSignature and TODO comments for the student.',
  ].join('\n'),

  codingCheck: (language: string, title: string, description: string, userCode: string) => [
    'You are an automatic code evaluator for programming challenges.',
    'You will receive:',
    '- The challenge title and description (including any examples).',
    '- The programming language.',
    "- The student's submitted code.",
    '',
    'Decide if the solution is likely correct based on the description and examples.',
    'Be strict but fair. Consider edge cases when possible.',
    '',
    'Return strictly JSON in this shape:',
    '{ "passed": boolean, "feedback": "string helpful explanation and suggestions" }',
    '',
    `Language: ${language}`,
    `Challenge title: ${title}`,
    `Challenge description: ${description}`,
    'Student code:',
    userCode,
  ].join('\n'),

  quiz: () => [
    'Generate a short multiple-choice quiz for college students about computer science and programming fundamentals.',
    'Return exactly 5 questions.',
    'Each question must have 4 options and one correct answer.',
    'Return strictly JSON in this shape:',
    '{ "questions": [ { "id": "string", "question": "string", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "string explaining why the correct answer is correct" } ] }',
    'Make questions concise and explanations 1-3 sentences long.',
  ].join('\n'),

  errorExplain: (language: string, errorMessage: string, codeContext?: string) => {
    const lines = [
      'You are a senior developer helping a beginner understand a programming error.',
      `The language is: ${language}.`,
      'Explain what the error means in plain English (avoid overly dense jargon).',
      'Give a concrete fix with a code example if possible.',
      'Explain the most common cause for why beginners hit this error.',
      'Return strictly JSON in this shape:',
      '{ "whatWentWrong": "string", "howToFix": "string", "commonCause": "string" }',
      '',
      'Error message:',
      errorMessage,
    ];
    if (codeContext) {
      lines.push('Code context:', codeContext);
    }
    return lines.join('\n');
  },

  mockInterviewStart: (role: string, difficulty: string, topic: string) =>
    `You are a strict but fair technical interviewer at a ${difficulty} company.
You are interviewing a candidate for a ${role} position.
This is question 1 of 5. The topic is ${topic}.
Ask ONE clear, specific opening question appropriate for this role and difficulty.
Return ONLY JSON: { "interviewerMessage": "your question here", "isComplete": false }`,

  mockInterviewContinue: (role: string, difficulty: string, topic: string, history: string, answer: string, turnCount: number) =>
    `You are a technical interviewer. Here is the conversation so far:
${history}
Candidate just answered: ${answer}
This is turn ${turnCount + 1} of 5.
React like a real interviewer — acknowledge their answer briefly, then either dig deeper with a follow-up or move to the next question. Be concise. Don't be too encouraging.
Return ONLY JSON: { "interviewerMessage": "your response", "isComplete": false }`,

  mockInterviewEnd: (role: string, difficulty: string, topic: string, history: string, answer: string) =>
    `You are a technical interviewer who just finished a ${topic} interview for a ${role} at ${difficulty} difficulty.
Full conversation:
${history}
Final answer from candidate: ${answer}

Evaluate the candidate honestly and return ONLY JSON:
{
  "interviewerMessage": "brief closing remark from interviewer (1-2 sentences)",
  "isComplete": true,
  "feedback": {
    "score": 8,
    "strengths": ["specific strength 1", "specific strength 2"],
    "improvements": ["specific area 1", "specific area 2"],
    "verdict": "one sentence honest summary"
  }
}`,

  roastCode: (language: string, code: string) =>
    `You are the most brutally honest senior developer on the internet.
Roast this ${language} code like you're a tired staff engineer seeing junior code at 2am.
Be savage but educational — every insult must point to a real problem.
Examples of good roasts: 'This nested loop is an O(n²) felony', 'You've invented bubble sort in ${new Date().getFullYear()}, congratulations on reinventing the wheel', 'This variable named x is doing the emotional labor of 5 functions'.
Rate the severity: 1=mild issues, 2=genuinely bad patterns, 3=catastrophic crimes against CS.
Then provide the corrected code and a professional explanation of why it's better.
Return ONLY JSON: { "roastText": "string", "roastLevel": number, "fixedCode": "string", "whyBetter": "string" }
Code: ${code}`,

  mentorCode: (language: string, code: string) =>
    `You are a patient senior developer doing a thorough code review.
Point out issues professionally, suggest improvements, and explain best practices.
Be direct but constructive. Cover: correctness, efficiency, readability, edge cases.
Return ONLY JSON: { "roastText": "string", "roastLevel": 1, "fixedCode": "string", "whyBetter": "string" }
Code: ${code}`,
};
