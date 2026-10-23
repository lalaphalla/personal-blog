export type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  tag: string
  content: string
}

export const posts: Post[] = [
  {
    slug: 'getting-started-with-react-and-fastapi',
    title: 'Getting Started with React and FastAPI',
    excerpt:
      'How to wire a Vite React frontend to a FastAPI backend and keep the data flow simple.',
    date: '2026-10-20',
    tag: 'Tutorial',
    content: `React on the front, FastAPI on the back — both are small to learn and hard to outgrow.

## Why this stack

- **Vite** keeps the frontend feedback loop fast.
- **FastAPI** gives you typed request and response models for free.
- Passing JSON between them is boring, which is exactly what you want.

## Wiring them together

Point Vite's dev server at the API with a small proxy so the browser never sees a CORS error:

- \`/api\` on the frontend dev server forwards to \`http://localhost:8000\`
- FastAPI serves routes under the same \`/api\` prefix in production

## Next steps

Add a \`/api/posts\` endpoint and fetch it with TanStack Query — loading and error states come for free.`,
  },
  {
    slug: 'structuring-a-personal-blog',
    title: 'Structuring a Personal Blog',
    excerpt:
      'Pages, routes, and folders: a lightweight layout that stays easy to extend.',
    date: '2026-10-12',
    tag: 'Architecture',
    content: `A personal blog should be boring to work on. A small, predictable structure gets you there.

## Pages and routes

- \`/blog\` lists every post, newest first.
- \`/blog/:slug\` renders one post.
- Anything unknown redirects back to the list.

## Folders

- \`src/pages\` — one file per route.
- \`src/data\` — post content and helpers.
- \`src/theme\` — design tokens for the whole app.

## Why not a router file with fifty routes

You do not need layout routes, nested outlets, or loaders yet. Add them when a real page needs them, not before.`,
  },
  {
    slug: 'markdown-rendering-in-the-browser',
    title: 'Markdown Rendering in the Browser',
    excerpt:
      'Rendering post content safely with react-markdown, without shipping a full editor.',
    date: '2026-10-03',
    tag: 'Frontend',
    content: `Markdown is the friendliest format for writing posts: plain text in, structured HTML out.

## Why react-markdown

- It does **not** use \`dangerouslySetInnerHTML\`, so raw HTML in a post cannot run scripts.
- Components are replaceable, so you can restyle every element the renderer emits.
- It reads well next to a design system like Material UI.

## Styling the output

The renderer emits plain tags — \`h2\`, \`p\`, \`ul\`, \`pre\`. Style them once on the container with nested selectors instead of wrapping every element by hand.

## Where it fits here

Posts are stored as markdown and rendered on the detail page, so writing stays in plain text and the app owns the presentation.`,
  },
]

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug)
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
