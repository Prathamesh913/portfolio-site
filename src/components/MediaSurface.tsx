import type { MediaAsset } from "../data";

export type SurfaceVariant =
  | "travel"
  | "checklist"
  | "construction"
  | "cineprint"
  | "project-dock"
  | "interface"
  | "system"
  | "experiment"
  | "concept"
  | "prototype"
  | "selected";

type MediaSurfaceProps = {
  media: MediaAsset;
  variant: SurfaceVariant;
  className?: string;
  badge?: string;
  label?: string;
  index?: string;
  title?: string;
};

export function MediaSurface({ media, variant, className = "", badge, label, index, title }: MediaSurfaceProps) {
  const aspectRatio = media.aspectRatio ?? "16 / 9";
  const objectFit = media.fit ?? "cover";

  return (
    <figure
      className={`media-surface media-surface--${variant} ${className}`}
      style={{ aspectRatio }}
      aria-label={media.alt}
    >
      <PlaceholderVisual variant={variant} label={label ?? media.alt} index={index} title={title} />
      <img
        src={media.src}
        alt={media.alt}
        loading="lazy"
        style={{ objectFit }}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      {badge && <span className="media-surface__badge">{badge}</span>}
    </figure>
  );
}

function PlaceholderVisual({ variant, label, index, title }: { variant: SurfaceVariant; label: string; index?: string; title?: string }) {
  return (
    <div className="placeholder-visual placeholder-pending" aria-hidden="true">
      <div className="surface-topline">
        <span>Screenshot pending</span>
        <span>{variant}</span>
      </div>
      <div className="pending-body">
        {index && <span className="pending-index">{index}</span>}
        <span className="pending-title">{title ?? shortLabel(label)}</span>
      </div>
      <div className="pending-footer">
        <span>Real screenshot replaces this surface</span>
      </div>
    </div>
  );
}

function shortLabel(label: string): string {
  if (label.toLowerCase().startsWith("placeholder")) return "Work preview";
  return label.length > 64 ? `${label.slice(0, 64)}…` : label;
}
