// These limits exist for one reason: without them, a very long paste into
// any field could overflow cards, break the grid layout, or blow up the
// page. They're enforced in two places that must be kept in sync:
//   - here, on the server, as the real enforcement (nothing bypasses this)
//   - client/lib/contentLimits.js, for maxLength attributes + counters in
//     the admin editor, so the UI stops you before you'd hit a server error
const LIMITS = {
  kicker: 80,
  name: 40,
  lede: 320,
  paragraph: 500,
  tagline: 100,
  groupTitle: 40,
  groupItem: 60,
  statNumber: 10,
  statLabel: 40,
  sideRowLabel: 30,
  sideRowValue: 60,
  projectIdx: 6,
  projectName: 60,
  projectRole: 80,
  projectDesc: 420,
  projectLink: 400,
  projectGithub: 400,
  projectLive: 400,
  tag: 30,
  socialLabel: 24,
  socialUrl: 400,
  email: 200,
  resumeUrl: 400,
  contactSub: 320,
  eduLede: 200,
  eduInstitution: 100,
  eduProgram: 80,
  eduPeriod: 40,
  eduScore: 30,
  eduDesc: 320,
};

const COUNTS = {
  paragraphs: 6,
  categories: 8,
  categoryItems: 12,
  technicalSkillGroups: 10,
  stats: 4,
  sideRows: 10,
  projects: 15,
  projectTags: 10,
  stackGroups: 10,
  socialLinks: 10,
  education: 10,
};

module.exports = { LIMITS, COUNTS };
