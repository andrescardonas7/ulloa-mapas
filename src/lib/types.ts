export interface MapConfig {
  id: string;
  title: string;
  description: string;
  envKey: string;
}

export interface MapViewItem extends MapConfig {
  src: string | null;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  sizeLabel: string;
  publishedAt: string;
}

export interface NavItem {
  href: string;
  label: string;
}
