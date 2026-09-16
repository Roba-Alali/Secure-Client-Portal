import { ClientUser, Project, DocumentItem, LoginLog, ViewLog, AdminNotification, WatermarkConfig } from '../types';

export const initialClients: ClientUser[] = [
  {
    id: 'client-1',
    name: 'عبدالرحمن المنصور',
    nameEn: 'Abdulrahman Al-Mansoor',
    email: 'mansoor@alofooq-consulting.com',
    company: 'مؤسسة الأفق للاستشارات',
    companyEn: 'Al-Ofooq Consulting',
    phone: '+966 50 123 4567',
    status: 'active',
    assignedProjectIds: ['proj-1', 'proj-2'],
    lastLogin: '2025-05-12 14:32:10',
    ipAddress: '197.34.12.88',
    accessExpiry: '2026-12-31',
    allowedIp: ''
  },
  {
    id: 'client-2',
    name: 'سارة التميمي',
    nameEn: 'Sarah Al-Tamimi',
    email: 'sarah@alrowad-group.com',
    company: 'مجموعة الرواد الدولية',
    companyEn: 'Al-Rowad International Group',
    phone: '+971 52 987 6543',
    status: 'active',
    assignedProjectIds: ['proj-2', 'proj-3'],
    lastLogin: '2025-05-11 09:15:40',
    ipAddress: '82.165.197.14',
    accessExpiry: '2026-08-15',
    allowedIp: ''
  },
  {
    id: 'client-3',
    name: 'م. طارق الخالدي',
    nameEn: 'Eng. Tarek Al-Khaldi',
    email: 'tarek@innovatetech.sa',
    company: 'شركة الابتكار الرقمي',
    companyEn: 'Innovate Tech Solutions',
    phone: '+966 55 456 7890',
    status: 'active',
    assignedProjectIds: ['proj-1', 'proj-3'],
    lastLogin: '2025-05-10 18:22:05',
    ipAddress: '151.254.102.3',
    accessExpiry: '2025-11-30',
    allowedIp: ''
  }
];

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: 'دراسة الجدوى والتطوير الاستراتيجي 2025',
    titleEn: 'Feasibility Study & Strategic Roadmap 2025',
    category: 'استشارات وتخطيط',
    categoryEn: 'Consulting & Strategy',
    description: 'ملف متكامل يحتوي على دراسات السوق والتقييم المالي، العروض التقديمية الاستراتيجية، ومقاطع الفيديو التوضيحية لخطوات التنفيذ.',
    descriptionEn: 'Comprehensive folder containing market research, financial assessments, strategic pitch decks, and implementation walkthroughs.',
    clientIds: ['client-1', 'client-3'],
    status: 'active',
    updatedAt: '2025-05-12',
    documentCount: {
      pdf: 2,
      presentation: 1,
      video: 1
    }
  },
  {
    id: 'proj-2',
    title: 'عقد الشراكة الاستثمارية وميثاق الحوكمة',
    titleEn: 'Investment Partnership & Governance Charter',
    category: 'قانوني واستثماري',
    categoryEn: 'Legal & Investment',
    description: 'العقود الرسمية المصادق عليها، ملخص الحصص، هيكل الإدارة التنفيذية، ولوائح حماية الملكية الفكرية المخصصة للشركاء.',
    descriptionEn: 'Official ratified agreements, equity distribution summary, executive governance structure, and proprietary IP regulations.',
    clientIds: ['client-1', 'client-2'],
    status: 'active',
    updatedAt: '2025-05-11',
    documentCount: {
      pdf: 2,
      presentation: 1,
      video: 0
    }
  },
  {
    id: 'proj-3',
    title: 'حملة الإطلاق والإنتاج الإعلامي الموجه',
    titleEn: 'Brand Launch Campaign & Media Deliverables',
    category: 'تسويق وإعلام',
    categoryEn: 'Media & Marketing',
    description: 'الهوية البصرية الكاملة، عروض الخطط الإعلانية للربع الثالث، والمقاطع الإعلانية النهائية المعتمدة للمراجعة.',
    descriptionEn: 'Brand guidelines, Q3 advertising roadmap deck, and master promotional video cuts awaiting final executive review.',
    clientIds: ['client-2', 'client-3'],
    status: 'in-progress',
    updatedAt: '2025-05-09',
    documentCount: {
      pdf: 1,
      presentation: 1,
      video: 2
    }
  }
];

export const initialDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    projectId: 'proj-1',
    title: 'تقرير دراسة الجدوى والتحليل المالي السري',
    titleEn: 'Confidential Feasibility & Financial Assessment Report',
    description: 'تحليل تكاليف رأس المال، الإيرادات التقديرية للسنوات الثلاث القادمة، ومؤشرات العائد على الاستثمار (ROI).',
    descriptionEn: 'CapEx breakdown, 3-year projected revenue streams, and internal rate of return benchmarks.',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    pageCount: 6,
    uploadedAt: '2025-05-10',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 14,
    contentPages: [
      'صفحة 1: الغلاف الرسمي والملخص التنفيذي للمشروع - مستند حصري غير قابل للنشر أو التصوير.',
      'صفحة 2: دراسة السوق وحجم الطلب المتوقع في منطقة الخليج والشرق الأوسط، ونموذج التسعير الديناميكي.',
      'صفحة 3: التكاليف التشغيلية (OpEx) والنفقات الرأسمالية (CapEx) للسنوات المالية 2025-2027.',
      'صفحة 4: جدول التدفقات النقدية المتوقعة، نقطة التعادل، ومعدل العائد الداخلي المرجح (IRR = 27.4%).',
      'صفحة 5: إدارة المخاطر واستراتيجيات التحوط التشغيلي والتعامل مع تقلبات سلاسل الإمداد.',
      'صفحة 6: التوصيات الختامية، ملحق التواقيع، واعتماد مجلس الإدارة للبدء في خطة التنفيذ.'
    ]
  },
  {
    id: 'doc-2',
    projectId: 'proj-1',
    title: 'اتفاقية عدم الإفصاح والسرية المتبادلة (NDA)',
    titleEn: 'Mutual Non-Disclosure Agreement (NDA)',
    description: 'البنود القانونية الصارمة لحماية الأسرار التجارية والبيانات المشتركة، مع غرامات الإخلال بالسرية.',
    descriptionEn: 'Binding legal clauses protecting trade secrets, proprietary workflows, and confidentiality penalties.',
    fileType: 'pdf',
    fileSize: '1.2 MB',
    pageCount: 4,
    uploadedAt: '2025-05-08',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 8,
    contentPages: [
      'صفحة 1: أطراف الاتفاقية والتمهيد التعريفي للمشروع ونطاق الالتزام.',
      'صفحة 2: تعريف المعلومات السرية والاستثناءات المحددة وفق القانون المعمول به.',
      'صفحة 3: مدة سريان التعهد (خمس سنوات) والتزامات الأطراف عند انتهاء التعاقد.',
      'صفحة 4: الاختصاص القضائي، فض النزاعات، وتوقيعات المفوضين الرسميين.'
    ]
  },
  {
    id: 'doc-3',
    projectId: 'proj-1',
    title: 'عرض استراتيجية التوسع ودخول الأسواق 2025',
    titleEn: 'Strategic Expansion & Market Entry Pitch Deck',
    description: 'عرض تقديمي تفاعلي يوضح مراحل النمو، الشركاء المستهدفين، ومراحل التوسع الإقليمي.',
    descriptionEn: 'Interactive strategic deck detailing growth milestones, target alliances, and regional launch stages.',
    fileType: 'presentation',
    fileSize: '12.4 MB',
    pageCount: 5,
    uploadedAt: '2025-05-11',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 22,
    slides: [
      {
        title: 'الرؤية الاستراتيجية 2025 - 2027',
        subtitle: 'بناء منصة رائدة للخدمات النوعية في الأسواق الإقليمية',
        content: [
          'الاستحواذ على حصة سوقية 14% في السنة الأولى',
          'تحقيق كفاءة تشغيلية بنسبة 35% عبر الأتمتة الرقمية',
          'تأسيس شراكات حصرية مع كبار الموزعين المحليين'
        ]
      },
      {
        title: 'مصفوفة المنتجات والحلول المبتكرة',
        subtitle: 'تقديم قيمة مضافة تنافسية وغير مسبوقة',
        content: [
          'الحل السحابي المتكامل بإعدادات مخصصة بالكامل',
          'بوابة عملاء فائقة الأمان مع حماية رقمية للبيانات',
          'دعم فني استشاري مباشر على مدار الساعة'
        ]
      },
      {
        title: 'المعالم الزمنية ومراحل التنفيذ (Roadmap)',
        subtitle: 'جدول زمني محكم على 4 مراحل ربع سنوية',
        content: [
          'الربع الأول: إطلاق النسخة التجريبية واختبارات الأمان',
          'الربع الثاني: استقطاب العملاء الأوائل وقياس الأداء',
          'الربع الثالث: التوسع التسويقي وحملات التوعية',
          'الربع الرابع: التوسع في أسواق الخليج المجاورة'
        ]
      },
      {
        title: 'النموذج المالي وتوقعات النمو',
        subtitle: 'مؤشرات أداء واضحة وعوائد مجزية',
        content: [
          'نمو تراكمي في الإيرادات السنوية بمعدل 42%',
          'الهامش الإجمالي المستهدف لا يقل عن 68%',
          'فترة استرداد رأس المال خلال 18 شهراً فقط'
        ]
      },
      {
        title: 'فريق القيادة ومجلس المستشارين',
        subtitle: 'خبرات تنفيذية تتجاوز 40 عاماً مجتمعة',
        content: [
          'قيادة تقنية متخصصة في أمن المعلومات والبنى السحابية',
          'مستشارون ماليون معتمدون في كبرى بيوت الاستثمار',
          'فريق قانوني متخصص في صياغة العقود والشراكات'
        ]
      }
    ]
  },
  {
    id: 'doc-4',
    projectId: 'proj-1',
    title: 'جلسة العرض التوضيحي وتدريب القيادات (Walkthrough)',
    titleEn: 'Executive System Walkthrough & Training Video',
    description: 'شرح مسجل بالفيديو عالي الدقة لطريقة استخدام البوابة ولوحات التحكم للمدراء التنفيذيين.',
    descriptionEn: 'High-definition executive walkthrough showing portal navigation and governance monitoring.',
    fileType: 'video',
    fileSize: '68.5 MB',
    duration: '07:45',
    uploadedAt: '2025-05-09',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 19,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'doc-5',
    projectId: 'proj-2',
    title: 'صيغة عقد الشراكة والمحاصة القانونية المعتمدة',
    titleEn: 'Ratified Joint Venture & Equity Agreement',
    description: 'العقد الأساسي الموقع بالختم الرقمي لتنظيم نسب المساهمة وتوزيع الأرباح وحقوق التصويت.',
    descriptionEn: 'Master equity partnership agreement governing voting rights, dividend policies, and dispute arbitration.',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    pageCount: 5,
    uploadedAt: '2025-05-11',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 11,
    contentPages: [
      'صفحة 1: البيانات الرسمية للشركاء، التأسيس، ورأس المال الأولي.',
      'صفحة 2: حصص الشركاء، نسبة الأرباح السنوية، وآلية الاحتياطي النظامي.',
      'صفحة 3: مجلس المديرين، صلاحيات الصرف، والتوقيع البنكي المعتمد.',
      'صفحة 4: شروط خروج الشريك، حق الشفعة، وقواعد تقييم الحصص العادلة.',
      'صفحة 5: أحكام عامة، فض النزاعات عبر التحكيم التجاري، والتواقيع الرسمية.'
    ]
  },
  {
    id: 'doc-6',
    projectId: 'proj-2',
    title: 'لائحة الحوكمة والسياسات الداخلية للشركاء',
    titleEn: 'Internal Governance & Compliance Policies',
    description: 'سياسة تضارب المصالح، الرقابة المالية، وضوابط الإفصاح والشفافية للشركاء.',
    descriptionEn: 'Conflict-of-interest procedures, audit controls, and disclosure standards for stakeholders.',
    fileType: 'pdf',
    fileSize: '2.5 MB',
    pageCount: 4,
    uploadedAt: '2025-05-05',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 7,
    contentPages: [
      'صفحة 1: مقدمة الحوكمة والمبادئ التوجيهية للنزاهة الإدارية والمالية.',
      'صفحة 2: لجنة المراجعة الداخلية والتدقيق الخارجي المستقل.',
      'صفحة 3: سياسة الإبلاغ عن المخالفات وحماية سرية المراسلات.',
      'صفحة 4: التحديثات السنوية ومراجعة مؤشرات الامتثال التنظيمي.'
    ]
  },
  {
    id: 'doc-7',
    projectId: 'proj-2',
    title: 'عرض هيكل الحصص وتوزيع رأس المال',
    titleEn: 'Capital Allocation & Cap Table Deck',
    description: 'شرائح تفاعلية توضح تطور قيمة السهم وجولات التمويل المستهدفة حتى عام 2027.',
    descriptionEn: 'Cap table evolution slides showing anticipated dilution and equity valuations through 2027.',
    fileType: 'presentation',
    fileSize: '8.7 MB',
    pageCount: 4,
    uploadedAt: '2025-05-06',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 9,
    slides: [
      {
        title: 'هيكل رأس المال الحالي (Pre-Money)',
        subtitle: 'توزيع الحصص التأسيسية بين الشركاء المؤسسين',
        content: [
          'الشريك المؤسس الأول: 45% من حقوق الملكية',
          'الشريك التقني والاستشاري: 35% من حقوق الملكية',
          'خيار حوافز الموظفين الاستراتيجيين (ESOP): 20%'
        ]
      },
      {
        title: 'جولة التمويل الأولي (Seed Round)',
        subtitle: 'المبلغ المستهدف: 1.5 مليون دولار بتقييم 6 ملايين دولار',
        content: [
          'تخصيص 60% للإنفاق على البنية الرقمية والتسويق',
          'تخصيص 25% لبناء فريق المبيعات واستقطاب الكفاءات',
          'تخصيص 15% كاحتياطي طوارئ تشغيلي'
        ]
      },
      {
        title: 'مراحل التخارج وعوائد المستثمرين',
        subtitle: 'استراتيجيات التخارج بعد 5 سنوات استثمارية',
        content: [
          'طرح عام أولي في السوق المالي الموازي (Nomu)',
          'أو استحواذ استراتيجي من شركة إقليمية كبرى',
          'معدل مضاعف استثمار متوقع 4.2x - 6.5x'
        ]
      },
      {
        title: 'سياسة توزيعات الأرباح النقدية',
        subtitle: 'تحقيق توازن بين إعادة الاستثمار والعوائد المباشرة',
        content: [
          'احتجاز 50% من الأرباح الصافية لتسريع وتيرة النمو',
          'توزيع 50% نقداً على الشركاء بنهاية كل سنة مالية'
        ]
      }
    ]
  },
  {
    id: 'doc-8',
    projectId: 'proj-3',
    title: 'دليل الهوية البصرية والتطبيقات الرقمية',
    titleEn: 'Brand Identity & Visual Application Guidelines',
    description: 'الألوان المعتمدة، الخطوط الطباعية، قياسات الشعار، وضوابط الاستخدام في المنصات الرقمية.',
    descriptionEn: 'Color palettes, typographic hierarchy, logo safe-zones, and digital execution guidelines.',
    fileType: 'pdf',
    fileSize: '15.3 MB',
    pageCount: 5,
    uploadedAt: '2025-05-07',
    isConfidential: false,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 26,
    contentPages: [
      'صفحة 1: فلسفة الهوية وقصة الشعار والدلالات البصرية الحديثة.',
      'صفحة 2: لوحة الألوان الرسمية (Primary, Secondary, Accent) وأكواد Hex وCMYK.',
      'صفحة 3: عائلة الخطوط العربية والإنجليزية المعتمدة وأوزان العناوين والنصوص.',
      'صفحة 4: التطبيقات القرطاسية والمطبوعات الرسمية وبطاقات العمل.',
      'صفحة 5: الاستخدامات الخاطئة والمحاذير عند تطبيق الشعار في الشاشات والمواد الإعلانية.'
    ]
  },
  {
    id: 'doc-9',
    projectId: 'proj-3',
    title: 'خطة الحملة الإعلانية للربع الثالث 2025',
    titleEn: 'Q3 Multi-Channel Launch Campaign Deck',
    description: 'خطة النشر، الميزانيات المخصصة لكل منصة، والأهداف الرقمية للوصول والتفاعل.',
    descriptionEn: 'Media allocation plan, per-channel budget distribution, and target impression goals.',
    fileType: 'presentation',
    fileSize: '18.9 MB',
    pageCount: 4,
    uploadedAt: '2025-05-08',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 16,
    slides: [
      {
        title: 'الرسالة الإعلانية والجمهور المستهدف',
        subtitle: 'استهداف صناع القرار والرؤساء التنفيذيين في قطاع الأعمال',
        content: [
          'رسالة واضحة: الأمان الرقمي والكفاءة بدون تعقيدات البرمجيات التقليدية',
          'التركيز على الشركات المتوسطة والكبيرة في الخليج'
        ]
      },
      {
        title: 'توزيع الميزانية التسويقية على القنوات',
        subtitle: 'ميزانية إجمالية بقيمة 120,000 دولار موزعة بعناية',
        content: [
          'إعلانات لينكد إن (LinkedIn Ads): 45%',
          'حملات محركات البحث (Google Search & Display): 30%',
          'المحتوى المرئي والبودكاست التخصصي: 25%'
        ]
      },
      {
        title: 'مؤشرات الأداء الرئيسية (KPIs)',
        subtitle: 'أهداف رقمية محددة وقابلة للقياس خلال 90 يوماً',
        content: [
          'تحقيق 250 عميل مؤهل عالي الاهتمام (MQLs)',
          'عقد 60 جلسة تجريبية مع فرق المبيعات',
          'تكلفة اكتساب العميل المستهدفة أقل من 480 دولار'
        ]
      },
      {
        title: 'الجدول الزمني للإنتاج والنشر',
        subtitle: 'انطلاق الحملة على ثلاث موجات ترويجية',
        content: [
          'الموجة 1: إثارة الاهتمام والمشكلة الشائعة مع أنظمة ووردبريس',
          'الموجة 2: الكشف عن الحل المخصص الفائق السرعة والأمان',
          'الموجة 3: عروض خاصة للاشتراكات السنوية المبكرة'
        ]
      }
    ]
  },
  {
    id: 'doc-10',
    projectId: 'proj-3',
    title: 'المقطع الترويجي الماستر - النسخة النهائية للموافقة',
    titleEn: 'Master Launch Promo Video (Executive Cut)',
    description: 'الفيديو الإعلاني الرئيسي عالي الدقة (4K) مدبلج باللغة العربية مع مؤثرات بصرية احترافية.',
    descriptionEn: 'Final 4K master promotional video with Arabic voiceover and dynamic motion graphics.',
    fileType: 'video',
    fileSize: '95.2 MB',
    duration: '01:30',
    uploadedAt: '2025-05-09',
    isConfidential: true,
    watermarkEnabled: true,
    downloadRestricted: true,
    viewsCount: 31,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

export const initialWatermarkConfig: WatermarkConfig = {
  enabled: true,
  template: 'MMG VIP • {name} • {email} • سري للغاية',
  fontSize: 16,
  opacity: 0.22,
  rotation: -25,
  color: '#E40107',
  density: 'medium',
  driftAnimation: true,
  showClientName: true,
  showTimestamp: true,
  showIp: false,
  mobileScreenshotShield: true,
  obscureOnAppSwitch: true,
  multiTouchGestureShield: true,
  dynamicFloatingPill: false,
  antiCropCornerStamps: true
};

export const initialLoginLogs: LoginLog[] = [
  {
    id: 'log-101',
    clientId: 'client-1',
    clientName: 'عبدالرحمن المنصور',
    email: 'mansoor@alofooq-consulting.com',
    ipAddress: '197.34.12.88',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0 Safari/537.36',
    deviceType: 'Desktop',
    location: 'الرياض، المملكة العربية السعودية',
    timestamp: '2025-05-12 14:32:10',
    status: '2fa_verified'
  },
  {
    id: 'log-102',
    clientId: 'client-2',
    clientName: 'سارة التميمي',
    email: 'sarah@alrowad-group.com',
    ipAddress: '82.165.197.14',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/124.0.2478.80',
    deviceType: 'Desktop',
    location: 'دبي، الإمارات العربية المتحدة',
    timestamp: '2025-05-11 09:15:40',
    status: 'success'
  },
  {
    id: 'log-103',
    clientId: 'client-3',
    clientName: 'م. طارق الخالدي',
    email: 'tarek@innovatetech.sa',
    ipAddress: '151.254.102.3',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) Mobile/15E148 Safari/604.1',
    deviceType: 'Mobile',
    location: 'جدة، المملكة العربية السعودية',
    timestamp: '2025-05-10 18:22:05',
    status: '2fa_verified'
  },
  {
    id: 'log-104',
    clientId: 'unknown',
    clientName: 'محاولة غير مصرح بها',
    email: 'hacker@suspicious-proxy.net',
    ipAddress: '45.154.255.91',
    userAgent: 'Python-urllib/3.9',
    deviceType: 'Desktop',
    location: 'فرانكفورت، ألمانيا',
    timestamp: '2025-05-10 03:14:22',
    status: 'failed'
  }
];

export const initialViewLogs: ViewLog[] = [
  {
    id: 'view-201',
    documentId: 'doc-1',
    documentTitle: 'تقرير دراسة الجدوى والتحليل المالي السري',
    fileType: 'pdf',
    clientId: 'client-1',
    clientName: 'عبدالرحمن المنصور',
    clientEmail: 'mansoor@alofooq-consulting.com',
    ipAddress: '197.34.12.88',
    durationSeconds: 345,
    pagesViewed: 6,
    maxPageReached: 6,
    timestamp: '2025-05-12 14:35:22',
    watermarkApplied: 'mansoor@alofooq-consulting.com | 197.34.12.88 | 2025-05-12 14:35:22'
  },
  {
    id: 'view-202',
    documentId: 'doc-3',
    documentTitle: 'عرض استراتيجية التوسع ودخول الأسواق 2025',
    fileType: 'presentation',
    clientId: 'client-3',
    clientName: 'م. طارق الخالدي',
    clientEmail: 'tarek@innovatetech.sa',
    ipAddress: '151.254.102.3',
    durationSeconds: 180,
    pagesViewed: 5,
    maxPageReached: 5,
    timestamp: '2025-05-10 18:25:40',
    watermarkApplied: 'tarek@innovatetech.sa | 151.254.102.3 | 2025-05-10 18:25:40'
  },
  {
    id: 'view-203',
    documentId: 'doc-4',
    documentTitle: 'جلسة العرض التوضيحي وتدريب القيادات (Walkthrough)',
    fileType: 'video',
    clientId: 'client-1',
    clientName: 'عبدالرحمن المنصور',
    clientEmail: 'mansoor@alofooq-consulting.com',
    ipAddress: '197.34.12.88',
    durationSeconds: 465,
    timestamp: '2025-05-12 14:48:10',
    watermarkApplied: 'mansoor@alofooq-consulting.com | 197.34.12.88'
  },
  {
    id: 'view-204',
    documentId: 'doc-5',
    documentTitle: 'صيغة عقد الشراكة والمحاصة القانونية المعتمدة',
    fileType: 'pdf',
    clientId: 'client-2',
    clientName: 'سارة التميمي',
    clientEmail: 'sarah@alrowad-group.com',
    ipAddress: '82.165.197.14',
    durationSeconds: 520,
    pagesViewed: 5,
    maxPageReached: 5,
    timestamp: '2025-05-11 09:20:15',
    watermarkApplied: 'sarah@alrowad-group.com | 82.165.197.14 | 2025-05-11 09:20:15'
  }
];

export const initialNotifications: AdminNotification[] = [
  {
    id: 'notif-1',
    title: 'تسجيل دخول عميل موثوق',
    titleEn: 'Client Login Verified',
    message: 'قام عبدالرحمن المنصور (مؤسسة الأفق) بتسجيل الدخول بنجاح عبر التحقق الثنائي من الرياض.',
    messageEn: 'Abdulrahman Al-Mansoor logged in successfully via 2FA from Riyadh.',
    type: 'login',
    timestamp: '2025-05-12 14:32:10',
    read: false,
    metadata: {
      clientId: 'client-1',
      ipAddress: '197.34.12.88'
    }
  },
  {
    id: 'notif-2',
    title: 'فتح مستند عالي الحساسية',
    titleEn: 'Confidential Document Viewed',
    message: 'تم فتح "تقرير دراسة الجدوى والتحليل المالي السري" وتم تطبيق العلامة المائية الديناميكية الخاصة بالعميل.',
    messageEn: 'Confidential Feasibility Report opened. Dynamic client watermark active.',
    type: 'view',
    timestamp: '2025-05-12 14:35:22',
    read: false,
    metadata: {
      clientId: 'client-1',
      documentId: 'doc-1',
      ipAddress: '197.34.12.88'
    }
  },
  {
    id: 'notif-3',
    title: 'محاولة تسجيل دخول مشبوهة محجوبة',
    titleEn: 'Suspicious Login Blocked',
    message: 'تم حجب محاولة تسجيل دخول فاشلة من عنوان IP مجهول (45.154.255.91) بنجاح دون أي تسريب.',
    messageEn: 'Blocked unauthorized login attempt from untrusted IP (45.154.255.91).',
    type: 'security',
    timestamp: '2025-05-10 03:14:22',
    read: true,
    metadata: {
      ipAddress: '45.154.255.91'
    }
  }
];
