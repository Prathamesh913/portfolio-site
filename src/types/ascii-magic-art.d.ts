declare module "ascii-magic-art/pieces/plasma.js" {
  export const meta: {
    slug: string;
    name: string;
    cols: number;
    rows: number;
    fps: number;
    palette: Record<string, string>;
  };
  export default function create(): (t: number) => { text: string; color: string };
}

