import {
  User,
  LearningTrack,
  Course,
  Task,
  TaskSubmission,
  LearnerProgress,
  Certificate,
  Announcement,
  ActivityLog,
  UnlockOverride,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'problos_users_v1',
  TRACKS: 'problos_tracks_v1',
  COURSES: 'problos_courses_v1',
  TASKS: 'problos_tasks_v1',
  SUBMISSIONS: 'problos_submissions_v1',
  PROGRESS: 'problos_progress_v1',
  CERTIFICATES: 'problos_certificates_v1',
  ANNOUNCEMENTS: 'problos_announcements_v1',
  LOGS: 'problos_logs_v1',
  OVERRIDES: 'problos_overrides_v1',
  CURRENT_PORTAL: 'problos_current_portal_v1',
};

// Seed Administrators & Interns
const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Siyab (Admin)',
    email: 'msiyab10492@gmail.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00Z',
    accountActive: true,
    assignedTrackIds: [],
    enrolledCourseIds: [],
  },
  {
    id: 'usr_admin_2',
    name: 'Rauf (Admin)',
    email: 'rauf@problos.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01T08:00:00Z',
    accountActive: true,
    assignedTrackIds: [],
    enrolledCourseIds: [],
  },
  {
    id: 'usr_intern_1',
    name: 'Alex Chen',
    email: 'alex.chen@problos.dev',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-10T10:00:00Z',
    accountActive: true,
    assignedTrackIds: ['trk_web_dev'],
    enrolledCourseIds: ['crs_html_css', 'crs_javascript', 'crs_react'],
    accessExpiresAt: '2026-12-31T23:59:59Z',
  },
  {
    id: 'usr_intern_2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@problos.dev',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15T11:30:00Z',
    accountActive: true,
    assignedTrackIds: ['trk_web_dev'],
    enrolledCourseIds: ['crs_html_css', 'crs_javascript'],
    accessExpiresAt: '2026-11-30T23:59:59Z',
  },
  {
    id: 'usr_intern_3',
    name: 'David Okafor',
    email: 'david.okafor@problos.dev',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T09:00:00Z',
    mustChangePassword: true, // Requires first-login password change!
    temporaryPasswordActive: true,
    accountActive: true,
    assignedTrackIds: ['trk_web_dev'],
    enrolledCourseIds: ['crs_html_css'],
    accessExpiresAt: '2026-09-30T23:59:59Z',
  },
];

// Seed Tracks
const INITIAL_TRACKS: LearningTrack[] = [
  {
    id: 'trk_web_dev',
    title: 'Modern Full-Stack Web Development',
    slug: 'modern-full-stack-web-development',
    description: 'Master foundational front-end, high-performance JavaScript ES6+, and scalable React architecture for enterprise applications.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
    category: 'Software Engineering',
    courseIds: ['crs_html_css', 'crs_javascript', 'crs_react'],
    isPublished: true,
    isArchived: false,
    estimatedHours: 120,
    level: 'Beginner',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'trk_cloud_edge',
    title: 'Cloudflare Edge & Serverless Architecture',
    slug: 'cloudflare-edge-serverless-architecture',
    description: 'Deep dive into globally distributed serverless computing, Workers KV, Cloudflare D1 relational databases, and edge performance.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    category: 'Cloud & Infrastructure',
    courseIds: ['crs_workers_d1'],
    isPublished: true,
    isArchived: false,
    estimatedHours: 60,
    level: 'Intermediate',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z',
  },
];

// Seed Courses
const INITIAL_COURSES: Course[] = [
  {
    id: 'crs_html_css',
    trackId: 'trk_web_dev',
    title: 'Semantic HTML5 & Modern CSS Architecture',
    slug: 'semantic-html5-modern-css',
    description: 'Learn semantic page structuring, responsive CSS grid/flexbox layouts, accessibility (WCAG), and modern design tokens.',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Sarah Lin',
    instructorTitle: 'Principal Frontend Architect at Problos',
    isPublished: true,
    isArchived: false,
    status: 'published',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    weeks: [
      {
        id: 'wk_html_1',
        weekNumber: 1,
        title: 'Document Outline & Semantic Hierarchy',
        description: 'Understand semantic elements, accessibility trees, and modern document structuring.',
        unlockRequiresTaskApproval: false,
        taskId: 'tsk_portfolio_html',
        lessons: [
          {
            id: 'lsn_html_101',
            title: 'Semantic HTML vs Container Div Soup',
            description: 'Why semantic tags matter for screen readers, SEO, and maintainable DOM structures.',
            durationMinutes: 24,
            videoEmbedUrl: 'https://www.youtube.com/embed/kUMe1FH4CHE',
            notesMarkdown: `### Semantic Elements Overview

Using semantic tags like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, and \`<footer>\` gives meaning to your web page rather than just presentation.

#### Key Principles:
1. **Never use \`<div>\` when a semantic tag exists.**
2. Use \`<h1>\` only once per primary document view.
3. Every input must have an explicitly associated \`<label>\`.
4. Buttons trigger actions, anchors navigate URLs. Never do \`<div onClick={...}>\`.`,
            codeSnippet: {
              language: 'html',
              filename: 'semantic-layout.html',
              code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Problos Portfolio</title>
</head>
<body>
  <header>
    <nav aria-label="Main Navigation">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>Enterprise Application UI</h1>
      <p>Built with accessibility and responsive performance at scale.</p>
    </article>
  </main>
  <footer>
    <p>&copy; 2026 Problos Inc.</p>
  </footer>
</body>
</html>`,
            },
            resources: [
              { title: 'MDN Semantic Elements Reference', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics', type: 'doc' },
              { title: 'W3C Accessibility Guidelines (WCAG 2.1)', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', type: 'doc' },
            ],
            order: 1,
          },
          {
            id: 'lsn_html_102',
            title: 'Modern CSS Grid & Flexbox Layouts',
            description: 'Building robust, responsive 2D layouts without media query spaghetti.',
            durationMinutes: 32,
            videoEmbedUrl: 'https://www.youtube.com/embed/9zBsdydE1S4',
            notesMarkdown: `### Grid vs. Flexbox: The True Mental Model

- **Flexbox is 1-Dimensional:** Perfect for linear alignment (horizontal row of tags, vertical column of form fields).
- **CSS Grid is 2-Dimensional:** Perfect for page scaffolds, cards with auto-fitting columns, and complex dashboard layouts.

#### CSS Grid Magic Formula:
\`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\` ensures cards adapt to any viewport effortlessly!`,
            codeSnippet: {
              language: 'css',
              filename: 'dashboard-grid.css',
              code: `.card-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.card-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}`,
            },
            resources: [
              { title: 'CSS-Tricks Complete Guide to Grid', url: 'https://css-tricks.com/snippets/css/complete-guide-grid/', type: 'article' },
              { title: 'Flexbox Froggy Game', url: 'https://flexboxfroggy.com/', type: 'article' },
            ],
            order: 2,
          },
        ],
      },
      {
        id: 'wk_html_2',
        weekNumber: 2,
        title: 'Design Systems & Responsive Components',
        description: 'Creating reusable components with custom properties, tokens, and Tailwind patterns.',
        unlockRequiresTaskApproval: true, // Gated!
        taskId: 'tsk_responsive_component',
        lessons: [
          {
            id: 'lsn_html_201',
            title: 'CSS Custom Properties (Variables) & Theming',
            description: 'Structuring centralized design tokens for colors, spacing, and typography.',
            durationMinutes: 28,
            notesMarkdown: `### Clean Theming with CSS Variables

CSS variables allow dynamic theme changes without reloading or rewriting stylesheet selectors.

\`\`\`css
:root {
  --brand-green: #009166;
  --brand-bg: #FAF9F6;
  --text-primary: #1F2937;
}
\`\`\``,
            resources: [
              { title: 'Problos Design Tokens Specification', url: 'https://problos.com/docs/tokens', type: 'doc' },
            ],
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'crs_javascript',
    trackId: 'trk_web_dev',
    title: 'Modern JavaScript (ES2024) Deep Dive',
    slug: 'modern-javascript-deep-dive',
    description: 'Asynchronous JavaScript, Event Loop, Closures, Prototypes, and clean functional programming patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Marcus Vance',
    instructorTitle: 'Staff Software Engineer at Problos',
    isPublished: true,
    isArchived: false,
    status: 'published',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
    weeks: [
      {
        id: 'wk_js_1',
        weekNumber: 1,
        title: 'Event Loop & Asynchronous Architecture',
        description: 'Microtasks, Macrotasks, Promises, and robust Async/Await patterns.',
        unlockRequiresTaskApproval: false,
        taskId: 'tsk_async_fetcher',
        lessons: [
          {
            id: 'lsn_js_101',
            title: 'Understanding the JavaScript Runtime & Event Loop',
            description: 'How V8 handles Call Stack, Web APIs, Microtask Queue, and Render Steps.',
            durationMinutes: 35,
            videoEmbedUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ',
            notesMarkdown: `### The JavaScript Event Loop

JavaScript is single-threaded, but the browser or Node.js environment provides concurrency via Web APIs and the task queue.

1. **Call Stack**: Executes synchronous operations.
2. **Microtasks Queue**: Promises (\`.then()\`, \`await\`), \`queueMicrotask\`. Executed immediately when stack is empty, BEFORE macrotasks!
3. **Macrotasks Queue**: \`setTimeout\`, \`setInterval\`, DOM events.`,
            codeSnippet: {
              language: 'javascript',
              filename: 'event-loop-demo.js',
              code: `console.log('1: Synchronous start');

setTimeout(() => {
  console.log('4: Macrotask timeout finished');
}, 0);

Promise.resolve().then(() => {
  console.log('2: Microtask promise resolved');
});

queueMicrotask(() => {
  console.log('3: Microtask queueMicrotask');
});

console.log('1.5: Synchronous end');`,
            },
            resources: [
              { title: 'Jake Archibald: Tasks, microtasks, queues and schedules', url: 'https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/', type: 'article' },
            ],
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'crs_react',
    trackId: 'trk_web_dev',
    title: 'Enterprise React & State Architecture',
    slug: 'enterprise-react-state-architecture',
    description: 'Component architecture, custom hooks, performant re-renders, Context API, and resilient API data fetching.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Elena Rostova',
    instructorTitle: 'Frontend Lead & Core Maintainer',
    isPublished: true,
    isArchived: false,
    status: 'published',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    weeks: [
      {
        id: 'wk_react_1',
        weekNumber: 1,
        title: 'Component Composition & Custom Hooks',
        description: 'Separating business logic from render presentation using clean hook composition.',
        unlockRequiresTaskApproval: true, // Gated!
        taskId: 'tsk_react_custom_hook',
        lessons: [
          {
            id: 'lsn_react_101',
            title: 'Custom Hooks for Data Fetching & Cache Management',
            description: 'Building resilient hooks with loading states, error boundaries, and abort controllers.',
            durationMinutes: 40,
            videoEmbedUrl: 'https://www.youtube.com/embed/6ThXsUwLWvc',
            notesMarkdown: `### The Golden Rules of Custom Hooks

- Custom hooks must start with \`use\`.
- Keep render components purely presentational; encapsulate effect lifecycles inside dedicated hooks.
- Always handle cancellation using \`AbortController\` to prevent race conditions.`,
            codeSnippet: {
              language: 'typescript',
              filename: 'useAsyncData.ts',
              code: `import { useState, useEffect } from 'react';

export function useAsyncData<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetcher(controller.signal)
      .then(res => {
        setData(res);
        setError(null);
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, deps);

  return { data, loading, error };
}`,
            },
            resources: [
              { title: 'React Official Documentation on Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', type: 'doc' },
            ],
            order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'crs_workers_d1',
    trackId: 'trk_cloud_edge',
    title: 'Cloudflare Workers & D1 Edge Relational DB',
    slug: 'cloudflare-workers-d1-edge-relational-db',
    description: 'Build sub-millisecond edge APIs with Cloudflare Workers, TypeScript, and SQLite-backed Cloudflare D1.',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
    instructorName: 'Rauf (Admin)',
    instructorTitle: 'DevOps & Edge Infrastructure Architect',
    isPublished: true,
    isArchived: false,
    status: 'published',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
    weeks: [
      {
        id: 'wk_cf_1',
        weekNumber: 1,
        title: 'Edge Runtime & D1 Schema Modeling',
        description: 'Architecting D1 tables, parameter bindings, and worker route dispatching.',
        unlockRequiresTaskApproval: false,
        lessons: [
          {
            id: 'lsn_cf_101',
            title: 'D1 Relational Storage vs Traditional Centralized Postgres',
            description: 'Why SQLite at the edge radically reduces latency and infrastructure operational overhead.',
            durationMinutes: 30,
            notesMarkdown: `### Cloudflare D1 Architecture

Cloudflare D1 is built on top of SQLite, allowing developers to run queries close to users around the globe.
- Full SQL compatibility (SELECT, INSERT, UPDATE, JOINs).
- Transactions and atomic batch operations via \`env.DB.batch()\`.
- Native TypeScript bindings.`,
            resources: [
              { title: 'Cloudflare D1 Documentation', url: 'https://developers.cloudflare.com/d1/', type: 'doc' },
            ],
            order: 1,
          },
        ],
      },
    ],
  },
];

// Seed Tasks
const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk_portfolio_html',
    courseId: 'crs_html_css',
    weekId: 'wk_html_1',
    title: 'Semantic Accessible Portfolio Project',
    description: 'Build a multi-section personal developer portfolio using pure semantic HTML5 and responsive CSS Grid.',
    instructions: `### Requirements:
1. Valid HTML5 syntax with zero accessibility violations (use Lighthouse Accessibility score >= 95).
2. Proper heading hierarchy (exactly one h1).
3. Contact form with accessible labels, input validations, and error messaging states.
4. Responsive navigation bar that collapses gracefully on mobile screens.
5. Provide:
   - **GitHub Repository URL**
   - **Live Production URL** (Cloudflare Pages, Vercel, or GitHub Pages)
   - **Documentation link** (README walkthrough)`,
    deadline: '2026-11-15T23:59:59Z',
    maxMarks: 100,
    allowLateSubmission: false,
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'tsk_responsive_component',
    courseId: 'crs_html_css',
    weekId: 'wk_html_2',
    title: 'Adaptive Design Tokens & Dashboard UI',
    description: 'Implement a responsive metrics card system with light/dark theme switching driven purely by CSS custom properties.',
    instructions: `### Deliverables:
- Live Demo link with responsive grid testing.
- GitHub repository with modular component structure.
- Adhere strictly to the Problos design guidelines (#009166 brand green, #FAF9F6 cream background).`,
    deadline: '2026-11-25T23:59:59Z',
    maxMarks: 100,
    allowLateSubmission: true,
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'tsk_async_fetcher',
    courseId: 'crs_javascript',
    weekId: 'wk_js_1',
    title: 'Resilient GitHub Search API Client with Debounce',
    description: 'Create an asynchronous API client with custom debounce, request cancellation, and retry logic.',
    instructions: `Implement an input search bar that searches repositories via the GitHub Public API.
Must include:
- AbortController cancellation on keystroke.
- Debounce timer of 350ms.
- Graceful offline / error handling display.`,
    maxMarks: 100,
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'tsk_react_custom_hook',
    courseId: 'crs_react',
    weekId: 'wk_react_1',
    title: 'Full-Stack Data Grid Hook with LocalStorage Cache',
    description: 'Write a TypeScript custom hook `useDataGrid` that provides pagination, sorting, search filter, and persistence.',
    instructions: `Deliver a clean demonstration app showcasing table filtering and sorting with 50+ mock records.`,
    deadline: '2026-12-05T23:59:59Z',
    maxMarks: 100,
    createdAt: '2026-02-18T00:00:00Z',
  },
];

// Seed Submissions
const INITIAL_SUBMISSIONS: TaskSubmission[] = [
  {
    id: 'sub_alex_portfolio',
    taskId: 'tsk_portfolio_html',
    courseId: 'crs_html_css',
    learnerId: 'usr_intern_1',
    learnerName: 'Alex Chen',
    learnerEmail: 'alex.chen@problos.dev',
    currentStatus: 'approved',
    latestMarks: 96,
    latestFeedback: 'Exceptional semantic structure and clean responsive grid. WCAG contrast tests passed with 100/100.',
    createdAt: '2026-02-18T14:20:00Z',
    updatedAt: '2026-02-20T16:00:00Z',
    attempts: [
      {
        id: 'att_1_alex',
        attemptNumber: 1,
        submittedAt: '2026-02-18T14:20:00Z',
        githubUrl: 'https://github.com/alexchen/problos-portfolio',
        liveDemoUrl: 'https://alexchen-problos.pages.dev',
        documentationUrl: 'https://github.com/alexchen/problos-portfolio#readme',
        notes: 'Implemented with HTML5 semantic tags and custom CSS Grid without third-party frameworks.',
        status: 'approved',
        marksAwarded: 96,
        feedback: 'Exceptional semantic structure and clean responsive grid. WCAG contrast tests passed with 100/100.',
        reviewedBy: 'Siyab (Admin)',
        reviewedAt: '2026-02-20T16:00:00Z',
      },
    ],
  },
  {
    id: 'sub_sarah_portfolio',
    taskId: 'tsk_portfolio_html',
    courseId: 'crs_html_css',
    learnerId: 'usr_intern_2',
    learnerName: 'Sarah Jenkins',
    learnerEmail: 'sarah.jenkins@problos.dev',
    currentStatus: 'revision_requested',
    latestMarks: 65,
    latestFeedback: 'Good start on layout, but the mobile navigation breaks at 375px viewport and you used multiple <h1> tags. Please resolve and resubmit.',
    createdAt: '2026-02-22T09:15:00Z',
    updatedAt: '2026-02-23T10:00:00Z',
    attempts: [
      {
        id: 'att_1_sarah',
        attemptNumber: 1,
        submittedAt: '2026-02-22T09:15:00Z',
        githubUrl: 'https://github.com/sjenkins/portfolio-v1',
        liveDemoUrl: 'https://sjenkins-portfolio.vercel.app',
        documentationUrl: 'https://github.com/sjenkins/portfolio-v1/blob/main/DESIGN.md',
        notes: 'First draft of my portfolio submission.',
        status: 'revision_requested',
        marksAwarded: 65,
        feedback: 'Good start on layout, but the mobile navigation breaks at 375px viewport and you used multiple <h1> tags. Please resolve and resubmit.',
        reviewedBy: 'Rauf (Admin)',
        reviewedAt: '2026-02-23T10:00:00Z',
      },
    ],
  },
  {
    id: 'sub_alex_component',
    taskId: 'tsk_responsive_component',
    courseId: 'crs_html_css',
    learnerId: 'usr_intern_1',
    learnerName: 'Alex Chen',
    learnerEmail: 'alex.chen@problos.dev',
    currentStatus: 'pending',
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
    attempts: [
      {
        id: 'att_2_alex_comp',
        attemptNumber: 1,
        submittedAt: '2026-03-01T11:00:00Z',
        githubUrl: 'https://github.com/alexchen/tokens-dashboard',
        liveDemoUrl: 'https://tokens-dashboard.pages.dev',
        documentationUrl: 'https://github.com/alexchen/tokens-dashboard#tokens',
        notes: 'Submitted the Week 2 component project. Ready for review.',
        status: 'pending',
      },
    ],
  },
];

// Seed Learner Progress
const INITIAL_PROGRESS: LearnerProgress[] = [
  {
    userId: 'usr_intern_1',
    courseId: 'crs_html_css',
    completedLessonIds: ['lsn_html_101', 'lsn_html_102', 'lsn_html_201'],
    currentLessonId: 'lsn_html_201',
    lastAccessedAt: '2026-03-01T11:00:00Z',
    completedAt: '2026-03-01T12:00:00Z',
  },
  {
    userId: 'usr_intern_1',
    courseId: 'crs_javascript',
    completedLessonIds: ['lsn_js_101'],
    currentLessonId: 'lsn_js_101',
    lastAccessedAt: '2026-03-02T15:30:00Z',
  },
  {
    userId: 'usr_intern_2',
    courseId: 'crs_html_css',
    completedLessonIds: ['lsn_html_101'],
    currentLessonId: 'lsn_html_102',
    lastAccessedAt: '2026-02-22T09:00:00Z',
  },
];

// Seed Certificates
const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'PRB-2026-WD-0481',
    recipientId: 'usr_intern_1',
    recipientName: 'Alex Chen',
    recipientEmail: 'alex.chen@problos.dev',
    courseOrTrackTitle: 'Semantic HTML5 & Modern CSS Architecture',
    type: 'course',
    issueDate: '2026-03-02',
    issuerName: 'Siyab (Admin)',
    issuerTitle: 'Head of Engineering Education, Problos',
    gradeOrMarks: 'Grade: A (96%)',
    isRevoked: false,
    certificateFileUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'PRB-2025-ARCH-0012',
    recipientId: 'usr_intern_old',
    recipientName: 'Jordan Vance (Revoked Example)',
    recipientEmail: 'jordan.vance@example.com',
    courseOrTrackTitle: 'Modern Full-Stack Web Development',
    type: 'track',
    issueDate: '2025-11-15',
    issuerName: 'Rauf (Admin)',
    issuerTitle: 'Director of Platform Engineering, Problos',
    isRevoked: true,
    revokedAt: '2026-01-10T12:00:00Z',
    revocationReason: 'Academic policy violation & unauthorized code submission identified during audit.',
  },
];

// Seed Announcements
const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_welcome',
    title: 'Welcome to Problos LMS Cohort 2026',
    content: 'Welcome to all interns! Your tracks are configured. Please complete your profile and begin with your assigned course syllabus. All assignments must adhere to Problos design and accessibility standards.',
    authorName: 'Siyab (Admin)',
    targetType: 'all',
    priority: 'normal',
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'ann_task_rule',
    title: 'Important: Task Approval Required to Unlock Week 2 Modules',
    content: 'For courses with gated modules (such as Semantic HTML and Enterprise React), the subsequent week remains locked until an admin reviews and approves your task submission. Submissions with revision requests will not unlock the next module.',
    authorName: 'Rauf (Admin)',
    targetType: 'track',
    targetTrackId: 'trk_web_dev',
    priority: 'important',
    createdAt: '2026-02-16T14:00:00Z',
  },
];

// Seed Activity Logs
const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-01-05T00:00:00Z',
    adminId: 'usr_admin_1',
    adminName: 'Siyab (Admin)',
    action: 'Created Track',
    details: 'Created "Modern Full-Stack Web Development" track with 3 initial courses.',
    targetType: 'track',
    targetId: 'trk_web_dev',
  },
  {
    id: 'log_2',
    timestamp: '2026-02-10T10:00:00Z',
    adminId: 'usr_admin_2',
    adminName: 'Rauf (Admin)',
    action: 'Created Intern Account',
    details: 'Provisioned intern account for Alex Chen (alex.chen@problos.dev).',
    targetType: 'intern',
    targetId: 'usr_intern_1',
  },
  {
    id: 'log_3',
    timestamp: '2026-02-20T16:00:00Z',
    adminId: 'usr_admin_1',
    adminName: 'Siyab (Admin)',
    action: 'Approved Submission',
    details: 'Approved Alex Chen submission for "Semantic Accessible Portfolio Project" (Marks: 96/100).',
    targetType: 'submission',
    targetId: 'sub_alex_portfolio',
  },
  {
    id: 'log_4',
    timestamp: '2026-03-02T10:15:00Z',
    adminId: 'usr_admin_1',
    adminName: 'Siyab (Admin)',
    action: 'Issued Certificate',
    details: 'Issued Certificate PRB-2026-WD-0481 to Alex Chen for Semantic HTML5 & Modern CSS Architecture.',
    targetType: 'certificate',
    targetId: 'PRB-2026-WD-0481',
  },
];

const INITIAL_OVERRIDES: UnlockOverride[] = [];

// Persistence Engine
class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  constructor() {
    this.initIfEmpty();
  }

  private initIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRACKS)) {
      this.setItem(STORAGE_KEYS.TRACKS, INITIAL_TRACKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
      this.setItem(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      this.setItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      this.setItem(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
      this.setItem(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
      this.setItem(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      this.setItem(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.OVERRIDES)) {
      this.setItem(STORAGE_KEYS.OVERRIDES, INITIAL_OVERRIDES);
    }
  }

  // Users
  getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  // Tracks
  getTracks(): LearningTrack[] {
    return this.getItem<LearningTrack[]>(STORAGE_KEYS.TRACKS, INITIAL_TRACKS);
  }

  getTrackById(id: string): LearningTrack | undefined {
    return this.getTracks().find(t => t.id === id);
  }

  saveTrack(track: LearningTrack): void {
    const tracks = this.getTracks();
    const index = tracks.findIndex(t => t.id === track.id);
    if (index >= 0) {
      tracks[index] = track;
    } else {
      tracks.push(track);
    }
    this.setItem(STORAGE_KEYS.TRACKS, tracks);
  }

  // Courses
  getCourses(): Course[] {
    return this.getItem<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  }

  getCourseById(id: string): Course | undefined {
    return this.getCourses().find(c => c.id === id);
  }

  saveCourse(course: Course): void {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    this.setItem(STORAGE_KEYS.COURSES, courses);
  }

  // Tasks
  getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  getTaskById(id: string): Task | undefined {
    return this.getTasks().find(t => t.id === id);
  }

  getTasksByCourseId(courseId: string): Task[] {
    return this.getTasks().filter(t => t.courseId === courseId);
  }

  saveTask(task: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  // Submissions
  getSubmissions(): TaskSubmission[] {
    return this.getItem<TaskSubmission[]>(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  }

  getSubmissionById(id: string): TaskSubmission | undefined {
    return this.getSubmissions().find(s => s.id === id);
  }

  getSubmissionsByLearnerId(learnerId: string): TaskSubmission[] {
    return this.getSubmissions().filter(s => s.learnerId === learnerId);
  }

  getSubmissionForLearnerAndTask(learnerId: string, taskId: string): TaskSubmission | undefined {
    return this.getSubmissions().find(s => s.learnerId === learnerId && s.taskId === taskId);
  }

  saveSubmission(submission: TaskSubmission): void {
    const submissions = this.getSubmissions();
    const index = submissions.findIndex(s => s.id === submission.id);
    if (index >= 0) {
      submissions[index] = submission;
    } else {
      submissions.push(submission);
    }
    this.setItem(STORAGE_KEYS.SUBMISSIONS, submissions);
  }

  // Progress
  getProgress(userId: string, courseId: string): LearnerProgress {
    const list = this.getItem<LearnerProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    const existing = list.find(p => p.userId === userId && p.courseId === courseId);
    if (existing) return existing;

    const newProgress: LearnerProgress = {
      userId,
      courseId,
      completedLessonIds: [],
      lastAccessedAt: new Date().toISOString(),
    };
    return newProgress;
  }

  saveProgress(progress: LearnerProgress): void {
    const list = this.getItem<LearnerProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
    const index = list.findIndex(p => p.userId === progress.userId && p.courseId === progress.courseId);
    if (index >= 0) {
      list[index] = progress;
    } else {
      list.push(progress);
    }
    this.setItem(STORAGE_KEYS.PROGRESS, list);
  }

  getAllProgress(): LearnerProgress[] {
    return this.getItem<LearnerProgress[]>(STORAGE_KEYS.PROGRESS, INITIAL_PROGRESS);
  }

  // Certificates
  getCertificates(): Certificate[] {
    return this.getItem<Certificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  }

  getCertificateById(id: string): Certificate | undefined {
    return this.getCertificates().find(c => c.id.toLowerCase().trim() === id.toLowerCase().trim());
  }

  getCertificatesByLearnerId(learnerId: string): Certificate[] {
    return this.getCertificates().filter(c => c.recipientId === learnerId);
  }

  saveCertificate(cert: Certificate): void {
    const list = this.getCertificates();
    const index = list.findIndex(c => c.id === cert.id);
    if (index >= 0) {
      list[index] = cert;
    } else {
      list.push(cert);
    }
    this.setItem(STORAGE_KEYS.CERTIFICATES, list);
  }

  // Announcements
  getAnnouncements(): Announcement[] {
    return this.getItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  }

  saveAnnouncement(ann: Announcement): void {
    const list = this.getAnnouncements();
    const index = list.findIndex(a => a.id === ann.id);
    if (index >= 0) {
      list[index] = ann;
    } else {
      list.unshift(ann);
    }
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    this.setItem(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }

  // Activity Logs
  getLogs(): ActivityLog[] {
    return this.getItem<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      ...log,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.LOGS, logs);
  }

  // Overrides
  getOverrides(): UnlockOverride[] {
    return this.getItem<UnlockOverride[]>(STORAGE_KEYS.OVERRIDES, INITIAL_OVERRIDES);
  }

  hasUnlockOverride(learnerId: string, courseId: string, weekId: string): boolean {
    return this.getOverrides().some(
      o => o.learnerId === learnerId && o.courseId === courseId && o.weekId === weekId
    );
  }

  saveOverride(override: UnlockOverride): void {
    const overrides = this.getOverrides();
    overrides.push(override);
    this.setItem(STORAGE_KEYS.OVERRIDES, overrides);
  }

  removeOverride(learnerId: string, courseId: string, weekId: string): void {
    const overrides = this.getOverrides().filter(
      o => !(o.learnerId === learnerId && o.courseId === courseId && o.weekId === weekId)
    );
    this.setItem(STORAGE_KEYS.OVERRIDES, overrides);
  }

  // Reset to initial demo database
  resetDatabase(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.TRACKS);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICATES);
    localStorage.removeItem(STORAGE_KEYS.ANNOUNCEMENTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.OVERRIDES);
    this.initIfEmpty();
  }

  // Export full JSON backup
  exportJsonBackup(): string {
    const data = {
      users: this.getUsers(),
      tracks: this.getTracks(),
      courses: this.getCourses(),
      tasks: this.getTasks(),
      submissions: this.getSubmissions(),
      progress: this.getAllProgress(),
      certificates: this.getCertificates(),
      announcements: this.getAnnouncements(),
      logs: this.getLogs(),
      overrides: this.getOverrides(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }
}

export const storage = new StorageService();
