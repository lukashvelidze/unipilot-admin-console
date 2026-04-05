import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle,
  Clock3,
  FileCheck,
  Globe,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Smart Checklists',
    description: 'Personalized steps for applications, visa preparation, and travel planning in one place.',
  },
  {
    icon: FileCheck,
    title: 'Visa Interview Simulator',
    description: 'Practice realistic interview scenarios and build confidence before the real appointment.',
  },
  {
    icon: Users,
    title: 'Smart Reminders',
    description: 'Stay ahead of deadlines for applications, visa steps, and pre-departure tasks.',
  },
  {
    icon: CheckCircle,
    title: 'Document Vault',
    description: 'Store and access important files anytime so your paperwork stays organized and ready.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Plan your study abroad path',
    description: 'Set your destination, application goals, and visa route so the process starts with the right structure.',
  },
  {
    number: '02',
    title: 'Follow your personalized checklist',
    description: 'Work through applications, visa steps, and travel tasks with guidance built around your situation.',
  },
  {
    number: '03',
    title: 'Stay ready at every stage',
    description: 'Use reminders, document storage, and clear progress tracking to keep everything on schedule.',
  },
];

const proofPoints = [
  {
    icon: Clock3,
    title: 'Less last-minute scrambling',
    description: 'A clearer sequence reduces the rush that comes from forgotten forms and unclear timing.',
  },
  {
    icon: ShieldCheck,
    title: 'Fewer preventable mistakes',
    description: 'Structured guidance helps you catch missing items and incomplete preparation earlier.',
  },
  {
    icon: GraduationCap,
    title: 'Built for student applicants',
    description: 'The product is focused on education-driven visa journeys rather than generic immigration tooling.',
  },
];

const readinessItems = [
  'Personalized checklist for applications, visa prep, and travel',
  'A clearer view of deadlines and next steps',
  'One place for important documents and progress tracking',
  'A simpler process from planning to departure',
];

export function HomePage() {
  return (
    <div className="bg-[linear-gradient(180deg,#f4efeb_0%,#f8f4f0_26%,#efe6e3_100%)]">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,84,87,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_28%)]" />
        <div className="container relative mx-auto px-4 py-12 md:py-24">
          <div className="grid items-center gap-8 md:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-primary/20 bg-white/75 px-4 py-2 text-xs text-foreground shadow-sm backdrop-blur sm:text-sm">
                <img src="/favicon.png" alt="UniPilot logo" className="h-5 w-5 object-contain" />
                <span className="truncate">Study abroad planning, visa prep, and travel support</span>
              </div>
              <h1 className="max-w-xl text-[2.65rem] font-bold leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Everything You Need to
                {' '}
                <span className="text-primary">Study Abroad</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 md:text-xl">
                Step-by-step guidance, visa prep, and travel support all in one app.
                No agencies. No confusion.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="w-full text-base shadow-sm sm:w-auto" asChild>
                  <a href="https://testflight.apple.com/join/13bcqnX4" target="_blank" rel="noopener noreferrer">
                    Join on TestFlight
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full border-foreground/15 bg-white/70 text-base backdrop-blur hover:bg-white sm:w-auto" asChild>
                  <Link to="/faqs">See How It Works</Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
                <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm">
                  <p className="text-xl font-semibold sm:text-2xl">1 app</p>
                  <p className="mt-1 text-sm text-muted-foreground">For applications, visa prep, and travel support</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm">
                  <p className="text-xl font-semibold sm:text-2xl">Clear steps</p>
                  <p className="mt-1 text-sm text-muted-foreground">Know what to do next at every stage</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm">
                  <p className="text-xl font-semibold sm:text-2xl">No confusion</p>
                  <p className="mt-1 text-sm text-muted-foreground">Stay organized without relying on agencies</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-10 hidden h-24 w-24 rounded-full bg-primary/15 blur-2xl lg:block" />
              <div className="absolute -right-6 bottom-8 hidden h-28 w-28 rounded-full bg-slate-900/10 blur-2xl lg:block" />
              <div className="rounded-[1.75rem] border border-white/40 bg-slate-950 p-4 text-white shadow-[0_30px_80px_rgba(15,23,42,0.22)] sm:rounded-[2rem] sm:p-5">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4 sm:rounded-[1.5rem] sm:p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/55 sm:text-sm">UniPilot</p>
                      <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Application Readiness</h2>
                    </div>
                    <img src="/favicon.png" alt="UniPilot logo" className="h-11 w-11 rounded-2xl bg-white/95 p-2 object-contain sm:h-12 sm:w-12" />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/65">Destination</p>
                      <p className="mt-2 text-lg font-medium">Study abroad journey organized</p>
                    </div>
                    <div className="rounded-2xl bg-primary/90 p-4 text-primary-foreground">
                      <p className="text-sm text-primary-foreground/80">Status</p>
                      <p className="mt-2 text-lg font-medium">Ready for the next step</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-4 text-slate-900 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-semibold">What UniPilot keeps clear</h3>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Guided
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {readinessItems.map((item) => (
                        <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <p className="text-sm text-slate-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-[#efe4df] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">What you get</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Built to replace scattered notes, deadlines, and guesswork.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                UniPilot combines the core tools students need before departure, from application planning to visa preparation and document access.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="rounded-3xl border-border/70 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                >
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-[#f6f0eb] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">The process</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              A simpler path from planning to departure.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Start with your study abroad plan, work through the right visa steps, and stay on top of every requirement without losing momentum.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[1.75rem] border border-border/70 bg-white/80 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium uppercase tracking-[0.3em] text-primary/70">{step.number}</span>
                  <div className="h-px w-16 bg-border" />
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight sm:mt-8 sm:text-2xl">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-slate-950 py-16 text-white md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Why it matters</p>
              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                The point is to make studying abroad feel manageable.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                UniPilot helps students move with more clarity, better preparation, and fewer missed details across the application, visa, and travel process.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
              {proofPoints.map((point) => (
                <div key={point.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 sm:rounded-[1.75rem] sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <point.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f1e3de_0%,#ead8d3_100%)] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-[1.75rem] border border-primary/15 bg-white/70 px-5 py-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[2rem] sm:px-6 sm:py-10 md:px-12">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Get started</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Study abroad with a clearer plan from day one.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Join UniPilot on TestFlight for step-by-step guidance, visa prep, smart reminders, and document access in one place.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" className="w-full text-base shadow-sm sm:w-auto" asChild>
                <a href="https://testflight.apple.com/join/13bcqnX4" target="_blank" rel="noopener noreferrer">
                  Join on TestFlight
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="w-full border-foreground/15 bg-white/70 text-base hover:bg-white sm:w-auto" asChild>
                <Link to="/articles">Browse Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
