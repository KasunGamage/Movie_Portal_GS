import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CorrespondenceDataService {
  inBoundDataSubject: Subject<string> = new Subject<string>();
  parentPackageCode: string;
  isFilter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  constructor() {}

  setParentPackage(data: string = 'parentPackageChange'): void {
    this.inBoundDataSubject.next(data);
  }
}
