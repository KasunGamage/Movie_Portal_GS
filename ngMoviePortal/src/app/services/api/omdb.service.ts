import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../utilities/http.service';
import { ApiConfig } from '../../constants/api-config';
import {
  MovieInfo,
  MovieListResponse,
  SearchParameters,
} from '../../models/omdb.model';

@Injectable({
  providedIn: 'root',
})
export class OmdbService {
  constructor(private httpService: HttpService) {}

  /**
   * get the list of movies
   * @param searchCriteria includes movie title & page number
   * @returns returns the MovieListResponse object as a observable
   */
  getMovies(searchCriteria: SearchParameters): Observable<MovieListResponse> {
    const apiURL = `${ApiConfig.apiEndpoint}?apikey=${ApiConfig.apiKey}&s=${searchCriteria.title}&page=${searchCriteria.page}`;
    return this.httpService.get(apiURL);
  }

  /**
   * get the specific movie details
   * @param id movie imdbID
   * @returns returns the MovieInfo object as a observable
   */
  getById(id: string): Observable<MovieInfo> {
    const apiURL = `${ApiConfig.apiEndpoint}?apikey=${ApiConfig.apiKey}&i=${id}`;
    return this.httpService.get(apiURL);
  }
}
