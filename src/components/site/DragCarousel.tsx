"use client";

import { useCallback, useRef, useState } from "react";
import type { ReactNode } from "react";

export function DragCarousel({
  children,
  label,
  hint = "Tip: drag sideways",
  className = "",
}: {
  children: ReactNode;
  label: string;
  hint?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });
  const [dragging, setDragging] = useState(false);

  const scrollBy = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(260, track.clientWidth * 0.8),
      behavior: "smooth",
    });
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: track.scrollLeft,
      moved: 0,
    };
    setDragging(true);
    track.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const track = trackRef.current;
    if (!track) return;
    const distance = event.clientX - drag.current.startX;
    drag.current.moved = Math.abs(distance);
    track.scrollLeft = drag.current.startScroll - distance;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    const track = trackRef.current;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollBy(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollBy(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    }
    if (event.key === "End") {
      event.preventDefault();
      const track = trackRef.current;
      track?.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    }
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="label-sm text-muted">{hint}</p>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            className="grid size-10 place-items-center border border-ink/25 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            aria-label="Scroll carousel left"
            onClick={() => scrollBy(-1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center border border-ink/25 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            aria-label="Scroll carousel right"
            onClick={() => scrollBy(1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onClickCapture={(event) => {
          if (drag.current.moved > 6) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = 0;
          }
        }}
        className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 ${
          dragging ? "cursor-grabbing select-none" : "cursor-grab"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
