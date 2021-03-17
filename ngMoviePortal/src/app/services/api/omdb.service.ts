import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpService } from '../utilities/http.service';
import { ApiConfig } from '../../constants/api-config';

// import { SearchParamsModel } from '../../../models/request/query-params-model';
import { QueryResultsModel } from '../../models/request/query-results-model';
import { SearchParameters } from '../../models/omdb.model';

@Injectable({
  providedIn: 'root',
})
export class OmdbService {
  constructor(private httpService: HttpService) {}

  getMovies(searchCriteria: SearchParameters): Observable<any> {
    const apiURL = `${ApiConfig.apiEndpoint}?apikey=${ApiConfig.apiKey}&s=${searchCriteria.title}`;
    return this.httpService.get(apiURL);
  }

  getById(id: string): Observable<any> {
    const apiURL = `${ApiConfig.apiEndpoint}?apikey=${ApiConfig.apiKey}&i=${id}`;
    return this.httpService.get(apiURL);
  }

  // add(template: any): Observable<QueryResultsModel> {
  //   return this.httpService.post(
  //     `${environment.apiUrl}LetterTemplate/add`,
  //     template
  //   );
  // }

  // update(
  //   id: number, // id => LetterTemplateId
  //   template: any
  // ): Observable<QueryResultsModel> {
  //   return this.httpService.post(
  //     `${environment.apiUrl}LetterTemplate/edit?idValue=${id}`,
  //     template
  //   );
  // }

  // delete(id: number): Observable<QueryResultsModel> {
  //   return this.httpService.get(
  //     `${environment.apiUrl}LetterTemplate/delete?idValue=${id}`
  //   );
  // }
}
