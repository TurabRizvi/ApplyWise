const { LIMITS, COUNTS } = require('./contentLimits');

function isStr(v) {
  return typeof v === 'string';
}

/**
 * Hand-rolled validator instead of a schema library — the shape of this
 * content object is fixed and known, so this just walks it directly.
 * Returns { valid: true } or { valid: false, error: '...' } with a
 * message specific enough to actually debug from.
 */
function validateContent(data) {
  const fail = (msg) => ({ valid: false, error: msg });

  if (!data || typeof data !== 'object') return fail('Content must be an object');

  // ---------- hero ----------
  const { hero, whatIDo, technicalSkills, about, work, stack, contact, links } = data;
  if (!hero) return fail('Missing hero section');
  for (const [key, limit] of [
    ['kicker', LIMITS.kicker],
    ['nameFirstLine', LIMITS.name],
    ['nameAccent', LIMITS.name],
    ['nameRest', LIMITS.name],
    ['lede', LIMITS.lede],
  ]) {
    if (!isStr(hero[key])) return fail(`hero.${key} must be a string`);
    if (hero[key].length > limit) return fail(`hero.${key} is too long (max ${limit} characters)`);
  }

  // ---------- whatIDo ----------
  if (!whatIDo || !Array.isArray(whatIDo.paragraphs) || !Array.isArray(whatIDo.categories)) {
    return fail('whatIDo section is malformed');
  }
  if (whatIDo.paragraphs.length > COUNTS.paragraphs) return fail(`Too many "What I Do" paragraphs (max ${COUNTS.paragraphs})`);
  for (const p of whatIDo.paragraphs) {
    if (!isStr(p) || p.length > LIMITS.paragraph) return fail(`A "What I Do" paragraph is too long (max ${LIMITS.paragraph} characters)`);
  }
  if (!isStr(whatIDo.tagline) || whatIDo.tagline.length > LIMITS.tagline) return fail(`whatIDo.tagline is too long (max ${LIMITS.tagline} characters)`);
  const groupError = validateGroups(whatIDo.categories, COUNTS.categories, COUNTS.categoryItems);
  if (groupError) return fail(`whatIDo.categories: ${groupError}`);

  // ---------- technicalSkills ----------
  if (!Array.isArray(technicalSkills)) return fail('technicalSkills must be an array');
  const techError = validateGroups(technicalSkills, COUNTS.technicalSkillGroups, COUNTS.categoryItems);
  if (techError) return fail(`technicalSkills: ${techError}`);

  // ---------- about ----------
  if (!about || !Array.isArray(about.paragraphs) || !Array.isArray(about.stats) || !Array.isArray(about.sideRows)) {
    return fail('about section is malformed');
  }
  if (!isStr(about.lede) || about.lede.length > LIMITS.lede) return fail(`about.lede is too long (max ${LIMITS.lede} characters)`);
  if (about.paragraphs.length > COUNTS.paragraphs) return fail(`Too many About paragraphs (max ${COUNTS.paragraphs})`);
  for (const p of about.paragraphs) {
    if (!isStr(p) || p.length > LIMITS.paragraph) return fail(`An About paragraph is too long (max ${LIMITS.paragraph} characters)`);
  }
  if (about.stats.length > COUNTS.stats) return fail(`Too many stat boxes (max ${COUNTS.stats})`);
  for (const s of about.stats) {
    if (!isStr(s.n) || s.n.length > LIMITS.statNumber) return fail(`A stat number is too long (max ${LIMITS.statNumber} characters)`);
    if (!isStr(s.l) || s.l.length > LIMITS.statLabel) return fail(`A stat label is too long (max ${LIMITS.statLabel} characters)`);
  }
  if (about.sideRows.length > COUNTS.sideRows) return fail(`Too many info rows (max ${COUNTS.sideRows})`);
  for (const r of about.sideRows) {
    if (!isStr(r.label) || r.label.length > LIMITS.sideRowLabel) return fail(`An info row label is too long (max ${LIMITS.sideRowLabel} characters)`);
    if (!isStr(r.value) || r.value.length > LIMITS.sideRowValue) return fail(`An info row value is too long (max ${LIMITS.sideRowValue} characters)`);
  }

  // ---------- education ----------
  const { education } = data;
  if (!education || !Array.isArray(education.entries)) return fail('education section is malformed');
  if (!isStr(education.lede) || education.lede.length > LIMITS.eduLede) return fail(`education.lede is too long (max ${LIMITS.eduLede} characters)`);
  if (education.entries.length > COUNTS.education) return fail(`Too many education entries (max ${COUNTS.education})`);
  for (const e of education.entries) {
    if (!isStr(e.institution) || e.institution.length > LIMITS.eduInstitution) return fail(`An education institution name is missing or too long (max ${LIMITS.eduInstitution} characters)`);
    if (!isStr(e.program) || e.program.length > LIMITS.eduProgram) return fail(`An education program is missing or too long (max ${LIMITS.eduProgram} characters)`);
    if (!isStr(e.period) || e.period.length > LIMITS.eduPeriod) return fail(`An education period is missing or too long (max ${LIMITS.eduPeriod} characters)`);
    if (e.score !== undefined && (!isStr(e.score) || e.score.length > LIMITS.eduScore)) return fail(`An education score is too long (max ${LIMITS.eduScore} characters)`);
    if (!isStr(e.desc) || e.desc.length > LIMITS.eduDesc) return fail(`An education description is missing or too long (max ${LIMITS.eduDesc} characters)`);
  }

  // ---------- work ----------
  if (!work || !Array.isArray(work.projects)) return fail('work section is malformed');
  if (!isStr(work.lede) || work.lede.length > LIMITS.lede) return fail(`work.lede is too long (max ${LIMITS.lede} characters)`);
  if (work.projects.length > COUNTS.projects) return fail(`Too many projects (max ${COUNTS.projects})`);
  for (const p of work.projects) {
    if (!isStr(p.idx) || p.idx.length > LIMITS.projectIdx) return fail(`A project's index is too long (max ${LIMITS.projectIdx} characters)`);
    if (!isStr(p.name) || p.name.length > LIMITS.projectName) return fail(`A project name is too long (max ${LIMITS.projectName} characters)`);
    if (!isStr(p.role) || p.role.length > LIMITS.projectRole) return fail(`A project role is too long (max ${LIMITS.projectRole} characters)`);
    if (!isStr(p.desc) || p.desc.length > LIMITS.projectDesc) return fail(`A project description is too long (max ${LIMITS.projectDesc} characters)`);
    if (p.link !== undefined && (!isStr(p.link) || p.link.length > LIMITS.projectLink)) return fail(`A project link is too long (max ${LIMITS.projectLink} characters)`);
    if (p.link && !/^https?:\/\//i.test(p.link)) return fail(`A project link must start with http:// or https://`);
    if (p.github !== undefined && (!isStr(p.github) || p.github.length > LIMITS.projectGithub)) return fail(`A project GitHub URL is too long (max ${LIMITS.projectGithub} characters)`);
    if (p.github && !/^https?:\/\//i.test(p.github)) return fail(`A project GitHub URL must start with http:// or https://`);
    if (p.live !== undefined && (!isStr(p.live) || p.live.length > LIMITS.projectLive)) return fail(`A project Live URL is too long (max ${LIMITS.projectLive} characters)`);
    if (p.live && !/^https?:\/\//i.test(p.live)) return fail(`A project Live URL must start with http:// or https://`);
    if (!Array.isArray(p.tags) || p.tags.length > COUNTS.projectTags) return fail(`A project has too many tags (max ${COUNTS.projectTags})`);
    for (const t of p.tags) {
      if (!isStr(t) || t.length > LIMITS.tag) return fail(`A project tag is too long (max ${LIMITS.tag} characters)`);
    }
  }

  // ---------- stack ----------
  if (!stack || !Array.isArray(stack.groups)) return fail('stack section is malformed');
  if (!isStr(stack.lede) || stack.lede.length > LIMITS.lede) return fail(`stack.lede is too long (max ${LIMITS.lede} characters)`);
  const stackError = validateGroups(stack.groups, COUNTS.stackGroups, COUNTS.categoryItems);
  if (stackError) return fail(`stack.groups: ${stackError}`);

  // ---------- contact ----------
  if (!contact || !isStr(contact.sub) || contact.sub.length > LIMITS.contactSub) {
    return fail(`contact.sub is missing or too long (max ${LIMITS.contactSub} characters)`);
  }

  // ---------- links ----------
  if (!links || !isStr(links.email) || links.email.length > LIMITS.email) {
    return fail(`links.email is missing or too long (max ${LIMITS.email} characters)`);
  }
  if (!isStr(links.resume) || links.resume.length > LIMITS.resumeUrl) {
    return fail(`links.resume is missing or too long (max ${LIMITS.resumeUrl} characters)`);
  }
  if (!Array.isArray(links.social) || links.social.length > COUNTS.socialLinks) {
    return fail(`links.social must be an array (max ${COUNTS.socialLinks} entries)`);
  }
  for (const s of links.social) {
    if (!isStr(s.id) || !isStr(s.label) || s.label.length > LIMITS.socialLabel) {
      return fail(`A social link label is missing or too long (max ${LIMITS.socialLabel} characters)`);
    }
    if (!isStr(s.url) || s.url.length > LIMITS.socialUrl) {
      return fail(`A social link URL is too long (max ${LIMITS.socialUrl} characters)`);
    }
    if (s.url && !/^https?:\/\//i.test(s.url)) {
      return fail(`The "${s.label}" link must start with http:// or https://`);
    }
  }

  return { valid: true };
}

function validateGroups(groups, maxGroups, maxItemsPerGroup) {
  if (!Array.isArray(groups)) return 'must be an array';
  if (groups.length > maxGroups) return `too many groups (max ${maxGroups})`;
  for (const g of groups) {
    if (!isStr(g.title) || g.title.length > LIMITS.groupTitle) return `a group title is too long (max ${LIMITS.groupTitle} characters)`;
    if (!Array.isArray(g.items) || g.items.length > maxItemsPerGroup) return `a group has too many items (max ${maxItemsPerGroup})`;
    for (const item of g.items) {
      if (!isStr(item) || item.length > LIMITS.groupItem) return `a group item is too long (max ${LIMITS.groupItem} characters)`;
    }
  }
  return null;
}

module.exports = { validateContent };
