import React, { ReactNode, useState, useEffect } from "react";

type InputGuardProps = {
  value: string;
  type: "code" | "answer" | "errorMessage" | "any";
  onValid: () => void;
  children: ReactNode;
};

export function InputGuard({ value, type, onValid, children }: InputGuardProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clear error if value changes
  useEffect(() => {
    setErrorMsg(null);
  }, [value]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleValidate = () => {
    const val = value || "";
    const trimmed = val.trim();

    if (type === "any") {
      if (!trimmed) {
        setErrorMsg("This field cannot be empty.");
        return;
      }
    } else if (type === "code") {
      if (!trimmed) {
        setErrorMsg("Write some code first.");
        return;
      }
      
      const lines = val.split("\n").filter(l => l.trim().length > 0);
      if (lines.length < 3) {
        setErrorMsg("That's too short to be a real solution. Add more code.");
        return;
      }
      
      const todoIndex = val.indexOf("// TODO");
      if (todoIndex !== -1) {
        const afterTodo = val.substring(todoIndex + "// TODO".length);
        const cleanAfter = afterTodo.replace(/\/\/.*$/gm, '').replace(/\s+/g, '');
        if (cleanAfter.length === 0 || cleanAfter === "}" || cleanAfter === "};") {
          setErrorMsg("You haven't filled in the solution yet — the TODO is still there.");
          return;
        }
      }
      
      if (!/[{}();:=+\-*/<>]/.test(val)) {
        setErrorMsg("This doesn't look like code. Make sure you're writing in the selected language.");
        return;
      }
      
    } else if (type === "answer") {
      if (!trimmed) {
        setErrorMsg("Type your answer first.");
        return;
      }
      if (trimmed.length === 1) {
        setErrorMsg("Give a more complete answer.");
        return;
      }
    } else if (type === "errorMessage") {
      if (!trimmed) {
        setErrorMsg("Paste an error message to continue.");
        return;
      }
      if (trimmed.length < 10) {
        setErrorMsg("That's too short to be a real error. Paste the full message.");
        return;
      }
      
      const codeKeywords = /(function |def |const |let |var |=>|class )/;
      if (codeKeywords.test(val) && val.includes("{") && val.includes("}")) {
        setErrorMsg("This looks like code, not an error message. Paste the error output from your terminal.");
        return;
      }
    }

    onValid();
  };

  const child = React.Children.only(children) as React.ReactElement<any>;
  const clone = React.cloneElement(child, {
    onClick: (e: any) => {
      e.preventDefault();
      handleValidate();
    }
  });

  return (
    <div className="flex flex-col items-start w-full sm:w-auto">
      {clone}
      {errorMsg && (
        <div className="flex items-center gap-2 mt-2 text-sm text-amber-400 animate-in slide-in-from-top-1">
          <span className="text-amber-500">⚠</span> {errorMsg}
        </div>
      )}
    </div>
  );
}
