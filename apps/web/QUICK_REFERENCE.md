# Plane Web - Quick Reference Guide for Agents

## 🚀 Quick Start

```bash
# Installation
npm install

# Development
npm run dev          # Start on http://localhost:3000

# Build
npm run build        # Create optimized bundle
npm start            # Serve built app

# Quality Checks
npm run check:types  # TypeScript type checking
npm run check:lint   # Linting
npm run check:format # Format checking
```

## 📁 Project Structure at a Glance

```
web/
├── app/             ← React Router routes (file-based)
├── core/            ← Components, hooks, stores, services
├── ce/              ← Community Edition extensions
├── helpers/         ← Utility functions
├── styles/          ← Global CSS
├── public/          ← Static assets & PWA
└── tsconfig.json    ← TypeScript config with path aliases
```

## 🔑 Key Technologies

| Purpose       | Technology      |
| ------------- | --------------- |
| Routing       | React Router v7 |
| Build         | Vite            |
| State         | MobX            |
| Styling       | Tailwind CSS    |
| Forms         | React Hook Form |
| Data Fetching | SWR + Axios     |
| Types         | TypeScript      |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           React Components              │ (1,099 total)
├─────────────────────────────────────────┤
│       Custom Hooks (100+)               │ (access store/data)
├─────────────────────────────────────────┤
│    MobX Store (RootStore + 32 domains) │ (state management)
├─────────────────────────────────────────┤
│    API Services (31 classes)            │ (Axios + APIService)
├─────────────────────────────────────────┤
│         Backend API                     │ (REST endpoints)
└─────────────────────────────────────────┘
```

## 📂 Finding Things

### Finding a Component

```bash
# By feature
core/components/issues/                # Issue components
core/components/cycles/                # Cycle components
core/components/workspace/             # Workspace components

# By name
find core/components -name "*modal*"   # Find modals
```

### Finding a Hook

```bash
core/hooks/use-issue.ts                # Issue store hook
core/hooks/store/                      # Store hooks directory
```

### Finding a Store

```bash
core/store/issue/                      # Issue state
core/store/workspace/                  # Workspace state
core/store/root.store.ts               # Root store (main container)
```

### Finding a Service

```bash
core/services/issue/issue.service.ts   # Issue API service
core/services/api.service.ts           # Base API class
```

## 🔗 Path Aliases

```typescript
@/*              // → core/*
@/app/*          // → app/*
@/helpers/*      // → helpers/*
@/styles/*       // → styles/*
@/plane-web/*    // → ce/*
```

**Always use aliases, never relative imports!**

## 🎯 Common Tasks

### Add a New Page

1. Create folder in `app/(all)/[workspaceSlug]/(projects)/...`
2. Add `layout.tsx` and `page.tsx`
3. Add route to `app/routes/core.ts`
4. Import components from `core/components/`

### Add a New Component

1. Create file in `core/components/{feature}/`
2. Use `observer()` wrapper if accessing store
3. Export as named export
4. Import with `@/components/{feature}/`

### Fetch Data

```typescript
import useSWR from "swr";
import { IssueService } from "@/services/issue/issue.service";

const issueService = new IssueService();
const { data, isLoading, error } = useSWR(
  `workspace-${workspaceSlug}-issues`,
  () => issueService.getIssues(workspaceSlug, projectId),
  { revalidateOnFocus: false }
);
```

### Access Store

```typescript
import { observer } from 'mobx-react';
import { useIssue } from '@/hooks/store/use-issue';

const MyComponent = observer(() => {
  const { issues, updateIssue } = useIssue();
  // Component auto-updates when store changes
  return <div>{issues.length} issues</div>;
});
```

### Update Store

```typescript
const { setIssue } = useIssue();
await setIssue(issueId, { title: "New Title" });
```

### Call API

```typescript
const response = await issueService.updateIssue(workspaceSlug, projectId, issueId, { status: "DONE" });
```

## 🛠️ Command Palette

The app includes a "Power K" command palette:

- **Shortcut**: Cmd/Ctrl+K
- **Location**: `core/components/power-k/`
- **Store**: `core/store/base-command-palette.store.ts`

## 🎨 Styling

**Framework**: Tailwind CSS v4.1.17

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg">
  <span className="text-lg font-semibold text-gray-900">Title</span>
</div>
```

**Theme colors** from next-themes:

```typescript
const { resolvedTheme } = useTheme();
// Returns: 'light', 'dark', 'light-contrast', 'dark-contrast', 'custom'
```

## 📝 Form Handling

Using React Hook Form:

```typescript
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>Required</span>}
    </form>
  );
};
```

## 🔐 Authentication

**Protected Routes**:

```typescript
<AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
  <YourComponent />
</AuthenticationWrapper>
```

**Page Types**:

- `AUTHENTICATED` - Requires login and onboarding
- `NON_AUTHENTICATED` - For login/signup pages
- `ONBOARDING` - Onboarding flow
- `PUBLIC` - No auth required
- `SET_PASSWORD` - Password setup flow

## 🌐 Environment Variables

```env
VITE_API_BASE_URL="http://localhost:8000"
VITE_WEB_BASE_URL="http://localhost:3000"
```

Only `VITE_*` prefixed variables are exposed to frontend.

## 📦 Workspace Packages

Used from monorepo:

- `@plane/types` - Shared TypeScript types
- `@plane/utils` - Utility functions
- `@plane/ui` - UI components
- `@plane/hooks` - Shared hooks
- `@plane/services` - API services
- `@plane/i18n` - Internationalization
- `@plane/constants` - Shared constants

## 🐛 Debugging

### Check Store

```typescript
// In browser console after importing RootStore
import { store } from "@/lib/store-context";
console.log(store);
```

### Debug Component Re-renders

```typescript
import { observer } from 'mobx-react';

const MyComponent = observer(() => {
  console.log('Component re-rendered');
  return <div>...</div>;
});
```

### Inspect SWR Cache

```typescript
// In browser console
import { cache } from "swr";
console.log(cache.keys());
```

## 📊 Route Structure Pattern

```
/:workspaceSlug/projects/:projectId/issues/:issueId
        ↓
app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/issues/(detail)/[issueId]/page.tsx
```

**Key patterns**:

- `(name)` = Route group (no URL segment)
- `[name]` = Dynamic segment (URL parameter)
- `layout.tsx` = Shared layout for children
- `page.tsx` = Route content

## 🚨 Common Errors

**"Cannot find module '@/components/..'"**

- Check path is correct
- Run `npm run check:types` to regenerate types

**"Store hook is undefined"**

- Ensure component is wrapped with `observer()`
- Verify hook is imported correctly

**"API call returns 401"**

- User session expired
- App redirects to login automatically
- Check `VITE_API_BASE_URL` is correct

## 💡 Best Practices

✅ **Do:**

- Use `observer()` wrapper for store-accessing components
- Use path aliases for imports
- Keep components focused and small
- Use TypeScript strict mode
- Document complex logic

❌ **Don't:**

- Use relative imports (`../../components/...`)
- Access store without `observer()` wrapper
- Mix SWR and store for same data
- Store sensitive data in localStorage
- Create components without types

## 🔄 Development Workflow

1. **Create page route** in `app/`
2. **Create components** in `core/components/`
3. **Add store** if needed in `core/store/`
4. **Add service** if API call needed in `core/services/`
5. **Create hook** to access store in `core/hooks/`
6. **Import and use** in component with `observer()`

## 📚 Additional Resources

- **TypeScript Config**: See `tsconfig.json` for path aliases
- **Vite Config**: See `vite.config.ts` for build settings
- **Route Config**: See `app/routes/core.ts` for all routes
- **Full Guide**: See `AGENTS.md` for comprehensive documentation

---

**Last Updated**: Analysis of Plane Web v1.3.1
