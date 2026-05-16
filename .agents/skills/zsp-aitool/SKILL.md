```markdown
# zsp-aitool Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `zsp-aitool` TypeScript codebase. It covers file organization, code style, commit message standards, and testing approaches. By following these guidelines, contributors can maintain consistency and quality across the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myUtility.ts`, `dataProcessor.test.ts`

### Import Style
- Use **relative imports** for referencing modules within the project.
  - Example:
    ```typescript
    import { processData } from './dataProcessor';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // In dataProcessor.ts
    export function processData(input: string): string {
      // implementation
    }

    // In another file
    import { processData } from './dataProcessor';
    ```

### Commit Messages
- Follow the **Conventional Commits** format.
- Use the `feat` prefix for new features.
- Keep commit messages concise (average ~49 characters).
  - Example:
    ```
    feat: add support for batch processing
    ```

## Workflows

### Feature Development
**Trigger:** When implementing a new feature  
**Command:** `/feature-development`

1. Create a new branch for your feature.
2. Write code using camelCase file names and relative imports.
3. Use named exports for all modules.
4. Write or update corresponding test files (`*.test.ts`).
5. Commit changes using the `feat` prefix and a concise message.
6. Open a pull request for review.

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Identify or create test files matching the `*.test.*` pattern.
2. Run the test suite using the project's test runner (framework unknown; refer to project documentation or scripts).
3. Review test results and address any failures.

## Testing Patterns

- Test files follow the pattern: `*.test.*` (e.g., `dataProcessor.test.ts`).
- The specific testing framework is not detected; check project scripts or documentation for details.
- Place tests alongside the code they verify or in a dedicated `tests` directory if present.

## Commands

| Command              | Purpose                                   |
|----------------------|-------------------------------------------|
| /feature-development | Start a new feature development workflow  |
| /run-tests           | Run the test suite                        |
```
