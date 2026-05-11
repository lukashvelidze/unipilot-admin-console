type SubscriptionTier = 'free' | 'basic' | 'standard' | 'premium';

export type EducationLevel =
  | 'foundation'
  | 'bachelors'
  | 'masters'
  | 'phd'
  | 'exchange'
  | 'language';

export interface CountryRecord {
  code: string;
  name: string;
  is_active: boolean;
}

export interface CountryOption {
  code: string;
  name: string;
}

export interface VisaTypeRecord {
  code: string;
  country_code: string | null;
  title: string;
  description: string | null;
  is_active: boolean;
}

export interface ChecklistRecord {
  id: string;
  visa_type: string;
  title: string;
  sort_order: number;
  country_code: string | null;
  subscription_tier: SubscriptionTier;
}

export interface ChecklistItemRecord {
  id: string;
  checklist_id: string | null;
  label: string;
  field_type: string;
  metadata: Record<string, unknown> | null;
  sort_order: number;
}

export interface ChecklistDraftItem {
  label: string;
  field_type: string;
  metadata: Record<string, unknown>;
  sort_order: number;
}

export interface ChecklistDraft {
  title: string;
  sort_order: number;
  subscription_tier: SubscriptionTier;
  items: ChecklistDraftItem[];
}

export interface ArticleDraft {
  slug: string;
  title: string;
  summary: string;
  content: string;
  categoryKey: 'visa' | 'housing' | 'flights' | 'scholarships';
}

export interface JourneyGenerationDraft {
  routeVisaCode: string;
  routeVisaTitle: string;
  routeVisaDescription: string;
  checklists: ChecklistDraft[];
  articles: ArticleDraft[];
  sourceSummary: string;
}

interface BuildJourneyDraftArgs {
  destination: CountryOption;
  origin: CountryOption;
  educationLevel: EducationLevel;
  visaTypes: VisaTypeRecord[];
  checklists: ChecklistRecord[];
  checklistItems: ChecklistItemRecord[];
}

interface EducationProfile {
  label: string;
  applicationTarget: string;
  academicRecords: string;
  supportingDocs: string;
  writingTask: string;
  offerType: string;
  fundingAngle: string;
  interviewAngle: string;
  arrivalPriority: string;
}

const GENERATED_ROUTE_PREFIX = 'ROUTE_STUDY';
const ISO_ALPHA2_COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
];

export const EDUCATION_LEVEL_OPTIONS: Array<{ value: EducationLevel; label: string }> = [
  { value: 'foundation', label: 'Foundation / Pathway' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'exchange', label: 'Exchange / Visiting' },
  { value: 'language', label: 'Language course' },
];

const EDUCATION_PROFILES: Record<EducationLevel, EducationProfile> = {
  foundation: {
    label: 'Foundation / Pathway',
    applicationTarget: 'foundation or pathway programs',
    academicRecords: 'secondary school transcripts, school leaving certificate, and predicted grades if final results are pending',
    supportingDocs: 'parent or guardian sponsorship proof, extracurricular records, and any bridging-course requirements',
    writingTask: 'prepare a short statement explaining why a pathway year is the right bridge into degree study',
    offerType: 'pathway or conditional admission offer',
    fundingAngle: 'family sponsorship, pathway scholarships, and the first-year total cost of study',
    interviewAngle: 'show maturity, a realistic academic transition plan, and a clear reason for not starting directly in a degree',
    arrivalPriority: 'confirm who will support you during your first weeks and how academic advising works after arrival',
  },
  bachelors: {
    label: "Bachelor's",
    applicationTarget: 'undergraduate degree programs',
    academicRecords: 'high school transcripts, graduation certificate, and any standardized test history that strengthens the file',
    supportingDocs: 'activity list, recommendation letters, and a clear academic-interest narrative',
    writingTask: 'prepare a focused personal statement that explains your academic interests and long-term direction',
    offerType: 'undergraduate admission offer',
    fundingAngle: 'tuition planning, scholarships, sponsor support, and living-cost coverage for the first academic year',
    interviewAngle: 'show that you understand the program, why you chose the destination, and how the degree fits your goals',
    arrivalPriority: 'understand orientation, freshman enrollment, and how housing and health coverage begin',
  },
  masters: {
    label: "Master's",
    applicationTarget: "master's degree programs",
    academicRecords: "bachelor's transcript, diploma copy, credential evaluation needs, and course-level evidence for prerequisites",
    supportingDocs: 'updated CV, recommendation letters, and any internship or work experience that supports the specialization',
    writingTask: 'prepare a sharp statement of purpose tied to the exact specialization and career outcome you want',
    offerType: "master's admission offer",
    fundingAngle: 'merit awards, assistantships, employer support, and a realistic first-year cash-flow plan',
    interviewAngle: 'show why the program is a deliberate specialization choice rather than a generic move abroad',
    arrivalPriority: 'plan course registration, assistantship onboarding, and early networking with faculty or career services',
  },
  phd: {
    label: 'PhD',
    applicationTarget: 'doctoral or research-track programs',
    academicRecords: "bachelor's and master's records, thesis work, publication list, and any formal research proposal components",
    supportingDocs: 'supervisor outreach, reference letters from academic mentors, and evidence of research fit',
    writingTask: 'prepare a research proposal or supervisor-fit statement that is specific, evidence-based, and feasible',
    offerType: 'doctoral admission, supervisor invitation, or research placement confirmation',
    fundingAngle: 'stipends, grants, tuition waivers, and proof that the funding package really covers living costs',
    interviewAngle: 'show research focus, supervisor alignment, and why the destination is the right place for your project',
    arrivalPriority: 'finalize supervisor contact, lab onboarding, ethics or enrollment deadlines, and stipend setup',
  },
  exchange: {
    label: 'Exchange / Visiting',
    applicationTarget: 'semester exchange, visiting study, or home-university mobility programs',
    academicRecords: 'current university transcript, active enrollment proof, and any course-approval paperwork from your home institution',
    supportingDocs: 'learning agreement, nomination letter, and approval for transfer-credit recognition',
    writingTask: 'prepare a short academic rationale that explains why the exchange destination improves your degree path',
    offerType: 'exchange acceptance or visiting-student confirmation',
    fundingAngle: 'mobility grants, home-campus support, and the full short-term cost of travel, housing, and insurance',
    interviewAngle: 'show that the exchange has a temporary academic purpose and that your home-degree obligations remain clear',
    arrivalPriority: 'confirm course add/drop deadlines, transcript transfer rules, and local registration requirements',
  },
  language: {
    label: 'Language course',
    applicationTarget: 'full-time language-school or preparatory language programs',
    academicRecords: 'latest study records, prior language certificates if any, and level-placement details from the school',
    supportingDocs: 'course schedule, attendance expectations, and documents showing how the language program supports your next step',
    writingTask: 'prepare a statement that connects the language course to a concrete academic or professional objective',
    offerType: 'language-course admission confirmation',
    fundingAngle: 'private funding, sponsor support, and proof that short-course costs, insurance, and living expenses are covered',
    interviewAngle: 'show that the language course has a real purpose, a realistic timeline, and a credible return plan or next step',
    arrivalPriority: 'understand attendance rules, placement testing, housing lead time, and any registration needed after arrival',
  },
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const getEducationLevelLabel = (educationLevel: EducationLevel) =>
  EDUCATION_LEVEL_OPTIONS.find((option) => option.value === educationLevel)?.label ?? educationLevel;

export const buildCountryOptions = (existingCountries: CountryRecord[]): CountryOption[] => {
  const existingByName = new Map(existingCountries.map((country) => [normalizeText(country.name), country]));
  const seenNames = new Set<string>();
  const options: CountryOption[] = [];

  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    ISO_ALPHA2_COUNTRY_CODES
      .map((code) => ({ code, name: regionNames.of(code) || code }))
      .filter((country) => country.name !== country.code)
      .sort((left, right) => left.name.localeCompare(right.name))
      .forEach((country) => {
        const key = normalizeText(country.name);
        const existingMatch = existingByName.get(key);
        seenNames.add(key);
        options.push({
          code: existingMatch?.code || country.code,
          name: existingMatch?.name || country.name,
        });
      });
  } catch {
    // Older browsers may not support Intl.DisplayNames. Existing DB countries remain available below.
  }

  existingCountries
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((country) => {
      const key = normalizeText(country.name);
      if (seenNames.has(key)) return;
      seenNames.add(key);
      options.push({ code: country.code, name: country.name });
    });

  return options;
};

export const buildJourneyDraft = ({
  destination,
  origin,
  educationLevel,
  visaTypes,
  checklists,
  checklistItems,
}: BuildJourneyDraftArgs): JourneyGenerationDraft => {
  const routeVisaCode = buildRouteVisaCode(destination.code, origin.code, educationLevel);
  const routeVisaTitle = `${destination.name} ${getEducationLevelLabel(educationLevel)} journey from ${origin.name}`;
  const routeVisaDescription = `Generated study-abroad journey for ${getEducationLevelLabel(
    educationLevel
  )} students moving from ${origin.name} to ${destination.name}.`;

  const template = buildTemplateFromExistingJourney({
    destination,
    origin,
    educationLevel,
    visaTypes,
    checklists,
    checklistItems,
  });

  const sourceSummary = template
    ? `Used ${template.templateVisa.title} as the destination template and added route-specific planning steps.`
    : `No detailed checklist template exists for ${destination.name} yet, so a generic route blueprint was generated.`;

  const draftChecklists = template
    ? reindexChecklists([
        buildRouteSetupChecklist(origin.name, destination.name, educationLevel),
        ...template.checklists,
      ])
    : buildGenericJourneyChecklists(origin.name, destination.name, educationLevel);

  return {
    routeVisaCode,
    routeVisaTitle,
    routeVisaDescription,
    checklists: draftChecklists,
    articles: buildRouteArticles(origin.name, destination.name, educationLevel),
    sourceSummary,
  };
};

const buildRouteVisaCode = (destinationCode: string, originCode: string, educationLevel: EducationLevel) =>
  `${GENERATED_ROUTE_PREFIX}_${destinationCode}_${originCode}_${educationLevel}`.replace(/[^\w-]/g, '_');

const buildTemplateFromExistingJourney = ({
  destination,
  origin,
  educationLevel,
  visaTypes,
  checklists,
  checklistItems,
}: BuildJourneyDraftArgs) => {
  const checklistsByVisa = new Map<string, ChecklistRecord[]>();
  checklists.forEach((checklist) => {
    const list = checklistsByVisa.get(checklist.visa_type) || [];
    list.push(checklist);
    checklistsByVisa.set(checklist.visa_type, list);
  });

  const itemsByChecklistId = new Map<string, ChecklistItemRecord[]>();
  checklistItems.forEach((item) => {
    if (!item.checklist_id) return;
    const list = itemsByChecklistId.get(item.checklist_id) || [];
    list.push(item);
    itemsByChecklistId.set(item.checklist_id, list);
  });

  const destinationVisas = visaTypes.filter((visa) => visa.country_code === destination.code);
  const rankedTemplates = destinationVisas
    .map((visa) => {
      const visaChecklists = (checklistsByVisa.get(visa.code) || []).slice().sort((left, right) => left.sort_order - right.sort_order);
      const itemCount = visaChecklists.reduce(
        (sum, checklist) => sum + (itemsByChecklistId.get(checklist.id) || []).length,
        0
      );

      return {
        visa,
        visaChecklists,
        itemCount,
        checklistCount: visaChecklists.length,
        keywordScore: scoreVisaTemplate(visa, educationLevel),
      };
    })
    .filter((template) => template.checklistCount > 0 && template.itemCount > 0)
    .sort((left, right) => {
      if (right.keywordScore !== left.keywordScore) return right.keywordScore - left.keywordScore;
      if (right.itemCount !== left.itemCount) return right.itemCount - left.itemCount;
      if (right.checklistCount !== left.checklistCount) return right.checklistCount - left.checklistCount;
      return left.visa.title.localeCompare(right.visa.title);
    });

  const bestTemplate = rankedTemplates[0];
  if (!bestTemplate) return null;

  const routeContextChecklist = buildOriginDocumentChecklist(origin.name, destination.name, educationLevel);
  const copiedChecklists: ChecklistDraft[] = bestTemplate.visaChecklists.map((checklist) => ({
    title: checklist.title,
    sort_order: checklist.sort_order,
    subscription_tier: checklist.subscription_tier,
    items: (itemsByChecklistId.get(checklist.id) || [])
      .slice()
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((item) => ({
        label: item.label,
        field_type: item.field_type || 'checkbox',
        metadata: item.metadata || {},
        sort_order: item.sort_order,
      })),
  }));

  return {
    templateVisa: bestTemplate.visa,
    checklists: reindexChecklists([routeContextChecklist, ...copiedChecklists]),
  };
};

const scoreVisaTemplate = (visa: VisaTypeRecord, educationLevel: EducationLevel) => {
  const text = `${visa.code} ${visa.title} ${visa.description || ''}`.toLowerCase();
  if (educationLevel === 'exchange') {
    if (text.includes('exchange') || text.includes('j-1') || text.includes('j1')) return 100;
    if (text.includes('student') || text.includes('study')) return 40;
    return 0;
  }

  if (educationLevel === 'language') {
    if (text.includes('language') || text.includes('sprach') || text.includes('course')) return 100;
    if (text.includes('student') || text.includes('study')) return 35;
    return 0;
  }

  if (text.includes('student') || text.includes('study') || text.includes('permit') || text.includes('tier') || text.includes('subclass')) {
    return 100;
  }

  if (text.includes('exchange')) return 15;
  return 25;
};

const buildRouteSetupChecklist = (
  originName: string,
  destinationName: string,
  educationLevel: EducationLevel
): ChecklistDraft => {
  const profile = EDUCATION_PROFILES[educationLevel];

  return {
    title: `Route setup: ${originName} to ${destinationName}`,
    sort_order: 1,
    subscription_tier: 'free',
    items: checklistItemsFromLabels([
      `Confirm your ${profile.label} goal, target intake, and ideal arrival month`,
      `Create one master timeline for the full move from ${originName} to ${destinationName}`,
      `Check passport validity and renewal timing before major applications begin`,
      `Review official entry, student, and consular guidance that applies to applicants living in ${originName}`,
      `List which documents from ${originName} may need translation, notarization, or apostille before use in ${destinationName}`,
      `Set a first-year budget covering tuition, visa costs, travel, housing, insurance, and emergency funds`,
      `Save official university, immigration, embassy, and housing links in one route workspace`,
      `Define your fallback plan if your first-choice university or timeline slips`,
    ]),
  };
};

const buildOriginDocumentChecklist = (
  originName: string,
  destinationName: string,
  educationLevel: EducationLevel
): ChecklistDraft => {
  const profile = EDUCATION_PROFILES[educationLevel];

  return {
    title: `Route-specific document rules`,
    sort_order: 2,
    subscription_tier: 'free',
    items: checklistItemsFromLabels([
      `Make a source-of-truth list for all documents issued in ${originName} that will be submitted in ${destinationName}`,
      `Check whether civil, academic, or financial documents need certified translation into the language accepted by your school or visa process`,
      `Confirm whether apostille, legalization, or embassy authentication is required for records from ${originName}`,
      `Verify whether police certificates, medicals, or biometrics are tied to residence in ${originName}`,
      `Review sponsor evidence requirements when funds are held in accounts based in ${originName}`,
      `Prepare a document naming convention so scanned files match application and visa portal expectations`,
      `Track expiration dates for passport, bank letters, language scores, and any route-specific certificates`,
      `Write down the exact visa-processing office or appointment center serving applicants from ${originName}`,
    ]),
  };
};

const buildGenericJourneyChecklists = (
  originName: string,
  destinationName: string,
  educationLevel: EducationLevel
): ChecklistDraft[] => {
  const profile = EDUCATION_PROFILES[educationLevel];

  return reindexChecklists([
    buildRouteSetupChecklist(originName, destinationName, educationLevel),
    {
      title: `Shortlist ${profile.applicationTarget}`,
      sort_order: 2,
      subscription_tier: 'free',
      items: checklistItemsFromLabels([
        `Define non-negotiables for studying in ${destinationName}: budget, city size, ranking needs, and post-study goals`,
        `Build a balanced shortlist of ambitious, realistic, and safe options`,
        `Check whether each program accepts applicants educated in ${originName}`,
        `Review tuition, deposit rules, and refund policies before applying`,
        `Confirm entry dates, program duration, and attendance format`,
        `Note whether housing or orientation deadlines arrive before the tuition deadline`,
        `Check whether the institution has route-specific guidance for students coming from ${originName}`,
        `Record every application portal, login, and deadline in one tracker`,
      ]),
    },
    {
      title: 'Prepare academic documents and narratives',
      sort_order: 3,
      subscription_tier: 'free',
      items: checklistItemsFromLabels([
        `Collect ${profile.academicRecords}`,
        `Confirm whether any transcripts from ${originName} need official translation or credential evaluation`,
        `Prepare ${profile.supportingDocs}`,
        `Draft a concise academic CV or activity summary`,
        `Ask referees early and share your timeline, program list, and supporting context`,
        `Prepare identity scans that match passport spelling exactly`,
        profile.writingTask,
        `Proofread every document so names, dates, and institutions are consistent across the full application set`,
      ]),
    },
    {
      title: 'Meet admissions and language requirements',
      sort_order: 4,
      subscription_tier: 'free',
      items: checklistItemsFromLabels([
        `Check whether standardized tests, interviews, or auditions apply to your target programs`,
        `Confirm accepted English or local-language tests and minimum score rules`,
        `Book test dates early enough for score release and retakes`,
        `Verify whether destination institutions waive language tests for applicants from your background`,
        `Prepare a remediation plan if one requirement is currently missing`,
        `Review portfolio, proposal, or writing-sample rules if relevant`,
        `Save the official admissions page for every institution rather than relying on third-party summaries`,
        `Check whether the institution requires an original paper copy after digital submission`,
      ]),
    },
    {
      title: 'Build the funding plan',
      sort_order: 5,
      subscription_tier: 'free',
      items: checklistItemsFromLabels([
        `Estimate total cost of study in ${destinationName}, not just tuition`,
        `Document your main funding mix: ${profile.fundingAngle}`,
        `Check minimum proof-of-funds windows and account-history rules`,
        `Prepare sponsor letters and relationship evidence if someone in ${originName} is supporting you`,
        `Keep large recent deposits explainable with supporting paperwork`,
        `Plan currency conversion and international transfer timing`,
        `Reserve money for visa fees, travel, housing deposit, insurance, and first-month living costs`,
        `Create a buffer for delayed refunds, delayed visa outcomes, or housing changes`,
      ]),
    },
    {
      title: 'Submit applications and manage offers',
      sort_order: 6,
      subscription_tier: 'free',
      items: checklistItemsFromLabels([
        `Submit each application at least a few days before the real deadline`,
        `Track all reference submissions, payment receipts, and portal confirmations`,
        `Follow up on missing documents before the institution has to request them`,
        `Compare offers on tuition, scholarship terms, living costs, and route-to-visa timing`,
        `Accept the strongest-fit offer only after understanding deposit and deferral rules`,
        `Secure the exact enrollment document needed for the visa stage, such as your ${profile.offerType}`,
        `Check whether the school requires tuition deposit, housing forms, or insurance enrollment before visa filing`,
        `Collect official contact details for the admissions or international office handling post-offer questions`,
      ]),
    },
    {
      title: 'Prepare the visa file',
      sort_order: 7,
      subscription_tier: 'basic',
      items: checklistItemsFromLabels([
        `Read the official student-visa guidance for ${destinationName} from start to finish`,
        `List every mandatory document and identify which ones must come from ${originName}`,
        `Prepare passport scans, admission evidence, funding proof, photographs, and signed declarations`,
        `Check whether translations, notarizations, or legalized copies are required in the visa file`,
        `Verify health-insurance, medical, or police-certificate rules`,
        `Draft clear explanations for study plan, funding source, and why the route from ${originName} to ${destinationName} is logical`,
        `Double-check that names, dates, and course information match the school documents exactly`,
        `Save screenshots or PDFs of every completed form before final submission`,
      ]),
    },
    {
      title: 'Handle appointments and decision follow-up',
      sort_order: 8,
      subscription_tier: 'basic',
      items: checklistItemsFromLabels([
        `Book biometrics, interview, medical, or document-drop appointments as soon as the filing rules allow`,
        `Confirm which visa center or embassy handles applicants from ${originName}`,
        `Prepare a physical and digital folder for appointment day`,
        `Practice concise answers around study purpose, finances, and post-study intent`,
        `Keep payment receipts, tracking numbers, and appointment confirmations organized`,
        `Monitor processing times and respond quickly to additional-document requests`,
        `Avoid booking irreversible travel until your approval status is clear enough`,
        `Prepare a backup intake or deferral plan if the timeline becomes too tight`,
      ]),
    },
    {
      title: 'Secure housing, insurance, and travel',
      sort_order: 9,
      subscription_tier: 'basic',
      items: checklistItemsFromLabels([
        `Compare dorm, shared housing, and short-term arrival options in ${destinationName}`,
        `Check common housing scams, deposit rules, and contract terms before paying`,
        `Confirm when health insurance must begin and who is responsible for activation`,
        `Review baggage, transit-visa, and entry-document needs for the trip from ${originName} to ${destinationName}`,
        `Choose an arrival date that leaves time for housing check-in and registration before classes start`,
        `Prepare airport transfer, temporary SIM, and emergency-contact details`,
        `Keep copies of admission, visa, accommodation, and insurance documents in your carry-on bag`,
        `Make a first-week budget for food, transport, and any local registration fees`,
      ]),
    },
    {
      title: 'Pre-departure and first-month setup',
      sort_order: 10,
      subscription_tier: 'basic',
      items: checklistItemsFromLabels([
        `Attend any pre-departure orientation offered by the school or student office`,
        `Pack original documents, medication notes, and a small emergency fund`,
        `Tell your bank about international travel and prepare payment methods that work on arrival`,
        `Check local registration, residence-permit, or university verification deadlines after landing`,
        profile.arrivalPriority,
        `Plan how you will open a bank account, activate a local number, and reach campus during the first week`,
        `Record key deadlines for visa compliance, course registration, and housing payments after arrival`,
        `Schedule a final review of the entire route one week before departure so nothing is left unclear`,
      ]),
    },
  ]);
};

const buildRouteArticles = (
  originName: string,
  destinationName: string,
  educationLevel: EducationLevel
): ArticleDraft[] => {
  const levelLabel = getEducationLevelLabel(educationLevel);
  const routePrefix = `${originName} to ${destinationName} ${levelLabel}`;

  return [
    {
      categoryKey: 'visa',
      slug: slugify(`${routePrefix} visa preparation`),
      title: `${originName} to ${destinationName}: visa preparation for ${levelLabel} students`,
      summary: `A practical route guide for students moving from ${originName} to ${destinationName}, covering admissions evidence, financial proof, and consular preparation.`,
      content: buildVisaArticle(originName, destinationName, educationLevel),
    },
    {
      categoryKey: 'housing',
      slug: slugify(`${routePrefix} housing planning`),
      title: `Finding housing in ${destinationName} as a ${levelLabel} student from ${originName}`,
      summary: `Housing decisions shape your first month abroad. This guide focuses on timing, documents, deposit risk, and arrival strategy for ${originName} to ${destinationName} students.`,
      content: buildHousingArticle(originName, destinationName, educationLevel),
    },
    {
      categoryKey: 'flights',
      slug: slugify(`${routePrefix} flight planning`),
      title: `Planning your flight from ${originName} to ${destinationName} for ${levelLabel} study`,
      summary: `A route-based checklist for booking flights, carrying documents, handling baggage, and avoiding last-minute travel mistakes.`,
      content: buildFlightsArticle(originName, destinationName, educationLevel),
    },
    {
      categoryKey: 'scholarships',
      slug: slugify(`${routePrefix} scholarships and funding`),
      title: `Funding a ${levelLabel} journey in ${destinationName} from ${originName}`,
      summary: `How to combine scholarships, sponsor evidence, and practical budgeting when planning ${levelLabel} study in ${destinationName}.`,
      content: buildScholarshipsArticle(originName, destinationName, educationLevel),
    },
  ];
};

const buildVisaArticle = (originName: string, destinationName: string, educationLevel: EducationLevel) => {
  const profile = EDUCATION_PROFILES[educationLevel];
  const levelLabel = getEducationLevelLabel(educationLevel);

  return [
    `Planning a ${levelLabel.toLowerCase()} route from ${originName} to ${destinationName} becomes much easier once you treat the process as one connected chain instead of separate tasks. Admission, finances, visa paperwork, housing, and travel all affect each other. If one part slips, the rest of the route usually gets more expensive and more stressful.`,
    '',
    `Start by anchoring everything to the document that proves the academic purpose of your move. For this route, that means building a clean file around your application target, making sure your academic history and supporting evidence stay consistent from school application through visa submission. Students often create problems for themselves when the wording in their statement, offer letter, funding explanation, and interview answers do not fully align.`,
    '',
    `The next major pressure point is route-specific document handling. Because your core evidence is issued in ${originName} and reviewed for study in ${destinationName}, you need to check early whether translations, notarization, legalization, biometrics, police certificates, or medicals are required. This is where a lot of avoidable delays come from. The safest approach is to build a source-of-truth list that shows which document exists, who issued it, whether it needs certification, and when it expires.`,
    '',
    `Financial proof also deserves more seriousness than many students give it. Immigration systems usually care less about vague future plans and more about whether your money is traceable, available, and clearly connected to tuition and living costs. If your funding relies on family or sponsors in ${originName}, the link between the sponsor, the bank records, and your study plan should be obvious. Large unexplained deposits or inconsistent sponsor narratives create unnecessary risk.`,
    '',
    `Finally, do not wait until visa filing to think about timing. Book tests, gather official records, pay deposits, and schedule appointments with buffer built in. A strong route is one where you could explain the logic from the first application step all the way to your first week in ${destinationName} without contradictions. That clarity matters just as much as the documents themselves.`,
  ].join('\n');
};

const buildHousingArticle = (originName: string, destinationName: string, educationLevel: EducationLevel) => {
  const levelLabel = getEducationLevelLabel(educationLevel);

  return [
    `Housing is one of the first real-life problems that hits students moving from ${originName} to ${destinationName}. By the time your admission or visa work is almost done, you still need a safe place to land, understand deposit rules, and judge neighborhoods you may never have seen in person. That is why housing should not be left as a final-week task.`,
    '',
    `For ${levelLabel.toLowerCase()} students, the best starting point is usually structure rather than perfection. Shortlist the most realistic options first: university housing, verified student residences, temporary arrival accommodation, and shared rentals with transparent terms. The goal is to reduce risk during your first month, not to find a perfect long-term apartment before you even arrive.`,
    '',
    `Document handling matters here too. Landlords or residence providers often ask for identity proof, admission confirmation, visa evidence, guarantor information, or upfront deposits. If your financial documents or sponsor arrangements are based in ${originName}, decide early what you can show quickly and what may take time to translate or certify. Delays on this side can cost you better housing options.`,
    '',
    `Be cautious with urgency tactics. Students moving internationally are easy targets for fake listings, pressure to wire money, or contracts they do not fully understand. If a listing refuses verification, avoids a written agreement, or asks for a large transfer without proper documentation, treat that as a warning sign. Paying slightly more for a verified short-term option is often smarter than losing money to the wrong lease.`,
    '',
    `The best housing plan is the one that supports the rest of your route. Choose an arrival setup that gives you time to complete registration, rest after travel, and start classes without panic. Once you are stable in ${destinationName}, you can upgrade your living situation from a position of control instead of stress.`,
  ].join('\n');
};

const buildFlightsArticle = (originName: string, destinationName: string, educationLevel: EducationLevel) => {
  const levelLabel = getEducationLevelLabel(educationLevel);

  return [
    `Booking the flight from ${originName} to ${destinationName} seems simple until you realize how many other parts of the route it touches. Your travel date affects housing check-in, airport pickup, university onboarding, and sometimes even the validity window of your immigration documents. For ${levelLabel.toLowerCase()} students, flights should be booked as part of the arrival plan, not as a random final purchase.`,
    '',
    `Price matters, but it is not the only thing that matters. When you are moving for study, baggage allowance, transit rules, and arrival time can easily matter more than saving a small amount on the fare. A flight that lands during business hours, includes checked baggage, and avoids difficult transfers often saves more stress than the absolute cheapest option.`,
    '',
    `Route-specific document risk is also real. Depending on the path from ${originName} to ${destinationName}, you may need to check transit visas, self-transfer baggage rules, or extra screening at certain airports. Keep your passport, admission evidence, visa approval, housing booking, and emergency contacts in your carry-on bag. If anything goes wrong mid-route, those are the documents that keep the situation manageable.`,
    '',
    `It is also worth thinking about your first 48 hours, not just the flight itself. A cheap ticket that lands at midnight can become expensive if it forces you into unsafe transport, extra hotel costs, or a missed move-in window. Try to arrive at a time that makes sense for registration, bank setup, local SIM activation, and your first commute to campus.`,
    '',
    `Students who travel well usually do one thing better than everyone else: they prepare the arrival sequence. Book the right route, pack documents intelligently, and know what happens after you land in ${destinationName}. That is what turns a stressful trip into a controlled transition.`,
  ].join('\n');
};

const buildScholarshipsArticle = (originName: string, destinationName: string, educationLevel: EducationLevel) => {
  const profile = EDUCATION_PROFILES[educationLevel];
  const levelLabel = getEducationLevelLabel(educationLevel);

  return [
    `Funding a ${levelLabel.toLowerCase()} journey from ${originName} to ${destinationName} usually works best when students stop looking for one miracle scholarship and start building a complete funding stack. Tuition support, family sponsorship, assistantships, mobility grants, departmental awards, and personal savings can work together. The strongest plans are layered, not dependent on one uncertain outcome.`,
    '',
    `Your first move should be to map deadlines and funding types by source. Universities in ${destinationName} may offer scholarships tied to admission, separate faculty awards, or aid that only appears after you contact a department directly. At the same time, sponsors or scholarship bodies in ${originName} may require nomination letters, translated records, or early proof of admission. Missing one deadline can close several funding doors at once.`,
    '',
    `This is especially important for ${levelLabel.toLowerCase()} students because the evidence behind the application and the evidence behind the visa often overlap. If you claim a sponsor, be ready to show the sponsor relationship and the source of funds. If you count on institutional funding, make sure the award terms are clear enough to support your budgeting plan. Vague promises are not a reliable financial strategy.`,
    '',
    `A good scholarship search is also selective. Focus on awards that match your academic profile, country of origin, field, or destination. Sending generic messages to dozens of offices usually produces weak results. A smaller number of targeted applications, backed by clean documents and a clear narrative, tends to move farther.`,
    '',
    `In practice, funding becomes manageable when you treat it as part of the whole route. Tie every funding source to a deadline, a required document set, and a backup plan. That gives you a route that remains stable even if one scholarship does not land exactly the way you hoped.`,
  ].join('\n');
};

const checklistItemsFromLabels = (labels: string[]): ChecklistDraftItem[] =>
  labels.map((label, index) => ({
    label,
    field_type: 'checkbox',
    metadata: {},
    sort_order: index + 1,
  }));

const reindexChecklists = (checklists: ChecklistDraft[]): ChecklistDraft[] =>
  checklists.map((checklist, checklistIndex) => ({
    ...checklist,
    sort_order: checklistIndex + 1,
    items: checklist.items.map((item, itemIndex) => ({
      ...item,
      sort_order: itemIndex + 1,
    })),
  }));
