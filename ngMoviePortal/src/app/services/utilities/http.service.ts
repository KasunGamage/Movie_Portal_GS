import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient, public router: Router) {}

  // post(
  //   url: string,
  //   body: any,
  //   header: any = { 'content-Type': 'application/json' }
  // ): Observable<any> {
  //   return this.http.post(url, body, this.createHeader(header));
  // }

  get(
    url: string,
    header: any = { 'content-Type': 'application/json' }
  ): Observable<any> {
    return this.http.get(url);
  }

  private createHeader(headers: any): any {
    headers = headers || {};
    const r1 = {
      'Access-Control-Allow-Origin': '*',
    };
    const x = { ...r1, ...headers };

    return {
      headers: new HttpHeaders(x),
    };
  }
}
