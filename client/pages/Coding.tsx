import { useEffect, useState, useRef } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";
import Editor from "@monaco-editor/react";
import { InputGuard } from "@/components/InputGuard";
import { api, ApiError } from "@/services/api";
import type { CodingQuestion, CodingCheckResult, ErrorExplainResult } from "@shared/types/api";

const ALGO_KEYWORDS = [
  "sort", "binary search", "bubble", "fibonacci", "factorial", 
  "reverse", "palindrome", "linked list", "stack", "queue", 
  "tree", "graph", "bfs", "dfs"
];

const renderVisualizer = (hint?: string | null, keyRender?: number) => {
  if (!hint || hint === "none") return null;

  let visualization = null;
  const key = hint.toLowerCase();

  if (key.includes("sort") || key.includes("bubble")) {
    visualization = (
      <div className="flex items-end justify-center gap-2 h-24 mt-4" key={`sort-${keyRender}`}>
        {[40, 80, 20, 100, 60].map((h, i) => (
          <div 
            key={i} 
            className="w-6 bg-red-500 rounded-t animate-pulse transition-all duration-1000" 
            style={{ height: `${h}%`, animationDelay: `${i * 0.2}s` }} 
          />
        ))}
      </div>
    );
  } else if (key.includes("binary search")) {
    visualization = (
      <div className="flex flex-col items-center justify-center h-24 gap-2 mt-4" key={`bs-${keyRender}`}>
        <div className="flex gap-1">
          {[1, 3, 5, 7, 9, 11, 13].map((n, i) => (
            <div key={i} className={`w-8 h-8 flex items-center justify-center border border-zinc-700 bg-[#111] text-zinc-400 text-xs rounded transition-all duration-500 ${i === 3 ? 'bg-red-900/30 border-red-500/50 text-white' : ''}`}>
              {n}
            </div>
          ))}
        </div>
        <div className="text-red-500 text-xs animate-bounce font-bold tracking-widest mt-1">↑ mid</div>
      </div>
    );
  } else if (key.includes("fibonacci") || key.includes("factorial")) {
    visualization = (
      <div className="flex items-center justify-center h-24 text-red-400 font-mono text-xl tracking-widest mt-4" key={`fibo-${keyRender}`}>
        <span className="animate-pulse">1, 1, 2, 3, 5, 8, 13...</span>
      </div>
    );
  } else if (key.includes("reverse") || key.includes("palindrome")) {
    visualization = (
      <div className="flex items-center justify-center h-24 gap-4 text-red-400 font-mono text-xl mt-4" key={`rev-${keyRender}`}>
        <span className="animate-pulse" style={{ animationDelay: '0s' }}>S T R I N G</span>
        <span className="text-zinc-600">⇌</span>
        <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>G N I R T S</span>
      </div>
    );
  } else if (key.includes("stack")) {
    visualization = (
      <div className="flex flex-col items-center justify-end h-24 gap-1 border-x-2 border-b-2 border-zinc-700 p-2 w-16 mx-auto mt-4" key={`stack-${keyRender}`}>
        {[1, 2, 3].map((n, i) => (
          <div key={i} className="w-full h-4 bg-red-500 rounded-sm animate-pulse" style={{ animationDelay: `${(3 - i) * 0.3}s` }} />
        ))}
      </div>
    );
  } else {
    visualization = (
      <div className="flex items-center justify-center h-24 mt-4" key={`def-${keyRender}`}>
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl p-4 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Algorithm in Action</span>
          <span className="text-[10px] uppercase tracking-wider bg-red-950 text-red-400 px-2 py-0.5 rounded-full border border-red-900/40">
            {hint}
          </span>
        </div>
      </div>
      {visualization}
    </div>
  );
};

export default function Coding() {
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [userCode, setUserCode] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CodingCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [explainingError, setExplainingError] = useState(false);
  const [explanation, setExplanation] = useState<ErrorExplainResult | null>(null);
  
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("Easy");
  const [vizKey, setVizKey] = useState(0);

  const loadQuestion = async (lang = language, diff = difficulty) => {
    try {
      setLoadingQuestion(true);
      setError(null);
      setResult(null);
      setExplanation(null);
      setVizKey(prev => prev + 1);
      
      const data = await api.getCodingQuestion(lang.toLowerCase(), diff.toLowerCase());
      setQuestion(data.question);
      setUserCode(data.question.starterCode ?? "");
    } catch (err) {
      console.error("Error loading question:", err);
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    void loadQuestion();
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    void loadQuestion(newLang, difficulty);
  };

  const handleDifficultyChange = (newDiff: string) => {
    setDifficulty(newDiff);
    void loadQuestion(language, newDiff);
  };

  const explainFailedCode = async (feedback: string) => {
    if (!question || !userCode.trim()) return;
    try {
      setExplainingError(true);
      setExplanation(null);
      const data = await api.explainError({
        language: question.language,
        errorMessage: feedback,
        codeContext: userCode,
      });
      setExplanation(data);
    } catch (err) {
      console.error("Failed to explain error automatically", err);
    } finally {
      setExplainingError(false);
    }
  };

  const handleCheck = async () => {
    if (!question) return;

    try {
      setChecking(true);
      setError(null);
      setExplanation(null);
      
      const data = await api.checkCodingAnswer({
        language: question.language,
        userCode,
        title: question.title,
        description: question.description,
      });

      setResult(data);

      if (data.passed) {
        const existing = JSON.parse(localStorage.getItem('devsensei_stats') || '{}');
        existing.codingSolved = (existing.codingSolved || 0) + 1;
        localStorage.setItem('devsensei_stats', JSON.stringify(existing));
      } else {
        void explainFailedCode(data.feedback);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setChecking(false);
    }
  };

  const getDetectedAlgorithm = (q: CodingQuestion | null) => {
    if (!q) return null;
    if (q.algorithmHint && q.algorithmHint !== "none") return q.algorithmHint;
    
    const text = (q.title + " " + q.description).toLowerCase();
    for (const kw of ALGO_KEYWORDS) {
      if (text.includes(kw)) return kw;
    }
    return null;
  };

  const lineCount = userCode.split("\n").length;
  const charCount = userCode.length;

  return (
    <PlatformLayout
      title="Coding Challenges"
      description="Solve AI-generated coding challenges in a full IDE environment. Get real-time feedback and intelligent error analysis from Gemini."
    >
      <div className="mt-8 mb-20 max-w-5xl mx-auto">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {["JavaScript", "Python", "Java", "C++"].map(l => {
              const val = l.toLowerCase() === "c++" ? "cpp" : l.toLowerCase();
              const active = language === val;
              return (
                <button 
                  key={l}
                  onClick={() => handleLanguageChange(val)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
                      : "border border-red-900/40 text-red-400 hover:bg-red-950/20"
                  }`}
                >
                  {l}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map(d => (
              <button 
                key={d}
                onClick={() => handleDifficultyChange(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  difficulty === d
                    ? "bg-red-600 text-white"
                    : "border border-red-900/40 text-red-400 hover:bg-red-950/20"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loadingQuestion ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-[60%] bg-[#111] border border-[#1f1f1f] rounded-xl p-5 animate-pulse h-64" />
            <div className="w-full lg:w-[40%] bg-[#111] border border-[#1f1f1f] rounded-xl animate-pulse h-64" />
          </div>
        ) : question ? (
          <>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column */}
              <div className="w-full lg:w-[60%] flex flex-col">
                <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5">
                  <h2 className="text-white font-semibold text-lg mb-3">{question.title}</h2>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line mb-4">
                    {question.description}
                  </p>
                  <div className="font-mono text-xs bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3 text-zinc-400 overflow-x-auto whitespace-pre">
                    {question.functionSignature}
                  </div>
                </div>

                <div className="relative group">
                  {renderVisualizer(getDetectedAlgorithm(question), vizKey)}
                  {getDetectedAlgorithm(question) && (
                    <button 
                      onClick={() => setVizKey(k => k + 1)}
                      className="absolute top-6 right-3 text-xs text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Replay
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-[40%] flex flex-col">
                <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#0a0a0a] flex-grow min-h-[350px]">
                  <Editor
                    theme="devsensei"
                    beforeMount={(monaco) => {
                      monaco.editor.defineTheme('devsensei', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [],
                        colors: {
                          'editor.background': '#0a0a0a',
                          'editor.lineHighlightBackground': '#111111',
                        }
                      });
                    }}
                    language={question.language.toLowerCase() === 'c++' || question.language.toLowerCase() === 'cplusplus' ? 'cpp' : question.language.toLowerCase()}
                    value={userCode}
                    onChange={(val) => setUserCode(val || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      fontFamily: "'DM Mono', monospace"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#1f1f1f]">
              <div className="flex items-center gap-3">
                <InputGuard value={userCode} type="code" onValid={handleCheck}>
                  <button
                    disabled={checking}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50"
                  >
                    {checking ? "Checking..." : "Run & Check"}
                  </button>
                </InputGuard>
                
                <button
                  onClick={() => void loadQuestion()}
                  disabled={loadingQuestion}
                  className="border border-red-900/40 text-red-400 hover:bg-red-950/40 px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50"
                >
                  New Problem
                </button>
              </div>
              <span className="text-xs text-zinc-600 font-mono">
                {lineCount} lines · {charCount} chars
              </span>
            </div>

            {/* Results Section */}
            {result && (
              <div className="mt-6">
                {result.passed ? (
                  <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4">
                    <p className="text-emerald-400 font-semibold mb-2">✓ Solution accepted</p>
                    <p className="text-zinc-300 text-sm whitespace-pre-line">{result.feedback}</p>
                  </div>
                ) : (
                  <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4">
                    <p className="text-red-400 font-semibold mb-2">✗ Needs work</p>
                    <p className="text-zinc-300 text-sm mb-3 whitespace-pre-line">{result.feedback}</p>
                    
                    {explainingError ? (
                      <div className="mt-3 pt-3 border-t border-red-900/20 space-y-2">
                        <div className="h-4 bg-[#1a1a1a] rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-[#1a1a1a] rounded animate-pulse w-1/2"></div>
                      </div>
                    ) : explanation ? (
                      <div className="mt-3 pt-3 border-t border-red-900/20">
                        <p className="text-xs text-red-400 font-medium mb-2">AI Error Analysis</p>
                        <p className="text-xs text-zinc-400"><span className="text-zinc-300 font-medium">What went wrong:</span> {explanation.whatWentWrong}</p>
                        <p className="text-xs text-zinc-400 mt-1"><span className="text-zinc-300 font-medium">How to fix it:</span> {explanation.howToFix}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </PlatformLayout>
  );
}
