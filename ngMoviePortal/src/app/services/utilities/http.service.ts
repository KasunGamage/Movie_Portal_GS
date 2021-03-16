import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../api/auth/auth.service';
import { environment } from '../../../environments/environment.dev';
import { tap, concatMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public router: Router
  ) {}

  post(
    url: string,
    body: any,
    header: any = { 'content-Type': 'application/json' }
  ): Observable<any> {
    if (this.authService.isTokenAboutToExpired()) {
      this.http
        .get(
          `${environment.apiUrl}authentication/renewWebToken`,
          this.createHeader2(header)
        )
        .pipe(
          tap((res: any) => {
            this.authService.setAuthToken(Object(res).Content.Token);
          }),
          concatMap(() => this.http.post(url, body, this.createHeader2(header)))
        )
        .subscribe((res: any) => res);
    }
    return this.http.post(url, body, this.createHeader2(header));
  }

  get(
    url: string,
    header: any = { 'content-Type': 'application/json' }
  ): Observable<any> {
    if (this.authService.isTokenAboutToExpired()) {
      this.http
        .get(
          `${environment.apiUrl}authentication/renewWebToken`,
          this.createHeader2(header)
        )
        .pipe(
          tap((res: any) => {
            this.authService.setAuthToken(Object(res).Content.Token);
          }),
          concatMap(() => this.http.get(url, this.createHeader2(header)))
        )
        .subscribe((res: any) => res);
    }

    return this.http.get(url, this.createHeader2(header));
  }

  upload(
    url: string,
    body: any,
    isReportProgressEnable: boolean
  ): Observable<any> {
    if (isReportProgressEnable) {
      return this.http.post(url, body, {
        headers: new HttpHeaders({
          'X-Tenant-Id': `${this.authService.getActiveTenant()}`,
          'X-Site-Id': `${this.authService.getActiveSite()}`,
          Authorization: `Bearer ${this.authService.getAuthToken()}`,
        }),
        reportProgress: true,
        observe: 'events',
      });
    }
    return this.http.post(url, body, {
      headers: new HttpHeaders({
        'X-Tenant-Id': `${this.authService.getActiveTenant()}`,
        'X-Site-Id': `${this.authService.getActiveSite()}`,
        Authorization: `Bearer ${this.authService.getAuthToken()}`,
      }),
    });
  }

  /**
   * No default header assigned
   * @param url api url
   * @param headers any header{}
   */
  get2(url: string, headers: any): Observable<any> {
    return this.http.get(url, this.createHeader2(headers));
  }

  /**
   * No default header assigned
   * @param url api url
   * @param body message payload
   * @param headers any header{}
   */
  post2(url: string, body: any, headers: any): Observable<any> {
    return this.http.post(url, body, this.createHeader2(headers));
  }

  private createHeader2(headers: any): any {
    headers = headers || {};
    const r1 = {
      'X-Tenant-Id': `${this.authService.getActiveTenant()}`,
      'X-Site-Id': `${this.authService.getActiveSite()}`,
      Authorization: `Bearer ${this.authService.getAuthToken()}`,
    };
    const x = { ...r1, ...headers };

    return {
      headers: new HttpHeaders(x),
    };
  }
}
