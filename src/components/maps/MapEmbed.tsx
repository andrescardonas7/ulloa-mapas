"use client";

import { useEffect, useRef } from "react";

interface MapEmbedProps {
  src: string;
  title: string;
  mapKey?: string;
}

export function MapEmbed({ src, title, mapKey }: MapEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      iframe.style.height = `${iframe.offsetWidth * 0.65}px`;
    });

    resizeObserver.observe(iframe);
    return () => resizeObserver.disconnect();
  }, [mapKey, src]);

  return (
    <iframe
      ref={iframeRef}
      key={mapKey ?? src}
      src={src}
      title={title}
      loading="lazy"
      className="min-h-[420px] w-full rounded-xl border border-brand-border bg-slate-100 shadow-sm"
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      allow="fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
