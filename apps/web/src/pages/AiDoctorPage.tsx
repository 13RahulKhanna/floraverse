import { useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, AlertTriangle, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { ImageCapture } from "@/components/ai/ImageCapture";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { apiUpload, ApiError } from "@/lib/api";
import type { HealthAssessmentResponse, IdentificationResponse } from "@/lib/types";

const STATUS_CONFIG: Record<
  HealthAssessmentResponse["health_status"],
  { label: string; tone: "success" | "warning" | "danger"; iconClass: string; icon: typeof CheckCircle2 }
> = {
  healthy: { label: "Healthy", tone: "success", iconClass: "text-[color:var(--color-success)]", icon: CheckCircle2 },
  warning: { label: "Warning", tone: "warning", iconClass: "text-[color:var(--color-warning)]", icon: AlertTriangle },
  unhealthy: { label: "Unhealthy", tone: "danger", iconClass: "text-[color:var(--color-danger)]", icon: AlertCircle },
};

export function AiDoctorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [identification, setIdentification] = useState<IdentificationResponse | null>(null);
  const [health, setHealth] = useState<HealthAssessmentResponse | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset(newFile: File) {
    setFile(newFile);
    setIdentification(null);
    setHealth(null);
    setError(null);
    setNotConfigured(false);
  }

  async function runIdentify() {
    if (!file) return;
    setIdentifying(true);
    setError(null);
    setNotConfigured(false);
    try {
      const result = await apiUpload<IdentificationResponse>("/api/v1/ai/identify", file);
      setIdentification(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) setNotConfigured(true);
      else setError(err instanceof ApiError ? err.message : "Could not identify this image. Try a clearer photo.");
    } finally {
      setIdentifying(false);
    }
  }

  async function runHealthCheck() {
    if (!file) return;
    setCheckingHealth(true);
    setError(null);
    setNotConfigured(false);
    const plantId = identification?.candidates[0]?.matched_plant?.id;
    try {
      const result = await apiUpload<HealthAssessmentResponse>("/api/v1/ai/health", file, plantId ? { plant_id: String(plantId) } : undefined);
      setHealth(result);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) setNotConfigured(true);
      else setError(err instanceof ApiError ? err.message : "Could not analyze plant health from this image.");
    } finally {
      setCheckingHealth(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="text-center flex flex-col items-center gap-2">
        <Stethoscope size={32} className="text-[color:var(--color-forest-500)]" />
        <h1 className="font-serif text-3xl font-bold">AI Plant Doctor</h1>
        <p className="text-[color:var(--color-ink-muted)] max-w-lg">
          Upload or capture a photo to identify a plant, then check it for visible signs of poor health.
        </p>
      </div>

      <Card>
        <ImageCapture onImageReady={(f) => reset(f)} />
        {file ? (
          <div className="flex justify-center gap-3 mt-5">
            <Button onClick={runIdentify} disabled={identifying}>
              {identifying ? <Loader2 size={16} className="animate-spin" /> : null}
              Identify Plant
            </Button>
            <Button variant="outline" onClick={runHealthCheck} disabled={checkingHealth}>
              {checkingHealth ? <Loader2 size={16} className="animate-spin" /> : null}
              Check Plant Health
            </Button>
          </div>
        ) : null}
      </Card>

      {notConfigured ? (
        <Card className="flex items-start gap-3 bg-[color:var(--color-cream-deep)]">
          <Info size={20} className="text-[color:var(--color-earth-600)] shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">AI identification isn't configured on this server yet.</p>
            <p className="text-sm text-[color:var(--color-ink-muted)] mt-1">
              This feature calls a real third-party plant-recognition API, which needs an API key. The rest of
              FloraVerse — the encyclopedia, My Garden, comparisons — works normally without it.
            </p>
          </div>
        </Card>
      ) : null}

      {error ? (
        <Card className="text-sm text-[color:var(--color-danger)]">{error}</Card>
      ) : null}

      {identification ? (
        <Card>
          <h2 className="font-serif text-xl font-semibold mb-1">Identification Results</h2>
          {identification.is_plant_probability !== null && identification.is_plant_probability < 0.5 ? (
            <p className="text-sm text-[color:var(--color-warning)] mb-3">This image may not contain a plant — results below are uncertain.</p>
          ) : null}
          <div className="flex flex-col gap-3 mt-3">
            {identification.candidates.length === 0 ? (
              <p className="text-sm text-[color:var(--color-ink-muted)]">No confident match was found. Try a clearer, closer photo of a leaf or flower.</p>
            ) : (
              identification.candidates.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-3 border-t border-[color:var(--color-border)] pt-3 first:border-t-0 first:pt-0">
                  <div>
                    <p className="font-medium">{c.common_name ?? c.scientific_name}</p>
                    <p className="italic text-sm text-[color:var(--color-forest-600)]">{c.scientific_name}</p>
                    <p className="text-xs text-[color:var(--color-ink-faint)]">Confidence: {Math.round(c.probability * 100)}%</p>
                  </div>
                  {c.matched_plant ? (
                    <Link to={`/plants/${c.matched_plant.slug}`}>
                      <Button size="sm" variant="outline">
                        View Complete Plant Information
                      </Button>
                    </Link>
                  ) : (
                    <Badge tone="neutral">Not yet in our encyclopedia</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      ) : null}

      {health ? <HealthReportCard health={health} /> : null}
    </div>
  );
}

function HealthReportCard({ health }: { health: HealthAssessmentResponse }) {
  const config = STATUS_CONFIG[health.health_status];
  const Icon = config.icon;
  return (
    <Card>
      <h2 className="font-serif text-xl font-semibold mb-4">Plant Health Report</h2>
      <div className="flex items-center gap-3 mb-4">
        <Icon size={24} className={config.iconClass} />
        <div>
          <Badge tone={config.tone}>{config.label}</Badge>
          <p className="text-xs text-[color:var(--color-ink-faint)] mt-1">
            Overall healthy-appearance confidence: {Math.round(health.is_healthy_probability * 100)}% · Severity: {health.severity}
          </p>
        </div>
      </div>

      {health.issues.length > 0 ? (
        <div className="flex flex-col gap-3 mb-4">
          {health.issues.map((issue, i) => (
            <div key={i} className="border-t border-[color:var(--color-border)] pt-3 first:border-t-0 first:pt-0">
              <p className="font-medium">
                {issue.name} <span className="text-xs text-[color:var(--color-ink-faint)]">({Math.round(issue.probability * 100)}% likely)</span>
              </p>
              <p className="text-sm text-[color:var(--color-ink-muted)] mt-1">{issue.description}</p>
              {issue.treatment ? <p className="text-sm text-[color:var(--color-forest-700)] mt-1">{issue.treatment}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[color:var(--color-ink-muted)] mb-4">No specific issues were detected from this photo.</p>
      )}

      <div className="bg-[color:var(--color-cream-deep)] rounded-xl p-4">
        <p className="text-sm font-medium mb-2">Recommended care</p>
        <ul className="text-sm text-[color:var(--color-ink-muted)] list-disc pl-5 flex flex-col gap-1">
          {health.care_recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-[color:var(--color-ink-faint)] mt-4 flex gap-1.5">
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        {health.disclaimer}
      </p>
    </Card>
  );
}
