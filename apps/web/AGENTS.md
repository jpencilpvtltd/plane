# Plane Web Application - Comprehensive Project Guide

## 1. Project Overview

**Plane Web** is an open-source project management frontend application built with **React Router v7** (SSR-disabled client-side SPA). It provides a comprehensive web interface for project collaboration, issue tracking, cycle management, and workspace administration.

**Key Purpose:** Modern, extensible web application for managing work items, cycles, modules, pages, and product roadmaps with real-time collaboration features.

**License:** AGPL-3.0-only  
**Current Version:** 1.3.1  
**Type:** Client-side React SPA (no server-side rendering)

---

## 2. Directory Structure

### Top-Level Organization

```
/Users/murali/development/docker/plane/apps/web/
├── app/                      # React Router application directory (file-based routing)
├── core/                     # Core business logic, components, and state management
├── ce/                       # Community Edition extensions (namespace: @/plane-web/*)
├── helpers/                  # Utility helper functions
├── styles/                   # Global styles and CSS
├── public/                   # Static assets (favicon, manifest, service worker)
├── node_modules/            # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── react-router.config.ts   # React Router configuration
├── package.json             # Project dependencies and scripts
├── Dockerfile.dev           # Development Docker setup
├── Dockerfile.web           # Production Docker setup
└── .env / .env.example      # Environment variables
```

### Core Directory Structure (Business Logic)

```
core/
├── components/              # 1,099 React components (~26,495 LOC)
│   ├── common/              # Shared components (logo-spinner, empty-state, breadcrumb-link, etc.)
│   ├── ui/                  # UI primitives and base components
│   ├── issues/              # Issue-related components (detail, layouts, modals, widgets)
│   │   ├── issue-layouts/   # Different layout views for issues
│   │   ├── issue-detail/    # Single issue detail page components
│   │   ├── issue-modal/     # Issue creation/editing modals
│   │   └── peek-overview/   # Quick issue preview panel
│   ├── cycles/              # Cycle management components
│   ├── modules/             # Module/milestone components
│   ├── pages/               # Page management components
│   ├── project/             # Project management components
│   ├── workspace/           # Workspace-level components
│   ├── sidebar/             # Navigation sidebar
│   ├── base-layouts/        # Layout wrappers
│   ├── settings/            # Settings pages (workspace, project, user)
│   ├── analytics/           # Analytics and reporting
│   ├── gantt-chart/         # Gantt chart visualization
│   ├── views/               # Custom views management
│   ├── navigation/          # Navigation controls
│   ├── power-k/             # Command palette functionality
│   ├── auth-screens/        # Authentication UI
│   ├── dropdowns/           # Dropdown components
│   ├── icons/               # Icon components
│   └── [25+ other categories]
│
├── hooks/                   # 100+ custom React hooks
│   ├── store/               # Store-related hooks (use-workspace, use-cycle, use-issue, etc.)
│   ├── use-auto-save.tsx    # Auto-save functionality
│   ├── use-debounce.tsx     # Debouncing utility
│   ├── use-intersection-observer.ts
│   ├── use-keypress.tsx     # Keyboard input handling
│   ├── use-dropdown.ts      # Dropdown state management
│   ├── use-group-dragndrop.ts # Drag-and-drop
│   ├── use-collaboration-*  # Collaborative features
│   └── [~35+ others]
│
├── store/                   # MobX state management (~32 store files)
│   ├── root.store.ts        # Main store container
│   ├── issue/               # Issue state (issue.store, issue_kanban_view, issue_calendar_view, issue_gantt_view)
│   ├── workspace/           # Workspace-related stores
│   ├── project/             # Project state management
│   ├── member/              # Member/user management stores
│   ├── cycle.store.ts       # Cycle management
│   ├── cycle_filter.store.ts # Cycle filtering
│   ├── module.store.ts      # Module management
│   ├── module_filter.store.ts
│   ├── pages/               # Page management stores
│   ├── inbox/               # Inbox/notification stores
│   ├── label.store.ts       # Label management
│   ├── favorite.store.ts    # Favorites tracking
│   ├── dashboard.store.ts   # Dashboard state
│   ├── user/                # User/authentication stores
│   ├── notifications/       # Notification stores
│   ├── estimates/           # Estimation stores
│   ├── editor/              # Editor state
│   ├── sticky/              # Sticky notes
│   ├── timeline/            # Timeline view state
│   ├── theme.store.ts       # Theme management
│   ├── global-view.store.ts # Global/workspace-level views
│   ├── router.store.ts      # Router state tracking
│   └── [additional stores]
│
├── services/                # API service classes (~31 services)
│   ├── api.service.ts       # Base axios API wrapper (supports GET, POST, PUT, PATCH, DELETE)
│   ├── auth.service.ts      # Authentication endpoints
│   ├── workspace.service.ts # Workspace API
│   ├── project/             # Project-related services
│   │   ├── project.service.ts
│   │   ├── project-member.service.ts
│   │   └── [project-specific services]
│   ├── issue/               # Issue-related services
│   │   ├── issue.service.ts
│   │   ├── issue-activity.service.ts
│   │   ├── issue-archive.service.ts
│   │   ├── issue-relation.service.ts
│   │   └── [issue-specific services]
│   ├── cycle.service.ts     # Cycle management
│   ├── module.service.ts    # Module management
│   ├── page/                # Page services
│   ├── user.service.ts      # User profile/settings
│   ├── file.service.ts      # File upload/management
│   ├── webhook.service.ts   # Webhook management
│   ├── analytics.service.ts # Analytics data
│   └── [additional services]
│
├── lib/                     # Utilities and context providers
│   ├── store-context.tsx    # MobX StoreContext provider
│   ├── idle-task.ts         # Idle task scheduling
│   ├── local-storage.ts     # Local storage utilities
│   ├── app-rail/            # App rail/navigation
│   ├── b-progress/          # Progress bar component
│   ├── wrappers/
│   │   ├── store-wrapper.tsx      # Store initialization & theme setup
│   │   ├── authentication-wrapper.tsx # Auth state & routing guards
│   │   └── instance-wrapper.tsx   # Instance configuration
│   └── polyfills/           # Browser compatibility shims
│
├── layouts/                 # Layout wrappers
│   ├── default-layout/      # Main app layout
│   └── auth-layout/         # Authentication pages layout
│
├── types/                   # TypeScript type definitions
│   └── navigation-preferences.ts
│
└── constants/               # Application constants
    ├── fetch-keys.ts        # SWR fetch key definitions
    ├── editor.ts            # Editor configuration
    ├── calendar.ts          # Calendar constants
    ├── gantt-chart.ts       # Gantt chart settings
    ├── ai.ts                # AI feature config
    ├── sidebar-favorites.ts
    └── [additional constants]
```

### App Directory Structure (React Router)

```
app/                        # React Router file-based routing (no SSR)
├── (home)/                 # Home/signin route group
│   ├── layout.tsx
│   └── page.tsx
│
├── (all)/                  # All authenticated/app routes
│   ├── layout.tsx          # Main app layout wrapper
│   │
│   ├── [workspaceSlug]/    # Workspace-scoped routes
│   │   ├── layout.tsx
│   │   ├── (projects)/     # Projects section
│   │   │   ├── page.tsx         # Workspace home/dashboard
│   │   │   ├── active-cycles/
│   │   │   ├── analytics/[tabId]/
│   │   │   ├── browse/[workItem]/
│   │   │   ├── drafts/
│   │   │   ├── notifications/
│   │   │   ├── profile/[userId]/
│   │   │   ├── stickies/
│   │   │   ├── workspace-views/  # Global views
│   │   │   ├── projects/
│   │   │   │   ├── (list)/       # Project list
│   │   │   │   └── (detail)/[projectId]/
│   │   │   │       ├── issues/
│   │   │   │       ├── cycles/
│   │   │   │       ├── modules/
│   │   │   │       ├── views/
│   │   │   │       ├── pages/
│   │   │   │       ├── intake/
│   │   │   │       ├── clockwork/
│   │   │   │       └── archives/
│   │   │   └── projects/(detail)/[projectId]/archives/
│   │   │
│   │   └── (settings)/     # Settings section
│   │       ├── settings/(workspace)/  # Workspace settings
│   │       │   ├── members/
│   │       │   ├── billing/
│   │       │   ├── exports/
│   │       │   └── webhooks/
│   │       │
│   │       └── settings/projects/    # Project settings
│   │           └── [projectId]/
│   │               ├── members/
│   │               ├── features/
│   │               ├── states/
│   │               ├── labels/
│   │               ├── estimates/
│   │               └── automations/
│   │
│   ├── sign-up/
│   ├── accounts/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── set-password/
│   ├── create-workspace/
│   ├── onboarding/
│   ├── invitations/
│   ├── workspace-invitations/
│   └── settings/profile/[profileTabId]/
│
├── routes/                 # Route configuration files
│   ├── core.ts            # Main route configuration
│   ├── extended.ts        # Extended/custom routes (empty by default)
│   ├── helper.ts          # Route merging utilities
│   └── redirects/         # Legacy URL redirects
│       ├── core/          # Project settings, analytics, API tokens, etc.
│       └── extended/
│
├── assets/                # Static assets (images, icons, logos)
│   ├── favicon/
│   ├── icons/
│   ├── logos/
│   ├── cover-images/
│   ├── emoji/
│   ├── attachment/
│   ├── auth/
│   ├── workspace/
│   ├── empty-state/
│   ├── images/
│   └── [other asset categories]
│
├── compat/                # Compatibility shims
│   └── next/              # Next.js API compatibility layer
│       ├── link.tsx       # next/link compatibility
│       ├── navigation.ts  # next/navigation compatibility
│       └── script.tsx     # next/script compatibility
│
├── types/                 # Route type definitions
│   └── [route type files]
│
├── root.tsx              # Root component (layout + outlet)
├── layout.tsx            # Legacy layout (compatibility)
├── entry.client.tsx      # React Router entry point
├── provider.tsx          # App provider (SWR, theme, i18n, store)
├── not-found.tsx         # 404 error page
└── error/                # Error boundary pages
```

### CE Directory Structure (Community Edition Extensions)

```
ce/                        # Community Edition namespace (@/plane-web/*)
├── components/             # CE-specific components
├── hooks/                  # CE-specific hooks
├── store/                  # CE store extensions
└── types/                  # CE type definitions
```

### Helpers Directory

```
helpers/
├── graph.helper.ts                      # Graph data utilities
├── emoji.helper.tsx                     # Emoji handling
├── issue-filter.helper.ts               # Issue filtering logic
├── dashboard.helper.ts                  # Dashboard utilities
├── authentication.helper.tsx            # Auth page type helpers
├── cover-image.helper.ts                # Cover image utilities
├── views.helper.ts                      # View utilities
└── react-hook-form.helper.ts           # Form utilities
```

### Styles Directory

```
styles/
├── globals.css              # Global styles
└── [component-specific CSS if needed]
```

### Public Directory

```
public/
├── favicon/                 # Favicon files (16x16, 32x32, ico)
├── icons/                   # App icons (180x180, 512x512)
├── plane-logos/             # Plane branding
├── manifest.json            # PWA manifest
├── site.webmanifest.json    # Web app manifest
├── sw.js                    # Service worker
├── workbox-*.js             # Workbox library for PWA
└── [PWA assets]
```

---

## 3. Tech Stack

### Core Framework & Build Tools

- **React Router v7** (latest) - Client-side routing, file-based routing system
- **Vite 5+** - Build tool and dev server
- **TypeScript 5+** - Type safety
- **React 18+** - UI library
- **React DOM 18+** - React rendering

### State Management

- **MobX** - Observable state management (@latest from catalog)
- **MobX React** - React bindings for MobX
- **MobX Utils** - MobX utilities

### Data Fetching & Caching

- **SWR** - Stale-while-revalidate data fetching with Axios (from catalog)
- **Axios** - HTTP client (from catalog)

### Styling & UI

- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Next-themes 0.4.6** - Theme management (light/dark/custom)
- **@headlessui/react 1.7.19** - Unstyled UI components
- **Lucide React** - Icon library (from catalog)
- **Clsx 2.0.0** - Classname utility
- **React Popper 2.3.0** - Positioning utility

### Forms & Validation

- **React Hook Form 7.51.5** - Form state management
- **React Fast Compare 3.2.2** - Deep equality checking

### Drag & Drop

- **@atlaskit/pragmatic-drag-and-drop** - Accessible drag-and-drop (from catalog)
- **@atlaskit/pragmatic-drag-and-drop-auto-scroll** - Auto-scroll support
- **@atlaskit/pragmatic-drag-and-drop-hitbox** - Hitbox detection

### Editor & Rich Text

- **@plane/editor** - Plane's custom rich text editor
- **React Markdown 8.0.7** - Markdown rendering
- **React PDF HTML 2.1.2** - PDF generation
- **@react-pdf/renderer 3.4.5** - PDF creation

### Data Visualization

- **Recharts 2.12.7** - Charts and graphs
- **@tanstack/react-table 8.21.3** - Table/grid component

### Utilities

- **Date-fns 4.1.0** - Date manipulation
- **Lodash-es** - Functional utilities (from catalog)
- **UUID** - ID generation (from catalog)
- **Emoji-picker-react 4.5.16** - Emoji selector
- **React Color 2.19.3** - Color picker
- **React Dropzone 14.2.3** - File upload
- **Export-to-CSV 1.4.0** - CSV export
- **Smooth-scroll-into-view-if-needed 2.0.2** - Scroll behavior
- **Comlink 4.4.1** - Web Worker communication

### Internationalization

- **@plane/i18n** - Plane's i18n solution (workspace:\*)

### Plane Workspace Packages

- **@plane/constants** - Shared constants
- **@plane/services** - API service classes
- **@plane/types** - TypeScript types
- **@plane/ui** - UI component library
- **@plane/utils** - Utility functions
- **@plane/hooks** - Shared hooks
- **@plane/propel** - Toast/notification system
- **@plane/shared-state** - Shared state utilities
- **@plane/tailwind-config** - Tailwind config (dev)
- **@plane/typescript-config** - TypeScript config (dev)

### Development Tools

- **@react-router/dev** - React Router dev tools
- **Vite** - Build tool
- **Vite-tsconfig-paths** - TypeScript path mapping
- **Dotenv** - Environment variable loading
- **TypeScript** - Type checking
- **@types packages** - Type definitions for libraries

### Code Quality

- **oxlint** - Rust-based linter (configured max-warnings: 11957)
- **oxfmt** - Code formatter

### Fonts

- **@fontsource-variable/inter** - Inter font (variable)
- **@fontsource/ibm-plex-mono** - IBM Plex Mono font
- **@fontsource/material-symbols-rounded** - Material Symbols font
- **Use-font-face-observer** - Font loading detection

### Observability

- **Analytics** - Custom analytics service
- **Clarity** - Session recording (Microsoft Clarity)
- **@bprogress/core** - Progress bar (from catalog)

### PWA & Browser Support

- **Workbox** - PWA service worker framework
- **Isbot** - Bot detection

---

## 4. Scripts from package.json

```json
{
  "dev": "react-router dev --port 3000",
  "build": "react-router build",
  "preview": "react-router build && serve -s build/client -l 3000",
  "start": "serve -s build/client -l 3000",
  "clean": "rm -rf .turbo && rm -rf .next && rm -rf .react-router && rm -rf node_modules && rm -rf dist && rm -rf build",
  "check:lint": "oxlint --max-warnings=11957 .",
  "check:types": "react-router typegen && tsc --noEmit",
  "check:format": "oxfmt --check .",
  "fix:lint": "oxlint --fix .",
  "fix:format": "oxfmt ."
}
```

### Script Explanations:

- **dev**: Start development server on port 3000 with HMR
- **build**: Build optimized production bundle with React Router
- **preview**: Build and serve production build locally
- **start**: Serve pre-built production bundle
- **clean**: Remove all build artifacts and node_modules
- **check:lint**: Run oxlint with warning threshold
- **check:types**: Generate route types and type-check code
- **check:format**: Check code formatting with oxfmt
- **fix:lint**: Auto-fix linting issues
- **fix:format**: Auto-format code

---

## 5. Key Patterns

### Routing Pattern

**React Router v7 File-Based Routing**

- Routes defined in `/app/` directory using file-based routing
- Special folders: `(home)`, `(all)`, `(projects)`, `(settings)` for grouping
- Dynamic segments: `[workspaceSlug]`, `[projectId]`, `[issueId]`
- Route configuration in `/app/routes/core.ts` and `/app/routes/extended.ts`
- Redirect routes in `/app/routes/redirects/` for backward compatibility

**Example Route Structure:**

```
/:workspaceSlug/projects/:projectId/issues/:issueId
→ app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/issues/(detail)/[issueId]/page.tsx
```

### State Management Pattern

**MobX Observable Architecture**

1. **Root Store** - `core/store/root.store.ts` containing all domain stores
2. **Domain Stores** - Specific stores for issues, cycles, projects, workspaces, etc.
3. **Store Context** - `core/lib/store-context.tsx` provides store via React Context
4. **StoreProvider** - Wraps entire app in `app/provider.tsx`
5. **Store Hooks** - Custom hooks like `useIssue()`, `useCycle()` access stores
6. **Observer Pattern** - Components use `observer()` HOC for reactivity

**Store Access Pattern:**

```tsx
import { useIssue } from "@/hooks/store/use-issue";

const MyComponent = observer(() => {
  const { issues, createIssue, updateIssue } = useIssue();
  // Component automatically re-renders when issues change
});
```

### Data Fetching Pattern

**SWR + Axios Pattern**

1. **Services** - Axios-based API classes in `core/services/`
2. **SWR Hooks** - Data fetching with automatic caching/revalidation
3. **Store Integration** - SWR calls populate MobX stores
4. **Configuration** - SWR config in `app/provider.tsx` with `WEB_SWR_CONFIG`

**Example Service:**

```tsx
// core/services/issue/issue.service.ts
export class IssueService extends APIService {
  async createIssue(workspaceSlug, projectId, data) {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/`, data);
  }
}
```

**Data Fetching in Components:**

```tsx
import useSWR from "swr";
const { data: issues, isLoading } = useSWR(`workspace-${workspaceSlug}-issues`, () =>
  issueService.getIssues(workspaceSlug, projectId)
);
```

### API Call Pattern

**Base APIService Class**

- Located: `core/services/api.service.ts`
- Extends with: `axios.create({ baseURL, withCredentials: true })`
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `request()`
- Error Handling: Interceptors handle 401 redirects to home
- Environment: `VITE_API_BASE_URL` from `.env`

**Service Extension Pattern:**

```tsx
export class IssueService extends APIService {
  constructor(serviceType = EIssueServiceType.ISSUES) {
    super(API_BASE_URL);
    this.serviceType = serviceType;
  }

  async createIssue(workspaceSlug, projectId, data) {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/${this.serviceType}/`, data);
  }
}
```

### Component Composition Pattern

**Nested Layout + Page Pattern**

```
app/(all)/[workspaceSlug]/(projects)/layout.tsx     # Workspace layout
  → app/(all)/[workspaceSlug]/(projects)/page.tsx   # Workspace home
  → app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/layout.tsx
    → app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/issues/(list)/page.tsx
```

**Component Organization:**

- Layout files handle structure/navigation
- Page files handle content
- Core components in `/core/components/` categorized by feature

### Authentication Pattern

**AuthenticationWrapper**

- Located: `core/lib/wrappers/authentication-wrapper.tsx`
- Uses SWR + hooks to fetch user data
- Guards routes based on `EPageTypes` (AUTHENTICATED, NON_AUTHENTICATED, ONBOARDING, PUBLIC, SET_PASSWORD)
- Redirects unauthenticated users to home
- Redirects authenticated non-onboarded users to onboarding

**Usage:**

```tsx
<AuthenticationWrapper pageType={EPageTypes.AUTHENTICATED}>
  <YourComponent />
</AuthenticationWrapper>
```

### Theme Management Pattern

**Next-themes + Custom Theme**

- ThemeProvider in `app/root.tsx` with themes: light, dark, light-contrast, dark-contrast, custom
- Store wrapper applies custom theme CSS variables
- User theme preference stored in profile
- One-time initialization from server, then localStorage-driven

---

## 6. Component Structure

### Component Organization

**Total Components:** 1,099 React components across ~26,495 lines of code

**Component Categories:**

1. **Common Components** (`core/components/common/`)
   - LogoSpinner, EmptyState, CoverImage, BreadcrumbLink, ProIcon, etc.
   - Shared across all pages and features

2. **Issues** (`core/components/issues/`)
   - Issue detail widgets, layouts (kanban, list, calendar, gantt)
   - Issue modals, filters, peek overview
   - Attachment management, relations, bulk operations

3. **Cycles** (`core/components/cycles/`)
   - Cycle lists, details, filters, analytics
   - Cycle quick actions, peek overview

4. **Modules** (`core/components/modules/`)
   - Module management, lists, details, filters

5. **Pages** (`core/components/pages/`)
   - Page editor, list views, collaborative editing

6. **Projects** (`core/components/project/`)
   - Project settings, members, archives
   - Project creation and management

7. **Workspace** (`core/components/workspace/`)
   - Workspace settings, member management
   - Workspace invitations, billing

8. **Settings** (`core/components/settings/`)
   - Workspace settings, project settings
   - User profile settings, appearance, integrations

9. **Sidebar/Navigation** (`core/components/sidebar/`, `core/components/navigation/`)
   - Workspace and project navigation
   - Favorites, quick access

10. **UI Components** (`core/components/ui/`)
    - Base buttons, inputs, modals, dropdowns
    - Form components

11. **Views** (`core/components/views/`)
    - Custom view creation and management
    - Filters and sorting

12. **Other Specialized Components**
    - Analytics, Gantt Charts, Comments, Editor, Icons
    - Empty States, Auth Screens, Profile, Power-K (command palette)
    - Web Hooks, Integrations, Licenses

### Component Naming Conventions

- **File naming**: kebab-case (e.g., `issue-detail.tsx`, `workspace-invitations.tsx`)
- **Component naming**: PascalCase (e.g., `export const IssueDetail = () => {}`)
- **Hooks**: camelCase with `use` prefix (e.g., `useIssue`, `useWorkspace`)
- **Store files**: suffix with `.store.ts` (e.g., `issue.store.ts`)
- **Service files**: suffix with `.service.ts` (e.g., `issue.service.ts`)
- **Type files**: descriptive names (e.g., `navigation-preferences.ts`)

### Component Import Patterns

**Import Aliases (tsconfig.json):**

```json
{
  "@/*": ["./core/*"],
  "@/app/*": ["./app/*"],
  "@/helpers/*": ["./helpers/*"],
  "@/styles/*": ["./styles/*"],
  "@/plane-web/*": ["./ce/*"]
}
```

**Common Import Patterns:**

```tsx
// Core components
import { IssueDetail } from "@/components/issues/issue-detail";

// Hooks
import { useIssue } from "@/hooks/store/use-issue";

// Services
import { IssueService } from "@/services/issue/issue.service";

// Styles
import styles from "@/styles/globals.css";

// Helpers
import { formatDate } from "@/helpers/date.helper";

// CE components
import { CustomFeature } from "@/plane-web/components/custom";

// App files
import { HomePage } from "@/app/(home)/page";
```

---

## 7. Configuration Files

### tsconfig.json

```json
{
  "rootDirs": [".", "./.react-router/types"],
  "paths": {
    "@/*": ["./core/*"],
    "@/app/*": ["./app/*"],
    "@/helpers/*": ["./helpers/*"],
    "@/styles/*": ["./styles/*"],
    "@/plane-web/*": ["./ce/*"],
    "package.json": ["./package.json"]
  },
  "strictNullChecks": true,
  "extends": "@plane/typescript-config/react-router.json"
}
```

### vite.config.ts

```typescript
// Exposes VITE_* environment variables
// Aliases: next/link, next/navigation, next/script for compatibility
// No SSR configuration (client-side only)
// Vite plugins: reactRouter(), tsconfigPaths()
// Server config: host 0.0.0.0
```

### react-router.config.ts

```typescript
export default {
  appDirectory: "app",
  ssr: false, // Client-side only
};
```

### tailwind.config.js

```javascript
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./ce/**/*.{js,ts,jsx,tsx}", "./styles/**/*.{css}"],
  theme: {
    extend: {},
  },
};
```

### postcss.config.js

Inherits from `@plane/tailwind-config/postcss.config.js`

### Environment Variables (.env / .env.example)

```env
VITE_API_BASE_URL="http://localhost:8000"
VITE_WEB_BASE_URL="http://localhost:3000"
VITE_ADMIN_BASE_URL="http://localhost:3000"
VITE_ADMIN_BASE_PATH="/god-mode"
VITE_SPACE_BASE_URL="http://localhost:3002"
VITE_SPACE_BASE_PATH="/spaces"
VITE_LIVE_BASE_URL="http://localhost:3100"
VITE_LIVE_BASE_PATH="/live"
VITE_ENABLE_SESSION_RECORDER=0
VITE_SESSION_RECORDER_KEY="[optional]"
```

**Variable Purposes:**

- `VITE_API_BASE_URL` - Backend API endpoint
- `VITE_WEB_BASE_URL` - Current app URL
- `VITE_ADMIN_BASE_URL` - Admin panel URL
- `VITE_SPACE_BASE_URL` - Shared spaces/public URL
- `VITE_LIVE_BASE_URL` - Live collaboration URL
- `VITE_ENABLE_SESSION_RECORDER` - Enable Microsoft Clarity
- `VITE_SESSION_RECORDER_KEY` - Clarity project key

---

## 8. Testing

**Current Status:** No test infrastructure found in this project.

- No `__tests__` directories
- No `.test.ts` or `.spec.ts` files
- No test runner configured (Jest, Vitest, etc.)
- No test dependencies in package.json

**Recommendation:** For adding tests, consider:

- **Vitest** (works with Vite)
- **Jest** (traditional option)
- **Testing Library** for component testing
- **Cypress/Playwright** for E2E testing

---

## 9. Environment Variables

### Configuration Sources

1. **`.env` file** (local development)
2. **`.env.example`** (template for developers)
3. **Environment variables** automatically exposed at build time
4. **Only `VITE_*` prefixed variables** are exposed to frontend code

### Available Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# URL Configuration
VITE_WEB_BASE_URL=http://localhost:3000
VITE_ADMIN_BASE_URL=http://localhost:3001
VITE_ADMIN_BASE_PATH=/god-mode
VITE_SPACE_BASE_URL=http://localhost:3002
VITE_SPACE_BASE_PATH=/spaces
VITE_LIVE_BASE_URL=http://localhost:3100
VITE_LIVE_BASE_PATH=/live

# Optional Features
VITE_ENABLE_SESSION_RECORDER=0  # Enable session recording
VITE_SESSION_RECORDER_KEY=""    # Microsoft Clarity key
```

### Access in Code

```tsx
const apiUrl = process.env.VITE_API_BASE_URL;
const enableRecorder = parseInt(process.env.VITE_ENABLE_SESSION_RECORDER || "0");
```

---

## 10. Notable Conventions

### Folder Structure Conventions

1. **Feature-Based Organization**
   - Each feature (issues, cycles, projects) has dedicated:
     - Components in `core/components/{feature}/`
     - Store in `core/store/{feature}/ or {feature}.store.ts`
     - Services in `core/services/{feature}/`
     - Hooks for accessing store/data

2. **Page-Based Organization in Routes**
   - Routes mirror folder structure
   - `[bracketed]` names for dynamic segments
   - Parentheses `(name)` for route groups without URL segment
   - `layout.tsx` for layout components
   - `page.tsx` for page content

3. **Type Safety**
   - TypeScript strict mode enabled
   - Path aliases prevent relative imports
   - Types from `@plane/types` package

### Naming Conventions

**Files:**

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Stores: `{name}.store.ts`
- Services: `{name}.service.ts`
- Hooks: `use{Name}.ts` or `use{Name}.tsx`

**Components:**

- Page components: `export default` with name
- Exported components: Named exports
- Sub-components: Prefixed with parent name (e.g., `IssueDetailHeader`)

**Stores:**

- Store names: `I{Name}Store` interface, `{Name}Store` class
- Observable methods: `makeAutoObservable(this)`
- Methods: `get{Name}()`, `set{Name}()`, `reset()`

**Services:**

- Extend `APIService` base class
- Constructor accepts config (baseURL, API version)
- Methods: `async create/read/update/delete{ResourceName}()`

### Import Patterns

**Preference Order:**

1. Absolute imports via aliases (`@/`)
2. Relative imports (rare, only for sibling files)

**Circular Dependency Prevention:**

- Hooks depend on stores, not vice versa
- Components depend on hooks, stores, services
- Services are pure, no dependencies on components

### Error Handling

**API Errors:**

- APIService interceptor handles 401 redirects
- Services throw error.response.data on failure
- Components handle errors via SWR error state

**Form Errors:**

- React Hook Form for form validation
- Custom validators for business logic

### Async Patterns

**Data Loading:**

```tsx
const { data, isLoading, error } = useSWR(key, fetcher, config);
```

**Store Mutations:**

```tsx
const { createIssue } = useIssue();
await createIssue(workspaceSlug, projectId, data);
```

---

## 11. Entry Points

### Application Entry Points

1. **React Router Entry** - `app/entry.client.tsx`

   ```tsx
   // Hydrates React Router app on client side
   hydrateRoot(document, <HydratedRouter />);
   ```

2. **Root Component** - `app/root.tsx`
   - Defines HTML structure
   - Loads fonts and stylesheets
   - Sets up meta tags and favicons
   - Returns `<Outlet />` for route content

3. **App Provider** - `app/provider.tsx`
   - StoreProvider (MobX context)
   - AppProgressBar (BProgress)
   - TranslationProvider (i18n)
   - Toast notifications
   - SWR configuration
   - Instance wrapper

4. **Store Provider** - `core/lib/store-context.tsx`
   - Creates RootStore instance
   - Provides via React Context

5. **Main Layout** - `app/(all)/layout.tsx`
   - Wraps all authenticated app routes
   - Contains AppProvider

6. **Wrappers** (in provider order):
   - StoreWrapper - Theme initialization
   - InstanceWrapper - Instance configuration
   - AuthenticationWrapper - Auth guards

### Development Entry

**Command:** `npm run dev`

- Starts React Router dev server on port 3000
- Hot module replacement enabled
- Reads from vite.config.ts

### Production Build

**Command:** `npm run build`

- Builds optimized bundle with React Router build
- Output: `build/` directory
- Serve with: `npm start` or `serve -s build/client -l 3000`

---

## 12. API/Backend Integration

### API Architecture

**Base Service**

- Location: `core/services/api.service.ts`
- Base class for all API services
- Axios instance with credentials: true
- Automatic 401 redirect handling

**Service Organization**

- One service class per domain (Issue, Cycle, Project, etc.)
- Services extend APIService
- Methods use async/await
- Error handling via try/catch or promise rejection

### API Communication Pattern

```tsx
// 1. Create service instance
const issueService = new IssueService();

// 2. Call API method
const issue = await issueService.getIssue(workspaceSlug, projectId, issueId);

// 3. Store result in MobX store
const { setIssue } = useIssue();
setIssue(issue);

// 4. Use in component
const MyComponent = observer(() => {
  const { issues } = useIssue();
  return <div>{issues.map(issue => ...)}</div>;
});
```

### Data Flow

```
Component
  ↓ (fetch via SWR)
Service (Axios API calls)
  ↓ (data from backend)
MobX Store (update observable state)
  ↓ (automatic re-render)
Component
```

### API Endpoints Pattern

**Standard REST pattern:**

```
POST   /api/workspaces/{slug}/projects/{id}/issues/
GET    /api/workspaces/{slug}/projects/{id}/issues/{issueId}
PATCH  /api/workspaces/{slug}/projects/{id}/issues/{issueId}
DELETE /api/workspaces/{slug}/projects/{id}/issues/{issueId}
```

### Fetch Keys (SWR Cache Keys)

Located in: `core/constants/fetch-keys.ts`

- Structured keys for predictable caching
- Pattern: `${resource}-${id}-${view}`

### Error Handling

**In Services:**

```tsx
try {
  const response = await this.post(url, data);
  return response.data;
} catch (error) {
  throw error?.response?.data;
}
```

**In Components:**

```tsx
const { data, isLoading, error } = useSWR(key, fetcher);

if (error) return <ErrorComponent error={error} />;
```

**In Authentication:**

- 401 errors redirect to home page
- Set via axios interceptor in APIService

### Backend Services Used

**Primary Service Classes:**

- IssueService - CRUD for issues, bulk operations
- CycleService - Cycles and archived cycles
- ModuleService - Modules and dependencies
- ProjectService - Project management
- WorkspaceService - Workspace operations
- UserService - User profile and settings
- FileService - File uploads and attachments
- WebhookService - Webhook management
- AnalyticsService - Analytics data
- IntegrationServices - Third-party integrations

### Real-Time Features

**Collaboration:**

- Pages support collaborative editing
- Uses hooks like `use-collaborative-page-actions`

**Notifications:**

- WorkspaceNotificationService
- Real-time updates via WebSocket (through service)

**Analytics:**

- AnalyticsService for tracking
- Clarity for session recording (optional)

---

## 13. Build & Deployment

### Build Process

```bash
npm run build
# Outputs to build/client/ (client bundle) and build/server/ (if SSR enabled)
```

### Deployment

**Docker:**

- `Dockerfile.web` - Production image
- `Dockerfile.dev` - Development image
- Nginx for serving static files

**Environment Setup:**

1. Copy `.env.example` to `.env`
2. Update `VITE_API_BASE_URL` to backend URL
3. Set other URLs as needed

**Docker Commands:**

```bash
docker build -f Dockerfile.web -t plane-web:latest .
docker run -p 3000:3000 -e VITE_API_BASE_URL=http://api:8000 plane-web:latest
```

**Serve Built App:**

```bash
npm start
# Serves build/client on port 3000
```

---

## 14. Code Quality Tools

### Linting with oxlint

**Command:** `npm run check:lint` or `npm run fix:lint`

- Rust-based linter (very fast)
- Max warnings: 11,957 (configured)
- Configuration: Default oxlint rules

### Code Formatting with oxfmt

**Command:** `npm run check:format` or `npm run fix:format`

- Rust-based formatter
- Single code style across project

### Type Checking

**Command:** `npm run check:types`

- Generates React Router types: `react-router typegen`
- Type-checks code: `tsc --noEmit`
- Strict TypeScript config enabled

### Pre-commit Recommendations

```bash
npm run check:types    # TypeScript
npm run check:lint     # Linting
npm run check:format   # Format checking
```

---

## 15. Module/Feature Structure Example: Issues

**Complete feature implementation pattern:**

```
Feature: Issues Management

Components:
  core/components/issues/
  ├── issue-detail/          # Single issue page
  ├── issue-layouts/         # List, kanban, calendar, gantt views
  ├── issue-modal/           # Create/edit modals
  ├── issue-detail-widgets/  # Assignee, priority, dates, etc.
  ├── filters.tsx            # Filter UI
  └── [other issue components]

Store:
  core/store/issue/
  ├── root.store.ts          # Issue root store
  ├── issue.store.ts         # Core issue state
  ├── issue_kanban_view.store.ts
  ├── issue_calendar_view.store.ts
  └── issue_gantt_view.store.ts

Services:
  core/services/issue/
  ├── issue.service.ts       # CRUD operations
  ├── issue-activity.service.ts
  ├── issue-archive.service.ts
  ├── issue-estimate.service.ts
  └── [other issue services]

Hooks:
  core/hooks/
  ├── use-issue.ts           # Access issue store
  ├── use-issues-actions.tsx # Issue mutations
  └── [other issue hooks]

Routes:
  app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/issues/
  ├── (list)/page.tsx        # Issues list
  └── (detail)/[issueId]/page.tsx  # Single issue
```

---

## 16. Key Development Workflows

### Adding a New Feature

1. **Create Route** in `app/routes/core.ts`
2. **Create Page/Layout** in corresponding app folder
3. **Create Components** in `core/components/{feature}/`
4. **Create Store** in `core/store/{feature}/`
5. **Create Service** in `core/services/{feature}/`
6. **Create Hook** to access store: `use{Feature}.ts`
7. **Integrate** in component with `observer()` and hooks

### Adding an API Call

1. **Add method to Service** in `core/services/{resource}/`
2. **Create fetch key** in `core/constants/fetch-keys.ts`
3. **Use SWR in component** to fetch data
4. **Update Store** with fetched data
5. **Re-render component** via observer

### Modifying Store State

1. **Update Store** in `core/store/{feature}/`
2. **Define getter/setter** methods
3. **Use hook** to access: `const { data, update } = use{Feature}()`
4. **Call update** method in component
5. **Component automatically re-renders** (observer)

---

## 17. Performance Considerations

### Optimization Techniques Used

1. **Code Splitting**
   - React Router lazy loading of routes
   - Lazy component imports in provider.tsx

2. **Caching**
   - SWR with stale-while-revalidate
   - Browser caching for assets

3. **PWA**
   - Service worker (sw.js)
   - Workbox for offline support

4. **Asset Optimization**
   - `assetsInlineLimit: 0` in Vite (no inlining)
   - Font preloading in root.tsx

5. **State Management**
   - MobX automatic memoization
   - Observer pattern prevents unnecessary renders

6. **Images**
   - WebP format support
   - Lazy loading for images

### Best Practices

- Use `observer()` wrapper for MobX components
- Implement proper error boundaries
- Use React.memo for expensive components
- Debounce search/filter inputs
- Paginate large lists
- Lazy load modals and dialogs

---

## 18. Security Considerations

### Implemented Security Measures

1. **Authentication**
   - 401 interceptor redirects to login
   - Credentials sent with all requests (withCredentials: true)
   - Auth guards on protected routes

2. **TypeScript**
   - Strict mode enabled
   - Type safety prevents many bugs

3. **Environment Variables**
   - Sensitive URLs in .env
   - Only VITE\_\* exposed to frontend

4. **CORS**
   - Backend handles CORS
   - Credentials allowed in requests

### Security Best Practices

- Never store tokens in localStorage (backend should use httpOnly cookies)
- Validate user input on backend
- Use HTTPS in production
- Keep dependencies updated
- Regular security audits

---

## 19. Known Limitations & Next.js Compatibility

### Why Next.js Compatibility Shims?

The project migrated from Next.js to React Router but maintains compatibility:

- `app/compat/next/link.tsx` - Shim for next/link
- `app/compat/next/navigation.ts` - Shim for next/navigation
- `app/compat/next/script.tsx` - Shim for next/script

These allow code using Next.js APIs to work with React Router.

### No Server-Side Rendering

- `ssr: false` in react-router.config.ts
- Fully client-side React SPA
- Better for real-time collaborative features

---

## 20. Useful Resources & Patterns

### Common Tasks

**Fetch Data:**

```tsx
const { data, isLoading } = useSWR("key", fetcher);
```

**Update Store:**

```tsx
const { setData } = useStore();
await setData(newValue);
```

**Create Modal:**

```tsx
// Use component + state management
const [isOpen, setIsOpen] = useState(false);
return (
  <Modal open={isOpen}>
    <FormComponent />
  </Modal>
);
```

**Add Filter:**

```tsx
// Store + hook + component
const { filters, setFilter } = useFilters();
return <FilterUI onChange={(f) => setFilter(f)} />;
```

**Add Theme Support:**

```tsx
const { resolvedTheme } = useTheme();
const isDark = resolvedTheme === "dark";
```

---

## 21. Project Statistics

- **Total Components:** 1,099 React components
- **Component Code:** ~26,495 lines
- **Custom Hooks:** 100+
- **Store Files:** 32+
- **Service Classes:** 31+
- **Page Routes:** 104 (page.tsx + layout.tsx)
- **Core Directories:** 9 major categories
- **App Routes:** 14 major route groups

---

## 22. Related Projects

This web app is part of the Plane platform:

- **Backend API:** Separate Django/Python API
- **Admin Panel:** `/god-mode` at `VITE_ADMIN_BASE_URL`
- **Shared Spaces:** `/spaces` at `VITE_SPACE_BASE_URL`
- **Live Collaboration:** `/live` at `VITE_LIVE_BASE_URL`
- **Shared Packages:** @plane/\* workspace packages

---

## 23. Design System & Tailwind v4 Color Tokens

### Tailwind Version

This project uses **Tailwind CSS v4** configured entirely through CSS — not `tailwind.config.js`. The v4 entry point is `packages/tailwind-config/index.css` which contains `@import "tailwindcss"`.

> ⚠️ **Standard Tailwind palette classes like `bg-red-500`, `text-blue-400`, `bg-green-200` do NOT work.** They are explicitly wiped in `packages/tailwind-config/variables.css`:
>
> ```css
> @theme {
>   --color-*: initial; /* resets the entire default color palette */
> }
> ```

### How Semantic Color Tokens Work

In Tailwind v4, CSS custom properties in a `@theme inline` block map directly to utility classes by their prefix:

```css
@theme inline {
  --background-color-accent-primary: var(--bg-accent-primary); /* → bg-accent-primary */
  --text-color-primary: var(--txt-primary); /* → text-primary       */
  --border-color-subtle: var(--border-subtle); /* → border-subtle      */
}
```

All tokens are defined in `packages/tailwind-config/variables.css`.

| CSS variable prefix    | Tailwind class prefix | Example                 |
| ---------------------- | --------------------- | ----------------------- |
| `--background-color-*` | `bg-*`                | `bg-accent-primary`     |
| `--text-color-*`       | `text-*`              | `text-primary`          |
| `--border-color-*`     | `border-*`            | `border-subtle`         |
| `--outline-color-*`    | `outline-*`           | `outline-accent-strong` |
| `--ring-color-*`       | `ring-*`              | `ring-accent-strong`    |

### Available Background Tokens (`bg-*`)

**Surfaces:**

- `bg-canvas` — page/app background
- `bg-surface-1`, `bg-surface-2`, `bg-surface-3` — layered surfaces (light to slightly elevated)

**Layers (interactive states):**

- `bg-layer-1`, `bg-layer-1-hover`, `bg-layer-1-active`, `bg-layer-1-selected`
- `bg-layer-2`, `bg-layer-2-hover`, `bg-layer-2-active`, `bg-layer-2-selected`
- `bg-layer-3`, `bg-layer-3-hover`, `bg-layer-3-active`, `bg-layer-3-selected`
- `bg-layer-transparent`, `bg-layer-transparent-hover`, `bg-layer-transparent-active`, `bg-layer-transparent-selected`
- `bg-layer-disabled`

**Accent (brand color):**

- `bg-accent-primary`, `bg-accent-primary-hover`, `bg-accent-primary-active`
- `bg-accent-subtle`, `bg-accent-subtle-hover`, `bg-accent-subtle-active`

**Success:**

- `bg-success-primary`, `bg-success-subtle`, `bg-success-subtle-1`

**Warning:**

- `bg-warning-primary`, `bg-warning-subtle`

**Danger:**

- `bg-danger-primary`, `bg-danger-primary-hover`, `bg-danger-primary-active`, `bg-danger-primary-selected`
- `bg-danger-subtle`, `bg-danger-subtle-hover`, `bg-danger-subtle-active`, `bg-danger-subtle-selected`
- `bg-danger-transparent`, `bg-danger-transparent-hover`, `bg-danger-transparent-active`, `bg-danger-transparent-selected`

**Other:**

- `bg-backdrop`, `bg-inverse`

### Available Text Tokens (`text-*`)

**Core:**

- `text-primary`, `text-secondary`, `text-tertiary`
- `text-placeholder`, `text-disabled`, `text-inverse`
- `text-on-color`, `text-on-color-disabled`

**Accent:**

- `text-accent-primary`, `text-accent-secondary`

**Status:**

- `text-success-primary`, `text-success-secondary`
- `text-warning-primary`, `text-warning-secondary`
- `text-danger-primary`, `text-danger-secondary`

**Icons:**

- `text-icon-primary`, `text-icon-secondary`, `text-icon-tertiary`
- `text-icon-accent-primary`, `text-icon-accent-subtle`, `text-icon-accent-secondary`, `text-icon-accent-primary-inverse`
- `text-icon-danger-primary`, `text-icon-danger-secondary`
- `text-icon-success-primary`, `text-icon-success-secondary`
- `text-icon-warning-primary`, `text-icon-warning-secondary`
- `text-icon-placeholder`, `text-icon-disabled`, `text-icon-on-color`, `text-icon-on-color-disabled`, `text-icon-inverse`

**Links:**

- `text-link-primary`, `text-link-primary-hover`, `text-link-secondary`

**Priority:**

- `text-priority-urgent`, `text-priority-high`, `text-priority-medium`, `text-priority-low`, `text-priority-none`

### Available Border Tokens (`border-*`)

- `border-subtle`, `border-subtle-1`, `border-strong`, `border-strong-1`
- `border-inverse`, `border-disabled`
- `border-accent-strong`, `border-accent-subtle`
- `border-success-strong`, `border-success-subtle`
- `border-warning-strong`, `border-warning-subtle`
- `border-danger-strong`, `border-danger-subtle`
- `border-priority-urgent`, `border-priority-high`, `border-priority-medium`, `border-priority-low`, `border-priority-none`

### Only Two Raw Colors Available

```css
@theme {
  --color-white: oklch(1 0 0); /* bg-white, text-white, … */
  --color-black: oklch(0.1482 …); /* bg-black, text-black, … */
}
```

All other colors must use semantic tokens above.

### Common Mistakes to Avoid

| ❌ Don't use      | ✅ Use instead                                |
| ----------------- | --------------------------------------------- |
| `bg-red-500`      | `bg-danger-primary`                           |
| `bg-red-500/10`   | `bg-danger-transparent` or `bg-danger-subtle` |
| `text-red-400`    | `text-danger-primary`                         |
| `bg-green-500`    | `bg-success-primary`                          |
| `text-green-400`  | `text-success-primary`                        |
| `bg-blue-500`     | `bg-accent-primary`                           |
| `text-gray-500`   | `text-secondary` or `text-tertiary`           |
| `bg-gray-100`     | `bg-surface-2` or `bg-layer-1`                |
| `border-gray-200` | `border-subtle`                               |

---

## Summary

**Plane Web** is a sophisticated, feature-rich React Router v7 SPA with:

- Comprehensive project management features (issues, cycles, modules, pages)
- Robust state management via MobX
- Service-based API architecture with Axios
- Component-driven UI with Tailwind CSS
- TypeScript for type safety
- SWR for intelligent data fetching
- PWA support for offline capability
- Extensive customization and extensibility

The architecture emphasizes separation of concerns, reusability, and maintainability, making it suitable for rapid feature development and team collaboration.
