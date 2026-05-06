import { useState } from "react";
import { PlatformLayout } from "@/components/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InputGuard } from "@/components/InputGuard";
import { api, ApiError } from "@/services/api";
import type { ErrorExplainResult } from "@shared/types/api";

export default function ErrorExplainer() {
  const [language, setLanguage] = useState("Python");
  const [errorMessage, setErrorMessage] = useState("");
  const [codeContext, setCodeContext] = useState("");
  const [showCodeContext, setShowCodeContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ErrorExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const data = await api.explainError({
        language,
        errorMessage,
        codeContext: showCodeContext ? codeContext : undefined,
      });

      setResult(data);

      const existing = JSON.parse(localStorage.getItem('devsensei_stats') || '{}');
      existing.errorsExplained = (existing.errorsExplained || 0) + 1;
      localStorage.setItem('devsensei_stats', JSON.stringify(existing));

    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlatformLayout
      title="AI Error Explainer"
      description="Paste any Python, JavaScript, Java, or C++ error message and get a plain-English explanation + fix."
    >
      <div className="mt-10 max-w-4xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-white">Debug Your Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1 w-48">
              <label className="text-sm text-slate-400 font-medium">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-3 py-2 outline-none focus:border-primary transition-colors"
              >
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400 font-medium">Paste your error message here</label>
              <Textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="e.g. TypeError: Cannot read properties of undefined (reading 'map')"
                className="min-h-[160px] font-mono text-sm bg-slate-950/80 border-slate-800 text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCodeContext(!showCodeContext)}
                  className="text-slate-400 hover:text-white hover:bg-slate-800 px-2 h-8"
                >
                  {showCodeContext ? "Hide code context" : "+ Add code context (optional)"}
                </Button>
              </div>
              
              {showCodeContext && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm text-slate-400 font-medium block mb-2">Paste the code that caused it</label>
                  <Textarea
                    value={codeContext}
                    onChange={(e) => setCodeContext(e.target.value)}
                    placeholder="Paste the relevant snippet of code here..."
                    className="min-h-[120px] font-mono text-sm bg-slate-950/80 border-slate-800 text-slate-300"
                  />
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <InputGuard value={errorMessage} type="errorMessage" onValid={handleExplain}>
              <Button
                disabled={loading}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all mt-2"
              >
                {loading ? "Analyzing..." : "Explain this error"}
              </Button>
            </InputGuard>
          </CardContent>
        </Card>

        {loading && (
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
            <CardContent className="p-6 space-y-6">
              <div className="h-6 bg-slate-800 rounded animate-pulse w-1/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
              </div>
              <div className="h-24 bg-slate-800 rounded animate-pulse w-full mt-4"></div>
            </CardContent>
          </Card>
        )}

        {result && !loading && (
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border border-primary/30 shadow-lg shadow-primary/10 overflow-hidden">
            <div className="bg-primary/10 border-b border-primary/20 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">💡</span> AI Explanation
              </h3>
            </div>
            <CardContent className="p-6 space-y-8">
              <div>
                <h4 className="text-primary font-semibold mb-2 uppercase tracking-wider text-sm">What went wrong</h4>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line">{result.whatWentWrong}</p>
              </div>

              <div>
                <h4 className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">How to fix it</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-md p-4 text-slate-300 font-mono text-sm whitespace-pre-line">
                  {result.howToFix}
                </div>
              </div>

              <div>
                <h4 className="text-yellow-400 font-semibold mb-2 uppercase tracking-wider text-sm">Common Cause</h4>
                <p className="text-slate-300 italic">{result.commonCause}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PlatformLayout>
  );
}
