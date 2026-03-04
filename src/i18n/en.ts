export const en = {
  // Common
  common: {
    appName: "Vascular Atlas",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    export: "Export",
    configure: "Configure",
    back: "Back",
    next: "Next",
    submit: "Submit",
    close: "Close",
    confirm: "Confirm",
    viewAll: "View All",
    comingSoon: "Coming soon",
    betaPreview: "Beta Preview",
    notAMedicalDevice: "Not a medical device",
    version: "v1.0 MVP · Compliance-Ready",
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    getStarted: "Get Started",
    learnMore: "Learn More",
    analytics: "Analytics",
    upload: "Upload",
    start: "Start",
    continue: "Continue",
  },

  // Sidebar
  sidebar: {
    clinical: "Clinical",
    dashboard: "Dashboard",
    aiAssistant: "AI Assistant",
    patients: "Patients",
    digitalTwin: "Digital Twin",
    registry: "Registry",
    education: "Education",
    simulationLab: "Simulation Lab",
    expertNetwork: "Expert Network",
    researchHub: "Research Hub",
    betaPreview: "Beta Preview",
    federatedLearning: "Federated Learning",
    aiSafety: "AI Safety",
    imagingPipeline: "Imaging Pipeline",
    wearables: "Wearables",
    arTraining: "AR Training",
    administration: "Administration",
    compliance: "Compliance",
    team: "Team",
    settings: "Settings",
  },

  // Command palette
  command: {
    placeholder: "Search modules, patients, or actions...",
    noResults: "No results found.",
    navigation: "Navigation",
    dashboard: "Dashboard",
    aiAssistant: "AI Clinical Assistant",
    patients: "Patient Cases",
    digitalTwin: "Digital Twin",
    registry: "Outcomes Registry",
    education: "Education Hub",
    simulation: "Simulation Lab",
    network: "Expert Network",
    research: "Research Hub",
    compliance: "Compliance Center",
    settings: "Settings",
  },

  // Top bar
  topBar: {
    searchPlaceholder: "Search or command...",
  },

  // Landing
  landing: {
    nav: {
      pricing: "Pricing",
      signIn: "Sign In",
    },
    hero: {
      badge: "The Intelligence OS for Vascular Medicine",
      title: "Vascular Atlas",
      subtitle: "Unifying clinical workflow, AI assistance, outcomes registry, certification, research, and expert networking — across USA, EU & Switzerland.",
      cta: "Start Free Trial",
      secondary: "View Plans",
    },
    modules: {
      title: "Six Core Modules",
      subtitle: "A unified platform built for vascular medicine excellence.",
      ai: {
        title: "AI Clinical Assistant",
        desc: "Structured SOAP notes, differentials, care pathways — generated with full transparency and clinician confirmation.",
      },
      twin: {
        title: "Vascular Digital Twin",
        desc: "Longitudinal patient timelines with interactive vascular maps, lesion tracking, and scenario simulation.",
      },
      registry: {
        title: "Global Outcomes Registry",
        desc: "Standardized outcomes for PAD, aortic, carotid, venous, and thromboembolic disease with privacy-first benchmarking.",
      },
      education: {
        title: "Certification & CME",
        desc: "Five competency tracks with micro-lessons, supervised logbooks, OSCE checklists, and digital badges.",
      },
      simulation: {
        title: "Clinical Simulation Lab",
        desc: "Interactive branching cases with rubric-constrained AI feedback and skill heatmaps.",
      },
      network: {
        title: "Global Expert Network",
        desc: "De-identified case discussions, structured tele-expertise, and mentorship matching across specialties.",
      },
    },
    trust: {
      title: "Compliance-Ready by Design",
      subtitle: "Built with auditability, traceability, and safety as first principles.",
      signals: [
        "Compliance-ready audit infrastructure",
        "Privacy-first: no re-identification in benchmarking",
        "AI outputs always require clinician confirmation",
        "Multi-tenant institution workspaces with RLS",
        "Citation placeholders — never fabricated guidelines",
        "Role-based access for physicians, trainees, admins",
      ],
    },
    cta: {
      title: "Ready to Transform Vascular Care?",
      subtitle: "Join institutions worldwide using Vascular Atlas.",
      button: "Get Started Free",
    },
    footer: "© 2026 Vascular Atlas. Compliance-ready platform. Not a medical device.",
  },

  // Pricing
  pricing: {
    title: "Plans & Pricing",
    subtitle: "From individual physicians to large institutions — find the right plan for your vascular practice.",
    mostPopular: "Most Popular",
    plans: {
      individual: {
        name: "Individual",
        price: "Free",
        period: "forever",
        desc: "For individual physicians exploring the platform",
        features: [
          "AI Clinical Assistant (limited)",
          "5 patient cases",
          "Education hub access",
          "Community forum access",
        ],
        cta: "Start Free",
      },
      professional: {
        name: "Professional",
        price: "$99",
        period: "/month",
        desc: "For practicing vascular physicians",
        features: [
          "Unlimited AI Assistant",
          "Unlimited patient cases",
          "Digital Twin + Timeline",
          "Outcomes registry",
          "Full education + certification",
          "Simulation lab access",
          "Expert consultations (5/mo)",
        ],
        cta: "Start Trial",
      },
      institution: {
        name: "Institution",
        price: "Custom",
        period: "per seat",
        desc: "For hospitals and vascular centers",
        features: [
          "Everything in Professional",
          "Multi-tenant workspace",
          "Aggregate dashboards",
          "Benchmarking analytics",
          "Research hub + study builder",
          "Compliance center",
          "SSO integration",
          "Dedicated support",
        ],
        cta: "Contact Sales",
      },
    },
  },

  // Auth
  auth: {
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",
    signUpDesc: "Join the global vascular medicine platform",
    signInDesc: "Sign in to your Vascular Atlas account",
    email: "Email",
    emailPlaceholder: "you@hospital.org",
    password: "Password",
    passwordPlaceholder: "••••••••",
    createBtn: "Create Account",
    signInBtn: "Sign In",
    switchToSignIn: "Already have an account? Sign in",
    switchToSignUp: "Don't have an account? Sign up",
    checkEmail: "Check your email",
    checkEmailDesc: "We sent you a confirmation link to verify your account.",
    error: "Error",
    authRequired: "Authentication required",
    authRequiredDesc: "Please sign in to use the AI Assistant.",
  },

  // 404
  notFound: {
    title: "404",
    message: "Oops! Page not found",
    backHome: "Return to Home",
  },

  // Dashboard
  dashboard: {
    title: "Clinical Dashboard",
    welcome: "Welcome back. Here's your clinical overview.",
    quickActions: {
      newCase: "New Patient Case",
      aiAssistant: "AI Assistant",
      simulation: "Start Simulation",
      education: "Continue Learning",
    },
    stats: {
      activeCases: "Active Cases",
      aiReports: "AI Reports",
      cmeCredits: "CME Credits",
      simulations: "Simulations",
    },
    recentActivity: "Recent Activity",
    modules: "Clinical Modules",
    moduleDesc: {
      ai: "Generate AI-powered clinical reports with structured SOAP notes and differential diagnoses.",
      twin: "View longitudinal patient timelines, vascular maps, and run scenario simulations.",
      registry: "Contribute to and analyze vascular outcomes data with privacy-preserving benchmarking.",
      education: "Complete competency tracks, earn CME credits, and collect digital badges.",
      simulation: "Practice clinical decision-making with interactive branching scenarios.",
      research: "Design studies, manage cohorts, and export de-identified datasets.",
    },
  },

  // AI Assistant
  aiAssistant: {
    title: "AI Clinical Assistant",
    subtitle: "Generate structured clinical reports with AI-powered analysis",
    badge: "Clinician Confirmation Required",
    disclaimer: {
      title: "AI-Generated Content — Not a Diagnosis",
      body: "All outputs require clinician review and confirmation. Citation fields use placeholders. This tool does not provide medical advice or diagnoses.",
    },
    signInPrompt: "Sign in to generate and save AI reports with full audit trail.",
    intake: {
      title: "Clinical Intake",
      subtitle: "Enter patient data for AI analysis",
      symptoms: "Symptoms & Presentation",
      symptomsPlaceholder: "e.g., Intermittent claudication, rest pain, walking distance 200m...",
      riskFactors: "Risk Factors",
      riskFactorsPlaceholder: "e.g., Diabetes, hypertension, smoking history 30 pack-years...",
      abi: "ABI / IPS",
      abiPlaceholder: "e.g., Right: 0.65, Left: 0.82",
      doppler: "Doppler Summary",
      dopplerPlaceholder: "e.g., Monophasic flow SFA right",
      imaging: "CTA/MRA Summary",
      imagingPlaceholder: "e.g., Occlusion of right SFA, patent popliteal...",
      labs: "Labs",
      labsPlaceholder: "e.g., HbA1c 7.8%, LDL 160mg/dL",
      medications: "Current Medications",
      medicationsPlaceholder: "e.g., Aspirin, Statin, Cilostazol",
    },
    generate: "Generate Report",
    generating: "Generating...",
    output: {
      title: "AI-Generated Report",
      subtitle: "Review, confirm, and export",
      report: "Report",
      evidence: "Evidence",
      empty: "Enter clinical data and generate a report",
      dataUsed: "Data Used",
      dataUsedDesc: "Patient-provided clinical data from intake form.",
      uncertainty: "Uncertainty & Limits",
      uncertaintyDesc: "AI analysis is based on structured input only. Guidelines use placeholder citations.",
      clinicianRequired: "Clinician Confirmation Required",
      clinicianRequiredDesc: "This output must be reviewed by a qualified clinician before any clinical action.",
      copyEHR: "Copy to EHR",
      copied: "Copied",
      copiedDesc: "Report copied as plain text (EHR format)",
      exportPDF: "Export PDF",
      confirmSign: "Confirm & Sign",
      signedOff: "Signed off",
      signedOffDesc: "Report confirmed and signed by clinician.",
    },
    history: {
      title: "Report History",
      subtitle: "Previous AI-generated reports with audit trail",
      signed: "Signed",
      pending: "Pending",
      empty: "No reports yet",
      emptyDesc: "Generated reports will appear here with full audit trail.",
    },
  },

  // Patients
  patients: {
    title: "Patient Cases",
    subtitle: "Manage pseudonymized vascular patient records",
    newCase: "New Case",
    searchPlaceholder: "Search cases...",
    empty: "No patient cases yet",
    columns: {
      caseId: "Case ID",
      category: "Category",
      status: "Status",
      abi: "ABI",
      risk: "Risk",
      lastVisit: "Last Visit",
    },
    form: {
      description: "Create a new pseudonymized patient case",
      pseudonym: "Pseudonym",
      ageRange: "Age Range",
      sex: "Sex",
      male: "Male",
      female: "Female",
      category: "Category",
      caseTitle: "Case Title",
    },
  },

  // Digital Twin
  digitalTwin: {
    title: "Vascular Digital Twin",
    subtitle: "Longitudinal patient model with timeline, vascular mapping, and scenario simulation",
    tabs: {
      timeline: "Timeline",
      vascularMap: "Vascular Map",
      simulation: "Simulation",
      carePlan: "Care Plan",
    },
    vascularMapPlaceholder: "Interactive vascular map — select a patient to visualize arterial and venous anatomy with lesion overlay",
    simulationPlaceholder: "Scenario Comparison Engine — model treatment outcomes against baseline using patient-specific parameters",
    carePlan: {
      title: "Active Care Plan Goals",
    },
  },

  // Registry
  registry: {
    title: "Outcomes Registry",
    subtitle: "Structured vascular outcomes data with privacy-preserving benchmarking",
    badge: "Anonymized Data Only",
    tabs: {
      physician: "My Outcomes",
      institution: "Institution",
      benchmarking: "Benchmarking",
    },
    stats: {
      casesContributed: "Cases Contributed",
      avgPatency: "Avg. Patency",
      amputationRate: "Amputation Rate",
    },
    table: {
      category: "Category",
      entries: "Entries",
      amputation: "Amputation",
      restenosis: "Restenosis",
      mortality: "Mortality",
      complications: "Complications",
    },
    institutionPlaceholder: "Aggregate institution dashboard — requires Hospital Admin role",
    benchmarkPlaceholder: "Percentile comparison against global registry — anonymized",
  },

  // Education
  education: {
    title: "Education Hub",
    subtitle: "Competency tracks, micro-lessons, and certification for vascular medicine",
    cmeCredits: "CME Credits",
    stats: {
      modulesCompleted: "Modules Completed",
      badgesEarned: "Badges Earned",
      tracksInProgress: "Tracks in Progress",
    },
    tracks: "Competency Tracks",
    digitalBadges: "Digital Badges",
    badges: {
      verified: "Verified",
      inProgress: "In Progress",
    },
  },

  // Simulation
  simulation: {
    title: "Clinical Simulation Lab",
    subtitle: "Interactive branching cases with rubric-constrained AI feedback",
    tabs: {
      cases: "Case Library",
      heatmap: "Skill Heatmap",
      authoring: "Case Authoring",
    },
    authoringPlaceholder: "Create branching case scenarios with decision points, rubric scoring, and AI feedback triggers.",
    createCase: "Create New Case",
  },

  // Network
  network: {
    title: "Global Expert Network",
    subtitle: "De-identified case discussions, tele-expertise, and mentorship",
    tabs: {
      discussions: "Discussions",
      askExpert: "Ask an Expert",
      mentorship: "Mentorship",
    },
    newDiscussion: "New Discussion",
    searchDiscussions: "Search discussions...",
    submitCase: "Submit Case",
    askExpertDesc: "Submit a de-identified case for structured expert review with response within 48h.",
    requestMentorship: "Request Mentorship",
    rating: "Rating",
    cases: "cases",
  },

  // Research
  research: {
    title: "Research Hub",
    subtitle: "Design studies, manage cohorts, and export de-identified datasets",
    newStudy: "New Study",
    stats: {
      activeStudies: "Active Studies",
      eligiblePatients: "Eligible Patients",
      dataExports: "Data Exports",
    },
  },

  // Compliance
  compliance: {
    title: "Compliance & Safety Center",
    subtitle: "Audit trail, consent management, and AI safety monitoring",
    stats: {
      auditEvents: "Audit Events",
      consentsActive: "Consents Active",
      aiOutputsLogged: "AI Outputs Logged",
      issuesReported: "Issues Reported",
    },
    tabs: {
      audit: "Audit Log",
      consent: "Consent Management",
      aiSafety: "AI Safety",
    },
    table: {
      action: "Action",
      user: "User",
      time: "Time",
      type: "Type",
      status: "Status",
    },
    consentItems: [
      "Patient data processing consent",
      "Research participation consent",
      "AI-assisted analysis consent",
    ],
    aiSafetyMetrics: {
      modelVersion: "Model Version",
      signOffRate: "Sign-off Rate",
      issuesReported: "Issues Reported",
    },
  },

  // Team
  team: {
    title: "Team Management",
    subtitle: "Manage institution workspace members and roles",
    inviteMember: "Invite Member",
    columns: {
      name: "Name",
      email: "Email",
      role: "Role",
      status: "Status",
    },
    statuses: {
      active: "Active",
      invited: "Invited",
    },
  },

  // Settings
  settings: {
    title: "Settings",
    subtitle: "Institution, integrations, and preferences",
    institution: {
      title: "Institution",
      name: "Institution Name",
      namePlaceholder: "University Hospital",
      country: "Country",
      countryPlaceholder: "Switzerland",
    },
    language: {
      title: "Language",
    },
    appearance: {
      title: "Appearance",
      darkMode: "Dark Mode",
    },
    security: {
      title: "Security",
      sso: "SSO Integration",
      rateLimiting: "Rate Limiting",
    },
  },

  // Beta: Federated Learning
  federated: {
    title: "Federated Learning",
    subtitle: "Privacy-preserving multi-institution model training. Each node trains locally and shares only model updates — no raw data leaves the institution.",
    optIn: {
      title: "Institution Opt-in",
      desc: "Enable federated participation. Your institution contributes model gradients — never raw patient data.",
      toggle: "Participate in Federated Training",
    },
    status: {
      title: "Federated Node Status",
      nodeStatus: "Node Status",
      inactive: "Inactive",
      trainingRounds: "Training Rounds",
      modelVersion: "Model Version",
    },
  },

  // Beta: AI Safety
  aiSafetyPage: {
    title: "AI Safety Layer",
    subtitle: "Medical-grade MLOps — model versioning, drift detection, and human override tracking.",
    stats: {
      modelVersion: "Model Version",
      outputsLogged: "Outputs Logged",
      issuesReported: "Issues Reported",
      signOffRate: "Sign-off Rate",
    },
    drift: {
      title: "Drift Detection",
      subtitle: "Monitor model performance and data distribution shifts",
      placeholder: "Drift detection dashboard — coming soon",
    },
  },

  // Beta: Imaging
  imaging: {
    title: "Imaging Pipeline",
    subtitle: "Upload imaging summaries, structured measurements, and annotation tools. DICOM-ready architecture.",
    uploadSummary: "Upload Summary",
    uploadDesc: "Upload imaging report summaries",
    measurements: "Measurements",
    measurementsDesc: "Aneurysm diameters, stenosis grading",
    annotation: "Annotation Tool",
    annotationDesc: "Mark & annotate imaging findings",
    dicom: {
      title: "DICOM Architecture",
      subtitle: "Future: Direct DICOM ingest pipeline — architecture placeholder",
      placeholder: "DICOM integration — architecture ready",
    },
  },

  // Beta: Wearables
  wearables: {
    title: "Wearables & Home Monitoring",
    subtitle: "Patient app concept for walking tests, symptom diary, wound photos, and compression adherence.",
    features: {
      walking: { title: "Walking Test Tracking", desc: "6-minute walk test, claudication distance" },
      symptom: { title: "Symptom Diary", desc: "Daily symptom logging and trends" },
      wound: { title: "Wound Photo Diary", desc: "Sequential wound documentation" },
      compression: { title: "Compression Adherence", desc: "Compression therapy compliance logging" },
    },
    consent: {
      title: "Patient Consent & Data Sharing",
      items: [
        "Share walking test data with physician",
        "Share wound photos with care team",
        "Allow data for research purposes",
      ],
    },
  },

  // Beta: AR Training
  arTraining: {
    title: "Immersive Training (AR)",
    subtitle: "Augmented-reality checklist mode and station-based procedural training concepts.",
    checklist: {
      title: "AR Checklist Mode",
    },
    station: {
      title: "Station-Based Training",
      placeholder: "Ultrasound-guided station training — coming soon",
    },
  },
};
