"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import type { PreviewQuestion } from "@/utils/flowTool";

export type Draft = { optionIds: string[]; text: string };

export const emptyDraft: Draft = { optionIds: [], text: "" };

const isMultiSelect = (question: PreviewQuestion) =>
  /multi/i.test(question.answer_type);

const isNumeric = (question: PreviewQuestion) =>
  /scale|number|numeric|rating|integer/i.test(question.answer_type);

/** A question counts as answered once it has a selection, or any free text. */
export const isAnswered = (question: PreviewQuestion, draft: Draft) =>
  question.options.length > 0
    ? draft.optionIds.length > 0
    : draft.text.trim().length > 0;

/**
 * The instruction line under the prompt, matching the copy and the exact
 * classes each question type uses in the main app. Free-text questions show
 * none at all.
 */
export function instructionFor(
  question: PreviewQuestion
): { text: string; className: string } | null {
  if (question.options.length > 0) {
    return isMultiSelect(question)
      ? {
          text: "Select all that apply",
          className:
            "text-primary-text/50 font-sans font-medium text-lg md:text-xl leading-normal tracking-tight",
        }
      : {
          text: "Please select one option",
          className:
            "text-primary-text/80 font-sans text-lg md:text-xl leading-relaxed",
        };
  }

  if (isNumeric(question)) {
    return {
      text: "Please enter a number",
      className:
        "text-primary-text/50 font-sans font-medium text-lg md:text-xl leading-normal tracking-tight",
    };
  }

  return null;
}

export default function QuestionField({
  question,
  draft,
  onChange,
  disabled,
}: {
  question: PreviewQuestion;
  draft: Draft;
  onChange: (draft: Draft) => void;
  disabled: boolean;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const multi = isMultiSelect(question);

  const options = question.options
    .slice()
    .sort((a, b) => a.display_order - b.display_order);

  const toggleOption = (optionId: string) => {
    if (multi) {
      onChange({
        ...draft,
        optionIds: draft.optionIds.includes(optionId)
          ? draft.optionIds.filter((id) => id !== optionId)
          : [...draft.optionIds, optionId],
      });
    } else {
      onChange({
        ...draft,
        optionIds: draft.optionIds[0] === optionId ? [] : [optionId],
      });
    }
  };

  if (options.length > 0 && !multi) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 md:gap-4">
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <Button
                disabled={disabled}
                className={`cursor-pointer text-base md:text-lg h-auto py-2.5 md:py-4 px-6 rounded-full border-2 w-full whitespace-normal min-h-[52px] md:min-h-[64px] transition-all ${
                  draft.optionIds[0] === option.id
                    ? "bg-secondary-background text-primary-background hover:bg-secondary-background/90 border-secondary-/20"
                    : "bg-white text-primary-text hover:bg-secondary-background/20 border-neutral drop-shadow-md"
                }`}
                onClick={() => toggleOption(option.id)}
              >
                {option.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (options.length > 0) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="space-y-2"
      >
        {options.map((option, index) => (
          <motion.div
            key={option.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            className="flex items-center space-x-4 py-2 px-4 rounded-full"
          >
            <Checkbox
              id={option.id}
              checked={draft.optionIds.includes(option.id)}
              disabled={disabled}
              onCheckedChange={() => toggleOption(option.id)}
              className="size-6 border-2 border-primary-text data-[state=checked]:bg-secondary-background data-[state=checked]:text-primary-text cursor-pointer"
            />
            <Label
              htmlFor={option.id}
              className="text-base md:text-lg cursor-pointer text-primary-text flex-1"
            >
              {option.label}
            </Label>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (isNumeric(question)) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <Textarea
          aria-label="Enter a number"
          placeholder=""
          disabled={disabled}
          className="bg-white text-primary-text text-lg md:text-xl px-6 py-[22px] leading-[28px] rounded-3xl min-h-[80px] border-2 border-primary-text focus:border-primary-text/50 focus:ring-2 focus:ring-primary-text/20 transition-all resize-y"
          value={draft.text}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => {
            if (/^\d*$/.test(event.target.value)) {
              onChange({ ...draft, text: event.target.value });
            }
          }}
        />
        {!draft.text && !isFocused && (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-start px-6"
            aria-hidden="true"
          >
            <span className="text-lg md:text-xl text-primary-text/50 text-left leading-snug">
              Enter a number
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <Textarea
        placeholder="Type your answer here"
        disabled={disabled}
        className="bg-white text-primary-text text-lg md:text-xl p-6 rounded-3xl min-h-[80px] border-2 border-primary-text focus:border-primary-text/50 focus:ring-2 focus:ring-primary-text/20 transition-all"
        value={draft.text}
        onChange={(event) => onChange({ ...draft, text: event.target.value })}
      />
    </motion.div>
  );
}
