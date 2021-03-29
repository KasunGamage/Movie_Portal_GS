import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  private isSearchApplied: Subject<string> = new Subject<string>();
  private totalrecords: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  constructor() {}

  setSearchAppliedStatus(status: string): void {
    this.isSearchApplied.next(status);
  }

  getSearchAppliedStatus(): Observable<string> {
    return this.isSearchApplied.asObservable();
  }

  setTotalRecords(records: number): void {
    this.totalrecords.next(records);
  }

  getTotalRecords(): Observable<number> {
    return this.totalrecords.asObservable();
  }
}
