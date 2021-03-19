import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../utilities/http.service';
import { ApiConfig } from '../../constants/api-config';
import { SearchParameters } from '../../models/omdb.model';

@Injectable({
  providedIn: 'root',
})
export class OmdbService {
  constructor(private httpService: HttpService) {}

  getMovies(searchCriteria: SearchParameters): Observable<any> {
    const apiURL = `${ApiConfig.apiEndpoint}?apikey=${ApiConfig.apiKey}&s=${
      searchCriteria.title
    }&page=${searchCriteria.page}`;
    return this.httpService.get(apiURL);
  }

  getById(id: string): Observable<any> {
    const apiURL = `${ApiConfig.apiEndpoint}?apikey=${ApiConfig.apiKey}&i=${id}`;
    return this.httpService.get(apiURL);
  }
}
