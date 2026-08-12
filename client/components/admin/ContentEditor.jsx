'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { LIMITS, COUNTS } from '../../lib/contentLimits';
import { DEFAULT_CONTENT } from '../../lib/defaultContent';

function updateAt(array, index, updater) {
  return array.map((item, i) => (i === index ? updater(item) : item));
}
function removeAt(array, index) {
  return array.filter((_, i) => i !== index);
}

const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '10.5px',
  letterSpacing: '0.08em',
  color: 'var(--ink-faint)',
  textTransform: 'uppercase',
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px',
};

function Counter({ value, max }) {
  const near = value.length > max * 0.9;
  return (
    <span style={{ color: near ? 'var(--accent-soft)' : 'var(--ink-faint)', fontSize: '10px', textTransform: 'none', letterSpacing: 0 }}>
      {value.length}/{max}
    </span>
  );
}

function TextField({ label, value, onChange, maxLength }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>
        <span>{label}</span>
        {maxLength && <Counter value={value} max={maxLength} />}
      </label>
      <input
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: "'Inter', sans-serif", fontSize: '14px', padding: '11px 14px', borderRadius: '2px' }}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, maxLength, rows = 3 }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>
        <span>{label}</span>
        {maxLength && <Counter value={value} max={maxLength} />}
      </label>
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', background: 'var(--panel)', border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: "'Inter', sans-serif", fontSize: '14px', padding: '11px 14px', borderRadius: '2px', resize: 'vertical' }}
      />
    </div>
  );
}

function ChipButton({ children, onClick, danger, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.05em',
        padding: '7px 12px',
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        background: 'transparent',
        border: `1px solid ${danger ? 'rgba(255,77,77,0.35)' : 'var(--line-strong)'}`,
        color: danger ? '#ff8080' : 'var(--ink)',
        // FIX: global.css inherits `word-break: break-word` down from html/body,
        // which collapses a flex child's natural minimum width down to ~1 character.
        // When this button sits next to a `flex:1` input (e.g. "Remove group" beside
        // the group-title input) there's no room for both on narrow screens, so the
        // flexbox algorithm shrank the button instead of the input — folding its
        // label into a vertical column, one letter per line. flexShrink:0 tells it
        // to hold its natural width instead; whiteSpace:nowrap is a second guard so
        // the text itself never wraps even if something squeezes it in the future.
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '4px', padding: '26px', marginBottom: '24px' }}>
      <div className="serif" style={{ fontSize: '1.2rem', marginBottom: '18px', color: 'var(--accent-soft)' }}>{title}</div>
      {children}
    </div>
  );
}

// List of plain strings (e.g. skill items) with add/remove, capped at maxCount
function StringListEditor({ items, onChange, maxLength = LIMITS.groupItem, maxCount = COUNTS.categoryItems }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={item}
            maxLength={maxLength}
            onChange={(e) => onChange(updateAt(items, i, () => e.target.value))}
            style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
          />
          <ChipButton danger onClick={() => onChange(removeAt(items, i))}>✕</ChipButton>
        </div>
      ))}
      <ChipButton disabled={items.length >= maxCount} onClick={() => onChange([...items, ''])}>
        + Add item ({items.length}/{maxCount})
      </ChipButton>
    </div>
  );
}

// List of {title, items[]} groups — used by whatIDo.categories, technicalSkills, stack.groups
function GroupListEditor({ groups, onChange, maxGroups, maxItems = COUNTS.categoryItems }) {
  return (
    <div>
      {groups.map((g, i) => (
        <div key={i} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', alignItems: 'center' }}>
            <input
              type="text"
              value={g.title}
              maxLength={LIMITS.groupTitle}
              onChange={(e) => onChange(updateAt(groups, i, (item) => ({ ...item, title: e.target.value })))}
              placeholder="Group title"
              style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: "'Fraunces', serif", fontSize: '15px', padding: '9px 12px', borderRadius: '2px' }}
            />
            <ChipButton danger onClick={() => onChange(removeAt(groups, i))}>Remove group</ChipButton>
          </div>
          <div style={{ textAlign: 'right', marginBottom: '8px' }}><Counter value={g.title} max={LIMITS.groupTitle} /></div>
          <StringListEditor
            items={g.items}
            maxLength={LIMITS.groupItem}
            maxCount={maxItems}
            onChange={(newItems) => onChange(updateAt(groups, i, (item) => ({ ...item, items: newItems })))}
          />
        </div>
      ))}
      <ChipButton disabled={groups.length >= maxGroups} onClick={() => onChange([...groups, { title: 'New Group', items: [] }])}>
        + Add group ({groups.length}/{maxGroups})
      </ChipButton>
    </div>
  );
}

export default function ContentEditor() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/content');
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setContent({ ...DEFAULT_CONTENT, ...data.content });
      } catch {
        setLoadError("Couldn't load site content. Is the backend running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setSaveError(false);
    setSaveStatus('Saving…');
    try {
      const res = await apiFetch('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSaveStatus(data?.error || "Couldn't save — please check your inputs.");
        setSaveError(true);
        return;
      }
      setSaveStatus('Saved — changes are live now.');
    } catch {
      setSaveStatus("Couldn't reach the server. Try again in a moment.");
      setSaveError(true);
    } finally {
      setSaving(false);
      if (!saveError) setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  if (loading) return <div className="empty-state">Loading site content…</div>;
  if (loadError) return <div className="empty-state">{loadError}</div>;
  if (!content) return null;

  const set = (key, value) => setContent((c) => ({ ...c, [key]: value }));
  const setNested = (key, subKey, value) => setContent((c) => ({ ...c, [key]: { ...c[key], [subKey]: value } }));

  const SaveBar = () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      <span className={`form-status${saveError ? ' error' : ''}`} style={{ minHeight: 'auto', maxWidth: '420px', textAlign: 'right' }}>{saveStatus}</span>
      <button className="btn btn-solid" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ position: 'sticky', top: '0', zIndex: 5, background: 'var(--bg)', paddingBottom: '16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--ink-dim)', fontSize: '13px' }}>Edit anything below, then save. Changes go live immediately — no redeploy needed. Every field has a character limit so nothing can break the layout.</p>
        <SaveBar />
      </div>

      <SectionCard title="Hero">
        <TextField label="Kicker line" value={content.hero.kicker} maxLength={LIMITS.kicker} onChange={(v) => setNested('hero', 'kicker', v)} />
        <TextField label="Name — first line" value={content.hero.nameFirstLine} maxLength={LIMITS.name} onChange={(v) => setNested('hero', 'nameFirstLine', v)} />
        <TextField label="Name — accent word" value={content.hero.nameAccent} maxLength={LIMITS.name} onChange={(v) => setNested('hero', 'nameAccent', v)} />
        <TextField label="Name — rest" value={content.hero.nameRest} maxLength={LIMITS.name} onChange={(v) => setNested('hero', 'nameRest', v)} />
        <TextAreaField label="Intro line" value={content.hero.lede} maxLength={LIMITS.lede} onChange={(v) => setNested('hero', 'lede', v)} />
      </SectionCard>

      <SectionCard title='"What I Do" section (Home page)'>
        <label style={labelStyle}><span>Paragraphs</span><span>{content.whatIDo.paragraphs.length}/{COUNTS.paragraphs}</span></label>
        {content.whatIDo.paragraphs.map((p, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={p}
                rows={2}
                maxLength={LIMITS.paragraph}
                onChange={(e) => setNested('whatIDo', 'paragraphs', updateAt(content.whatIDo.paragraphs, i, () => e.target.value))}
                style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
              />
              <ChipButton danger onClick={() => setNested('whatIDo', 'paragraphs', removeAt(content.whatIDo.paragraphs, i))}>✕</ChipButton>
            </div>
            <div style={{ textAlign: 'right' }}><Counter value={p} max={LIMITS.paragraph} /></div>
          </div>
        ))}
        <ChipButton disabled={content.whatIDo.paragraphs.length >= COUNTS.paragraphs} onClick={() => setNested('whatIDo', 'paragraphs', [...content.whatIDo.paragraphs, ''])}>
          + Add paragraph
        </ChipButton>

        <div style={{ marginTop: '18px' }}>
          <TextField label="Tagline" value={content.whatIDo.tagline} maxLength={LIMITS.tagline} onChange={(v) => setNested('whatIDo', 'tagline', v)} />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={labelStyle}><span>Categories</span></label>
          <GroupListEditor groups={content.whatIDo.categories} maxGroups={COUNTS.categories} onChange={(v) => setNested('whatIDo', 'categories', v)} />
        </div>
      </SectionCard>

      <SectionCard title="Technical Skills (Home page)">
        <GroupListEditor groups={technicalSkillsSafe(content)} maxGroups={COUNTS.technicalSkillGroups} onChange={(v) => set('technicalSkills', v)} />
      </SectionCard>

      <SectionCard title="About page">
        <TextAreaField label="Intro line" value={content.about.lede} maxLength={LIMITS.lede} onChange={(v) => setNested('about', 'lede', v)} />

        <label style={labelStyle}><span>Paragraphs</span><span>{content.about.paragraphs.length}/{COUNTS.paragraphs}</span></label>
        {content.about.paragraphs.map((p, i) => (
          <div key={i} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={p}
                rows={3}
                maxLength={LIMITS.paragraph}
                onChange={(e) => setNested('about', 'paragraphs', updateAt(content.about.paragraphs, i, () => e.target.value))}
                style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
              />
              <ChipButton danger onClick={() => setNested('about', 'paragraphs', removeAt(content.about.paragraphs, i))}>✕</ChipButton>
            </div>
            <div style={{ textAlign: 'right' }}><Counter value={p} max={LIMITS.paragraph} /></div>
          </div>
        ))}
        <ChipButton disabled={content.about.paragraphs.length >= COUNTS.paragraphs} onClick={() => setNested('about', 'paragraphs', [...content.about.paragraphs, ''])}>
          + Add paragraph
        </ChipButton>

        <div style={{ marginTop: '18px' }}>
          <label style={labelStyle}><span>Stat boxes</span><span>{content.about.stats.length}/{COUNTS.stats}</span></label>
          {content.about.stats.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="text" value={s.n} maxLength={LIMITS.statNumber} placeholder="Number (e.g. 4+)" onChange={(e) => setNested('about', 'stats', updateAt(content.about.stats, i, (item) => ({ ...item, n: e.target.value })))} style={{ width: '120px', flexShrink: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <input type="text" value={s.l} maxLength={LIMITS.statLabel} placeholder="Label" onChange={(e) => setNested('about', 'stats', updateAt(content.about.stats, i, (item) => ({ ...item, l: e.target.value })))} style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <ChipButton danger onClick={() => setNested('about', 'stats', removeAt(content.about.stats, i))}>✕</ChipButton>
            </div>
          ))}
          <ChipButton disabled={content.about.stats.length >= COUNTS.stats} onClick={() => setNested('about', 'stats', [...content.about.stats, { n: '', l: '' }])}>+ Add stat</ChipButton>
        </div>

        <div style={{ marginTop: '18px' }}>
          <label style={labelStyle}><span>Info rows (right column)</span><span>{content.about.sideRows.length}/{COUNTS.sideRows}</span></label>
          {content.about.sideRows.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input type="text" value={row.label} maxLength={LIMITS.sideRowLabel} placeholder="Label" onChange={(e) => setNested('about', 'sideRows', updateAt(content.about.sideRows, i, (item) => ({ ...item, label: e.target.value })))} style={{ width: '160px', flexShrink: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <input type="text" value={row.value} maxLength={LIMITS.sideRowValue} placeholder="Value" onChange={(e) => setNested('about', 'sideRows', updateAt(content.about.sideRows, i, (item) => ({ ...item, value: e.target.value })))} style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <ChipButton danger onClick={() => setNested('about', 'sideRows', removeAt(content.about.sideRows, i))}>✕</ChipButton>
            </div>
          ))}
          <ChipButton disabled={content.about.sideRows.length >= COUNTS.sideRows} onClick={() => setNested('about', 'sideRows', [...content.about.sideRows, { label: '', value: '' }])}>+ Add row</ChipButton>
        </div>
      </SectionCard>

      <SectionCard title={`Education page — timeline (${content.education.entries.length}/${COUNTS.education})`}>
        <TextAreaField label="Intro line" value={content.education.lede} maxLength={LIMITS.eduLede} onChange={(v) => setNested('education', 'lede', v)} rows={2} />
        <p style={{ fontSize: '11px', color: 'var(--ink-faint)', marginBottom: '14px' }}>
          Entries render top to bottom in the order you add them here — put your earliest schooling first and your current program last.
          Check &quot;Currently studying&quot; on one entry to show it with the glowing pulse and an &quot;Ongoing&quot; badge instead of its date range.
        </p>
        {content.education.entries.map((entry, i) => (
          <div key={entry.id || i} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input type="text" value={entry.institution} maxLength={LIMITS.eduInstitution} placeholder="Institution name" onChange={(e) => setNested('education', 'entries', updateAt(content.education.entries, i, (item) => ({ ...item, institution: e.target.value })))} style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: "'Fraunces', serif", fontSize: '15px', padding: '8px 12px', borderRadius: '2px' }} />
              <ChipButton danger onClick={() => setNested('education', 'entries', removeAt(content.education.entries, i))}>Remove</ChipButton>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input type="text" value={entry.program} maxLength={LIMITS.eduProgram} placeholder="Program (e.g. BS Artificial Intelligence)" onChange={(e) => setNested('education', 'entries', updateAt(content.education.entries, i, (item) => ({ ...item, program: e.target.value })))} style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <input type="text" value={entry.period} maxLength={LIMITS.eduPeriod} placeholder="Years (e.g. 2021 — 2023)" onChange={(e) => setNested('education', 'entries', updateAt(content.education.entries, i, (item) => ({ ...item, period: e.target.value })))} style={{ width: '180px', flexShrink: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
            </div>
            <textarea value={entry.desc} rows={2} maxLength={LIMITS.eduDesc} placeholder="Short description" onChange={(e) => setNested('education', 'entries', updateAt(content.education.entries, i, (item) => ({ ...item, desc: e.target.value })))} style={{ width: '100%', marginBottom: '4px', background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
            <div style={{ textAlign: 'right', marginBottom: '10px' }}><Counter value={entry.desc} max={LIMITS.eduDesc} /></div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" value={entry.score || ''} maxLength={LIMITS.eduScore} placeholder="Score / scholarship (optional, e.g. 90%)" onChange={(e) => setNested('education', 'entries', updateAt(content.education.entries, i, (item) => ({ ...item, score: e.target.value })))} style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--ink-dim)', whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={!!entry.current}
                  onChange={(e) => setNested('education', 'entries', updateAt(content.education.entries, i, (item) => ({ ...item, current: e.target.checked })))}
                />
                Currently studying
              </label>
            </div>
          </div>
        ))}
        <ChipButton
          disabled={content.education.entries.length >= COUNTS.education}
          onClick={() => setNested('education', 'entries', [
            ...content.education.entries,
            { id: `edu-${Date.now()}`, institution: '', program: '', period: '', current: false, score: '', desc: '' },
          ])}
        >
          + Add entry
        </ChipButton>
      </SectionCard>

      <SectionCard title={`Work page — projects (${content.work.projects.length}/${COUNTS.projects})`}>
        <TextAreaField label="Intro line" value={content.work.lede} maxLength={LIMITS.lede} onChange={(v) => setNested('work', 'lede', v)} rows={2} />
        {content.work.projects.map((proj, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: '3px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <input type="text" value={proj.idx} maxLength={LIMITS.projectIdx} placeholder="01" onChange={(e) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, idx: e.target.value })))} style={{ width: '60px', flexShrink: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
              <input type="text" value={proj.name} maxLength={LIMITS.projectName} placeholder="Project name" onChange={(e) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, name: e.target.value })))} style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontFamily: "'Fraunces', serif", fontSize: '15px', padding: '8px 12px', borderRadius: '2px' }} />
              <ChipButton danger onClick={() => setNested('work', 'projects', removeAt(content.work.projects, i))}>Remove</ChipButton>
            </div>
            <input type="text" value={proj.role} maxLength={LIMITS.projectRole} placeholder="Role / subtitle" onChange={(e) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, role: e.target.value })))} style={{ width: '100%', marginTop: '10px', marginBottom: '10px', background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
            <textarea value={proj.desc} rows={3} maxLength={LIMITS.projectDesc} placeholder="Description" onChange={(e) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, desc: e.target.value })))} style={{ width: '100%', marginBottom: '4px', background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }} />
            <div style={{ textAlign: 'right', marginBottom: '10px' }}><Counter value={proj.desc} max={LIMITS.projectDesc} /></div>

            <label style={labelStyle}><span>GitHub URL</span></label>
            <input
              type="text"
              value={proj.github || ''}
              maxLength={LIMITS.projectGithub}
              placeholder="https://github.com/yourname/project"
              onChange={(e) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, github: e.target.value })))}
              style={{ width: '100%', marginBottom: '10px', background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
            />

            <label style={labelStyle}><span>Live demo URL</span></label>
            <input
              type="text"
              value={proj.live || ''}
              maxLength={LIMITS.projectLive}
              placeholder="https://your-project.vercel.app"
              onChange={(e) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, live: e.target.value })))}
              style={{ width: '100%', marginBottom: '10px', background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
            />
            <p style={{ fontSize: '11px', color: 'var(--ink-faint)', marginBottom: '10px' }}>
              Fill either or both URLs to show action buttons on the project card. Leave blank to show no buttons.
            </p>

            <label style={labelStyle}><span>Tags</span></label>
            <StringListEditor
              items={proj.tags}
              maxLength={LIMITS.tag}
              maxCount={COUNTS.projectTags}
              onChange={(newTags) => setNested('work', 'projects', updateAt(content.work.projects, i, (p) => ({ ...p, tags: newTags })))}
            />
          </div>
        ))}
        <ChipButton
          disabled={content.work.projects.length >= COUNTS.projects}
          onClick={() => setNested('work', 'projects', [
            ...content.work.projects,
            { idx: String(content.work.projects.length + 1).padStart(2, '0'), name: 'New Project', role: '', desc: '', tags: [], github: '', live: '', link: '' },
          ])}
        >
          + Add project
        </ChipButton>
      </SectionCard>

      <SectionCard title="Stack page">
        <TextAreaField label="Intro line" value={content.stack.lede} maxLength={LIMITS.lede} onChange={(v) => setNested('stack', 'lede', v)} rows={2} />
        <GroupListEditor groups={content.stack.groups} maxGroups={COUNTS.stackGroups} onChange={(v) => setNested('stack', 'groups', v)} />
      </SectionCard>

      <SectionCard title="Contact page">
        <TextAreaField label="Intro line" value={content.contact.sub} maxLength={LIMITS.contactSub} onChange={(v) => setNested('contact', 'sub', v)} />
      </SectionCard>

      <SectionCard title="Links">
        <TextField label="Email" value={content.links.email} maxLength={LIMITS.email} onChange={(v) => setNested('links', 'email', v)} />
        <TextField label="Resume URL (Google Drive, etc.)" value={content.links.resume} maxLength={LIMITS.resumeUrl} onChange={(v) => setNested('links', 'resume', v)} />

        <div style={{ marginTop: '20px' }}>
          <label style={labelStyle}><span>Social / other links</span><span>{content.links.social.length}/{COUNTS.socialLinks}</span></label>
          <p style={{ fontSize: '11px', color: 'var(--ink-faint)', marginBottom: '12px' }}>
            Add as many as you want — Instagram, a second GitHub, a portfolio site, anything.
            Leave the URL blank to show that chip as &quot;coming soon&quot; on the Contact page instead of removing it.
          </p>
          {content.links.social.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={s.label}
                maxLength={LIMITS.socialLabel}
                placeholder="LABEL (e.g. INSTAGRAM)"
                onChange={(e) => setNested('links', 'social', updateAt(content.links.social, i, (item) => ({ ...item, label: e.target.value.toUpperCase() })))}
                style={{ width: '160px', flexShrink: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
              />
              <input
                type="text"
                value={s.url}
                maxLength={LIMITS.socialUrl}
                placeholder="https://..."
                onChange={(e) => setNested('links', 'social', updateAt(content.links.social, i, (item) => ({ ...item, url: e.target.value })))}
                style={{ flex: 1, minWidth: 0, background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--ink)', fontSize: '13px', padding: '8px 12px', borderRadius: '2px' }}
              />
              <ChipButton danger onClick={() => setNested('links', 'social', removeAt(content.links.social, i))}>✕</ChipButton>
            </div>
          ))}
          <ChipButton
            disabled={content.links.social.length >= COUNTS.socialLinks}
            onClick={() => setNested('links', 'social', [...content.links.social, { id: `link-${Date.now()}`, label: '', url: '' }])}
          >
            + Add link ({content.links.social.length}/{COUNTS.socialLinks})
          </ChipButton>
        </div>
      </SectionCard>

      <SaveBar />
    </div>
  );
}

// Guards against an old cached content object (from before technicalSkills
// existed as top-level array) briefly rendering broken — shouldn't happen
// in practice since the backend always returns the full shape, but cheap
// insurance against a blank crash.
function technicalSkillsSafe(content) {
  return Array.isArray(content.technicalSkills) ? content.technicalSkills : [];
}