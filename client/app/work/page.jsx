import { getContent } from '../../lib/content';

export const metadata = {
  title: 'Work',
  description: 'Selected work by Turab Rizvi: Amethyst, Campus Freelance Board, Aurum Drive, and a 2048 AI solver.',
};

export default async function WorkPage() {
  const content = await getContent();
  const { work } = content;

  return (
    <>
      <header className="page-hero wrap">
        <p className="kicker">03 — Work</p>
        <h1>
          Selected <span className="accent-italic">work</span>
        </h1>
        <p className="lede">{work.lede}</p>
      </header>

      <section style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <div className="projects reveal">
            {work.projects.map((p) => {
              return (
                <div className="project" key={p.idx}>
                  <div className="project-index">{p.idx}</div>
                  <div>
                    <div className="project-name serif">{p.name}</div>
                    <div className="project-role">{p.role}</div>
                  </div>
                  <div>
                    <p className="project-desc">{p.desc}</p>
                    <div className="tag-row">
                      {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      {p.github && (
                        <a href={p.github} className="btn btn-view" target="_blank" rel="noopener noreferrer">GitHub</a>
                      )}
                      {p.live && (
                        <a href={p.live} className="btn btn-view" target="_blank" rel="noopener noreferrer">Live demo</a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
