/**
 * Types for the generated content module (content.js).
 * The data itself is extracted verbatim from deen-daily-v2.html — see
 * scripts/extract-content.mjs and CLAUDE.md.
 */

/** [number 1-42, title, text, lesson, action] */
export type Hadith = [number, string, string, string, string]
/** Source + grading for hadith N lives at index N-1. */
export type Source = string
/** [arabic, transliteration, meaning] */
export type Name = [string, string, string]
/** [n, name, meaning, ayahs, startPage (Madani 604-page mushaf)] */
export type Surah = [number, string, string, number, number]
/** [text, source] — all graded */
export type Motiv = [string, string]
/** Muhasabah reflection prompt — rotates daily. */
export type Prompt = string
/** [title, arabic, meaning, count, source, transliteration ("" when no authenticated one exists)] */
export type Dhikr = [string, string, string, string, string, string]
/** [id, label, sublabel] */
export type Task = [string, string, string]

export declare const HADITH: Hadith[]
export declare const SOURCES: Source[]
export declare const NAMES: Name[]
export declare const SURAHS: Surah[]
export declare const MOTIV: Motiv[]
export declare const PROMPTS: Prompt[]
export declare const ADHKAR: Dhikr[]
export declare const TASKS: Task[]
