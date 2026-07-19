const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export interface TmdbResult {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate: string | null;
  genreIds: number[];
  mediaType: "movie" | "tv";
}

interface RawListResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
}

interface RawListResponse {
  results: RawListResult[];
}

interface RawGenre {
  id: number;
  name: string;
}

interface RawGenreListResponse {
  genres: RawGenre[];
}

interface RawCollectionResponse {
  parts: RawListResult[];
}

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set. Add it to .env.local before running the seed script.");
  }
  return key;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  language = "th-TH"
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", language);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TMDB request failed (${response.status}) for ${path}: ${body}`);
  }
  return (await response.json()) as T;
}

function toResults(raw: RawListResponse, mediaType: "movie" | "tv"): TmdbResult[] {
  return raw.results.map((item) => ({
    id: item.id,
    title: item.title ?? item.name ?? "Untitled",
    overview: item.overview,
    posterPath: item.poster_path,
    voteAverage: item.vote_average,
    releaseDate: item.release_date ?? item.first_air_date ?? null,
    genreIds: item.genre_ids,
    mediaType,
  }));
}

export async function fetchPopularMovies(language = "th-TH"): Promise<TmdbResult[]> {
  const raw = await tmdbFetch<RawListResponse>("/movie/popular", {}, language);
  return toResults(raw, "movie");
}

export async function fetchNowPlayingMovies(language = "th-TH"): Promise<TmdbResult[]> {
  const raw = await tmdbFetch<RawListResponse>("/movie/now_playing", {}, language);
  return toResults(raw, "movie");
}

export async function fetchDiscoverMovies(
  params: Record<string, string>,
  language = "th-TH"
): Promise<TmdbResult[]> {
  const raw = await tmdbFetch<RawListResponse>(
    "/discover/movie",
    { sort_by: "popularity.desc", ...params },
    language
  );
  return toResults(raw, "movie");
}

export async function fetchDiscoverTv(
  params: Record<string, string>,
  language = "th-TH"
): Promise<TmdbResult[]> {
  const raw = await tmdbFetch<RawListResponse>(
    "/discover/tv",
    { sort_by: "popularity.desc", ...params },
    language
  );
  return toResults(raw, "tv");
}

export async function fetchCollectionParts(collectionId: number, language = "th-TH"): Promise<TmdbResult[]> {
  const raw = await tmdbFetch<RawCollectionResponse>(`/collection/${collectionId}`, {}, language);
  return toResults({ results: raw.parts }, "movie");
}

interface RawDetailResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
}

// Fetch a single named title by id directly (not via discover) — used for forcing specific
// well-known franchises into a category regardless of where they'd otherwise rank/paginate.
export async function fetchTitleDetail(
  id: number,
  mediaType: "movie" | "tv",
  language = "th-TH"
): Promise<TmdbResult | null> {
  try {
    const raw = await tmdbFetch<RawDetailResult>(`/${mediaType}/${id}`, {}, language);
    return {
      id: raw.id,
      title: raw.title ?? raw.name ?? "Untitled",
      overview: raw.overview,
      posterPath: raw.poster_path,
      voteAverage: raw.vote_average,
      releaseDate: raw.release_date ?? raw.first_air_date ?? null,
      genreIds: raw.genres.map((g) => g.id),
      mediaType,
    };
  } catch {
    return null;
  }
}

export async function fetchGenreMap(): Promise<Map<number, string>> {
  const [movieGenres, tvGenres] = await Promise.all([
    tmdbFetch<RawGenreListResponse>("/genre/movie/list"),
    tmdbFetch<RawGenreListResponse>("/genre/tv/list"),
  ]);

  const map = new Map<number, string>();
  for (const genre of [...movieGenres.genres, ...tvGenres.genres]) {
    if (!map.has(genre.id)) {
      map.set(genre.id, genre.name);
    }
  }
  return map;
}

export function tmdbPosterUrl(posterPath: string | null): string | null {
  return posterPath ? `${IMAGE_BASE}${posterPath}` : null;
}
