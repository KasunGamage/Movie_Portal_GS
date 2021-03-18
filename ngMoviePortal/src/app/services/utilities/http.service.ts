import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private http: HttpClient, public router: Router) {}

  get(url: string): Observable<any> {
    return this.http.get(url);
  }
}
