import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, Loader2, PlaneTakeoff, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotatingGlobe } from '@/components/public/RotatingGlobe';
import { fetchJourneyPlannerOptions, generateJourneyPlan } from '@/lib/journeyPlanner';
import { JourneyPlan } from '@/types/journeyPlanner';

const appStoreUrl = 'https://apps.apple.com/us/app/unipilot-journey-tracker/id6748587544';
const ambassadorProgramUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeyjSw2h6nV8wlyFW5aKQPDXJQFhyQ3_DZ_RO0f-2Z6kkjr7g/viewform';
const localPlannerStorageKey = 'unipilot:journey-planner:v1';

const features = [
  {
    icon: CheckCircle2,
    title: 'Track your process',
    description: 'Keep applications, deadlines, and next steps in one place.',
  },
  {
    icon: FileCheck2,
    title: 'Prepare your visa',
    description: 'Stay on top of documents, appointments, and interview prep.',
  },
  {
    icon: PlaneTakeoff,
    title: 'Get ready to arrive',
    description: 'Carry your plan through departure and arrival.',
  },
];

const bullets = [
  'Applications',
  'Visa steps',
  'Documents',
  'Deadlines',
  'Arrival planning',
];

const studyLevels = [
  { value: 'all', label: 'Any study level' },
  { value: 'bachelor', label: 'Bachelor' },
  { value: 'master', label: 'Master' },
  { value: 'phd', label: 'PhD' },
  { value: 'language', label: 'Language program' },
  { value: 'exchange', label: 'Exchange / pathway' },
];

type PlannerStoragePayload = {
  originCountryCode: string;
  destinationCountryCode: string;
  visaTypeCode: string;
  levelOfStudy: string;
  latestPlan: JourneyPlan | null;
};

export function HomePage() {
  const [originCountries, setOriginCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [destinationCountries, setDestinationCountries] = useState<Array<{ code: string; name: string }>>([]);
  const [visaTypes, setVisaTypes] = useState<Array<{ code: string; title: string; country_code: string | null }>>([]);

  const [originCountryCode, setOriginCountryCode] = useState('');
  const [destinationCountryCode, setDestinationCountryCode] = useState('');
  const [visaTypeCode, setVisaTypeCode] = useState('all');
  const [levelOfStudy, setLevelOfStudy] = useState('all');

  const [plannerLoading, setPlannerLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const [latestPlan, setLatestPlan] = useState<JourneyPlan | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(localPlannerStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as PlannerStoragePayload;
        setOriginCountryCode(parsed.originCountryCode || '');
        setDestinationCountryCode(parsed.destinationCountryCode || '');
        setVisaTypeCode(parsed.visaTypeCode || 'all');
        setLevelOfStudy(parsed.levelOfStudy || 'all');
        setLatestPlan(parsed.latestPlan || null);
      }
    } catch {
      localStorage.removeItem(localPlannerStorageKey);
    }

    const loadOptions = async () => {
      setPlannerLoading(true);
      try {
        const options = await fetchJourneyPlannerOptions();
        setOriginCountries(options.originCountries);
        setDestinationCountries(options.destinationCountries);
        setVisaTypes(options.visaTypes);
      } catch (error) {
        setPlannerError(error instanceof Error ? error.message : 'Failed to load planner options.');
      } finally {
        setPlannerLoading(false);
      }
    };

    loadOptions();
  }, []);

  const availableVisaTypes = useMemo(
    () =>
      visaTypes.filter(
        (visa) => !destinationCountryCode || !visa.country_code || visa.country_code === destinationCountryCode
      ),
    [destinationCountryCode, visaTypes]
  );

  const persistPlannerState = (plan: JourneyPlan | null) => {
    const payload: PlannerStoragePayload = {
      originCountryCode,
      destinationCountryCode,
      visaTypeCode,
      levelOfStudy,
      latestPlan: plan,
    };
    localStorage.setItem(localPlannerStorageKey, JSON.stringify(payload));
  };

  const handleGeneratePlan = async () => {
    if (!originCountryCode || !destinationCountryCode) {
      setPlannerError('Select both origin and destination countries before generating a plan.');
      return;
    }

    setPlannerError(null);
    setIsGenerating(true);

    try {
      const generated = await generateJourneyPlan({
        originCountryCode,
        destinationCountryCode,
        visaTypeCode: visaTypeCode === 'all' ? undefined : visaTypeCode,
        levelOfStudy: levelOfStudy === 'all' ? undefined : levelOfStudy,
      });

      setLatestPlan(generated);
      persistPlannerState(generated);
    } catch (error) {
      setPlannerError(error instanceof Error ? error.message : 'Failed to generate journey plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetPlanner = () => {
    setLatestPlan(null);
    setPlannerError(null);
    localStorage.removeItem(localPlannerStorageKey);
  };

  return (
    <div className="bg-white font-sans text-slate-950">
      <section className="border-b border-black/6 bg-white">
        <div className="landing-hero-shell container mx-auto px-4">
          <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="landing-hero-globe landing-fade-up landing-delay-1 w-full max-w-[340px] sm:max-w-none">
              <RotatingGlobe />
            </div>

            <div className="landing-hero-copy max-w-3xl">
              <p className="landing-fade-up px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-xs sm:tracking-[0.22em]">
                International student platform
              </p>

              <h1 className="landing-hero-title landing-fade-up landing-delay-2 mt-4 font-semibold leading-[1] tracking-[-0.05em]">
                Track your study abroad journey with
                {' '}
                <span className="text-[#ff6b6b]">UniPilot</span>.
              </h1>

              <p className="landing-hero-body landing-fade-up landing-delay-3 mx-auto max-w-[32rem] px-1 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                UniPilot helps students track the full move abroad process from application to arrival.
              </p>

              <div className="landing-hero-actions landing-fade-up landing-delay-4 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="w-full rounded-full px-6 text-base shadow-none sm:w-auto sm:px-7" asChild>
                  <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                    Download the app
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-black/10 bg-white px-6 text-base text-slate-700 shadow-none hover:bg-slate-50 sm:w-auto sm:px-7"
                  asChild
                >
                  <a href={ambassadorProgramUrl} target="_blank" rel="noopener noreferrer">Student Ambassador Program</a>
                </Button>
              </div>

              <div className="landing-hero-tags landing-fade-up landing-delay-4 flex flex-wrap justify-center gap-2">
                {bullets.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-black/8 px-3 py-1.5 text-xs text-slate-600 sm:text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey-planner" className="border-b border-black/8 bg-slate-50 py-12 sm:py-16">
        <div className="container mx-auto space-y-6 px-4">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Journey Planner</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Generate your route-specific checklist</h2>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Select origin and destination countries and let UniPilot auto-build procedures, deadlines, and checklist items.
            </p>
          </div>

          <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Origin country *</p>
                <Select value={originCountryCode} onValueChange={setOriginCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={plannerLoading ? 'Loading origins...' : 'Select origin'} />
                  </SelectTrigger>
                  <SelectContent>
                    {originCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Destination country *</p>
                <Select value={destinationCountryCode} onValueChange={setDestinationCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={plannerLoading ? 'Loading destinations...' : 'Select destination'} />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationCountries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Visa type (optional)</p>
                <Select value={visaTypeCode} onValueChange={setVisaTypeCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any visa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any visa</SelectItem>
                    {availableVisaTypes.map((visa) => (
                      <SelectItem key={visa.code} value={visa.code}>
                        {visa.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Study level (optional)</p>
                <Select value={levelOfStudy} onValueChange={setLevelOfStudy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any study level" />
                  </SelectTrigger>
                  <SelectContent>
                    {studyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button onClick={handleGeneratePlan} disabled={isGenerating || plannerLoading} className="sm:min-w-[210px]">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate my plan
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleResetPlanner} disabled={!latestPlan && !plannerError}>
                Clear saved plan
              </Button>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Generated guidance is informational and may vary by embassy/consulate. Always verify final requirements with official government sources.
              </p>
            </div>

            {plannerError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {plannerError}
              </div>
            )}
          </div>

          {latestPlan && (
            <div className="space-y-5 rounded-3xl border border-black/8 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.02em]">Your generated journey plan</h3>
                  <p className="text-sm text-slate-600">
                    Last updated: {new Date(latestPlan.lastUpdatedAt).toLocaleString()} • Mode: {latestPlan.generationMode === 'ai' ? 'AI automation' : 'Checklist fallback'}
                  </p>
                </div>
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-slate-600">
                  Status: {latestPlan.status}
                </span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-black/8 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Procedures</p>
                  <ol className="space-y-3">
                    {latestPlan.procedures.map((procedure) => (
                      <li key={procedure.id} className="rounded-xl border border-black/8 bg-white p-3">
                        <p className="text-sm font-semibold text-slate-900">{procedure.sortOrder}. {procedure.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{procedure.description}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="space-y-3 rounded-2xl border border-black/8 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Checklist groups</p>
                  <div className="space-y-3">
                    {latestPlan.checklistGroups.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-black/15 bg-white p-3 text-sm text-slate-500">
                        No checklist groups found for this route yet.
                      </p>
                    ) : (
                      latestPlan.checklistGroups.map((group) => (
                        <div key={group.id} className="rounded-xl border border-black/8 bg-white p-3">
                          <p className="text-sm font-semibold text-slate-900">{group.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">Tier: {group.subscriptionTier}</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                            {group.items.map((item) => (
                              <li key={item.id} className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                <span>{item.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-black/8 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Deadlines</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                    {latestPlan.deadlines.length === 0 ? <li>No deadlines available.</li> : latestPlan.deadlines.map((deadline, index) => <li key={`${deadline}-${index}`}>{deadline}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-black/8 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Notes</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                    {latestPlan.notes.length === 0 ? <li>No additional notes.</li> : latestPlan.notes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-black/8 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">Sources</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                    {latestPlan.sources.length === 0 ? (
                      <li>No linked sources.</li>
                    ) : (
                      latestPlan.sources.map((source) => (
                        <li key={source.id}>
                          {source.url ? (
                            <Link to={source.url} className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900">
                              {source.label}
                            </Link>
                          ) : (
                            source.label
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="features" className="border-b border-black/8 bg-slate-950 py-12 text-white sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">What UniPilot does</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              The essentials, kept clear.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300 sm:mt-10 sm:px-5">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <p>
              UniPilot is built to reduce missed steps and last-minute scrambling by giving students one place to track the journey.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-black/8 bg-white p-5 sm:flex-row sm:items-center sm:p-8">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Get started</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Start tracking your international journey.
              </h2>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button size="lg" className="w-full rounded-full px-7 text-base shadow-none sm:w-auto" asChild>
                <a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                  Download the app
                </a>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full rounded-full px-7 text-base text-slate-700 hover:bg-slate-50 sm:w-auto"
                asChild
              >
                <Link to="/articles">Read articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
