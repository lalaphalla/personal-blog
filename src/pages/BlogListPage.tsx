import { Link } from 'react-router'
import './BlogListPage.css'

type Post = {
  slug: string
  title: string
  excerpt: string
  date: string
  tag: string
}

const posts: Post[] = [
  {
    slug: 'getting-started-with-react-and-fastapi',
    title: 'Getting Started with React and FastAPI',
    excerpt:
      'How to wire a Vite React frontend to a FastAPI backend and keep the data flow simple.',
    date: '2026-10-20',
    tag: 'Tutorial',
  },
  {
    slug: 'structuring-a-personal-blog',
    title: 'Structuring a Personal Blog',
    excerpt:
      'Pages, routes, and folders: a lightweight layout that stays easy to extend.',
    date: '2026-10-12',
    tag: 'Architecture',
  },
  {
    slug: 'markdown-rendering-in-the-browser',
    title: 'Markdown Rendering in the Browser',
    excerpt:
      'Rendering post content safely with react-markdown, without shipping a full editor.',
    date: '2026-10-03',
    tag: 'Frontend',
  },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function BlogListPage() {
  return (
    <main className="blog-page">
      <header className="blog-header">
        <h1>Blog</h1>
        <p>Notes, guides, and stories about building for the web.</p>
      </header>

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.slug} className="post-card">
            <article>
              <div className="post-meta">
                <span className="post-tag">{post.tag}</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </div>
              <h2>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="post-excerpt">{post.excerpt}</p>
              <Link className="post-more" to={`/blog/${post.slug}`}>
                Read more →
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default BlogListPage
