import { useState } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";
import Editor from "@monaco-editor/react";
import { InputGuard } from "@/components/InputGuard";
import { api, ApiError } from "@/services/api";
import type { RoastResult } from "@shared/types/api";

type RoastMode = 'roast' | 'mentor';

const DEFAULT_CODE = {
  javascript: "function findMax(arr) {\n  let max = 0;\n  for(let i = 0; i < arr.length; i++) {\n    for(let j = 0; j < arr.length; j++) {\n      if(arr[i] > max) max = arr[i];\n    }\n  }\n  return max;\n}",
  python: "def find_max(arr):\n    max_val = 0\n    for i in range(len(arr)):\n        for j in range(len(arr)):\n            if arr[i] > max_val:\n                max_val = arr[i]\n    return max_val",
  java: "public class Main {\n    public static int findMax(int[] arr) {\n        int max = 0;\n        for(int i = 0; i < arr.length; i++) {\n            for(int j = 0; j < arr.length; j++) {\n                if(arr[i] > max) max = arr[i];\n            }\n        }\n        return max;\n    }\n}",
  cpp: "int findMax(int arr[], int n) {\n    int max = 0;\n    for(int i = 0; i < n; i++) {\n        for(int j = 0; j < n; j++) {\n            if(arr[i] > max) max = arr[i];\n        }\n    }\n    return max;\n}"
};

export default function CodeRoaster() {
  const [language, setLanguage] = useState("javascript");
  const [userCode, setUserCode] = useState(DEFAULT_CODE.javascript);
  const [mode, setMode] = useState<RoastMode>('roast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => setMode(prev => prev === 'roast' ? 'mentor' : 'roast');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setUserCode(DEFAULT_CODE[lang as keyof typeof DEFAULT_CODE] || "");
    setResult(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const data = await api.roastCode({ language, code: userCode, mode });
      setResult(data);
      
      const existing = JSON.parse(localStorage.getItem('devsensei_stats') || '{}');
      existing.roastsReceived = (existing.roastsReceived || 0) + 1;
      localStorage.setItem('devsensei_stats', JSON.stringify(existing));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyRoast = () => {
    if (!result) return;
    const text = `I got roasted on DevSensei 🔥\n\n"${result.roastText}"\n\n${window.location.origin}`;
    navigator.clipboard.writeText(text);
  };

  const renderBadge = (level: number) => {
    if (level === 1) return <span className="bg-amber-950 text-amber-400 border border-amber-900 px-2 py-0.5 rounded text-xs tracking-wider">MILD</span>;
    if (level === 2) return <span className="bg-orange-950 text-orange-400 border border-orange-900 px-2 py-0.5 rounded text-xs tracking-wider">SPICY</span>;
    return <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded text-xs tracking-wider animate-pulse">NUCLEAR</span>;
  };

  const fixedCodeLines = result?.fixedCode.split("\n").length || 10;

  return (
    <PlatformLayout
      title="Code Roaster"
      description="Submit your code. Get roasted. Learn faster."
    >
      <div className="text-center -mt-3 mb-8">
        <span className="text-xs text-red-500/80 uppercase tracking-widest font-medium">Powered by Gemini · Brutally honest · Actually useful</span>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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

          <div className="flex items-center gap-3">
            <span className={mode === 'roast' ? "text-red-400 font-semibold text-sm" : "text-zinc-600 text-sm"}>🔥 Roast Mode</span>
            <button onClick={toggleMode} className="w-12 h-6 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] relative transition-all">
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-all ${mode === 'mentor' ? 'left-[22px] bg-blue-500' : 'left-0.5 bg-red-500'}`} />
            </button>
            <span className={mode === 'mentor' ? "text-blue-400 font-semibold text-sm" : "text-zinc-600 text-sm"}>🎓 Mentor Mode</span>
          </div>
        </div>

        <div className="border border-[#1f1f1f] rounded-xl overflow-hidden bg-[#0a0a0a]">
          <Editor
            height="280px"
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
            language={language}
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

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-start">
          <InputGuard value={userCode} type="code" onValid={handleSubmit}>
            <button
              disabled={loading}
              className={`px-5 py-2.5 rounded-md text-sm font-medium transition-all text-white disabled:opacity-50 ${
                mode === 'roast' ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Analyzing..." : (mode === 'roast' ? "Roast My Code 🔥" : "Review My Code")}
            </button>
          </InputGuard>
        </div>

        {loading && (
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-5 animate-pulse h-48 mt-8" />
        )}

        {result && !loading && (
          <div className={`mt-8 border rounded-xl p-5 ${
            mode === 'roast' ? 'bg-[#0f0a0a] border-red-900/60' : 'bg-[#0a0f0a] border-emerald-900/40'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${mode === 'roast' ? 'text-red-500' : 'text-emerald-400'}`}>
                {mode === 'roast' ? "🔥 Roast Report" : "🎓 Code Review"}
              </h3>
              {mode === 'roast' && renderBadge(result.roastLevel)}
            </div>

            <p className={`text-sm leading-relaxed mb-6 whitespace-pre-line ${
              mode === 'roast' ? 'text-zinc-200 italic' : 'text-zinc-300'
            }`}>
              "{result.roastText}"
            </p>

            <div className={`border-t pt-5 ${mode === 'roast' ? 'border-red-900/30' : 'border-emerald-900/30'}`}>
              <h4 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">The Real Fix:</h4>
              <div className="border border-[#1f1f1f] rounded-md overflow-hidden bg-[#0a0a0a] mb-4">
                <Editor
                  height={`${Math.max(100, fixedCodeLines * 21 + 20)}px`}
                  theme="devsensei"
                  language={language}
                  value={result.fixedCode}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "off",
                    scrollBeyondLastLine: false,
                    readOnly: true,
                    fontFamily: "'DM Mono', monospace"
                  }}
                />
              </div>
              
              <h4 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Why this is better:</h4>
              <p className="text-zinc-400 text-sm whitespace-pre-line leading-relaxed">
                {result.whyBetter}
              </p>
            </div>

            {mode === 'roast' && (
              <button 
                onClick={copyRoast} 
                className="text-xs text-zinc-500 hover:text-zinc-300 border border-[#2a2a2a] rounded px-3 py-1.5 mt-6 transition-colors"
              >
                Copy Roast to Share
              </button>
            )}
          </div>
        )}
      </div>
    </PlatformLayout>
  );
}
