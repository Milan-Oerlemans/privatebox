# Creating a New Page in Frontend

This document explains how to add a new page at `/app/apps` (the `/apps` route within the main application), how routing and sidebar navigation are managed, and the recommended implementation steps.

## 1. Architecture Overview

### Routing

The application uses the **Next.js App Router** (`src/app` directory).

- Routes are defined by folder structure.
- `/app/apps` maps to `src/app/app/apps/page.tsx`.
- The root layout (`src/app/app/layout.tsx`) handles the persistent **Sidebar** and **Projects Context**.

### Sidebar Management

The Sidebar is NOT part of the individual page; it is rendered in the parent layout (`src/app/app/layout.tsx`).

- **File**: `src/sections/sidebar/AppSidebar.tsx`
- **Logic**: It uses the `useAppFocus` hook to determine which tab is currently active/highlighted.
- **Navigation**: Links in the sidebar use standard Next.js `<Link>` (wrapped in `SidebarTab`) to navigate to routes like `/app/agents`.

### Layout Layers

1. **`src/app/app/layout.tsx`**: Top-level layout. Adds the `AppSidebar` and `ProjectsProvider`.
2. **`AppLayouts.Root`**: Used in `page.tsx`. Provides the main content container, background effects, header, and footer.
3. **`SettingsLayouts.Root`** (Optional): Used inside the page component (e.g., `AgentsNavigationPage`). Provides the standard "Settings/Dashboard" visual structure (Header with title/description, Body with cards/lists).

---

## 2. Implementation Guide: Adding `/app/apps`

To create a new "Apps" page similar to the "Agents" page, follow these steps:

### Step 1: Create the Page Content Component

Create a new component in `src/refresh-pages/` (e.g., `AppsPage.tsx`) to contain the UI logic. This keeps the route file clean.

```tsx
// src/refresh-pages/AppsPage.tsx
"use client";

import * as SettingsLayouts from "@/layouts/settings-layouts";
import { SvgOnyxOctagon } from "@opal/icons";

export default function AppsPage() {
  return (
    <SettingsLayouts.Root>
      <SettingsLayouts.Header
        icon={SvgOnyxOctagon}
        title="Apps"
        description="Manage and explore your applications."
      />
      <SettingsLayouts.Body>
        {/* Your content here */}
        <div>Apps content goes here</div>
      </SettingsLayouts.Body>
    </SettingsLayouts.Root>
  );
}
```

### Step 2: Create the Route

Create the `page.tsx` file in the App Router structure.

```tsx
// src/app/app/apps/page.tsx
import AppsPage from "@/refresh-pages/AppsPage";
import * as AppLayouts from "@/layouts/app-layouts";

export default async function Page() {
  return (
    <AppLayouts.Root>
      <AppsPage />
    </AppLayouts.Root>
  );
}
```

### Step 3: Update Sidebar Logic (`useAppFocus`)

The sidebar needs to know when to highlight the "Apps" tab. Update the `AppFocus` class and hook.

**File**: `src/hooks/useAppFocus.ts`

1.  Add `"apps"` to the `AppFocusType` type definition.
2.  Update `AppFocus` class methods (add `isApps()`).
3.  Update the `useAppFocus` hook to detect the path.

```typescript
// Add logic to check path
if (pathname.startsWith("/app/apps")) {
  return new AppFocus("apps");
}
```

### Step 4: Add Sidebar Button

Add the button to the actual sidebar component.

**File**: `src/sections/sidebar/AppSidebar.tsx`

1.  Find where `appsButton` or `moreAgentsButton` is defined.
2.  Add a new `SidebarTab` for Apps.

```tsx
<SidebarTab
  leftIcon={SvgSomeIcon}
  href="/app/apps"
  folded={folded}
  transient={activeSidebarTab.isApps()} // Uses the method added in Step 3
>
  Apps
</SidebarTab>
```

---

## 3. Comparison: Agents List vs. Agent Creation

To understand the complexity differences, compare `app/agents/page.tsx` and `app/agents/create/page.tsx`:

### `app/agents` (List Page)

- **Component**: `AgentsNavigationPage`
- **Layout**: `SettingsLayouts.Root` -> `Header` (with filters/search) -> `Body` (Grid of `AgentCard`s).
- **Data**: Uses `useAgents()` hook to fetch the list.
- **State**: Handles client-side filtering (search text, tabs for "All" vs "Your").
- **Complexity**: Low to Medium. Mainly concerns displaying lists and filtering.

### `app/agents/create` (Editor Page)

- **Component**: `AgentEditorPage`
- **Layout**: `SettingsLayouts.Root` wrapped in a `Formik` form provider.
- **Data**: Fetches `existingAgent` (if editing), `llmProviders`, `availableTools`, etc.
- **State**: Heavy form state management (Formik), validation (Yup), and complex UI interactions (file uploads, toggling tools, knowledge base selection).
- **Complexity**: High. Involves deep integration with backend APIs for CRUD operations and handling various distinct logical sections (Knowledge, Prompts, Tools).

## 4. Key Considerations for New Pages

1.  **Data Fetching**: Prefer **SWR** (`useSWR` or custom hooks like `useAgents`) for client-side data fetching. The root `page.tsx` is a Server Component but usually just renders a Client Component shell.
2.  **Styling**: Use existing layout components (`SettingsLayouts`, `GeneralLayouts`) and `refresh-components` (e.g., `Text`, `Button`, `InputTypeIn`) to maintain design consistency. Avoid raw HTML/Tailwind where a component exists.
3.  **Icons**: Use icons from `@opal/icons` or `src/icons`. Do not import from external libraries like `lucide-react` directly if an internal version exists.

---

## 5. Developing on the Apps Page

This section explains how to implement functionality on the new `/app/apps` page.

### 1. Where to Write Code

The primary file for UI development is:

- **`src/refresh-pages/AppsPage.tsx`**

This is a **Client Component** (marked with `"use client"`), which allows you to use React hooks (`useState`, `useEffect`) and handle user interactions.

### 2. Layout Structure

The page uses `SettingsLayouts` to provide a consistent "Dashboard" look.

```tsx
<SettingsLayouts.Root>
  {/* The Header contains the title, description, and action buttons */}
  <SettingsLayouts.Header
    title="Apps"
    description="..."
    icon={SvgIcon}
    rightChildren={
      <Button>Create App</Button> // Optional action button
    }
  />

  {/* The Body contains the main content */}
  <SettingsLayouts.Body>{/* Your content goes here */}</SettingsLayouts.Body>
</SettingsLayouts.Root>
```

### 3. Adding Content

Use standard `refresh-components` to maintain the design system.

- **Text:** `import Text from "@/refresh-components/texts/Text"`
- **Buttons:** `import Button from "@/refresh-components/buttons/Button"`
- **Inputs:** `import InputTypeIn from "@/refresh-components/inputs/InputTypeIn"`
- **Cards:** `import { Card } from "@/refresh-components/cards"`

**Example: Displaying a List of Apps**

```tsx
import { Card } from "@/refresh-components/cards";
import Text from "@/refresh-components/texts/Text";

// ... inside SettingsLayouts.Body
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {apps.map((app) => (
    <Card key={app.id}>
      <Text headingH3>{app.name}</Text>
      <Text text03>{app.description}</Text>
    </Card>
  ))}
</div>;
```

### 4. Fetching Data

Use `useSWR` for client-side data fetching.

```tsx
import useSWR from "swr";
import { errorHandlingFetcher } from "@/lib/fetcher";

function AppsPage() {
  const { data, isLoading, error } = useSWR("/api/apps", errorHandlingFetcher);

  if (isLoading) return <div>Loading...</div>;

  // ... render data
}
```
