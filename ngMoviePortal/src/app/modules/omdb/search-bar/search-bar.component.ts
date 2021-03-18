import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MovieDataService } from '../../../services/data/movie-data.service';
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  totalRecords: Observable<number>;
  searchInputControl: FormControl = new FormControl();
  constructor(private movieDataService: MovieDataService) {}

  ngOnInit(): void {
    this.totalRecords = this.movieDataService.getTotalRecords();
  }

  search(): void {
    console.log(this.searchInputControl.value);
    this.movieDataService.setTotalRecords(0);
    this.movieDataService.setSearchAppliedStatus(this.searchInputControl.value);
  }

  ngOnDestroy(): void {}
}
