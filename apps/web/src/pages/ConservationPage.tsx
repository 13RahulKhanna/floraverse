import { Home, Users, Building2, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CONSERVATION_WAVES } from "@/data/conservationWaves";

const WAVE_ICONS = [Home, Users, Building2, Flag];

export function ConservationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-14 flex flex-col gap-10">
      <div className="text-center flex flex-col items-center gap-3">
        <Badge tone="forest">Take Action</Badge>
        <h1 className="font-serif text-4xl font-bold">Conserve &amp; Protect, One Wave at a Time</h1>
        <p className="text-[color:var(--color-ink-muted)] max-w-xl">
          Real environmental impact scales outward — from decisions you make alone, to the people around you, to the
          infrastructure and policy only a city or country can build. Here's concrete, plant-focused action at each
          scale.
        </p>
      </div>

      <div className="relative flex flex-col gap-10">
        {/* Connecting line through the waves, desktop only */}
        <div className="hidden sm:block absolute left-7 top-10 bottom-10 w-px bg-[color:var(--color-border)]" aria-hidden="true" />

        {CONSERVATION_WAVES.map((wave) => {
          const Icon = WAVE_ICONS[wave.wave - 1] ?? Home;
          return (
            <section key={wave.wave} className="relative flex gap-5">
              <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-full bg-[color:var(--color-forest-600)] text-white items-center justify-center z-10 shadow-md">
                <Icon size={22} />
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="earth">Wave {wave.wave}</Badge>
                    <h2 className="font-serif text-2xl font-bold">{wave.scale}</h2>
                  </div>
                  <p className="italic text-sm text-[color:var(--color-forest-600)] mt-1">{wave.tagline}</p>
                  <p className="text-[color:var(--color-ink-muted)] mt-2 leading-relaxed">{wave.intro}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {wave.actions.map((action) => (
                    <Card key={action.title} className="p-4">
                      <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                      <p className="text-sm text-[color:var(--color-ink-muted)] leading-relaxed">{action.detail}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Card className="text-center bg-[color:var(--color-cream-deep)]">
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          None of these scales replace the others — a thriving houseplant habit and a national reforestation policy
          both matter, and most people find it easier to start at Wave 1 and work outward as it becomes natural.
        </p>
      </Card>
    </div>
  );
}
