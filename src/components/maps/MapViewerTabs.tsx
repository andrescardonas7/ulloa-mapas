"use client";

import { useState } from "react";

import { MapEmbed } from "@/components/maps/MapEmbed";
import type { MapViewItem } from "@/lib/types";

interface MapViewerTabsProps {
  maps: MapViewItem[];
  emptyMessage?: string;
}

export function MapViewerTabs({
  maps,
  emptyMessage = "Aún no hay mapas configurados. Añade las URLs de embed en el archivo .env.local.",
}: MapViewerTabsProps) {
  const configuredMaps = maps.filter((map) => map.src !== null);
  const [activeId, setActiveId] = useState(
    configuredMaps[0]?.id ?? maps[0]?.id ?? "",
  );

  const activeMap =
    maps.find((map) => map.id === activeId) ?? configuredMaps[0] ?? maps[0];

  if (maps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-border bg-brand-red-soft/50 p-8 text-center text-pretty text-brand-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Seleccionar mapa"
        className="flex flex-wrap gap-2"
      >
        {maps.map((map) => {
          const isActive = map.id === activeId;
          const isConfigured = map.src !== null;
          return (
            <button
              key={map.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${map.id}`}
              id={`tab-${map.id}`}
              disabled={!isConfigured}
              onClick={() => setActiveId(map.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                isActive
                  ? "bg-brand-red text-white shadow-sm shadow-brand-red/20"
                  : isConfigured
                    ? "bg-surface text-brand-dark ring-1 ring-brand-border hover:bg-brand-red-soft"
                    : "cursor-not-allowed bg-brand-border/30 text-brand-muted"
              }`}
            >
              {map.title}
            </button>
          );
        })}
      </div>

      {activeMap && (
        <div className="space-y-3">
          <p className="text-pretty text-sm text-brand-muted">
            {activeMap.description}
          </p>
          <div
            role="tabpanel"
            id={`panel-${activeMap.id}`}
            aria-labelledby={`tab-${activeMap.id}`}
          >
            {activeMap.src ? (
              <MapEmbed
                src={activeMap.src}
                title={activeMap.title}
                mapKey={activeMap.id}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-brand-border bg-brand-red-soft/50 p-8 text-center text-brand-muted">
                <p className="font-medium text-brand-dark">{activeMap.title}</p>
                <p className="mt-2 text-pretty text-sm">
                  Configura la variable{" "}
                  <code className="rounded bg-surface px-1.5 py-0.5 text-xs ring-1 ring-brand-border">
                    {activeMap.envKey}
                  </code>{" "}
                  en tu archivo <code className="text-xs">.env.local</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {configuredMaps.length === 0 && (
        <p className="text-pretty text-sm text-brand-muted">{emptyMessage}</p>
      )}
    </div>
  );
}
