export interface SearchMovieResponse {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
}

export interface Movie {
  adult: boolean;
  backdropPath: string | null;
  genreIds: number[];
  id: number;
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  popularity: number;
  posterPath: string | null;
  releaseDate: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
  providers?: CountryWatchOptions;
}

export interface MovieDetailsResponse {
  adult: boolean;
  backdropPath: string | null;
  belongsToCollection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdbId: string;
  originCountry: string[];
  originalLanguage: string;
  originalTitle: string;
  overview: string;
  popularity: number;
  posterPath: string | null;
  productionCompanies: ProductionCompany[];
  productionCountries: ProductionCountry[];
  releaseDate: string;
  revenue: number;
  runtime: number;
  spokenLanguages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  voteAverage: number;
  voteCount: number;
}

interface Collection {
  id: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
}

interface Genre {
  id: number;
  name: string;
}

interface ProductionCompany {
  id: number;
  logoPath: string | null;
  name: string;
  originCountry: string;
}

interface ProductionCountry {
  iso31661: string;
  name: string;
}

interface SpokenLanguage {
  englishName: string;
  iso6391: string;
  name: string;
}

export interface WatchProvider {
  logoPath: string;
  providerId: number;
  providerName: string;
  displayPriority: number;
}

export interface CountryWatchOptions {
  link: string;
  buy?: WatchProvider[];
  rent?: WatchProvider[];
  flatrate?: WatchProvider[];
}

export interface MovieProviders {
  [countryCode: string]: CountryWatchOptions;
}

export interface MovieProvidersResponse {
  id: number;
  results: MovieProviders;
}
