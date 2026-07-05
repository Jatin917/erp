# Engineering Workflow

> Mandatory for every task: features, bug fixes, refactors, architectural changes.

## Quick reference

| Phase | Name | Coding allowed? |
|-------|------|-----------------|
| 0 | Understand the problem | No |
| 1 | Requirement analysis | No |
| 2 | Explore solutions | No |
| 3 | Design document | No |
| 4 | Design critique | No |
| 5 | Implementation planning | No |
| 6 | Documentation before implementation | No |
| 7 | Implementation | Yes |
| 8 | Self code review | Yes (fixes only) |
| 9 | Testing | Yes |
| 10 | Production readiness | Yes (verify) |
| 11 | Knowledge transfer | Yes (docs) |

## Phase 0 - Understand the problem

Deliverables: restated task, assumptions, missing info, questions, success criteria. No coding.

## Phase 1 - Requirement analysis

Functional/non-functional requirements, constraints, dependencies, risks, unknowns, out-of-scope.
GATE: Tech Lead confirms scope.

## Phase 2 - Explore multiple solutions

Compare >=2 approaches: pros, cons, complexity, scalability, security, maintainability, performance, ops impact, extensibility. Recommend one.
GATE: Tech Lead approves approach.

## Phase 3 - Design document

Architecture, components, data flow, DB, APIs, state, errors, logging, security, testing, rollback, migration.
Use docs/templates/feature-design.md. No implementation.
GATE: Tech Lead approves design.

## Phase 4 - Design critique

Challenge assumptions, races, edge cases, failures, performance, security, maintainability, tech debt. Revise if needed.

## Phase 5 - Implementation planning

Milestones: objective, files, complexity, dependencies, risks, deliverables.
Use docs/templates/implementation-plan.md.

## Phase 6 - Documentation before implementation

Decision log, trade-offs, reasoning, assumptions, limitations, future work, dev notes, glossary, change summary.
No production code.

## Phase 7 - Implementation

Clean code per design and repo conventions. Update co-located READMEs.

## Phase 8 - Self code review

Use docs/templates/code-review-checklist.md. Fix before presenting.

## Phase 9 - Testing

Unit/integration tests, manual checklist, edge cases, failures, regression.
Use docs/templates/testing-checklist.md.

## Phase 10 - Production readiness

Logging, metrics, monitoring, config, secrets, rollback, deploy, performance, security, docs.
Use docs/templates/deployment-checklist.md.

## Phase 11 - Knowledge transfer

What/why changed, files, decisions, future work, maintenance. Update CHANGELOG.
Use docs/templates/knowledge-transfer.md.

## Exceptions

| Situation | Phases |
|-----------|--------|
| Typo/comment | 0, 7, 8 |
| Doc only | 0, 6, 11 |
| Hotfix | 0, 3 minimal, 7-11; retro design within 48h |

See DOCUMENTATION_RULES.md, REVIEW_POLICY.md, BEHAVIOR_RULES.md.
