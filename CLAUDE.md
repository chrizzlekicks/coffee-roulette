# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Rails Backend
- **Start server**: `bin/rails server`
- **Run tests**: `bin/rails test` (runs all tests in parallel)
- **Run single test**: `bin/rails test test/path/to/test_file.rb`
- **Run system tests**: `bin/rails test:system`
- **Database setup**: `bin/rails db:create db:migrate db:seed`
- **Console**: `bin/rails console`
- **Lint Ruby**: `bundle exec rubocop`

### Frontend (SolidJS + Vite)
- **Build assets**: `npm run build` (via Vite)
- **Lint JavaScript**: `npm run lint`
- **Development with hot reload**: `bin/vite dev` (for Vite development server)

### Running Background Jobs
- **Match users**: `UserMatchingJob.perform_now` (in Rails console)

## Architecture Overview

### Hybrid Rails + SolidJS Application
This is a Rails API backend serving a SolidJS single-page application. Rails handles:
- RESTful API endpoints (`/users`, `/matches`, `/login`, `/logout`)
- Session-based authentication with CSRF protection
- Background job processing for user matching
- Email delivery for matches and password resets

The SolidJS frontend provides:
- Modern reactive UI with TypeScript
- Client-side routing with `@solidjs/router`
- Global authentication state via `AuthContext`
- Route protection with `AuthGuard` component

### Key Architectural Patterns

**Authentication Flow**:
- Rails sessions with cookies (not JWT)
- `AuthContext` manages frontend auth state
- Session persistence via `sessionStorage`
- CSRF token integration between frontend/backend

**Matching System**:
- `UserMatchingJob` performs random matching in groups of 2
- Date-based match events with many-to-many user relationships
- Immediate email notifications via `MatchMailer`

**Database Design**:
- PostgreSQL with UUID primary keys
- Clean relational structure: `users` → `user_matches` ← `matches`
- Secure password handling with `has_secure_password`

**Frontend Organization**:
- `/components` - Reusable UI components
- `/pages` - Route-specific components  
- `/contexts` - Global state management
- `/lib` - API client and utilities

### Testing Strategy
- **Unit tests**: Models, controllers, jobs, mailers
- **Integration tests**: API endpoints with session management helpers
- **System tests**: Full-stack Capybara with Selenium WebDriver
- Test helpers available: `stub_multiple_users`, `create_session_for`, `logout_session`

### Build System
- Vite replaces Rails asset pipeline for modern JS tooling
- `vite-plugin-ruby` bridges Rails and Vite development
- TailwindCSS + DaisyUI for styling with custom theme

## Important File Locations

- **API Controllers**: `app/controllers/`
- **SolidJS Components**: `app/javascript/components/`
- **Frontend Pages**: `app/javascript/pages/`
- **Authentication Context**: `app/javascript/contexts/AuthContext.tsx`
- **API Client**: `app/javascript/lib/httpClient.ts`
- **Models**: `app/models/`
- **Background Jobs**: `app/jobs/`
- **Email Templates**: `app/views/*_mailer/`
- **Tests**: `test/` (organized by type: controllers, models, integration, system)

## Development Notes

- The application serves a single SPA at the root route
- All client-side routing handled by SolidJS router
- CSRF protection is enabled - use proper form submission patterns
- Session-based auth means users stay logged in across browser sessions
- Background jobs run inline in development, use proper job queue in production
- Email delivery uses Rails Action Mailer with HTML/text templates