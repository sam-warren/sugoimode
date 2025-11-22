"use client";

import { useEffect, useState } from "react";
import type { ScriptType, KanaChar } from "@/lib/kana";
import { randomKanaString, normalizeRomaji } from "@/lib/kana";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ResultState = "idle" | "correct" | "incorrect";

export function KanaTrainer() {
  const { theme, setTheme } = useTheme();
  const [script, setScript] = useState<ScriptType>("hiragana");
  const [length, setLength] = useState<number>(3);
  const [question, setQuestion] = useState<KanaChar[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ResultState>("idle");
  const [revealedHints, setRevealedHints] = useState<boolean[]>([]);
  const [streak, setStreak] = useState<number>(0);

  // Generate first question
  useEffect(() => {
    generateQuestion(script, length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQuestion = (scriptType: ScriptType, len: number) => {
    const q = randomKanaString(scriptType, len);
    setQuestion(q);
    setAnswer("");
    setResult("idle");
    setRevealedHints(new Array(q.length).fill(false));
  };

  const expectedRomaji = question.map((c) => c.romaji).join("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInput = normalizeRomaji(answer);
    const normalizedExpected = normalizeRomaji(expectedRomaji);

    if (!normalizedInput) return;

    if (normalizedInput === normalizedExpected) {
      setResult("correct");
      setStreak((prev) => prev + 1);
      // Briefly flash green then move on
      setTimeout(() => {
        generateQuestion(script, length);
      }, 400);
    } else {
      setResult("incorrect");
      setStreak(0);
    }
  };

  const handleHintClick = (index: number) => {
    setStreak(0);
    setRevealedHints((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
  };

  const containerClasses =
    "flex flex-col gap-4 transition-all duration-300 border-2 rounded-lg " +
    (result === "correct"
      ? "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-950/30 shadow-lg shadow-green-500/20"
      : result === "incorrect"
      ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950/30 animate-shake shadow-lg shadow-red-500/20"
      : "border-border shadow-md");

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      // system - toggle to opposite of current system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "light" : "dark");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
      <Card className="w-full max-w-xl shadow-2xl border-border/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold">
              Hiragana & Katakana Trainer
            </span>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20">
                  <span className="text-sm font-semibold text-primary">
                    🔥 {streak}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative h-9 w-9 rounded-full hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-row gap-3 items-end justify-start">
            <div className="w-40 shrink-0">
              <label className="mb-2 block text-sm font-semibold text-foreground/80">
                Script
              </label>
              <Select
                value={script}
                onValueChange={(val: ScriptType) => {
                  setScript(val);
                  generateQuestion(val, length);
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select script" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hiragana">Hiragana</SelectItem>
                  <SelectItem value="katakana">Katakana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-24 shrink-0">
              <label className="mb-2 block text-sm font-semibold text-foreground/80">
                Length
              </label>
              <Select
                value={String(length)}
                onValueChange={(val) => {
                  const newLen = Number(val);
                  setLength(newLen);
                  generateQuestion(script, newLen);
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((len) => (
                    <SelectItem key={len} value={String(len)}>
                      {len}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question + Input */}
          <div className={containerClasses}>
            {/* Kana string */}
            <div className="flex justify-center items-center gap-2 sm:gap-4 py-4 sm:py-6 px-2 flex-wrap">
              {question.map((char, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleHintClick(idx)}
                  className="group flex flex-col items-center rounded-lg px-2 sm:px-3 py-2 transition-all hover:bg-muted/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background shrink-0"
                >
                  <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground transition-transform group-hover:scale-110 leading-none">
                    {char.kana}
                  </span>
                  {revealedHints[idx] && (
                    <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-primary animate-in fade-in slide-in-from-top-1">
                      {char.romaji}
                    </span>
                  )}
                  {!revealedHints[idx] && (
                    <span className="mt-1 sm:mt-2 h-3 sm:h-4 w-6 sm:w-8 rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>

            {/* Answer input */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 px-6 pb-6"
            >
              <label className="text-sm font-medium text-foreground/80">
                Type the full romaji for the string:
              </label>
              <Input
                autoFocus
                placeholder="e.g. kakikukeko"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (result !== "idle") setResult("idle");
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className="h-12 text-base transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
              />
              <div className="flex items-center justify-between gap-3">
                <Button 
                  type="submit" 
                  className="flex-1 h-11 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                >
                  Check
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStreak(0);
                    generateQuestion(script, length);
                  }}
                  className="h-11 px-6 font-medium"
                >
                  Skip
                </Button>
              </div>
              {result === "incorrect" && (
                <p className="text-sm font-medium text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
                  Not quite. Try again or click a character for a hint.
                </p>
              )}
              {result === "correct" && (
                <p className="text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1">
                  Correct! ✨
                </p>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
