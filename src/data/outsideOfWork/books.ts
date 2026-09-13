// Books I've read — recovered from the original Framer About Me page.
//
// Source note: the Framer card text field contained only the published
// placeholder ("Walter Isaacson") for every item, so titles and authors were
// read from the source cover artwork itself. No ratings or outbound book links
// were recoverable from the source page.
//
// `src` is the locally stored original-quality cover; `sourceUrl` is the
// original Framer-hosted file the cover was downloaded from.

export type BookCover = {
  slug: string;
  title: string;
  author: string;
  /** Local cover, cached from the original Framer asset. */
  src: string;
  /** Original Framer-hosted cover asset. */
  sourceUrl: string;
  w: number;
  h: number;
};

const cover = (slug: string) => `/media/outside-of-work/books/${slug}.jpg`;
const source = (id: string, ext = "jpg") => `https://framerusercontent.com/images/${id}.${ext}`;

export const books: BookCover[] = [
  { slug: "mr-salary", title: "Mr Salary", author: "Sally Rooney", src: cover("mr-salary"), sourceUrl: source("2UG9cVKkp7fnBW4gQu7c1XXRyyg"), w: 694, h: 1000 },
  { slug: "and-then-there-were-none", title: "And Then There Were None", author: "Agatha Christie", src: cover("and-then-there-were-none"), sourceUrl: source("r2IU0kT1CYizOHiJx2l32Lxp6pk"), w: 620, h: 1000 },
  { slug: "never-lie", title: "Never Lie", author: "Freida McFadden", src: cover("never-lie"), sourceUrl: source("oIdRot99WacWMunAE6ROl1bXus", "jpeg"), w: 1563, h: 2500 },
  { slug: "the-picture-of-dorian-gray", title: "The Picture of Dorian Gray", author: "Oscar Wilde", src: cover("the-picture-of-dorian-gray"), sourceUrl: source("eSaVq6O17zvokIzUfQzzhdNg8"), w: 450, h: 695 },
  { slug: "white-nights", title: "White Nights", author: "Fyodor Dostoyevsky", src: cover("white-nights"), sourceUrl: source("uqHi0yJgs9Bj0T2XhZlM9Raygs"), w: 680, h: 1000 },
  { slug: "the-silent-patient", title: "The Silent Patient", author: "Alex Michaelides", src: cover("the-silent-patient"), sourceUrl: source("6VUk7wOapU5ayFMdyIFt1EwEdw"), w: 1594, h: 2409 },
  { slug: "only-dull-people-are-brilliant-at-breakfast", title: "Only Dull People Are Brilliant at Breakfast", author: "Oscar Wilde", src: cover("only-dull-people-are-brilliant-at-breakfast"), sourceUrl: source("fcPqfFIdTMxUXic2WOYjV28eUvU"), w: 690, h: 1000 },
  { slug: "the-devotion-of-suspect-x", title: "The Devotion of Suspect X", author: "Keigo Higashino", src: cover("the-devotion-of-suspect-x"), sourceUrl: source("hF6ssk4pQHvCahxXiXnstJgJJM"), w: 1488, h: 2338 },
  { slug: "before-the-coffee-gets-cold", title: "Before the Coffee Gets Cold", author: "Toshikazu Kawaguchi", src: cover("before-the-coffee-gets-cold"), sourceUrl: source("pm68iJOuYatZTEUwOfdcky0x1k"), w: 510, h: 680 },
  { slug: "flowers-for-algernon", title: "Flowers for Algernon", author: "Daniel Keyes", src: cover("flowers-for-algernon"), sourceUrl: source("ANRsVZpwjajDqKGqr5KngyyNw"), w: 1700, h: 2560 },
  { slug: "the-vegetarian", title: "The Vegetarian", author: "Han Kang", src: cover("the-vegetarian"), sourceUrl: source("b9hROGF2jhwiA0vGjGlTX8IuB04"), w: 1524, h: 2339 },
  { slug: "blue-sisters", title: "Blue Sisters", author: "Coco Mellors", src: cover("blue-sisters"), sourceUrl: source("kn1dfzTx9o3ZQqBTDCUY7kJb49A"), w: 649, h: 1000 },
  { slug: "recursion", title: "Recursion", author: "Blake Crouch", src: cover("recursion"), sourceUrl: source("4Rwu7tDKdBz0PRj0apJleMoFM"), w: 658, h: 1000 },
  { slug: "the-family-experiment", title: "The Family Experiment", author: "John Marrs", src: cover("the-family-experiment"), sourceUrl: source("bSCs55OCZyiyeKKy1vsvbjsync"), w: 1664, h: 2560 },
  { slug: "i-who-have-never-known-men", title: "I Who Have Never Known Men", author: "Jacqueline Harpman", src: cover("i-who-have-never-known-men"), sourceUrl: source("ljf4a7c8h3dcNayt0kSkat0LWtE"), w: 300, h: 400 },
];
