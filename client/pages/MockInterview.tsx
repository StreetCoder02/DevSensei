import { useState, useRef, useEffect } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/services/api";
import type { InterviewMessage, InterviewConfig, InterviewFeedback, InterviewResponse } from "@shared/types/api";

export default function MockInterview() {
  const [config, setConfig] = useState<InterviewConfig>({
    role: "SDE Intern",
    difficulty: "Beginner (Startups)",
    topic: "Data Structures & Algorithms",
  });
  
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [turnCount, setTurnCount] = useState(0); // number of user answers processed
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startInterview = async () => {
    setStarted(true);
    await performTurn("");
  };

  const performTurn = async (answer: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newMessages = [...messages];
      if (answer) {
        newMessages.push({ role: "user", content: answer });
        setMessages(newMessages);
      }

      const data = await api.performInterviewTurn({
        config,
        messages: newMessages,
        userAnswer: answer,
        turnCount: answer ? turnCount + 1 : 0,
      });

      setMessages((prev) => [
        ...prev,
        { role: "interviewer", content: data.interviewerMessage },
      ]);

      if (answer) setTurnCount((prev) => prev + 1);

      if (data.isComplete) {
        setInterviewDone(true);
        setFeedback(data.feedback!);
        
        const existing = JSON.parse(localStorage.getItem('devsensei_stats') || '{}');
        existing.interviewsCompleted = (existing.interviewsCompleted || 0) + 1;
        localStorage.setItem('devsensei_stats', JSON.stringify(existing));
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
      setUserInput("");
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim() || isLoading) return;
    void performTurn(userInput.trim());
  };

  const handleReset = () => {
    setStarted(false);
    setMessages([]);
    setInterviewDone(false);
    setFeedback(null);
    setTurnCount(0);
    setUserInput("");
  };

  if (!started) {
    return (
      <PlatformLayout
        title="AI Mock Interview"
        description="Practice real technical interviews. Choose your role and topic, and an AI will challenge you with follow-ups and real-time evaluation."
      >
        <div className="max-w-2xl mx-auto mt-10 space-y-6">
          <Card className="bg-[#111] border-[#222]">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Role</label>
                  <select 
                    value={config.role}
                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-red-500"
                  >
                    <option>SDE Intern</option>
                    <option>ML/AI Intern</option>
                    <option>Frontend Dev</option>
                    <option>Backend Dev</option>
                    <option>Data Analyst</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Difficulty</label>
                  <select 
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-red-500"
                  >
                    <option>Beginner (Startups)</option>
                    <option>Intermediate (Product)</option>
                    <option>Advanced (FAANG)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Topic</label>
                  <select 
                    value={config.topic}
                    onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-zinc-200 rounded-md px-3 py-2 text-sm outline-none focus:border-red-500"
                  >
                    <option>Data Structures & Algorithms</option>
                    <option>Operating Systems</option>
                    <option>DBMS</option>
                    <option>OOP Concepts</option>
                    <option>Machine Learning Basics</option>
                    <option>System Design Basics</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#222] text-center">
                <Button 
                  onClick={() => void startInterview()}
                  className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto px-8"
                >
                  Start Interview
                </Button>
                <p className="mt-3 text-xs text-zinc-500">
                  ~5 questions · AI evaluates your answers in real time
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    );
  }

  if (interviewDone && feedback) {
    return (
      <PlatformLayout title="Interview Complete" description="Here is your final evaluation.">
        <div className="max-w-3xl mx-auto mt-10">
          <Card className="bg-[#111] border-[#222]">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-red-400 text-6xl font-bold mb-2">{feedback.score} / 10</div>
                <div className="text-zinc-500 text-sm uppercase tracking-wider font-semibold">Overall Score</div>
              </div>
              
              <div className="h-px bg-[#222] w-full mb-8" />
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-4 text-sm uppercase tracking-wider">Strengths</h3>
                  <ul className="space-y-3">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300">
                        <span className="text-emerald-500 mt-0.5">✓</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-4 text-sm uppercase tracking-wider">Areas to Improve</h3>
                  <ul className="space-y-3">
                    {feedback.improvements.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-300">
                        <span className="text-yellow-500 mt-0.5">➜</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#222] mb-8">
                <p className="italic text-zinc-400 text-sm leading-relaxed text-center">
                  "{feedback.verdict}"
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                  Start New Interview
                </Button>
                <Link to="/">
                  <Button variant="outline" className="border-[#333] text-zinc-300 hover:bg-[#222]">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout title="Mock Interview" description="">
      <div className="max-w-3xl mx-auto -mt-4 mb-4 flex items-center justify-between bg-[#111] border border-[#222] p-4 rounded-xl">
        <div className="text-sm text-zinc-400 font-medium">
          <span className="text-red-500 mr-2">●</span>
          {config.topic} · <span className="text-zinc-500">{config.difficulty}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          className="text-red-400 border-red-900/50 hover:bg-red-950/30"
        >
          End Interview
        </Button>
      </div>

      <div className="max-w-3xl mx-auto bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden flex flex-col h-[600px]">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-zinc-500 mb-1 ml-1">
                {msg.role === 'user' ? 'You' : 'Interviewer'}
              </span>
              <div className={`px-4 py-3 rounded-lg text-sm max-w-[85%] leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-red-950/40 border border-red-900/30 text-zinc-200' 
                  : 'bg-[#1a1a1a] text-zinc-200 border border-[#2a2a2a]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-zinc-500 mb-1 ml-1">Interviewer</span>
              <div className="px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 text-sm flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
              </div>
            </div>
          )}
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        </div>

        <div className="p-4 bg-[#111] border-t border-[#222]">
          <Textarea 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your answer..."
            className="min-h-[80px] bg-[#0a0a0a] border-[#2a2a2a] text-sm text-zinc-200 resize-none focus:border-red-500 mb-3"
            disabled={isLoading || interviewDone}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">
              Question {Math.min(turnCount + 1, 5)} of 5
            </span>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !userInput.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {turnCount === 4 ? "Finish & Get Feedback" : "Send Answer"}
            </Button>
          </div>
        </div>
      </div>
    </PlatformLayout>
  );
}
