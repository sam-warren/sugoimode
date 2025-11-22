Here’s a straight “drop this into Cursor and go” plan.

I’ll assume:

* **Next.js 14+ with App Router**
* **TypeScript**
* **Tailwind already set up by create-next-app**
* We’ll add **shadcn/ui** and a small set of components.

---

## 1. Create the project

In Cursor terminal:

```bash
npx create-next-app@latest sugoimode \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir
cd sugoimode
```

---

## 2. Install shadcn/ui

Still in the project root:

```bash
# Install shadcn cli
npx shadcn-ui@latest init
```

Accept defaults or tweak as you like (e.g. `src/components`).

Then add the components we’ll use:

```bash
npx shadcn-ui@latest add button card input select
```

This will generate components in `src/components/ui`.

---

## 3. Add a shake animation for wrong answers

Open `src/app/globals.css` and add this near the bottom:

```css
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
  100% { transform: translateX(0); }
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}
```

Tailwind will pick these up.

---

## 4. Add kana data + helpers

Create `src/lib/kana.ts`:

```ts
export type ScriptType = "hiragana" | "katakana";

export type KanaChar = {
  kana: string;
  romaji: string;
};

export const HIRAGANA: KanaChar[] = [
  // a-row
  { kana: "あ", romaji: "a" },
  { kana: "い", romaji: "i" },
  { kana: "う", romaji: "u" },
  { kana: "え", romaji: "e" },
  { kana: "お", romaji: "o" },
  // k-row
  { kana: "か", romaji: "ka" },
  { kana: "き", romaji: "ki" },
  { kana: "く", romaji: "ku" },
  { kana: "け", romaji: "ke" },
  { kana: "こ", romaji: "ko" },
  // s-row
  { kana: "さ", romaji: "sa" },
  { kana: "し", romaji: "shi" },
  { kana: "す", romaji: "su" },
  { kana: "せ", romaji: "se" },
  { kana: "そ", romaji: "so" },
  // t-row
  { kana: "た", romaji: "ta" },
  { kana: "ち", romaji: "chi" },
  { kana: "つ", romaji: "tsu" },
  { kana: "て", romaji: "te" },
  { kana: "と", romaji: "to" },
  // n-row
  { kana: "な", romaji: "na" },
  { kana: "に", romaji: "ni" },
  { kana: "ぬ", romaji: "nu" },
  { kana: "ね", romaji: "ne" },
  { kana: "の", romaji: "no" },
  // h-row
  { kana: "は", romaji: "ha" },
  { kana: "ひ", romaji: "hi" },
  { kana: "ふ", romaji: "fu" },
  { kana: "へ", romaji: "he" },
  { kana: "ほ", romaji: "ho" },
  // m-row
  { kana: "ま", romaji: "ma" },
  { kana: "み", romaji: "mi" },
  { kana: "む", romaji: "mu" },
  { kana: "め", romaji: "me" },
  { kana: "も", romaji: "mo" },
  // y-row
  { kana: "や", romaji: "ya" },
  { kana: "ゆ", romaji: "yu" },
  { kana: "よ", romaji: "yo" },
  // r-row
  { kana: "ら", romaji: "ra" },
  { kana: "り", romaji: "ri" },
  { kana: "る", romaji: "ru" },
  { kana: "れ", romaji: "re" },
  { kana: "ろ", romaji: "ro" },
  // w-row
  { kana: "わ", romaji: "wa" },
  { kana: "を", romaji: "wo" },
  // n
  { kana: "ん", romaji: "n" },
];

export const KATAKANA: KanaChar[] = [
  // a-row
  { kana: "ア", romaji: "a" },
  { kana: "イ", romaji: "i" },
  { kana: "ウ", romaji: "u" },
  { kana: "エ", romaji: "e" },
  { kana: "オ", romaji: "o" },
  // k-row
  { kana: "カ", romaji: "ka" },
  { kana: "キ", romaji: "ki" },
  { kana: "ク", romaji: "ku" },
  { kana: "ケ", romaji: "ke" },
  { kana: "コ", romaji: "ko" },
  // s-row
  { kana: "サ", romaji: "sa" },
  { kana: "シ", romaji: "shi" },
  { kana: "ス", romaji: "su" },
  { kana: "セ", romaji: "se" },
  { kana: "ソ", romaji: "so" },
  // t-row
  { kana: "タ", romaji: "ta" },
  { kana: "チ", romaji: "chi" },
  { kana: "ツ", romaji: "tsu" },
  { kana: "テ", romaji: "te" },
  { kana: "ト", romaji: "to" },
  // n-row
  { kana: "ナ", romaji: "na" },
  { kana: "ニ", romaji: "ni" },
  { kana: "ヌ", romaji: "nu" },
  { kana: "ネ", romaji: "ne" },
  { kana: "ノ", romaji: "no" },
  // h-row
  { kana: "ハ", romaji: "ha" },
  { kana: "ヒ", romaji: "hi" },
  { kana: "フ", romaji: "fu" },
  { kana: "ヘ", romaji: "he" },
  { kana: "ホ", romaji: "ho" },
  // m-row
  { kana: "マ", romaji: "ma" },
  { kana: "ミ", romaji: "mi" },
  { kana: "ム", romaji: "mu" },
  { kana: "メ", romaji: "me" },
  { kana: "モ", romaji: "mo" },
  // y-row
  { kana: "ヤ", romaji: "ya" },
  { kana: "ユ", romaji: "yu" },
  { kana: "ヨ", romaji: "yo" },
  // r-row
  { kana: "ラ", romaji: "ra" },
  { kana: "リ", romaji: "ri" },
  { kana: "ル", romaji: "ru" },
  { kana: "レ", romaji: "re" },
  { kana: "ロ", romaji: "ro" },
  // w-row
  { kana: "ワ", romaji: "wa" },
  { kana: "ヲ", romaji: "wo" },
  // n
  { kana: "ン", romaji: "n" },
];

export const getKanaSet = (script: ScriptType): KanaChar[] =>
  script === "hiragana" ? HIRAGANA : KATAKANA;

export const randomKanaString = (script: ScriptType, length: number): KanaChar[] => {
  const set = getKanaSet(script);
  const result: KanaChar[] = [];

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * set.length);
    result.push(set[idx]);
  }

  return result;
};

export const normalizeRomaji = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "");
```

---

## 5. Create the trainer component

Create `src/components/sugoimode.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ScriptType, KanaChar } from "@/lib/kana";
import { randomKanaString, normalizeRomaji } from "@/lib/kana";

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
  const [script, setScript] = useState<ScriptType>("hiragana");
  const [length, setLength] = useState<number>(3);
  const [question, setQuestion] = useState<KanaChar[]>([]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ResultState>("idle");
  const [revealedHints, setRevealedHints] = useState<boolean[]>([]);

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
      // Briefly flash green then move on
      setTimeout(() => {
        generateQuestion(script, length);
      }, 400);
    } else {
      setResult("incorrect");
      // Let user try again, don’t change question
    }
  };

  const handleHintClick = (index: number) => {
    setRevealedHints((prev) => {
      const copy = [...prev];
      copy[index] = true;
      return copy;
    });
  };

  const containerClasses =
    "flex flex-col gap-4 transition-all border-2 " +
    (result === "correct"
      ? "border-green-500 bg-green-50"
      : result === "incorrect"
      ? "border-red-500 bg-red-50 animate-shake"
      : "border-border");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kana Trainer</span>
            <span className="text-sm text-muted-foreground">
              Practice hiragana &amp; katakana
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">
                Script
              </label>
              <Select
                value={script}
                onValueChange={(val: ScriptType) => {
                  setScript(val);
                  generateQuestion(val, length);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select script" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hiragana">Hiragana</SelectItem>
                  <SelectItem value="katakana">Katakana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-32">
              <label className="mb-1 block text-sm font-medium">
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
                <SelectTrigger>
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
            <div className="flex justify-center gap-3 py-4">
              {question.map((char, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleHintClick(idx)}
                  className="flex flex-col items-center rounded-md px-2 py-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span className="text-4xl sm:text-5xl font-semibold">
                    {char.kana}
                  </span>
                  {revealedHints[idx] && (
                    <span className="mt-1 text-xs text-muted-foreground">
                      {char.romaji}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Answer input */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 px-4 pb-4"
            >
              <label className="text-sm">
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
              />
              <div className="flex items-center justify-between gap-2">
                <Button type="submit" className="flex-1">
                  Check
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => generateQuestion(script, length)}
                >
                  Skip
                </Button>
              </div>
              {result === "incorrect" && (
                <p className="text-sm text-red-600">
                  Not quite. Try again or click a character for a hint.
                </p>
              )}
              {result === "correct" && (
                <p className="text-sm text-green-600">Correct!</p>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 6. Plug the trainer into the home page

Open `src/app/page.tsx` and replace with:

```tsx
import { KanaTrainer } from "@/components/sugoimode";

export default function HomePage() {
  return <KanaTrainer />;
}
```

---

## 7. Run locally

In Cursor terminal:

```bash
npm run dev
```

Open `http://localhost:3000` and you should have:

* Script toggle: **Hiragana / Katakana**
* Length selector: 1–5 characters
* Big kana string in the middle
* Text input for romaji
* ✅ Correct ⇒ card flashes green and moves to next item
* ❌ Incorrect ⇒ shakes red and stays on the same string
* Clicking any character shows its romaji as a hint

---

## 8. Deploy to Vercel

1. Push the project to GitHub (or GitLab/Bitbucket).
2. Go to Vercel, **New Project** → import repo.
3. Framework should auto-detect as **Next.js**.
4. No special env vars needed for this simple trainer.
5. Deploy.

You’ll have a live URL you can share.

---

If you want, next step we can add scoring, streaks, and a “focus only on characters I often miss” mode—but this gets you the clean v1 in your stack.
