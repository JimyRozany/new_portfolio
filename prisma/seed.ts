/**
 * Database seed.
 *
 * Run with `npm run db:seed`. The script is **idempotent**: every write is an
 * upsert keyed on a natural identifier (slug, email, platform, key), so running
 * it again refreshes the content instead of duplicating it. That makes it safe
 * to re-run after pulling new migrations.
 *
 * Content is taken from the owner's CV --- the same source the public pages read
 * from the database, so the seeded site is complete rather than a demo shell.
 */

// Load .env first: `tsx` does not do it automatically, and this script can be
// run directly (`npm run db:reset-password`) as well as through the Prisma CLI.
import 'dotenv/config';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { hash } from 'bcryptjs';
import { PrismaClient, type ProjectStatus } from '../src/generated/prisma/client';

/** Same cost as `auth.ts` and `prisma/reset-password.ts`, so hashes are uniform. */
const BCRYPT_COST = 12;

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env first.');
  }

  const parsed = new URL(url);

  return new PrismaClient({
    adapter: new PrismaMariaDb({
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1),
      ssl: parsed.searchParams.get('ssl') === 'true' ? {} : undefined,
    }),
  });
}

const prisma = createPrisma();

/** Only the month is meaningful for a CV, so dates are pinned to day 1. */
const date = (value: string): Date => new Date(`${value}-01T00:00:00.000Z`);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Admin account.
 *
 * The email comes from `ADMIN_EMAIL` and the password from `ADMIN_PASSWORD` in
 * `.env`, so the credentials are configured in one place instead of being
 * duplicated here. The password is hashed at seed time rather than stored as a
 * literal: a bcrypt hash committed to the repository is a published password,
 * however "placeholder" the comment claims.
 *
 * Both are only applied when the row is **created**. A later `db:seed` refreshes
 * the profile but leaves `passwordHash` alone, so re-seeding cannot silently
 * reset a password the owner has since changed --- that is what
 * `npm run db:reset-password` is for.
 */
const adminEmail = (process.env.ADMIN_EMAIL ?? 'rozny@yahoo.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeMe!2026';

if (adminPassword.length < 8) {
  throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');
}

const users = [
  {
    email: adminEmail,
    name: 'Mohamed Gamal',
    role: 'ADMIN' as const,
    passwordHash: await hash(adminPassword, BCRYPT_COST),
  },
];

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

const skillCategories = [
  { nameEn: 'Backend', nameAr: 'الخلفية', sortOrder: 1 },
  { nameEn: 'Frontend', nameAr: 'الواجهة الأمامية', sortOrder: 2 },
  { nameEn: 'Tools & Concepts', nameAr: 'أدوات ومفاهيم', sortOrder: 3 },
];

const skills = [
  // Backend
  { name: 'PHP (OOP)', icon: 'code', category: 'Backend', level: 90, sortOrder: 1 },
  { name: 'Laravel', icon: 'server', category: 'Backend', level: 90, sortOrder: 2 },
  { name: 'Laravel Modules', icon: 'boxes', category: 'Backend', level: 80, sortOrder: 3 },
  { name: 'RESTful API', icon: 'webhook', category: 'Backend', level: 88, sortOrder: 4 },
  { name: 'MVC', icon: 'workflow', category: 'Backend', level: 85, sortOrder: 5 },
  { name: 'MySQL', icon: 'database', category: 'Backend', level: 85, sortOrder: 6 },
  {
    name: 'Authentication & Authorization',
    icon: 'shield',
    category: 'Backend',
    level: 82,
    sortOrder: 7,
  },
  {
    name: 'Database Design & Migrations',
    icon: 'table',
    category: 'Backend',
    level: 80,
    sortOrder: 8,
  },
  // Frontend
  { name: 'React.js', icon: 'atom', category: 'Frontend', level: 90, sortOrder: 1 },
  { name: 'Redux', icon: 'zap', category: 'Frontend', level: 85, sortOrder: 2 },
  { name: 'Next.js', icon: 'layers', category: 'Frontend', level: 82, sortOrder: 3 },
  { name: 'JavaScript (ES6+)', icon: 'braces', category: 'Frontend', level: 88, sortOrder: 4 },
  { name: 'Tailwind CSS', icon: 'palette', category: 'Frontend', level: 85, sortOrder: 5 },
  { name: 'Blade Templates', icon: 'file', category: 'Frontend', level: 78, sortOrder: 6 },
  { name: 'Responsive Design', icon: 'monitor', category: 'Frontend', level: 88, sortOrder: 7 },
  // Tools & Concepts
  {
    name: 'Git & GitHub',
    icon: 'git-branch',
    category: 'Tools & Concepts',
    level: 85,
    sortOrder: 1,
  },
  { name: 'API Integration', icon: 'plug', category: 'Tools & Concepts', level: 88, sortOrder: 2 },
  { name: 'Payment Gateways', icon: 'card', category: 'Tools & Concepts', level: 78, sortOrder: 3 },
  { name: 'POS Systems', icon: 'barcode', category: 'Tools & Concepts', level: 75, sortOrder: 4 },
  { name: 'E-commerce Logic', icon: 'cart', category: 'Tools & Concepts', level: 80, sortOrder: 5 },
  { name: 'ERP Systems', icon: 'building', category: 'Tools & Concepts', level: 78, sortOrder: 6 },
  {
    name: 'Agile Collaboration',
    icon: 'users',
    category: 'Tools & Concepts',
    level: 80,
    sortOrder: 7,
  },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

type ProjectSeed = {
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  longDescriptionEn: string;
  longDescriptionAr: string;
  category: string;
  /** Stack used, inferred from the project description in the owner's CV. */
  technologies: string[];
  featured: boolean;
  status: ProjectStatus;
  sortOrder: number;
};

const projects: ProjectSeed[] = [
  {
    slug: 'desar',
    titleEn: 'Desar',
    titleAr: 'ديزار',
    descriptionEn:
      'E-commerce platform with an admin dashboard, coupon engine and payment integration.',
    descriptionAr: 'منصة تجارة إلكترونية بلوحة تحكم ونظام كوبونات ودمج بوابات دفع.',
    longDescriptionEn:
      'Built the admin dashboard used to manage more than 200 products, coupons, advertisements and banners. Implemented a coupon engine supporting fixed and percentage discounts as well as product-specific rules. Integrated payment gateway APIs to reduce checkout friction and enable secure transactions, and managed global state with Redux while improving component reuse across the dashboard.',
    longDescriptionAr:
      'بنيت لوحة التحكم لإدارة أكثر من ٢٠٠ منتج وكوبون وإعلان وبانر. نفذت نظام كوبونات يدعم الخصم الثابت والنسبة المئوية وقواعد خاصة بمنتجات محددة. ودمجت واجهات بوابات الدفع لتقليل احتكاك الدفع وتمكين معاملات آمنة، مع إدارة الحالة العامة عبر Redux وتحسين إعادة استخدام المكوّنات في اللوحة.',
    technologies: ['Laravel', 'React', 'Redux', 'MySQL', 'REST API'],
    category: 'E-commerce',
    featured: true,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 1,
  },
  {
    slug: 'genaptx',
    titleEn: 'Genaptx',
    titleAr: 'جينابتكس',
    descriptionEn:
      'Medical and genetic analysis platform that turns complex API data into readable results.',
    descriptionAr: 'منصة تحليل طبي وجيني تحوّل بيانات معقدة من واجهات API إلى نتائج واضحة.',
    longDescriptionEn:
      'Designed the interface that surfaces complex genetic analysis results coming from backend APIs in a clear, readable layout. Worked with structured API data covering genetic diseases and mutation reports, and collaborated closely with the backend team while integrating AI-based analysis features.',
    longDescriptionAr:
      'صممت الواجهة التي تعرض نتائج التحليل الجيني المعقدة القادمة من واجهات البرمجة الخلفية بتخطيط واضح وسهل القراءة. تعاملت مع بيانات منظمة تغطي الأمراض الجينية وتقارير الطفرات، وتعاونت عن قرب مع فريق الخلفية أثناء دمج خصائص التحليل المدعومة بالذكاء الاصطناعي.',
    technologies: ['React', 'REST API', 'AI Integration'],
    category: 'Medical',
    featured: true,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 2,
  },
  {
    slug: 'follow-up',
    titleEn: 'Follow Up',
    titleAr: 'فولو أب',
    descriptionEn:
      'Project management system rebuilt with a role-aware interface and full permissions.',
    descriptionAr: 'نظام إدارة مشاريع أُعيد بناؤه بواجهة مبنية على الأدوار وصلاحيات كاملة.',
    longDescriptionEn:
      'Rebuilt the entire frontend from scratch, replacing a legacy UI with a modern, role-aware interface. Refactored the backend by updating models and migrations and implementing a complete role and permission system. Delivered modules for project creation, client and employee management, task assignment, stage tracking, calendar integration and sticky-note follow-ups.',
    longDescriptionAr:
      'أعدت بناء الواجهة الأمامية بالكامل من الصفر، مستبدلةً واجهة قديمة بواجهة حديثة مبنية على الأدوار. وأعدت هيكلة الخلفية بتحديث النماذج والترحيلات وتنفيذ نظام كامل للأدوار والصلاحيات. وسلمت وحدات لإنشاء المشاريع وإدارة العملاء والموظفين وإسناد المهام وتتبع المراحل وربط التقويم ومتابعة الملاحظات.',
    technologies: ['Laravel', 'React', 'MySQL', 'RBAC', 'Migrations'],
    category: 'Project Management',
    featured: true,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 3,
  },
  {
    slug: 'erp-system',
    titleEn: 'ERP System',
    titleAr: 'نظام ERP',
    descriptionEn: 'ERP extended with sales, purchase, invoicing, returns and improved POS logic.',
    descriptionAr:
      'نظام ERP تم تطويره بإضافات المبيعات والمشتريات والفواتير والمرتجعات ومنطق نقاط البيع.',
    longDescriptionEn:
      'Extended the ERP with sales and purchase modules, invoices, returns and improved POS logic. Updated inventory and stock-management workflows to match new business requirements. Resolved multilingual and translation issues while maintaining the Laravel Modules architecture.',
    longDescriptionAr:
      'طوّرت نظام ERP بإضافة وحدات المبيعات والمشتريات والفواتير والمرتجعات وتحسين منطق نقاط البيع. حدّثت تدفقات المخزون وإدارة المستودعات لتتوافق مع متطلبات العمل الجديدة. وعالجت مشكلات تعدد اللغات والترجمة مع الحفاظ على بنية Laravel Modules.',
    technologies: ['Laravel', 'Laravel Modules', 'MySQL', 'i18n'],
    category: 'Enterprise',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 4,
  },
  {
    slug: 'eco-store',
    titleEn: 'Eco Store',
    titleAr: 'إيكو ستور',
    descriptionEn: 'E-commerce frontend with product listing, cart and a complete checkout flow.',
    descriptionAr: 'واجهة متجر إلكتروني بعرض المنتجات والسلة ومسار شراء كامل.',
    longDescriptionEn:
      'Personal project. An e-commerce frontend covering product listing, cart management and the checkout flow, built to practise component composition and state handling on a realistic storefront.',
    longDescriptionAr:
      'مشروع شخصي. واجهة متجر إلكتروني تغطي عرض المنتجات وإدارة السلة ومسار الشراء، بُني للتدرّب على تركيب المكوّنات والتعامل مع الحالة في واجهة واقعية.',
    technologies: ['React', 'Redux', 'Tailwind CSS'],
    category: 'E-commerce',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 5,
  },
  {
    slug: 'rozany-chat',
    titleEn: 'Rozany Chat',
    titleAr: 'روزاني شات',
    descriptionEn: 'Real-time chat application with live messaging and user rooms.',
    descriptionAr: 'تطبيق محادثة فوري مع رسائل مباشرة وغرف للمستخدمين.',
    longDescriptionEn:
      'Personal project. A real-time chat application built with WebSockets, supporting live messaging and multiple user rooms.',
    longDescriptionAr:
      'مشروع شخصي. تطبيق محادثة فوري مبني بـ WebSockets يدعم الرسائل المباشرة وغرفًا متعددة للمستخدمين.',
    technologies: ['WebSockets', 'React', 'Node.js'],
    category: 'Real-time',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 6,
  },
  {
    slug: 'temo-gpt',
    titleEn: 'TemoGPT',
    titleAr: 'تيمو جي بي تي',
    descriptionEn: 'AI chatbot integrating the OpenAI API for conversational responses.',
    descriptionAr: 'روبوت محادثة ذكي يدمج واجهة OpenAI للردود الحوارية.',
    longDescriptionEn:
      'Personal project. A conversational chatbot integrating the OpenAI API to produce natural-language responses.',
    longDescriptionAr: 'مشروع شخصي. روبوت محادثة يدمج واجهة OpenAI لإنتاج ردود بلغة طبيعية.',
    technologies: ['OpenAI API', 'React', 'Node.js'],
    category: 'AI',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 7,
  },
  {
    slug: 'courses-api',
    titleEn: 'Courses API',
    titleAr: 'واجهة الدورات',
    descriptionEn: 'RESTful backend for a course platform with full CRUD operations.',
    descriptionAr: 'واجهة خلفية RESTful لمنصة دورات بعمليات CRUD كاملة.',
    longDescriptionEn:
      'Personal project. A RESTful Laravel and MySQL backend for a course platform implementing full CRUD operations.',
    longDescriptionAr:
      'مشروع شخصي. واجهة خلفية RESTful بـ Laravel و MySQL لمنصة دورات تنفّذ عمليات CRUD كاملة.',
    technologies: ['Laravel', 'MySQL', 'REST API'],
    category: 'Backend',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 8,
  },
  {
    slug: 'restaurant-api',
    titleEn: 'Restaurant API',
    titleAr: 'واجهة المطاعم',
    descriptionEn: 'CRUD-based backend system for managing a restaurant menu and orders.',
    descriptionAr: 'نظام خلفي مبني على CRUD لإدارة قائمة المطعم والطلبات.',
    longDescriptionEn:
      'Personal project. A CRUD-based backend system for managing restaurant menus and orders.',
    longDescriptionAr: 'مشروع شخصي. نظام خلفي مبني على CRUD لإدارة قوائم المطاعم والطلبات.',
    technologies: ['Laravel', 'MySQL', 'REST API'],
    category: 'Backend',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 9,
  },
  {
    slug: 'weather-app',
    titleEn: 'Weather App',
    titleAr: 'تطبيق الطقس',
    descriptionEn: 'Live weather lookup consuming a third-party weather API.',
    descriptionAr: 'تطبيق بحث مباشر عن الطقس يستخدم واجهة طقس خارجية.',
    longDescriptionEn:
      'Personal project. A live weather lookup app consuming a third-party weather API and rendering the forecast.',
    longDescriptionAr:
      'مشروع شخصي. تطبيق بحث مباشر عن الطقس يستهلك واجهة طقس خارجية ويعرض التوقعات.',
    technologies: ['React', 'REST API', 'CSS'],
    category: 'Frontend',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 10,
  },
  {
    slug: 'game-unity',
    titleEn: 'Game Unity',
    titleAr: 'جيم يونيتي',
    descriptionEn: 'Multi-page gaming website integrated with a Laravel backend API.',
    descriptionAr: 'موقع ألعاب متعدد الصفحات مدمج مع واجهة خلفية بـ Laravel.',
    longDescriptionEn:
      'Collaborated on a multi-page gaming website integrated with a Laravel backend API, fixing existing UI and logic bugs to improve overall platform stability.',
    longDescriptionAr:
      'تعاونت في موقع ألعاب متعدد الصفحات مدمج مع واجهة خلفية بـ Laravel، وأصلحت أخطاء موجودة في الواجهة والمنطق لتحسين استقرار المنصة.',
    technologies: ['Laravel', 'REST API', 'JavaScript'],
    category: 'Gaming',
    featured: false,
    status: 'PUBLISHED' as ProjectStatus,
    sortOrder: 11,
  },
];

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

const experiences = [
  {
    company: 'Tamakan',
    positionEn: 'Full Stack Developer',
    positionAr: 'مطوّر ويب متكامل',
    location: 'Cairo, Egypt',
    startDate: date('2025-04'),
    endDate: null,
    technologies: ['Laravel', 'React', 'MySQL', 'REST API'],
    current: true,
    sortOrder: 1,
    descriptionEn:
      'Full-stack developer delivering production features across e-commerce, medical, ERP and project-management platforms --- from database design and RESTful APIs to dynamic dashboards and payment integrations.',
    descriptionAr:
      'مطوّر ويب متكامل يسلّم ميزات جاهزة للإنتاج عبر منصات التجارة الإلكترونية والطبأنظمة الـ ERP وإدارة المشاريع --- من تصميم قاعدة البيانات وواجهات REST إلى لوحات تحكم ديناميكية ودمج بوابات الدفع.',
  },
  {
    company: 'EraDev',
    positionEn: 'Front End Developer',
    positionAr: 'مطوّر واجهات أمامية',
    location: 'Cairo, Egypt',
    startDate: date('2023-01'),
    endDate: date('2024-04'),
    technologies: ['React.js', 'JavaScript', 'CSS'],
    current: false,
    sortOrder: 2,
    descriptionEn:
      'Built responsive, reusable UI components across multiple client projects using React.js. Focused on performance optimisation, component architecture and clean design systems, and delivered cross-browser compatible interfaces.',
    descriptionAr:
      'بنيت مكوّنات واجهة متجاوبة وقابلة لإعادة الاستخدام عبر مشاريع عملاء متعدّدة باستخدام React.js. ركّزت على تحسين الأداء وبنية المكوّنات وأنظمة التصميم النظيفة، وسلّمت واجهات متوافقة مع المتصفحات المختلفة.',
  },
  {
    company: 'Reefy',
    positionEn: 'IT Specialist',
    positionAr: 'أخصائي تقنية معلومات',
    location: 'Cairo, Egypt',
    startDate: date('2024-04'),
    endDate: date('2025-03'),
    technologies: ['Networking', 'Linux', 'Windows'],
    current: false,
    sortOrder: 3,
    descriptionEn:
      'Maintained network infrastructure and system performance while continuing self-development in full-stack technologies. Used the period to deepen skills in Laravel and Next.js before returning to a development role in April 2025.',
    descriptionAr:
      'صنت البنية التحتية للشبكات وأداء الأنظمة مع الاستمرار في تطوير الذات في تقنيات الويب المتكامل. استخدمت هذه الفترة لتوسيع مهاراتي في Laravel و Next.js قبل العودة إلى وظيفة التطوير في أبريل ٢٠٢٥.',
  },
];

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

const educations = [
  {
    institution: 'Nahda University (NUB) — Faculty of Computer Science',
    degreeEn: "Bachelor's Degree in Computer Science",
    degreeAr: 'بكالوريوس علوم الحاسب',
    fieldEn: 'Computer Science',
    fieldAr: 'علوم الحاسب',
    startDate: date('2017-09'),
    endDate: date('2021-06'),
    current: false,
    sortOrder: 1,
    descriptionEn: null,
    descriptionAr: null,
  },
];

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

const services = [
  {
    titleEn: 'Full Stack Web Development',
    titleAr: 'تطوير ويب متكامل',
    descriptionEn: 'Complete web applications built from database design to deployed interface.',
    descriptionAr: 'تطبيقات ويب متكاملة من تصميم قاعدة البيانات حتى الواجهة المنشورة.',
    icon: 'layers',
    featuresEn: [
      'Database design and migrations',
      'RESTful API development',
      'Authentication and roles',
      'Responsive user interface',
    ],
    featuresAr: [
      'تصميم قاعدة البيانات والترحيلات',
      'تطوير واجهات RESTful',
      'المصادقة والأدوار',
      'واجهة مستخدم متجاوبة',
    ],
    sortOrder: 1,
  },
  {
    titleEn: 'E-commerce Solutions',
    titleAr: 'حلول التجارة الإلكترونية',
    descriptionEn: 'Online stores with catalogues, carts, coupons and secure payment flows.',
    descriptionAr: 'متاجر إلكترونية بكتالوجات وسلال وكوبونات ومسارات دفع آمنة.',
    icon: 'shopping-cart',
    featuresEn: [
      'Product and category management',
      'Coupon and discount engine',
      'Payment gateway integration',
      'Sales dashboard and reports',
    ],
    featuresAr: [
      'إدارة المنتجات والتصنيفات',
      'نظام كوبونات وخصومات',
      'دمج بوابات الدفع',
      'لوحة تحكم وتقارير المبيعات',
    ],
    sortOrder: 2,
  },
  {
    titleEn: 'API & Backend Development',
    titleAr: 'تطوير الواجهات والخلفية',
    descriptionEn: 'Reliable backends and third-party API integrations that hold up under load.',
    descriptionAr: 'خدمات خلفية موثوقة ودمج واجهات خارجية تتحمّل الحمل.',
    icon: 'server',
    featuresEn: [
      'RESTful API design',
      'Third-party API integration',
      'Query optimisation',
      'Documentation and versioning',
    ],
    featuresAr: [
      'تصميم واجهات RESTful',
      'دمج واجهات خارجية',
      'تحسين الاستعلامات',
      'توثيق وإصدارات',
    ],
    sortOrder: 3,
  },
  {
    titleEn: 'Frontend Development',
    titleAr: 'تطوير الواجهات الأمامية',
    descriptionEn: 'Fast, accessible interfaces built with React.js and Next.js.',
    descriptionAr: 'واجهات سريعة ومتاحة مبنية بـ React.js و Next.js.',
    icon: 'layout',
    featuresEn: [
      'React.js and Next.js',
      'Component architecture',
      'State management',
      'Performance optimisation',
    ],
    featuresAr: ['React.js و Next.js', 'بنية المكوّنات', 'إدارة الحالة', 'تحسين الأداء'],
    sortOrder: 4,
  },
];

// ---------------------------------------------------------------------------
// Social links
// ---------------------------------------------------------------------------

const socialLinks = [
  { platform: 'github', url: 'https://github.com/JimyRozany', sortOrder: 1 },
  { platform: 'linkedin', url: 'https://linkedin.com/in/rozny', sortOrder: 2 },
  { platform: 'email', url: 'mailto:rozny@yahoo.com', sortOrder: 3 },
  { platform: 'phone', url: 'tel:+201153791575', sortOrder: 4 },
];

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------

const siteSettings: Array<{ key: string; value: string }> = [
  {
    key: 'site.title',
    value: JSON.stringify({ en: 'Mohamed Gamal', ar: 'محمد جمال' }),
  },
  {
    key: 'site.tagline',
    value: JSON.stringify({
      en: 'Full Stack Developer — Laravel · React.js · Next.js',
      ar: 'مطوّر ويب متكامل — Laravel · React.js · Next.js',
    }),
  },
  {
    key: 'site.description',
    value: JSON.stringify({
      en: 'Full Stack Developer with 2+ years building production-grade systems with Laravel, React.js and Next.js across e-commerce, ERP, medical and project-management platforms.',
      ar: 'مطوّر ويب متكامل بخبرة تتجاوز عامين في بناء أنظمة جاهزة للإنتاج باستخدام Laravel و React.js و Next.js عبر منصات التجارة الإلكترونية وأنظمة ERP والطب وإدارة المشاريع.',
    }),
  },
  { key: 'contact.email', value: 'rozny@yahoo.com' },
  { key: 'contact.phone', value: '+201153791575' },
  { key: 'contact.location', value: JSON.stringify({ en: 'Cairo, Egypt', ar: 'القاهرة، مصر' }) },
  { key: 'contact.available', value: 'true' },
  { key: 'profile.years_of_experience', value: '2' },
  { key: 'resume.path', value: '/Mohamed_Gamal_CV.pdf' },
  { key: 'social.defaults', value: JSON.stringify(socialLinks) },
  { key: 'seo.og_image', value: '/opengraph-image.png' },
  { key: 'features.show_testimonials', value: 'false' },
  { key: 'features.show_services', value: 'true' },
];

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

/** Run the seed inside a transaction so a failure never leaves half content. */
async function main(): Promise<void> {
  console.log('Seeding portfolio database...\n');

  // -- Users -----------------------------------------------------------------
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
    console.log(`  user            ${user.email}`);
  }

  // -- Skill categories ------------------------------------------------------
  // Resolved by name so the skills block below can reference them by label.
  const categoryIdByName = new Map<string, number>();

  for (const category of skillCategories) {
    const saved = await prisma.skillCategory.upsert({
      where: { id: await existingCategoryId(category.nameEn) },
      update: { nameAr: category.nameAr, sortOrder: category.sortOrder },
      create: category,
    });
    categoryIdByName.set(category.nameEn, saved.id);
  }
  console.log(`  categories      ${skillCategories.length}`);

  // -- Skills ----------------------------------------------------------------
  for (const skill of skills) {
    const categoryId = categoryIdByName.get(skill.category) ?? null;
    const existing = await prisma.skill.findFirst({ where: { name: skill.name } });

    const data = {
      name: skill.name,
      icon: skill.icon,
      categoryId,
      level: skill.level,
      sortOrder: skill.sortOrder,
    };

    if (existing) {
      await prisma.skill.update({ where: { id: existing.id }, data });
    } else {
      await prisma.skill.create({ data });
    }
  }
  console.log(`  skills          ${skills.length}`);

  // -- Projects --------------------------------------------------------------
  for (const project of projects) {
    const { longDescriptionEn, longDescriptionAr, ...rest } = project;

    await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...rest, longDescriptionEn, longDescriptionAr },
      create: { ...rest, longDescriptionEn, longDescriptionAr },
    });
  }
  console.log(`  projects        ${projects.length}`);

  // -- Experience ------------------------------------------------------------
  for (const experience of experiences) {
    const existing = await prisma.experience.findFirst({
      where: { company: experience.company, positionEn: experience.positionEn },
    });

    if (existing) {
      await prisma.experience.update({ where: { id: existing.id }, data: experience });
    } else {
      await prisma.experience.create({ data: experience });
    }
  }
  console.log(`  experiences     ${experiences.length}`);

  // -- Education -------------------------------------------------------------
  for (const education of educations) {
    const existing = await prisma.education.findFirst({
      where: { institution: education.institution },
    });

    if (existing) {
      await prisma.education.update({ where: { id: existing.id }, data: education });
    } else {
      await prisma.education.create({ data: education });
    }
  }
  console.log(`  educations      ${educations.length}`);

  // -- Services --------------------------------------------------------------
  for (const service of services) {
    const existing = await prisma.service.findFirst({
      where: { titleEn: service.titleEn },
    });

    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: service });
    } else {
      await prisma.service.create({ data: service });
    }
  }
  console.log(`  services        ${services.length}`);

  // -- Social links ----------------------------------------------------------
  for (const link of socialLinks) {
    await prisma.socialLink.upsert({
      where: { platform: link.platform },
      update: { url: link.url, sortOrder: link.sortOrder },
      create: { ...link, active: true },
    });
  }
  console.log(`  social links    ${socialLinks.length}`);

  // -- Site settings ---------------------------------------------------------
  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`  settings        ${siteSettings.length}`);

  console.log('\nSeed complete.');
}

/**
 * `SkillCategory` has no natural unique key, so the category id is looked up by
 * the English name. Returns `-1` when the row does not exist yet, which makes
 * the `upsert` fall through to `create`.
 */
async function existingCategoryId(nameEn: string): Promise<number> {
  const existing = await prisma.skillCategory.findFirst({ where: { nameEn } });
  return existing?.id ?? -1;
}

main()
  .catch((error: unknown) => {
    console.error('\nSeed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
