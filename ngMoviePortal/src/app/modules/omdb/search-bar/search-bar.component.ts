import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieDataService } from '../../../services/data/movie-data.service';
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchInputControl: FormControl = new FormControl();
  constructor(private movieDataService: MovieDataService) {}

  ngOnInit(): void {}

  search(): void {
    this.movieDataService.setSearchAppliedStatus(this.searchInputControl.value);
  }

  ngOnDestroy(): void {}
}
