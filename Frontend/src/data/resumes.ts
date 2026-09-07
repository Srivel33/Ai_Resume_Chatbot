import { ResumeData, ChatMessage } from "../types";

export const SAMPLE_RESUMES: ResumeData[] = [
  {
    id: "srivel_2024",
    filename: "Srivel_Resume_2024.pdf",
    sizeKb: 248,
    candidateName: "Srivel",
    title: "Senior Full-Stack & Systems Engineer",
    summary:
      "Full-stack engineer proficient in Python, Java, and JavaScript with deep hands-on expertise in FastAPI, React 18, and high-concurrency SQL architectures. Proven track record leading hackathon winning teams and civic tech programs.",
    tokenCount: 1420,
    entityCount: 38,
    latencyMs: 820,
    competencies: ["Python 3.11", "React 18", "FastAPI", "SQL Architecture", "Team Direction"],
    suggestedInquiries: [
      "Can you give a brief summary of this resume?",
      "What are this candidate's main skills?",
      "What is their work experience?",
      "What projects have they worked on?",
      "What is their educational background?",
      "What certifications or achievements do they have?",
    ],
    fullText: `Srivel
Senior Software Engineer | Full-Stack & Distributed Systems
Email: srivel@example.com | Portfolio: srivel.dev | GitHub: github.com/srivel

SUMMARY
Senior Software Engineer with 5+ years of experience engineering high-throughput microservices, responsive web applications, and fault-tolerant distributed systems. Proven track record leading multidisciplinary teams during competitive hackathons and engineering civic outreach programs.

TECHNICAL PROFICIENCY
— Languages: Python 3.11, Java SE 17, ECMAScript/JavaScript, SQL, TypeScript, Bash.
— Frameworks: FastAPI, React 18, Next.js, Node.js, Spring Boot, Express.
— Cloud & Infrastructure: Docker, Kubernetes, AWS (ECS, Lambda, S3), Redis, PostgreSQL, Kafka.
— Methodologies: Distributed Systems, CI/CD Pipelines, Microservices Architecture, Event-Driven Architecture, Unit & Integration Testing.

PROFESSIONAL EXPERIENCE
Senior Full-Stack Engineer — Apex Systems (2022 – Present)
• Architected scalable backend telemetry yielding 42% throughput gain on distributed clusters.
• Engineered high-performance REST and gRPC endpoints in FastAPI and Python 3.11 handling 14,000+ RPS with p99 latency < 45ms.
• Designed and shipped core customer appraisal portal using React 18 and Next.js, cutting page load time by 38%.
• Overhauled relational schema for analytics warehouse, optimizing complex SQL queries and reducing index footprint by 22%.

Full-Stack Developer — Horizon Software Labs (2020 – 2022)
• Developed responsive web applications using React, TypeScript, and Node.js.
• Created asynchronous task pipelines leveraging Celery, Redis, and PostgreSQL.
• Implemented role-based access control (RBAC) and OAuth2 identity providers.

LEADERSHIP & ACTIVITIES
• Team Lead, Smart India Hackathon (36-hr): Led a 6-person engineering squad to win 1st prize out of 1,200 participating teams for an emergency relief coordination engine.
• Community Outreach Director, Rotaract Club: Orchestrated 12 civic technology workshops educating 400+ undergraduate developers in open-source software and agile practices.

EDUCATION
Bachelor of Science in Computer Science & Engineering — First Class with Distinction`,
  },
  {
    id: "elena_vance",
    filename: "Elena_Vance_Staff_PM.pdf",
    sizeKb: 312,
    candidateName: "Elena Vance",
    title: "Staff Technical Product Manager",
    summary:
      "Enterprise product leader specializing in developer platforms, API ecosystems, and AI tool integrations. 8+ years scaling B2B SaaS from zero to $40M ARR.",
    tokenCount: 1890,
    entityCount: 44,
    latencyMs: 950,
    competencies: ["Product Strategy", "API Design", "B2B SaaS Growth", "Cross-Functional Leadership", "OKRs"],
    suggestedInquiries: [
      "Can you give a brief summary of this resume?",
      "What are this candidate's main skills?",
      "What is their work experience?",
      "What projects have they worked on?",
      "What is their educational background?",
      "What certifications or achievements do they have?",
    ],
    fullText: `Elena Vance
Staff Technical Product Manager | Platform & Developer Tooling
Email: elena.vance@example.com | LinkedIn: linkedin.com/in/elenavance

EXECUTIVE PROFILE
Staff Technical Product Manager with 8+ years experience guiding developer platform architecture, API developer experiences, and machine learning infrastructure products. Successfully drove $40M ARR expansion across Fortune 500 enterprise clients.

CORE COMPETENCIES
Product Strategy, API Design & Telemetry, Developer Experience (DX), Enterprise SaaS, Cross-Functional Leadership, Metrics & Data Analytics, Roadmapping, Agile Transformation.

NOTABLE IMPACT
• Headed Cloud Developer Platform at ScaleTech, expanding active monthly developer base by 240% over 18 months.
• Spearheaded integration of automated documentation and SDK generators for 14 public client libraries.`,
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg_1",
    sender: "user",
    text: "What programming languages does this candidate know?",
    timestamp: "10:42 AM",
  },
  {
    id: "msg_2",
    sender: "ai",
    text: "This candidate is proficient in Python, Java, and JavaScript, with hands-on experience in React and FastAPI. Python appears most consistently across their projects.",
    quote: "“Technical Proficiency — Languages: Python 3.11, Java SE 17, ECMAScript/JavaScript, SQL. Frameworks: FastAPI, React 18, Next.js.”",
    matchPercentage: 88,
    competencies: ["Python 3.11", "Java SE 17", "JavaScript", "SQL"],
    timestamp: "10:42 AM",
  },
  {
    id: "msg_3",
    sender: "user",
    text: "Do they have leadership experience?",
    timestamp: "10:43 AM",
  },
  {
    id: "msg_4",
    sender: "ai",
    text: "Yes — they led a team during a 36-hour national hackathon and coordinated community events through their college Rotaract Club, showing initiative beyond technical work.",
    quote: "“Leadership & Activities — Team Lead, Smart India Hackathon (36-hr); Community Outreach Director, Rotaract Club.”",
    matchPercentage: 76,
    competencies: ["Team Direction", "Smart India Hackathon", "Rotaract Club"],
    timestamp: "10:43 AM",
  },
];
