import { useEffect, useState } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/services/api";
import type { QuizQuestion } from "@shared/types/api";

export default function Quizzes() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = questions[currentIndex];

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowResult(false);
      setSelectedIndex(null);
      setCurrentIndex(0);
      const data = await api.getQuiz();
      setQuestions(data.questions ?? []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQuiz();
  }, []);

  const handleSubmit = () => {
    if (selectedIndex === null || !current) return;
    setShowResult(true);
    
    if (selectedIndex === current.correctIndex) {
      const s = JSON.parse(localStorage.getItem('devsensei_stats') || '{}');
      s.quizCorrect = (s.quizCorrect || 0) + 1;
      localStorage.setItem('devsensei_stats', JSON.stringify(s));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIndex(null);
      setShowResult(false);
    } else {
      // End of quiz, reload a fresh one
      void loadQuiz();
    }
  };

  return (
    <PlatformLayout
      title="Gemini Live Quiz"
      description="Answer AI-generated multiple-choice questions about programming and computer science. Each visit gives you a fresh quiz created by Gemini."
    >
      <div className="mt-10 space-y-6">
        {loading && (
          <p className="text-slate-300">Loading interactive quiz...</p>
        )}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && !current && (
          <p className="text-slate-400">
            No questions available right now. Try reloading.
          </p>
        )}

        {current && (
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Question {currentIndex + 1} of {questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-200">{current.question}</p>

              <div className="space-y-3">
                {current.options.map((option, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isCorrect = current.correctIndex === idx;
                  const showColors = showResult && (isSelected || isCorrect);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !showResult && setSelectedIndex(idx)}
                      className={[
                        "w-full text-left px-4 py-3 rounded-md border transition",
                        "bg-slate-900/70 border-slate-700 text-slate-200 hover:border-primary/60 hover:bg-slate-900",
                        isSelected && !showResult
                          ? "border-primary bg-slate-900"
                          : "",
                        showColors && isCorrect
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "",
                        showColors && isSelected && !isCorrect
                          ? "border-red-500 bg-red-500/10"
                          : "",
                      ].join(" ")}
                    >
                      <span className="font-semibold mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                {!showResult ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedIndex === null}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
                  >
                    Check answer
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
                  >
                    {currentIndex + 1 < questions.length
                      ? "Next question"
                      : "New quiz"}
                  </Button>
                )}
                <Button
                  onClick={() => void loadQuiz()}
                  disabled={loading}
                  className="border border-red-900/50 text-red-400 hover:bg-red-950/40 hover:border-red-500/60 px-4 py-2 rounded-md text-sm font-medium transition-all"
                >
                  Refresh quiz
                </Button>
              </div>

              {showResult && (
                <div className="mt-4 rounded-md border border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-200">
                  <p className="font-semibold mb-1">
                    {selectedIndex === current.correctIndex
                      ? "✅ Correct!"
                      : "❌ Not quite."}
                  </p>
                  <p>{current.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PlatformLayout>
  );
}
