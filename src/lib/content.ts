// Seed/fallback content from the CV. Admin dashboard (DB) will override this. Placeholders marked TODO.
export type L = "ar" | "en";
export const locales: L[] = ["ar", "en"];
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const contact = { email: "rozny@yahoo.com", phone: "+20 115 379 1575", github: "https://github.com/JimyRozany", linkedin: "https://linkedin.com/in/rozny" };
const b = <T,>(ar: T, en: T) => ({ ar, en });
export const ui = {
  name: b("محمد جمال", "Mohamed Gamal"),
  role: b("مطوّر Full Stack — Laravel · React · Next.js", "Full Stack Developer — Laravel · React · Next.js"),
  intro: b("أبني أنظمة جاهزة للإنتاج: متاجر إلكترونية، ERP، منصات طبية وإدارة مشاريع — من تصميم قاعدة البيانات وواجهات الـ API إلى لوحات التحكم.", "I build production-grade systems: e-commerce, ERP, medical and project-management platforms — from database design and APIs to dashboards."),
  about: b("مطوّر Full Stack بخبرة أكثر من سنتين في Laravel وReact.js وNext.js. أتعامل بارتياح مع قواعد الأكواد الكبيرة، وأعمل بسرعة داخل فرق Agile.", "Full Stack Developer with 2+ years of hands-on experience in Laravel, React.js and Next.js. Comfortable in large existing codebases, shipping fast in agile teams."),
  nav: b(["من أنا", "المهارات", "الخبرة", "المشاريع", "تواصل"], ["About", "Skills", "Experience", "Projects", "Contact"]),
  h: b({ about: "من أنا", skills: "المهارات", services: "الخدمات", exp: "الخبرة", projects: "المشاريع", personal: "مشاريع شخصية", contact: "تواصل معي", cta: "شاهد المشاريع", back: "كل المشاريع", tech: "التقنيات", edu: "التعليم" }, { about: "About me", skills: "Skills", services: "Services", exp: "Experience", projects: "Projects", personal: "Personal projects", contact: "Get in touch", cta: "View projects", back: "All projects", tech: "Stack", edu: "Education" }),
  edu: b("بكالوريوس علوم الحاسب — جامعة النهضة (2017–2021)", "B.Sc. Computer Science — Nahda University (2017–2021)"),
  screenshot: b("لقطة شاشة — TODO: أضف صورة", "Screenshot — TODO: add image"),
};
export const skills = {
  Backend: ["PHP (OOP)", "Laravel", "Laravel Modules", "RESTful API", "MVC", "MySQL", "Authentication & Authorization", "Database Design & Migrations"],
  Frontend: ["React.js", "Redux", "Next.js", "JavaScript (ES6+)", "Tailwind CSS", "Blade Templates", "Responsive Design"],
  Tools: ["Git & GitHub", "API Integration", "Payment Gateways", "POS Systems", "E-commerce Logic", "ERP Systems", "Agile Collaboration"],
};
export const experience = [
  { company: "Tamakan", period: b("أبريل 2025 – الآن", "Apr 2025 – Present"), role: b("مطوّر Full Stack", "Full Stack Developer"), bullets: b(["بناء وتطوير مشاريع: Desar وGenaptx وFollow Up وERP وGame Unity.", "تكامل مع بوابات الدفع وواجهات API."], ["Delivered Desar, Genaptx, Follow Up, ERP and Game Unity.", "Integrated payment gateways and backend APIs."]) },
  { company: "Reefy", period: b("أبريل 2024 – مارس 2025", "Apr 2024 – Mar 2025"), role: b("أخصائي IT (فترة انتقالية)", "IT Specialist (career transition)"), bullets: b(["صيانة الشبكات وأداء الأنظمة مع تطوير مهارات Laravel وNext.js.", "العودة للتطوير في أبريل 2025."], ["Maintained network infrastructure while deepening Laravel and Next.js skills.", "Returned to development in April 2025."]) },
  { company: "EraDev", period: b("يناير 2023 – أبريل 2024", "Jan 2023 – Apr 2024"), role: b("مطوّر واجهات أمامية", "Front End Developer"), bullets: b(["مكوّنات React قابلة لإعادة الاستخدام لعدة عملاء.", "تحسين الأداء وتوافق المتصفحات."], ["Built responsive, reusable React components across client projects.", "Focused on performance and cross-browser compatibility."]) },
];
export type Project = { slug: string; title: L extends never ? never : Record<L, string>; desc: Record<L, string>; points: Record<L, string[]>; tech: string[]; pro: boolean };
export const projects: Project[] = [
  { slug: "desar", pro: true, title: b("Desar — منصة تجارة إلكترونية", "Desar — E-commerce platform"), desc: b("لوحة تحكم لإدارة المنتجات والكوبونات والإعلانات.", "Admin dashboard for products, coupons, ads and banners."), tech: ["React.js", "Redux"], points: b(["لوحة تحكم لإدارة أكثر من 200 منتج وكوبونات وإعلانات وبانرات.", "محرك كوبونات: خصم ثابت/نسبة مئوية وقواعد لمنتجات محددة.", "تكامل مع بوابات الدفع.", "إدارة الحالة العامة بـ Redux وتحسين إعادة استخدام المكوّنات."], ["Admin dashboard managing 200+ products, coupons, ads and banners.", "Coupon engine: fixed/percentage discounts and product-specific rules.", "Payment gateway integration for secure checkout.", "Global state with Redux; more reusable components."]) },
  { slug: "genaptx", pro: true, title: b("Genaptx — تحليل جيني وطبي", "Genaptx — Medical & genetic analysis"), desc: b("واجهات تعرض نتائج التحليل الجيني بوضوح.", "Interfaces that present genetic analysis results clearly."), tech: ["React.js"], points: b(["تصميم واجهة لعرض نتائج التحليل الجيني المعقدة من الـ API.", "العمل مع بيانات الأمراض الوراثية وتقارير الطفرات.", "تعاون مع فريق الـ Backend لدمج ميزات التحليل بالذكاء الاصطناعي."], ["Designed UI to present complex genetic results from backend APIs.", "Worked with genetic-disease and mutation-report data.", "Collaborated with the backend team on AI-based analysis."]) },
  { slug: "follow-up", pro: true, title: b("Follow Up — إدارة المشاريع", "Follow Up — Project management"), desc: b("إعادة بناء الواجهة بالكامل مع نظام أدوار وصلاحيات.", "Full frontend rebuild with roles and permissions."), tech: ["Laravel", "Blade"], points: b(["إعادة بناء الواجهة من الصفر بواجهة حديثة حسب الأدوار.", "تطوير الـ Backend: Models وMigrations ونظام أدوار وصلاحيات كامل.", "وحدات: المشاريع، العملاء والموظفين، المهام، المراحل، التقويم، الملاحظات اللاصقة."], ["Rebuilt the frontend from scratch with a role-aware UI.", "Refactored backend: models, migrations, full role & permission system.", "Modules: projects, clients/employees, tasks, stages, calendar, sticky notes."]) },
  { slug: "erp", pro: true, title: b("نظام ERP", "ERP System"), desc: b("مبيعات ومشتريات وفواتير ونقاط بيع ومخزون.", "Sales, purchases, invoices, POS and inventory."), tech: ["Laravel", "Laravel Modules", "Blade"], points: b(["توسيع النظام بوحدات المبيعات والمشتريات والفواتير والمرتجعات.", "تحسين منطق نقطة البيع وإدارة المخزون.", "حل مشاكل الترجمة متعددة اللغات والحفاظ على بنية Laravel Modules."], ["Added sales & purchase modules, invoices, returns and improved POS logic.", "Updated inventory and stock workflows.", "Fixed multilingual issues; maintained Laravel Modules architecture."]) },
  { slug: "game-unity", pro: true, title: b("Game Unity — منصة ألعاب", "Game Unity — Gaming platform"), desc: b("موقع ألعاب متعدد الصفحات مع Laravel API.", "Multi-page gaming site on a Laravel API."), tech: ["React.js", "Laravel API"], points: b(["المشاركة في بناء موقع متعدد الصفحات متكامل مع Laravel.", "إصلاح أخطاء الواجهة والمنطق وتحسين الاستقرار."], ["Helped build a multi-page site integrated with a Laravel API.", "Fixed UI and logic bugs, improving stability."]) },
  ...([["eco-store", "Eco Store", ["React.js"], "متجر إلكتروني: قائمة منتجات وسلة ودفع.", "E-commerce frontend: listing, cart, checkout."], ["rozany-chat", "Rozany Chat", ["React.js", "WebSockets"], "دردشة لحظية مع غرف مستخدمين.", "Real-time chat with user rooms."], ["temogpt", "TemoGPT", ["React.js", "OpenAI API"], "روبوت محادثة عبر OpenAI API.", "AI chatbot using the OpenAI API."], ["courses-api", "Courses API", ["Laravel", "MySQL"], "واجهة REST لمنصة دورات (CRUD كامل).", "RESTful backend for a course platform (full CRUD)."], ["restaurant-api", "Restaurant API", ["Laravel", "MySQL"], "نظام لإدارة قائمة المطعم والطلبات.", "CRUD backend for restaurant menu and orders."], ["weather-app", "Weather App", ["React.js", "REST API"], "بحث عن الطقس عبر API خارجي.", "Live weather lookup via a third-party API."]] as [string, string, string[], string, string][]).map(([slug, t, tech, ar, en]) => ({ slug, pro: false, title: b(t, t), desc: b(ar, en), tech, points: b([ar], [en]) })),
];

export const form = {
  name: b("الاسم", "Name"), email: b("البريد الإلكتروني", "Email"), message: b("رسالتك", "Message"),
  send: b("إرسال", "Send"), sending: b("جارٍ الإرسال…", "Sending…"),
  ok: b("تم الإرسال، شكرًا لك! سأرد قريبًا.", "Sent — thank you! I'll reply soon."),
  invalid: b("تأكد من الاسم والبريد الإلكتروني ورسالة لا تقل عن 10 أحرف.", "Please check your name, email and a message of at least 10 characters."),
  throttled: b("محاولات كثيرة. حاول لاحقًا.", "Too many messages. Please try again later."),
  fail: b("تعذّر الإرسال حاليًا. راسلني عبر البريد الإلكتروني.", "Couldn't send right now. Please email me directly."),
};

export const ux = {
  skip: b("تخطَّ إلى المحتوى", "Skip to content"),
  scroll: b("مرّر", "Scroll"),
  menu: b("القائمة", "Menu"), close: b("إغلاق", "Close"),
  progress: b("تقدّم القراءة", "Reading progress"),
  concept: b("تصوّر للواجهة", "Interface concept"),
  contribution: b("مساهمتي", "My contribution"),
  viewProject: b("تفاصيل المشروع", "View project"),
  selected: b("أعمال مختارة", "Selected work"),
  skillsNote: b("التقنيات التي أعمل بها يوميًا في الواجهة الخلفية والأمامية والأدوات.", "The technologies I work with day to day across backend, frontend and tooling."),
  letsTalk: b("لنبنِ شيئًا معًا.", "Let's build something together."),
  contactLead: b("لديك فكرة أو فرصة عمل؟ راسلني وسأرد عليك في أقرب وقت.", "Got an idea or an opportunity? Write to me and I'll get back to you soon."),
  copy: b("نسخ", "Copy"), copied: b("تم النسخ ✓", "Copied ✓"),
  orMessage: b("أو أرسل رسالة", "Or send a message"),
  backTop: b("للأعلى", "Back to top"),
  prev: b("المشروع السابق", "Previous project"), next: b("المشروع التالي", "Next project"),
  live: b("المعاينة المباشرة", "Live demo"), source: b("الكود المصدري", "Source code"),
  project: b("مشروع", "Project"),
  contributions: b("ما قمت به", "What I did"),
  allProjects: b("كل المشاريع", "All projects"),
};
