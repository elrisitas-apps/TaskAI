# AI Agent for New Task from Voice/Text

## Goal

User records freely (e.g. *"Remind me to renew my internet package in 1 year, I pay 40 dollars a month and need to renew it"*). The AI:

1. Understands app logic and object structure.
2. Extracts: **title**, **description** (optional), **targetAt** (date), **type** (expiration/deadline/open), and optionally reminder intent.
3. **Fully understood** → navigate to **Confirm Task** with all data pre-filled.
4. **Partially understood** → navigate to **New Task** with known fields filled; user completes the rest manually.

---

## 1. Object structure the AI must map to

- **Commitment**: `type`, `title`, `description?`, `targetAt` (ISO date or null for open-ended), `source` (template/manual).
- **Reminders**: generated from ladder (see `generateReminderLadder` in `src/domain/ladder.ts`) or left for user to edit on Confirm screen.
- **Types**: `expiration` | `deadline` | `open`. Open = no target date.
- **Description**: free text for extra context (e.g. "I pay 40 dollars a month and need to renew it").

Give the AI a **schema** (e.g. JSON) of this shape so it can return structured data.

---

## 2. High-level flow

```
User speaks/types → Transcribe (if voice) → AI parses → Structured payload
                                                              ↓
                                    ┌─────────────────────────┴─────────────────────────┐
                                    ↓                                                     ↓
                    All required fields + date resolved              Some fields missing or ambiguous
                                    ↓                                                     ↓
                    Navigate to ConfirmCommitment                     Navigate to AddEditCommitment
                    with commitment + reminder dates                  with pre-filled title, description, type, targetAt
                    (user confirms)                                   (user fills rest, then Next → Confirm)
```

- **Required for “full”**: `title`, `type`, and either `targetAt` (for expiration/deadline) or `type: 'open'`.
- **Optional**: `description` (AI can put “I pay 40 dollars…” here).

---

## 3. Implementation options

### Option A: In-app LLM (e.g. OpenAI / Gemini API)

1. **Transcription**: Use device speech-to-text (e.g. `expo-speech`, or a cloud API) to get text from the recording.
2. **Prompt**: Send the user text + a **system prompt** that includes:
   - Short description of the app (tasks with optional target date, reminders, types: expiration / deadline / open).
   - The exact **Commitment** JSON shape (and that reminders are generated later from target date).
   - Instructions: “Extract title, description (optional), type, and targetAt (ISO date or null). If a relative time is mentioned (e.g. ‘in 1 year’), compute the date. If unclear, leave field null.”
3. **Response**: Parse AI response (e.g. JSON) into `{ type, title, description?, targetAt }`.
4. **Routing**:
   - If `title` and `type` and (`targetAt` or `type === 'open'`) → navigate to **ConfirmCommitment** with `commitment` and pre-computed reminder dates (from ladder).
   - Else → navigate to **AddEditCommitment** with the same payload (and optional `commitmentId` undefined); user fills gaps and taps Next to go to Confirm.

Store API key in env (e.g. `EXPO_PUBLIC_OPENAI_API_KEY`) and call from a small **task** (e.g. `parseTaskFromUserInput`) so the rest of the app stays unchanged.

### Option B: Backend service

Same logic, but:

1. App sends raw text (or audio URL) to your backend.
2. Backend runs transcription (if needed) + LLM parsing, returns the same JSON.
3. App receives JSON and does the same navigation (Confirm vs AddEdit) as above.

Useful if you want to hide keys, log usage, or add auth.

### Option C: Rule-based + LLM fallback

- First try **rule-based** parsing (regex / keyword: “in X days/months/years”, “renew”, “expire”, etc.) for title + date.
- If confidence is low or fields missing, call LLM to fill the rest. Then same routing.

---

## 4. Navigation integration

- **ConfirmCommitment** already accepts `route.params.commitment` (with `type`, `title`, `description?`, `targetAt`, `source`) and `commitmentId?`. So you can:

  `navigation.navigate('ConfirmCommitment', { commitment: aiPayload, commitmentId: undefined });`

- **AddEditCommitment** accepts `commitmentId?`. To pre-fill from AI:

  - Either extend params to accept optional **initial values** (e.g. `initialCommitment?: { type, title, description?, targetAt }`), and in the screen use them to initialize state when present.
  - Or use a **global store** (e.g. Redux): before navigating to AddEdit, dispatch “set draft from AI” with the partial payload; AddEdit reads that draft on mount and clears it when leaving.

---

## 5. Suggested order of work

1. **Define** the exact JSON schema the AI returns (and document it in code or this doc).
2. **Implement** a single “Parse task from text” function (call LLM or backend) that returns that schema.
3. **Add** a “Create from voice/text” entry point (e.g. FAB or new screen) that:
   - Records or opens a text input.
   - Calls the parser.
   - Based on completeness, navigates to ConfirmCommitment or AddEditCommitment with the new **Description** and other fields.
4. **Pre-fill** AddEdit when navigating from AI: either via route params or a small “AI draft” in Redux.
5. **Optional**: On Confirm screen, pre-fill reminder schedule from `generateReminderLadder(commitment, targetDate)` when all data is from AI.

---

## 6. Example prompt (for LLM)

```text
You are a task parser for a mobile app. The user describes a task in natural language.

Output valid JSON only, with this shape:
{
  "title": "short task title",
  "description": "optional extra details or null",
  "type": "expiration" | "deadline" | "open",
  "targetAt": "YYYY-MM-DD" or null
}

Rules:
- "expiration" = something that expires (e.g. passport, insurance).
- "deadline" = something to do by a date (e.g. submit form).
- "open" = no fixed date.
- If the user says "in X days/months/years", set targetAt to that date; otherwise use null for open-ended.
- Put clarifying details (e.g. "I pay 40 dollars a month") in description.
- If you cannot infer a field, use null.
```

Then in app: if `title` and `type` are non-null and (`targetAt` is set or `type === 'open'`), go to Confirm; else go to New Task with pre-fill.
