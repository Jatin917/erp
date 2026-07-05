# Document Templates

## Purpose
PDF document generation system with pluggable templates and system field registry.

## Architecture
- **engine/template-engine.ts** - Facade orchestrating template lifecycle
- **implementations/pdf-template.ts** - Puppeteer-based PDF rendering
- **services/** - template, mapping, validation, system-field-registry
- **abstracts/template.abstract.ts** - Base template contract
- **types/** - Template and system field types

## Dependencies
- Puppeteer, EJS
- Prisma (template storage)
- registry field definitions (related)

## Public interfaces
TemplateEngine class - used by controllers/templates

## Extension points
Add new template implementations under implementations/

## Recent changes
| Date | Change |
|------|--------|
| 2026-07-05 | Co-located README added |
