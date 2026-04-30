import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock3, FileCheck2, PlaneTakeoff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RotatingGlobe } from '@/components/public/RotatingGlobe';

const appStoreUrl = 'https://apps.apple.com/us/app/unipilot-journey-tracker/id6748587544';
const ambassadorProgramUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeyjSw2h6nV8wlyFW5aKQPDXJQFhyQ3_DZ_RO0f-2Z6kkjr7g/viewform';

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

export function HomePage() {
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
