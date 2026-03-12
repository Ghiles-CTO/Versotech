# VERSO In-App Support Chat

## Summary
Build a new global bottom-right `VERSO Support` chat inside `versotech_main` as a general platform support assistant, separate from Wayne.

It should help users understand:
- how the platform works
- where to click
- what this page means
- why something is empty or locked
- what to do next

It should not do compliance or KYC decisioning.  
If the topic is compliance/KYC-specific, it routes the user to Wayne instead of answering in depth.

## Key Changes
### 1. UI
- Add one global support launcher in `UnifiedAppLayout`.
- Open a floating chat panel on desktop and a sheet/fullscreen panel on mobile.
- Keep chat available on all authenticated `versotech_main` pages.
- Show real message history, not a disposable popup.
- Include first-class CTAs inside replies:
  - `Go to page`
  - `Open next step`
  - `Open Wayne` for compliance/KYC topics
  - `Request human help` when needed

### 2. Conversation model
- Reuse existing `conversations` and `messages`.
- Create one `support` conversation per `user + active persona`.
- Store support metadata on the conversation:
  - `support_chat.enabled`
  - `support_chat.persona_type`
  - `support_chat.flagged`
  - `support_chat.flagged_reason`
  - `support_chat.last_route`
  - `support_chat.last_context`
- Use `owner_team = "support"` so staff can filter these threads separately from compliance.
- Persist all support chats into the native messaging backend.
- For personas without a normal inbox page, the popup still shows history; staff still see the saved thread.

### 3. Support brain
- Create a separate support reply pipeline, not Wayne's reply pipeline.
- Source answers from:
  - existing help/FAQ/how-to content
  - recent conversation history
  - current route
  - explicit page context flags from the frontend
- Add a support context contract passed with each user message:
  - `route`
  - `pageTitle`
  - `personaType`
  - `entityName`
  - `emptyStateReason`
  - `blockedReason`
  - `nextStepLabel`
  - `nextStepHref`
  - `availableActions`
- Initial "smart" route coverage:
  - dashboard
  - opportunities
  - profile
  - documents
  - inbox
- All other pages use generic support behavior with route name + KB fallback.

### 4. Hard boundary with Wayne
- Detect compliance/KYC-heavy questions early.
- Do not answer them as general support.
- Reply with a short redirect:
  - explain that Wayne handles compliance/KYC
  - provide CTA to open Wayne thread / inbox route
- Keep Wayne unchanged.

### 5. Human takeover
- Add `Request human help` in the support UI.
- Auto-flag when:
  - low confidence
  - repeated fallback
  - user frustration
  - unsupported request
- Flagged support threads appear in staff messages via `owner_team = support`.
- Staff answer in the same thread.

## APIs / Interfaces
- Add `POST /api/support-chat/ensure-thread`
  - returns the current support conversation for the active user/persona
- Add `POST /api/conversations/[id]/support-reply`
  - generates and saves the assistant reply
- Add a shared frontend type:
  - `SupportPageContext`
- Extend conversation filtering to support `ownerTeam = support`

## Test Plan
- Launcher appears globally in `versotech_main`
- One support thread is reused per user + persona
- Messages persist and reload correctly
- Support replies use persona-filtered help content
- Smart page support works on the 5 target routes
- Compliance/KYC questions route to Wayne
- Human-help requests flag the thread and surface it to staff
- Personas without inbox still retain popup history
- Existing Wayne/compliance behavior is unchanged

## Assumptions
- This is a new assistant called `VERSO Support`
- It is available to all personas in `versotech_main`
- It is global in UI, but only a defined set of pages gets rich contextual support in v1
- No new DB tables are required
- Wayne remains the dedicated compliance/KYC assistant
