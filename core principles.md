1. PROJECT PHILOSOPHY
   - Why this project exists
   - The AI-human collaboration vision
   - Success definition beyond functionality

2. ARCHITECTURAL PRINCIPLES
   - Separation of concerns (frontend/backend boundaries)
   - Single responsibility principle for components
   - DRY (Don't Repeat Yourself) application
   - SOLID principles where applicable
   - API-first design approach
   - Database schema normalization rules

3. CODE QUALITY PRINCIPLES
   - Readability over cleverness
   - Explicit over implicit
   - Fail fast and loudly (error handling)
   - Self-documenting code with minimal comments
   - Consistent naming conventions across codebase
   - Pure functions preferred over stateful logic

4. PERFORMANCE PRINCIPLES
   - Measure before optimizing
   - Optimize for perceived performance first
   - Cache aggressively but invalidate intelligently
   - Lazy load everything that's not immediately needed
   - Virtualize long lists (>100 items)
   - Minimize bundle size (code splitting required)
   - Database queries must be indexed

5. AI COLLABORATION PRINCIPLES
   - AI accelerates, humans validate
   - Never ship AI-generated code without review
   - AI handles boilerplate, humans handle business logic
   - Document all AI contributions for portfolio transparency
   - Prompt engineering is part of the development process

6. USER EXPERIENCE PRINCIPLES
   - Progressive enhancement over graceful degradation
   - Mobile-first responsive design
   - Accessibility is non-negotiable (WCAG AA minimum)
   - Loading states for all async operations
   - Error messages must be actionable
   - Keyboard navigation for all interactive elements
   - Maximum 3-second initial page load

7. DATA PRINCIPLES
   - Validate all inputs (never trust client)
   - Sanitize all outputs (prevent XSS)
   - Single source of truth for data
   - Cache frequently read data, invalidate on write
   - Soft deletes preferred over hard deletes
   - Audit trails for critical operations
   - Personal data handling compliance (even in demo)

8. SECURITY PRINCIPLES
   - Assume all user input is malicious
   - Principle of least privilege (API permissions)
   - Secrets never in code (environment variables only)
   - HTTPS everywhere in production
   - Rate limiting on expensive operations
   - SQL/NoSQL injection prevention via parameterization
   - Content Security Policy headers required

9. DEVELOPMENT WORKFLOW PRINCIPLES
    - Commit early, commit often (atomic commits)
    - Conventional commits for clear history
    - Code reviews required before merge
    - Feature flags for incomplete features
    - Version control everything (except secrets)
    - Document decisions in ADRs (Architecture Decision Records)
    - Refactor continuously, don't accumulate tech debt

10. SCALABILITY PRINCIPLES
    - Design for 10x current load
    - Horizontal scaling over vertical
    - Stateless backend services
    - Database connection pooling
    - Async processing for heavy operations
    - Rate limiting to prevent abuse
    - Monitoring and alerting from day one

11. DOCUMENTATION PRINCIPLES
    - Code should explain "how", comments explain "why"
    - README must enable setup in <10 minutes
    - API contracts documented before implementation
    - Architecture diagrams kept up-to-date
    - Changelog for all releases
    - AI collaboration fully transparent
    - Onboarding docs for future contributors

12. PORTFOLIO-SPECIFIC PRINCIPLES
    - Every feature demonstrates a specific skill
    - Code quality over feature quantity
    - Document problems solved, not just features built
    - Show thought process in commit messages
    - AI usage is a feature, not a secret
    - Performance metrics tracked and displayed
    - Clean, professional presentation matters

13. DECISION-MAKING FRAMEWORK
    ask questions, never make assumptions
