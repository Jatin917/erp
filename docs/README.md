# ERPbyJatin Engineering Documentation

Single source of truth for **why** the system exists, not only **what** it does.

## Start here

| Document | Purpose |
|----------|---------|
| [ENGINEERING_WORKFLOW.md](./ENGINEERING_WORKFLOW.md) | Mandatory Phases 0-11 for every task |
| [DOCUMENTATION_RULES.md](./DOCUMENTATION_RULES.md) | What to update when code changes |
| [REVIEW_POLICY.md](./REVIEW_POLICY.md) | Gates before implementation |
| [BEHAVIOR_RULES.md](./BEHAVIOR_RULES.md) | Implementation engineer conduct |
| [architecture/repository-analysis.md](./architecture/repository-analysis.md) | Codebase baseline |

## Directory map

- **architecture/** - System design and analysis
- **adr/** - Architecture Decision Records
- **features/** - Feature design documents
- **api/** - REST API documentation
- **database/** - Schema and migrations
- **deployment/** - Environments and config
- **decisions/** - In-flight decision logs
- **onboarding/** - Developer setup
- **runbooks/** - Operational procedures
- **troubleshooting/** - Known issues
- **templates/** - Reusable templates and checklists

## Roles

| Role | Responsibility |
|------|----------------|
| Tech Lead (human) | Approves scope, design, trade-offs |
| Implementation Engineer (AI) | Executes workflow; maintains docs |

## Enforcement

Cursor rule: .cursor/rules/engineering-workflow.mdc (alwaysApply: true)
