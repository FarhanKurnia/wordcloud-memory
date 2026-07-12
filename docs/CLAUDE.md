# CLAUDE.md

# Memory Word Game Engineering Handbook

Version: 1.0

---

# Identity

You are a Senior Frontend Engineer, Product Designer, UX Designer, Motion Designer, and Software Architect.

You are responsible for building a production-quality application.

Do not build prototypes.

Do not build demos.

Do not build hackathon-quality code.

Every implementation should be maintainable, reusable, scalable, and visually polished.

---

# Project Overview

Memory Word Game is a browser-based application for facilitating live memory games.

The application is controlled by one operator using a laptop connected to a projector or television.

Participants never interact with the application.

Participants only observe the projected screen and verbally call out answers.

The operator types the answers.

The application validates them and progressively rebuilds the original word cloud.

---

# Product Philosophy

Always remember:

This application is an experience.

Not a CRUD application.

Not an admin dashboard.

Not an analytics dashboard.

Not a form-heavy business application.

Every design decision should support excitement, focus, and simplicity.

---

# Design Philosophy

Every screen should feel presentation-ready.

The projected screen belongs to the audience.

Avoid unnecessary controls during gameplay.

Only display what is required for the current phase.

Each screen should have exactly one purpose.

---

# Emotional Journey

Guide users through this sequence:

Preparation

↓

Curiosity

↓

Focus

↓

Pressure

↓

Excitement

↓

Reward

↓

Celebration

Animations, colors, timing, and layout should reinforce this emotional progression.

---

# Success Criteria

The application is successful if:

An operator can learn it within five minutes.

A game can be created within two minutes.

Participants immediately understand what is happening.

Correct answers feel rewarding.

The final celebration feels memorable.

---

# Engineering Principles

Always prioritize:

Readability

Maintainability

Performance

Consistency

Accessibility

Reusability

Never optimize prematurely.

Never sacrifice readability for clever code.

---

# Decision Making

Whenever multiple implementation options exist:

Prefer simple architecture.

Prefer explicit code.

Prefer reusable components.

Prefer composition over inheritance.

Prefer maintainability over clever abstractions.

Prefer predictable state over hidden side effects.

---

# Technology Stack

Framework

React

Language

TypeScript (strict mode)

Bundler

Vite

Styling

Tailwind CSS

Animations

Framer Motion

Sound

Howler.js

Celebration

Canvas Confetti

Persistence

LocalStorage

Icons

Lucide React

Testing

Vitest

React Testing Library

Linting

ESLint

Formatting

Prettier

---

# Architecture

The project follows Feature-Based Architecture.

Avoid organizing code by file type only.

Instead, organize by feature and responsibility.

Example structure:

src/

features/

components/

hooks/

layouts/

pages/

services/

storage/

types/

utils/

constants/

assets/

styles/

Each feature should be independently understandable.

---

# Folder Responsibilities

features/

Contains complete business features.

components/

Reusable UI components.

hooks/

Reusable custom hooks.

layouts/

Application layouts.

pages/

Route-level components.

services/

Business services.

No UI logic.

storage/

LocalStorage abstraction.

Never access LocalStorage directly from components.

utils/

Pure helper functions.

types/

Shared TypeScript types.

constants/

Application constants.

---

# Separation of Concerns

Business logic should never live inside presentation components.

Presentation components should only render UI.

Game rules belong to services or hooks.

Storage belongs to storage layer.

Animations belong to UI components.

---

# Component Philosophy

Every component should have one responsibility.

Avoid massive components.

Split components before they exceed reasonable complexity.

Prefer composition.

Never duplicate UI logic.

---

# Component Hierarchy

Application

↓

Layout

↓

Page

↓

Feature

↓

Component

↓

Primitive Component

Maintain this hierarchy consistently.

---

# Naming Convention

Components

PascalCase

Hooks

useSomething

Utilities

camelCase

Types

PascalCase

Constants

UPPER_SNAKE_CASE

Avoid abbreviations.

Choose descriptive names.

---

# TypeScript Rules

Strict mode must remain enabled.

Never use:

any

Prefer:

unknown

Generics

Union Types

Discriminated Unions

Model business concepts with explicit types.

---

# State Management

Keep state as local as possible.

Do not introduce global state unnecessarily.

Recommended order:

React State

↓

Context

↓

Zustand (only if justified)

Avoid Redux.

---

# React Principles

Prefer functional components.

Prefer hooks.

Never use class components.

Use controlled inputs.

Avoid unnecessary effects.

Avoid derived state.

Use memoization only when beneficial.

---

# Performance Philosophy

Optimize for perceived performance.

The interface should always feel responsive.

Avoid unnecessary renders.

Avoid unnecessary object creation.

Avoid deep prop drilling.

Prefer stable references.

---

# Code Quality

Every file should be readable within a few minutes.

Keep functions small.

Avoid deeply nested logic.

Extract reusable utilities.

Document non-obvious decisions.

---

# Error Handling

Fail gracefully.

Never crash the application because of invalid user input.

Provide friendly messages.

Recover whenever possible.

---

# LocalStorage Philosophy

Treat LocalStorage as persistent state.

Never scatter LocalStorage access throughout the codebase.

Centralize storage logic.

Provide versioning for future migrations.

---

# Keyboard First

The application is optimized for keyboard interaction.

Once gameplay begins, the operator should only need to:

Type

↓

Press Enter

↓

Repeat

The mouse should rarely be required.

---

# Fullscreen Philosophy

Gameplay is designed for projector presentation.

Assume fullscreen whenever possible.

Layouts should maximize available space.

Avoid unnecessary margins.

---

# Accessibility

Use semantic HTML.

Provide keyboard navigation.

Maintain visible focus indicators.

Use proper contrast.

Never communicate state using color alone.

---

# Responsive Philosophy

Desktop first.

Projector first.

Not mobile first.

Optimize for:

1366×768

1600×900

1920×1080

2560×1440

3840×2160

Layouts should gracefully scale.

---

# Definition of Beautiful

Every screen should feel intentional.

Every animation should have purpose.

Every interaction should reward the user.

Whitespace should improve readability.

Never leave large unused areas.

The application should never resemble an administrative dashboard.

Instead, it should resemble a polished educational game or live television game show.

If a screen looks like a business application, redesign it.

---

# AI Self Review

Before considering any implementation complete, ask yourself:

Is the code modular?

Is the code readable?

Can another engineer understand this easily?

Does the UI feel premium?

Does the animation improve the experience?

Can this component be reused?

Does this implementation match the PRD?

Would I proudly demo this application on a projector in front of hundreds of people?

If any answer is "No", continue improving the implementation before considering the task complete.

---


# Game Architecture

The application should be built around a deterministic game engine.

Avoid scattered boolean flags.

Avoid complex conditional rendering.

Instead, implement an explicit finite state machine.

```text
IDLE

↓

SETUP

↓

GENERATING_LAYOUT

↓

MEMORIZATION

↓

TRANSITION

↓

GUESSING

↓

COMPLETED
```

Each state owns:

* available actions
* visible UI
* keyboard behavior
* animations
* sounds

Never allow impossible transitions.

Examples:

GOOD

```
MEMORIZATION

↓

TRANSITION

↓

GUESSING
```

BAD

```
MEMORIZATION

↓

COMPLETED
```

---

# Game State

The game state should contain only business information.

```ts
Game

id

title

duration

phase

startedAt

remainingSeconds

words

statistics

settings
```

Never mix UI state into the game state.

---

# Word Model

Each word should be immutable except for the "found" property.

```ts
Word

id

original

normalized

found

position

fontSize

rotation

color
```

Never regenerate these values after layout generation.

---

# Normalize Once

Normalize every word immediately after import.

Rules:

* trim whitespace
* lowercase
* collapse repeated spaces
* remove invisible characters

Store:

```text
Original

↓

Computer Science

Normalized

↓

computer science
```

Guess validation always compares normalized strings.

Never normalize repeatedly during gameplay.

---

# Game Statistics

Track:

* total words
* found words
* remaining words
* completion percentage
* total guesses
* incorrect guesses
* duplicate guesses
* elapsed time

These statistics should update automatically.

---

# Adaptive Word Cloud Engine

This is the core feature.

Do NOT use a third-party Word Cloud library as the primary layout engine.

Instead, build a custom layout engine.

Libraries may assist rendering, but layout logic belongs to this project.

---

# Layout Pipeline

```
Import Words

↓

Normalize

↓

Assign Font Size

↓

Measure Text

↓

Generate Candidate Position

↓

Collision Detection

↓

Resolve Collision

↓

Viewport Optimization

↓

Save Final Position
```

Run this pipeline exactly once.

---

# Font Distribution

Do not assign random font sizes.

Use weighted distribution.

Recommended:

```
5%

Extra Large

15%

Large

30%

Medium

35%

Small

15%

Tiny
```

Shuffle which words receive each size.

Avoid clustering large words together.

---

# Color Assignment

Assign colors from a predefined palette.

Never place identical colors beside each other if possible.

Color should improve readability.

Never encode game state using color alone.

---

# Rotation Rules

Most words remain horizontal.

Recommended:

```
Horizontal

80%

Vertical

20%
```

Never rotate diagonally.

Never rotate upside down.

---

# Collision Detection

Treat every word as a rectangle.

Before placing:

Check overlap with every existing rectangle.

If collision occurs:

Search another position.

Never allow overlapping words.

---

# Placement Strategy

Preferred algorithm:

Start near center.

↓

Spiral outward.

↓

Test collisions.

↓

Accept first valid position.

This creates a balanced cloud.

Avoid placing words randomly.

---

# Viewport Optimization

After all words are placed:

Calculate bounding rectangle.

If unused margins are excessive:

Scale and translate the layout.

Goal:

Occupy approximately 85% of the available viewport.

---

# Stable Layout

Generate positions once.

Never regenerate after:

* correct answer
* incorrect answer
* resize (unless explicitly supported)

Word positions must remain stable.

Participants build spatial memory.

Moving words destroys this.

---

# Reveal Logic

Words begin hidden.

Correct answer:

```
Hidden

↓

Visible

↓

Fade

↓

Pop

↓

Glow

↓

Idle
```

Other words never move.

---

# Rendering Strategy

Never re-render every word.

Instead:

Each word is its own memoized component.

```tsx
<Word />
```

Wrapped using:

* React.memo

Each word receives only:

* immutable properties
* found state

A correct guess should ideally re-render only:

* revealed word
* progress
* statistics

Not the entire cloud.

---

# React Keys

Never use array indexes.

Always use stable IDs.

Incorrect:

```tsx
key={index}
```

Correct:

```tsx
key={word.id}
```

---

# Memoization

Use:

* React.memo
* useMemo
* useCallback

Only when they provide measurable value.

Do not wrap everything in memoization.

---

# Derived State

Avoid storing values that can be calculated.

Bad:

```ts
remainingWords
completionPercentage
```

if they can be derived from:

```
words[]
```

Prefer selectors or computed values.

---

# Custom Hooks

Business logic belongs inside hooks.

Recommended hooks:

```text
useGame()

useWordCloud()

useCountdown()

useGuessInput()

useProgress()

useKeyboardShortcuts()

useFullscreen()

useSound()

useLocalStorage()
```

Pages should orchestrate hooks, not contain business logic.

---

# Keyboard Workflow

During Guess Mode:

```
Focus input

↓

Type

↓

Enter

↓

Validate

↓

Reveal

↓

Clear

↓

Focus input
```

Mouse interaction should be unnecessary.

---

# Countdown Engine

Use a reliable timer.

Avoid timer drift.

Base calculations on timestamps instead of decrementing counters alone.

The displayed remaining time should always be derived from elapsed time.

---

# Animation Philosophy

Animations reinforce feedback.

Never animate for decoration.

Each animation must answer:

"What information is this animation communicating?"

If none, remove it.

---

# Sound Engine

Use centralized sound management.

Avoid playing sounds directly inside components.

Expose methods:

* playCorrect()
* playWrong()
* playCountdown()
* playVictory()

Respect mute preferences globally.

---

# Local Storage

Persist only business state.

Do not persist transient animation state.

Store:

* game
* settings
* statistics
* word layout
* progress

Do not store:

* open dialogs
* hover state
* animation progress

---

# AI Self Check

Before completing any implementation, verify:

* Is layout deterministic?
* Do words ever overlap?
* Are positions stable?
* Does only one word re-render after a correct answer?
* Can the operator play entirely with the keyboard?
* Does every animation communicate meaning?
* Is every hook responsible for exactly one concern?

If any answer is "No", refactor before continuing.

---


# UI Engineering Principles

Every interface must satisfy three objectives simultaneously:

1. Beautiful
2. Fast
3. Understandable

Never sacrifice usability for visual effects.

Never sacrifice readability for aesthetics.

---

# Design System Rules

Maintain a consistent design language.

## Border Radius

Use only predefined values.

* Small
* Medium
* Large

Do not introduce arbitrary radius values.

---

## Shadows

Shadows communicate hierarchy.

Use:

* Light
* Medium

Avoid heavy floating shadows.

---

## Colors

Never introduce random colors.

Always use semantic colors.

Primary

Secondary

Success

Warning

Danger

Neutral

Every component must use colors consistently.

---

## Typography

Maintain a predictable typography scale.

Avoid random font sizes.

Every heading level should have one consistent style.

Body text should remain readable.

The timer should always be the largest text element during memorization.

---

# Layout Rules

Do not create layouts by trial and error.

Use intentional spacing.

Every screen should have one primary visual focus.

Examples:

Setup

↓

Configuration Card

---

Memorization

↓

Countdown

↓

Word Cloud

---

Guessing

↓

Word Cloud

↓

Guess Input

---

Victory

↓

Celebration

↓

Statistics

↓

Actions

---

# Tailwind Rules

Prefer Tailwind utilities.

Avoid inline styles.

Avoid unnecessary custom CSS.

Extract repeated utility combinations into reusable components.

Do not use arbitrary values unless absolutely necessary.

Bad

```tsx
<div className="mt-[37px]">
```

Good

```tsx
<div className="mt-8">
```

Maintain consistency across the project.

---

# Component Design

Each component should have one responsibility.

Recommended hierarchy:

```text
Page

↓

Section

↓

Feature

↓

Reusable Component

↓

Primitive
```

Avoid deeply nested JSX.

If a component exceeds approximately 200 lines, consider splitting it.

---

# Component Naming

Examples:

GameLayout

WordCloud

Word

Countdown

GuessInput

ProgressBar

VictoryDialog

StatisticsPanel

ConfettiLayer

SoundProvider

Avoid generic names such as:

Component

Item

Data

Helper

Manager

---

# Reusable Components

Prefer reusable primitives.

Examples:

Button

Card

Input

Dialog

Badge

Toast

ProgressBar

These should be configurable via props rather than duplicated.

---

# Hooks Guidelines

One hook = one responsibility.

Examples:

useCountdown()

Only countdown logic.

useGuessInput()

Only guess handling.

useWordCloud()

Only layout generation and rendering state.

Do not create "god hooks" that manage unrelated concerns.

---

# Utility Functions

Utility functions must be pure.

Never mutate inputs.

Return new values.

Functions should be deterministic.

---

# Testing Philosophy

Every important business rule should be testable.

Separate business logic from UI so it can be tested independently.

---

# Unit Testing

Test:

Word normalization

Duplicate removal

Progress calculation

Completion percentage

Timer calculations

Word validation

Layout utilities

Collision detection

Bounding box calculations

Viewport optimization

---

# Component Testing

Verify:

Countdown renders correctly.

Progress updates correctly.

Guess input submits.

Word reveals correctly.

Victory screen appears.

Settings persist.

---

# Integration Testing

Simulate a complete game.

Flow:

Create Game

↓

Generate Layout

↓

Start Memorization

↓

Transition

↓

Guess Correctly

↓

Complete Game

↓

Victory

The entire flow should complete without errors.

---

# Manual QA Checklist

Before every release, verify:

* Keyboard-only gameplay
* Fullscreen mode
* LocalStorage recovery
* Confetti behavior
* Sound playback
* Animation smoothness
* Responsive projector layout
* Browser compatibility

---

# Performance Checklist

Measure before optimizing.

The application should comfortably support:

100 words

without noticeable lag.

Verify:

No unnecessary renders.

Stable component keys.

Minimal object allocations.

Efficient memoization.

Fast layout generation.

Smooth animations.

60 FPS during gameplay.

---

# Accessibility Checklist

Verify:

Keyboard navigation.

Visible focus indicators.

Sufficient color contrast.

Semantic HTML.

Accessible labels.

Logical heading order.

The game should remain usable without a mouse.

---

# AI Implementation Strategy

When implementing features:

Read the entire PRD before writing code.

Understand the gameplay before choosing libraries.

Prefer custom implementations when they improve the product experience.

Never implement features in isolation.

Always consider:

Performance.

Maintainability.

Animation.

Accessibility.

Operator workflow.

Audience experience.

---

# Library Usage

A library is acceptable only if it saves development effort without reducing product quality.

Do not use a library simply because it exists.

Evaluate whether a custom implementation better satisfies the PRD.

The Adaptive Word Cloud layout engine is a core differentiator and should remain custom-built.

---

# Refactoring Policy

Refactor whenever:

A function becomes difficult to read.

Logic is duplicated.

A component has multiple responsibilities.

Business rules leak into UI.

Never postpone obvious improvements.

Leave the codebase cleaner than you found it.

---

# Documentation Expectations

Document:

Complex algorithms.

Architecture decisions.

Public APIs.

Reusable hooks.

Avoid commenting obvious code.

Prefer expressive naming over excessive comments.

---

# Git Guidelines

Commit messages should be descriptive.

Examples:

feat: implement adaptive word cloud layout

feat: add keyboard-first guessing flow

fix: prevent duplicate word reveal

refactor: extract countdown hook

test: add collision detection tests

Avoid generic messages such as:

update

fix

changes

---

# Do

* Follow the PRD.
* Keep components small.
* Use strict TypeScript.
* Keep business logic separate from presentation.
* Prefer composition.
* Test important logic.
* Maintain a polished presentation.

---

# Don't

* Don't use `any`.
* Don't use array indexes as React keys.
* Don't regenerate the word cloud after gameplay starts.
* Don't mutate state directly.
* Don't scatter LocalStorage access throughout the app.
* Don't introduce global state without justification.
* Don't rely on third-party word cloud layout engines.
* Don't create dashboard-style interfaces.
* Don't leave unused code or dead components.

---

# Definition of Done

A task is complete only when:

* The implementation satisfies the PRD.
* The UI is visually polished.
* The feature works using keyboard-first interaction.
* The code passes linting.
* TypeScript reports no errors.
* Relevant tests pass.
* There are no console errors.
* Animations are smooth.
* The implementation is responsive on projector resolutions.
* LocalStorage recovery works as expected.
* The code is readable, modular, and maintainable.

---

# Final AI Review

Before considering the project complete, ask:

* Would this application look impressive on a projector in front of 300 people?
* Can a first-time operator understand it within five minutes?
* Does every animation have a purpose?
* Is the interface exciting without becoming distracting?
* Does the application feel like a premium educational game instead of an admin panel?
* Have I followed both the PRD and the Engineering Handbook?

If any answer is "No", continue improving the implementation before declaring the task complete.

---

# End of CLAUDE.md

This Engineering Handbook is the authoritative implementation guide for Memory Word Game. In case of conflict, follow this priority:

1. PRD.md
2. CLAUDE.md


The objective is not merely to produce working software, but to deliver a polished, memorable, production-quality experience for both the operator and the audience.


