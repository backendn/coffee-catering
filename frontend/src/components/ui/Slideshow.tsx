import { useEffect, useState } from "react";

export interface SlideshowItem {
  img: string;
  label?: string;
  sublabel?: string;
}

interface SlideshowProps {
  items: SlideshowItem[];
  intervalMs?: number;
  aspectRatio?: string;
  showDots?: boolean;
  objectFit?: "cover" | "contain";
}

// Single-image-at-a-time slideshow: shows items[0], waits intervalMs, fades
// to items[1], and so on, looping back to the start. Pauses on hover/focus
// so the visitor can actually read a caption if they linger, and respects
// prefers-reduced-motion by disabling auto-advance entirely (the dots still
// let people click through manually).
export default function Slideshow({ items, intervalMs = 1600, aspectRatio = "4 / 3", showDots = true, objectFit = "cover" }: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (paused || reducedMotion || items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [paused, intervalMs, items.length, reducedMotion]);

  if (items.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      style={{ position: "relative" }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio, overflow: "hidden", background: "#2e231b" }}>
        {items.map((item, i) => (
          <img
            key={item.img}
            src={item.img}
            alt={item.label ?? ""}
            loading={i === 0 ? "eager" : "lazy"}
            onClick={() => setIndex((cur) => (cur + 1) % items.length)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: objectFit,
              opacity: i === index ? 1 : 0,
              transition: "opacity 0.9s ease",
              cursor: items.length > 1 ? "pointer" : "default",
            }}
          />
        ))}
      </div>

      {(items[index].label || items[index].sublabel) && (
        <div style={{ marginTop: "0.6rem" }}>
          {items[index].label && (
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{items[index].label}</div>
          )}
          {items[index].sublabel && (
            <div style={{ color: "var(--parchment-dim)", fontSize: "0.85rem" }}>{items[index].sublabel}</div>
          )}
        </div>
      )}

      {showDots && items.length > 1 && (
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
          {items.map((item, i) => (
            <button
              key={item.img}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === index ? "var(--gold)" : "rgba(242,233,220,0.25)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
