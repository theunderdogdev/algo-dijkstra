export interface Elements {
  numEdges: number;
  numNodes: number;
  nodes: Array<string>;
  circles: Map<string, Circle>;
  edges: WeightedEdges;
}

export type AdjGraph = Record<string, Record<string, number>>;
export interface Circle {
  x: number;
  y: number;
  d: number;
  r: number;
  color: string;
}

export interface Configuration {
  wMax: number;
  wMin: number;
  separation: number;
  maxIterations: number;
  itemsMin: number;
  itemsMax: number;
  xOffset: number;
  yOffset: number;
  drawAdjust: number;
  edgeDensity: number;
  radius: number;
}
export const defaultConfig: Configuration = {
  wMax: 100,
  wMin: 0.1,
  separation: 100,
  maxIterations: 10000,
  itemsMin: 10,
  itemsMax: 22,
  xOffset: 50,
  yOffset: 50,
  drawAdjust: 2,
  edgeDensity: 1.3,
  radius: 25,
} as const;
export type WeightedEdges = Map<string, number>;
export const BACKGROUND_COLOR = "#cbd5e1";
export const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const CIRCLE_COLORS: string[] = [
  "#8b5cf6",
  "#3b82f6",
  "#0ea5e9",
  "#10b981",
  "#f97316",
];
export const randomColor = (): string => {
  return CIRCLE_COLORS[Math.floor(Math.random() * CIRCLE_COLORS.length)];
};
