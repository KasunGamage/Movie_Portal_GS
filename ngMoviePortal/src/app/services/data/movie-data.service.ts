import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  inBoundDataSubject: Subject<string> = new Subject<string>();
  parentPackageCode: string;
  private isSearchApplied: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );
  constructor() {}

  setSearchAppliedStatus(status: string): void {
    this.isSearchApplied.next(status);
  }

  getSearchAppliedStatus(): Observable<string>{
    return this.isSearchApplied.asObservable();
  }
}
