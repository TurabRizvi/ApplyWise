// This object is the starting point for every editable piece of text and
// every link on the site. It's used two places:
//   1. The backend seeds the database with this the first time GET
//      /api/content runs and finds no row yet.
//   2. The frontend keeps an identical copy as a fallback — if the API
//      is ever unreachable, the site still renders instead of going blank.
// After the first edit through the admin panel, the database version is
// what's actually served — this file stops being "live" and just remains
// the safety net.

const DEFAULT_CONTENT = {
  hero: {
    kicker: 'Islamabad, Pakistan — AI & Full-Stack Dev',
    nameFirstLine: 'Syed Muhammad',
    nameAccent: 'Turab',
    nameRest: 'Rizvi',
    lede: "I'm an AI undergraduate at CUST, Islamabad, building at the intersection of web development and artificial intelligence.",
  },
  whatIDo: {
    paragraphs: [
      'I work in two spaces — crafting full-stack web applications and developing smart, AI-powered tools that solve real problems. My focus has always been on turning problems into solutions that actually work.',
      'Currently exploring full-stack development and intelligent automation, and getting better every day.',
    ],
    tagline: 'Always learning. Always shipping.',
    categories: [
      { title: 'AI Tooling', items: ['Offline-capable assistants', 'Speech-to-intent pipelines', 'Search & solver algorithms'] },
      { title: 'Full-Stack Web', items: ['React / Next.js frontends', 'Node & Express APIs', 'PostgreSQL + Prisma data layers'] },
      { title: 'Systems Thinking', items: ['Custom data structures', 'C++ performance-critical code', 'Clear, grounded documentation'] },
    ],
  },
  technicalSkills: [
    { title: 'Languages', items: ['C++', 'JavaScript (ES6+)', 'TypeScript', 'Python'] },
    { title: 'Frontend', items: ['React & Next.js', 'HTML5, CSS3', 'Responsive Design'] },
    { title: 'Backend', items: ['Node.js / Express.js', 'RESTful APIs', 'Auth & Authorization (JWT)'] },
    { title: 'Databases & ORM', items: ['PostgreSQL', 'SQL', 'Prisma ORM', 'Database Design'] },
    { title: 'AI & Automation', items: ['NLP', 'Voice Recognition (Vosk)', 'Groq API', 'System Automation'] },
    { title: 'Tools & Practices', items: ['Git & GitHub', 'VS Code', 'Agile, SDLC', 'Data Structures & Algorithms'] },
  ],
  about: {
    lede: "I'm a full-stack developer and AI undergraduate who builds real things — not class projects for a grade, but tools people can actually open and use.",
    paragraphs: [
      "I work comfortably across the stack — C++, Python, Node.js, React, and PostgreSQL — and I'm actively sharpening my data structures and algorithms fundamentals alongside it. I like projects with a real user on the other end: something that gets installed, clicked, or actually used, not just demoed once.",
      'My work sits at the intersection of AI tooling and full-stack engineering — from an offline voice-powered desktop assistant to a five-role freelance marketplace. I keep the presentation as grounded as the code: no overselling, just what it does and how.',
      "Outside of coursework, I've picked up a cybersecurity job simulation certificate through Forage, along with a couple of AWS Student Builder Group certificates on agentic AI and GitHub fundamentals.",
    ],
    stats: [
      { n: '4+', l: 'SHIPPED PROJECTS' },
      { n: '3.0', l: 'CGPA / 4.0 SCALE' },
    ],
    sideRows: [
      { label: 'Institution', value: 'CUST, Islamabad' },
      { label: 'Program', value: 'BS Artificial Intelligence' },
      { label: 'Semester', value: '3rd' },
      { label: 'Expected', value: '2029' },
      { label: 'Focus', value: 'AI + Full-Stack Web' },
      { label: 'Currently', value: 'Backend Intern Assessment @ XDevflow' },
    ],
  },
  education: {
    lede: 'The path so far, from first classroom to current semester.',
    // Empty until filled in from the admin panel. Shape per entry:
    // { id, institution, program, period, current (bool), score, desc }
    entries: [],
  },
  work: {
    lede: 'Four projects, four different problems — an AI assistant, a marketplace, a rental platform, and a solver.',
    projects: [
      {
        idx: '01',
        name: 'Amethyst',
        role: 'Offline AI Desktop Assistant',
        desc: 'A desktop assistant that runs without an internet dependency for its core loop — local speech recognition paired with the Groq API for language understanding, wrapped in a C++ shell for speed.',
        tags: ['C++', 'Python', 'Vosk', 'Groq API'],
        github: 'https://github.com/TurabRizvi',
        live: '',
        link: 'https://github.com/TurabRizvi',
      },
      {
        idx: '02',
        name: 'Campus Freelance Board',
        role: 'Full-Stack Marketplace',
        desc: 'A freelance marketplace built for a campus audience — students posting and taking on paid work, with a proper data layer underneath instead of a spreadsheet pretending to be one.',
        tags: ['Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Prisma'],
        github: '',
        live: '',
        link: '',
      },
      {
        idx: '03',
        name: 'Aurum Drive',
        role: 'Premium Car Rental Platform',
        desc: 'A car-rental front end built as a backend-intern technical assessment — local image management, an admin dashboard, and a dark/light theme system built on CSS custom properties.',
        tags: ['React (Vite)', 'React Router', 'Tailwind CSS'],
        github: '',
        live: '',
        link: '',
      },
      {
        idx: '04',
        name: '2048 — Data Structures Edition',
        role: 'Group Project, AI Solver',
        desc: 'A 2048 clone with an AI solver behind it, searching moves with BFS and DFS on top of six custom-built data structures — implemented in parallel across C++ and JavaScript.',
        tags: ['C++', 'JavaScript', 'BFS / DFS', 'Custom DS'],
        github: '',
        live: '',
        link: '',
      },
    ],
  },
  stack: {
    lede: 'What I reach for, grouped by where it actually gets used.',
    groups: [
      { title: 'Languages', items: ['C++', 'Python', 'JavaScript / TypeScript', 'SQL'] },
      { title: 'Frontend', items: ['React & Next.js', 'React Router', 'Tailwind CSS', 'Vite'] },
      { title: 'Backend & Data', items: ['Node.js / Express', 'PostgreSQL', 'Prisma ORM', 'REST API design'] },
      { title: 'AI / ML', items: ['Vosk (offline speech)', 'Groq API', 'Search algorithms (BFS/DFS)', 'Applied ML fundamentals'] },
      { title: 'Tooling', items: ['Git & GitHub', 'VS Code', 'Linux / bash', 'Figma (light use)'] },
      { title: 'Currently Learning', items: ['Prisma + Express in depth', 'System design fundamentals', 'Advanced data structures'] },
    ],
  },
  contact: {
    sub: 'Open to backend / full-stack internships and collaborative AI projects. Send a message directly, or reach out through whichever channel is easiest.',
  },
  links: {
    email: 'turabrizvi948@gmail.com',
    resume: 'https://drive.google.com/file/d/14FbgdWDqYjCPW567qwUolWSc2EmpgXCK/view?usp=drive_link',
    // Flexible list — add/remove/reorder from the admin panel without any
    // code changes. A blank url shows the chip as "coming soon" instead
    // of a dead link. id is just a stable React key, never shown.
    social: [
      { id: 'github', label: 'GITHUB', url: 'https://github.com/TurabRizvi' },
      { id: 'linkedin', label: 'LINKEDIN', url: 'https://www.linkedin.com/in/turab-rizvi-1b6719376' },
      { id: 'whatsapp', label: 'WHATSAPP', url: '' },
    ],
  },
};

export { DEFAULT_CONTENT };
