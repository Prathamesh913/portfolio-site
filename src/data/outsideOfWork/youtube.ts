// YouTube — recovered from the original Framer About Me page.
//
// Videos and the channel URL were resolved from the source page's embeds via
// YouTube's official oEmbed endpoint, so titles and the channel name are
// source-accurate. Shorts carry only hashtag titles on YouTube; those hashtags
// are preserved verbatim (with the leading # removed) rather than rewritten.

export type YouTubeItem = {
  id: string;
  kind: "video" | "short";
  /** Present only when YouTube provides a real title. */
  title?: string;
  /** Present for shorts, whose titles are hashtags. */
  tags?: string[];
  url: string;
  thumbnail: string;
  w: number;
  h: number;
};

export const youtubeChannel = {
  name: "Books & Frames",
  url: "https://www.youtube.com/@BooksFrames",
  description:
    "Welcome to Books & Frames! This channel is all about exploring stories from books, classic and niche movies, and sometimes K-dramas. We dive into interesting themes, compare books with their movie adaptations, and uncover the deeper ideas behind them.",
};

const thumb = (id: string) => `/media/outside-of-work/youtube/yt-${id}.jpg`;

export const youtubeVideos: YouTubeItem[] = [
  {
    id: "L5Nn7FxsSvw",
    kind: "video",
    title: "14 books, one year: my honest thoughts on each",
    url: "https://www.youtube.com/watch?v=L5Nn7FxsSvw",
    thumbnail: thumb("L5Nn7FxsSvw"),
    w: 1280,
    h: 720,
  },
  {
    id: "O7mOdl6kS7I",
    kind: "short",
    tags: ["law", "lawyer", "courtroomdrama", "legaldrama", "beyondthebar", "netflix", "netflixseries"],
    url: "https://www.youtube.com/shorts/O7mOdl6kS7I",
    thumbnail: thumb("O7mOdl6kS7I"),
    w: 1280,
    h: 720,
  },
  {
    id: "-2Gjpme-2ac",
    kind: "short",
    tags: ["dogs", "movie", "moviereview", "movies", "horror", "horrorstories", "benleonberg", "indy"],
    url: "https://www.youtube.com/shorts/-2Gjpme-2ac",
    thumbnail: thumb("-2Gjpme-2ac"),
    w: 1280,
    h: 720,
  },
  {
    id: "FcYLmT1QzaQ",
    kind: "short",
    tags: ["doriangray", "books", "booktok", "booktube", "book", "bookrecommendations", "oscarwilde"],
    url: "https://www.youtube.com/shorts/FcYLmT1QzaQ",
    thumbnail: thumb("FcYLmT1QzaQ"),
    w: 1280,
    h: 720,
  },
];
