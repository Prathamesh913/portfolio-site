// Photos — recovered from the original Framer About Me page.
//
// The source page provided no captions, locations, or alt text (every image
// had an empty alt). Alt text below describes only what is visibly present in
// each photograph; no locations, dates, or titles are invented.
//
// `src` is the locally stored original-quality asset; `sourceUrl` is the
// original Framer-hosted file the asset was downloaded from. Display order
// matches the source gallery.

export type Photo = {
  id: string;
  src: string;
  /** Original Framer-hosted asset. */
  sourceUrl: string;
  alt: string;
  w: number;
  h: number;
};

const photo = (n: number) => `/media/outside-of-work/photos/photo-${String(n).padStart(2, "0")}.jpg`;
const source = (id: string) => `https://framerusercontent.com/images/${id}.jpg`;

export const photos: Photo[] = [
  {
    id: "photo-01",
    src: photo(1),
    sourceUrl: source("5bXWtbOlt6LCx3I1KHJ2KQSkhV0"),
    alt: "A road stretching toward the horizon at sunrise, its surface catching warm light above the water.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-02",
    src: photo(2),
    sourceUrl: source("4mmv2c4DFq3gWx5yH079L3SgB6o"),
    alt: "A paved path running through a tall forest, with two people in red walking ahead.",
    w: 2252,
    h: 4000,
  },
  {
    id: "photo-03",
    src: photo(3),
    sourceUrl: source("ZFXIRwjSlbm663GdW1HefzikPe8"),
    alt: "Cattle walking along a road beneath a hazy, glowing sky at dusk.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-04",
    src: photo(4),
    sourceUrl: source("0GSw5clh6jCwucYE6nMjQmILWOE"),
    alt: "A white Buddhist stupa lined with prayer wheels against a clear blue sky.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-05",
    src: photo(5),
    sourceUrl: source("v63RuqrMt426awkkBG7zNcZvXU"),
    alt: "A person in teal sitting on a beach beside a black dog, with people and inflatable rings behind them.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-06",
    src: photo(6),
    sourceUrl: source("4by4c4bus4jTyCv86H4nV2lOUU"),
    alt: "A misty mountain road curving beneath a colourful welcome gate, with two people walking along the edge.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-07",
    src: photo(7),
    sourceUrl: source("q3rGIsJfwCOUBzNlqqPFYy0kx18"),
    alt: "Colourful prayer flags strung along a foggy mountain road beside the Indian flag.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-08",
    src: photo(8),
    sourceUrl: source("HUFGhd1PEh9BeiXn2JyDlvGwiU"),
    alt: "A golden dog resting on concrete beside a road, under a flat overcast sky.",
    w: 2268,
    h: 4032,
  },
  {
    id: "photo-09",
    src: photo(9),
    sourceUrl: source("DT5UJx7f3L6VEHICf8SpmHXOV8"),
    alt: "Looking upward at the trunks of tall trees fading into mist.",
    w: 2268,
    h: 4032,
  },
];
