import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchParameters } from 'src/app/models/omdb.model';
import { OmdbService } from '../../../services/api/omdb.service';
import { MovieDataService } from '../../../services/data/movie-data.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchInputControl: FormControl = new FormControl();
  subscriptions: Subscription[] = [];
  constructor(
    private movieDataService: MovieDataService,
    private omdbService: OmdbService
  ) {}

  ngOnInit(): void {
    // this.onSearchChange();
  }

  search(): void {
    this.movieDataService.setSearchAppliedStatus(this.searchInputControl.value);
    // this.getMovies(this.searchInputControl.value, 2000);
    console.log(this.searchInputControl.value);
  }

  // onSearchChange(): void {
  //   this.subscriptions.push(
  //     this.searchInputControl.valueChanges
  //       .pipe(debounceTime(500))
  //       .subscribe((val: any) => {
  //         console.log(val);
  //       })
  //   );
  // }

  getMovies(title: string, year: number): void {
    const req: SearchParameters = {
      title,
      year,
    };
    this.omdbService.getMovies(req).subscribe((res: any) => {
      console.log(res);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((element: Subscription) =>
      element.unsubscribe()
    );
  }
}
