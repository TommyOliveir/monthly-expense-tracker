# Project Coding Standards & Architecture Rules

You are working on a TypeScript project that includes both frontend and backend code.

Your primary responsibility is to write clean, maintainable, scalable, type-safe, and well-structured code.

Follow these rules for every feature, component, service, API, and refactoring task.

## 1. Separation of Concerns

- Always follow the Separation of Concerns (SoC) principle.
- Each file, function, component, service, or module should have one clear responsibility.
- Do not mix business logic, UI rendering, API communication, data transformation, and state management unnecessarily.
- Keep components focused on their primary responsibility.
- Extract reusable logic into hooks, utilities, services, or dedicated modules when appropriate.
- Avoid unnecessary abstractions. Keep the implementation simple and maintainable.

## 2. TypeScript Rules

- Never use `any` in TypeScript.
- Always prefer explicit and meaningful types.
- Use `unknown` when the type is genuinely unknown, and narrow it safely before using it.
- Avoid unnecessary type assertions and unsafe casts.
- Prefer `type` or `interface` according to the project's existing conventions.
- Define all types, interfaces, and enums outside React components and functions.
- Never declare types or interfaces inside a component body.
- Do not duplicate type definitions.
- Reuse existing types whenever possible.

### Type Organization

- Feature-specific types must be located alongside their respective feature.
- Shared types that are genuinely used by multiple features should be placed in the appropriate shared or common directory.
- Do not put every type into a global `common/types` directory.
- Do not create global types for types that are only used by one feature.
- Keep API request types, response types, domain models, and UI-specific types appropriately separated when necessary.
- Avoid creating unnecessary type files for trivial cases. Follow the existing project structure.

## 3. Smart and Dumb Component Pattern

Always prefer the Smart and Dumb Component pattern when it improves separation of concerns.

### Smart Components (Container Components)

Smart components are responsible for:

- Managing state and component-level orchestration.
- Handling user interactions.
- Connecting to hooks, services, and APIs.
- Managing data fetching and mutations.
- Passing data and callbacks to presentation components.

### Dumb Components (Presentational Components)

Dumb components are responsible for:

- Rendering UI based on props.
- Displaying data.
- Emitting user interactions through callbacks.
- Remaining reusable and predictable.
- Avoiding direct API calls and unnecessary business logic.

Dumb components should not know how data is fetched or where it comes from.

Prefer explicit, strongly typed props.

Do not force every component into this pattern. For small, simple components, keep the implementation straightforward.

## 4. Feature-by-Feature Development

Always work feature by feature.

When implementing a new feature:

1. Understand the existing architecture and conventions.
2. Identify the feature's responsibilities.
3. Identify the necessary components, types, hooks, services, API handlers, and utilities.
4. Keep feature-specific code together.
5. Reuse existing shared functionality when appropriate.
6. Implement the feature in small, logical steps.
7. Verify that the implementation is consistent with the existing codebase.
8. Test the feature and its important edge cases.

Do not implement unrelated features or refactor unrelated modules unless explicitly requested.

Avoid modifying files outside the scope of the requested feature unless necessary.

## 5. Frontend Rules

- Keep UI components focused on rendering and user interaction.
- Separate business logic from presentation logic.
- Keep API communication outside presentation components.
- Use dedicated hooks for reusable stateful logic.
- Use services or API modules for communication with the backend.
- Keep component props explicitly typed.
- Avoid deeply nested components and unnecessary prop drilling.
- Follow the existing state management solution.
- Do not introduce new libraries or architectural patterns without a good reason.

## 6. Backend Rules

- Separate controllers, routes, services, repositories, and domain logic according to the existing architecture.
- Controllers should handle HTTP concerns and delegate business logic.
- Services should contain business logic.
- Repositories or data-access modules should handle database operations when the project uses that pattern.
- Keep request validation separate from business logic.
- Define explicit types for API inputs, outputs, and domain models.
- Avoid coupling business logic directly to framework-specific code.
- Do not expose internal database models directly through API responses unless the existing architecture explicitly supports this.

## 7. Function Style

Follow the Next.js / React convention:

- Use `function` declarations for top-level React components (including Next.js pages and layouts), custom hooks, and module-level utility, service, and API functions.
- Use arrow functions for callbacks, event handlers, inline functions, and functions passed as arguments or props (e.g. `onClick`, `.map()`, `mutationFn`, `useCallback`, `useEffect`).
- Next.js route files (`page.tsx`, `layout.tsx`, etc.) use `export default function Name()`.
- Type component props with a named `type`/`interface` declared outside the component. Do not use `React.FC`.
- Do not change the style of third-party or generated code (e.g. shadcn components in `src/components/ui/`).
- NestJS controllers, services, guards, and strategies remain classes.

Example:

```tsx
type UserCardProps = {
  name: string;
  onSelect: (name: string) => void;
};

export function UserCard({ name, onSelect }: UserCardProps) {
  const handleClick = () => onSelect(name);

  return <button onClick={handleClick}>{name}</button>;
}
```

## 8. Naming Conventions

- Use meaningful and descriptive names.
- Use PascalCase for components, types, and interfaces.
- Use camelCase for variables, functions, hooks, and methods.
- Use descriptive names instead of abbreviations.
- Use the `use` prefix for React hooks.
- Avoid generic names such as `data`, `item`, `handler`, or `value` when a more meaningful name is available.

## 9. Reusability and Shared Code

- Prefer reusing existing components, hooks, utilities, services, and types.
- Extract shared code only when there is a genuine reuse requirement or clear architectural benefit.
- Avoid premature abstraction.
- Do not create a common utility for logic that is only used once without a strong reason.
- Keep feature-specific implementations within their feature.
- Shared code should be generic, reusable, and independent of individual features whenever possible.

## 10. Code Quality

- Write code that is easy to read and maintain.
- Avoid unnecessary complexity.
- Avoid deeply nested conditionals.
- Prefer early returns when they improve readability.
- Avoid duplicated logic.
- Avoid unnecessary comments that simply explain obvious code.
- Add comments when they explain why something is done.
- Handle errors explicitly.
- Avoid silently swallowing errors.
- Follow the project's existing linting, formatting, and testing conventions.

## 11. Before Making Changes

Before implementing a feature:

- Inspect the existing project structure.
- Understand how similar features are implemented.
- Identify existing conventions and reusable code.
- Do not assume the project needs a new architecture.
- Do not introduce unnecessary dependencies.
- Do not rewrite existing code without a clear reason.

## 12. Expected Behavior

Always prioritize:

1. Type safety.
2. Separation of concerns.
3. Maintainability.
4. Reusability.
5. Simplicity.
6. Consistency with the existing architecture.

When implementing a feature, provide a short explanation of the approach and the files that will be affected.

Implement only what is necessary.

If a requested implementation conflicts with these rules or the existing architecture, explain the conflict and choose the most maintainable solution.

These rules apply to both frontend and backend code unless a specific rule is clearly framework-dependent.
