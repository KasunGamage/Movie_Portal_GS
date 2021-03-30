import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class MovieDataService {
  private isSearchApplied: Subject<string> = new Subject<string>();
  private totalRecords: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  constructor() {}

  /**
   * set the search value
   * @param value movie name
   */
  setSearchAppliedStatus(value: string): void {
    this.isSearchApplied.next(value);
  }

  /**
   * get the latest search value
   * @returns returns the latest search value as a observable
   */
  getSearchAppliedStatus(): Observable<string> {
    return this.isSearchApplied.asObservable();
  }

  /**
   * set the total movie record count
   * @param records number of movies
   */
  setTotalRecords(records: number): void {
    this.totalRecords.next(records);
  }

  /**
   * get the latest movie count
   * @returns returns the latest movie count as a observable
   */
  getTotalRecords(): Observable<number> {
    return this.totalRecords.asObservable();
  }
}
