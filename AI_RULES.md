# AI Development Rules for investorion.com.br

This document provides guidelines for AI assistants to ensure consistency, maintainability, and adherence to the project's architectural standards.

## 1. Technology Stack Overview

The frontend is a modern web application built with the following core technologies:

*   **Framework**: React 18 with TypeScript for type-safe development.
*   **Build Tool**: Vite for fast development and optimized production builds.
*   **Routing**: React Router for all client-side navigation and routing logic.
*   **Styling**: Tailwind CSS for a utility-first styling approach.
*   **UI Components**: A combination of `shadcn/ui` and Radix UI for a consistent and accessible component library.
*   **Data Fetching & Server State**: TanStack Query (React Query) for managing asynchronous operations, caching, and server state.
*   **Global State**: React's Context API for managing global concerns like authentication.
*   **Charts & Visualization**: Recharts for creating responsive charts.
*   **Forms**: React Hook Form for robust and performant form handling.
*   **Icons**: `lucide-react` for a consistent set of icons.

## 2. Library Usage and Coding Conventions

Adhere strictly to the following rules when adding or modifying features.

### UI & Styling
*   **Components**: **ALWAYS** use pre-built `shadcn/ui` components from the `src/components/ui` directory for elements like Buttons, Inputs, Cards, Dialogs, etc. Do not create custom versions of these.
*   **Styling**: **ONLY** use Tailwind CSS utility classes for styling. Do not write custom CSS in `.css` files or use inline `style` attributes.
*   **Class Merging**: Use the `cn` utility function from `src/lib/utils.ts` to conditionally apply or merge Tailwind classes.

### State Management
*   **Server State**: **MUST** use TanStack Query (`useQuery`, `useMutation`) for all interactions with the backend API (fetching, creating, updating, deleting data).
*   **Global Client State**: Use the existing React Contexts (e.g., `AuthContext`) for global, cross-component state. Only create a new context for a clear, new global concern. Do not introduce libraries like Redux or Zustand.
*   **Local Component State**: Use React's built-in `useState` and `useReducer` hooks for state that is local to a single component or a small group of related components.

### Navigation
*   **Routing**: All page routing is managed by `react-router-dom`. Define new page routes within `src/App.tsx`.
*   **Links**: Use the `<Link>` component from `react-router-dom` for internal navigation to ensure client-side routing. Use standard `<a>` tags only for external links.

### Forms
*   **Form Logic**: **ALWAYS** use `react-hook-form` to manage form state, validation, and submissions.
*   **Form Components**: Integrate `react-hook-form` with the `shadcn/ui` `Form` components (`<Form>`, `<FormField>`, etc.) as demonstrated in existing pages like `AccountData.tsx`.

### Specific Libraries
*   **Icons**: Use icons exclusively from the `lucide-react` package.
*   **Charts**: Use the `recharts` library for all data visualizations and charts.
*   **Dates**: Use `date-fns` for any date formatting or manipulation.
*   **Notifications**: Use the custom `useToast` hook from `src/hooks/use-toast.ts` to display user feedback and notifications. Do not use `alert()`.

### General
*   **API Interaction**: All communication with the backend must go through the `apiClient` instance from `src/lib/api.ts`.
*   **File Structure**: Maintain the existing file structure. Place new pages in `src/pages`, reusable components in `src/components`, hooks in `src/hooks`, and utility functions in `src/lib`.