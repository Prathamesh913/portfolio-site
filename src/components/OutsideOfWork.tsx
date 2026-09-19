import { RecentlyWatched } from "./RecentlyWatched";
import { Bookshelf } from "./objects/Bookshelf";
import { PhotoLine } from "./PhotoLine";
import { photos, youtubeChannel, youtubeVideos } from "../data/outsideOfWork";

function PhotosBlock() {
  return (
    <section className="oow-block oow-photos-block" aria-labelledby="oow-photos">
      <h3 id="oow-photos">Photos</h3>
      <PhotoLine photos={photos} />
    </section>
  );
}

function BooksBlock() {
  return (
    <section className="oow-block" aria-labelledby="oow-books">
      <h3 id="oow-books">Books I've Read</h3>
      <Bookshelf />
    </section>
  );
}

function YouTubeBlock() {
  return (
    <section className="oow-block" aria-labelledby="oow-youtube">
      <div className="oow-block__head">
        <h3 id="oow-youtube">My YouTube</h3>
        <a className="oow-block__link" href={youtubeChannel.url} target="_blank" rel="noreferrer">
          View my channel ↗<span className="sr-only">: {youtubeChannel.name} (opens in a new tab)</span>
        </a>
      </div>
      <p className="oow-block__note">Things I've made and shared.</p>
      <div className="oow-videos">
        {youtubeVideos.map((video) => (
          <a
            className="oow-video"
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="oow-video__media">
              <img
                src={video.thumbnail}
                alt=""
                width={video.w}
                height={video.h}
                loading="lazy"
                decoding="async"
              />
              <span className="oow-video__kind">{video.kind === "short" ? "Short" : "Video"}</span>
            </span>
            <span className="oow-video__body">
              {video.title ? (
                <span className="oow-video__title">{video.title}</span>
              ) : (
                <span className="oow-video__title oow-video__title--short">Short</span>
              )}
              {video.tags && (
                <span className="oow-video__tags">
                  {video.tags.slice(0, 4).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </span>
              )}
            </span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function OutsideOfWork() {
  return (
    <section className="outside-of-work section-frame" aria-label="Outside of work">
      <h2>Outside of Work</h2>
      <p className="oow-intro">
        A collection of things I enjoy outside of design — what I watch, photograph, read, and create.
      </p>

      <RecentlyWatched />

      <PhotosBlock />
      <BooksBlock />
      <YouTubeBlock />
    </section>
  );
}
