import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { OmdbService } from '../../../services/api/omdb.service';
import { Movie, MovieInfo, SearchParameters } from '../../../models/omdb.model';
import { MovieDataService } from '../../../services/data/movie-data.service';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit {
  isSearchApplied: boolean;
  movieList: Movie[] = [];
  isNoResult = false;
  constructor(
    private movieDataService: MovieDataService,
    private omdbService: OmdbService
  ) {}

  ngOnInit(): void {
    this.isSearchStatusOnChange();
  }

  isSearchStatusOnChange(): void {
    this.movieDataService
      .getSearchAppliedStatus()
      .subscribe((searchVal: string) => {
        if (searchVal) {
          this.isSearchApplied = true;
          this.getMovies(searchVal, 1995);
        } else {
          this.movieList = [];
        }
      });
  }

  getMovies(title: string, year: number): void {
    const req: SearchParameters = {
      title,
      year,
    };
    this.omdbService.getMovies(req).subscribe((res: any) => {
      if (res && res.Response === 'True') {
        this.movieList = res.Search;
        this.isNoResult = this.movieList.length ? false : true;
      } else if (
        res &&
        res.Response === 'False' &&
        res.Error === 'Movie not found!'
      ) {
        this.movieList = [];
        this.isNoResult = true;
      }
    });
  }

  moreDetails(id: string): void {
    this.getById(id);
  }

  getById(id: string): void {
    this.omdbService.getById(id).subscribe((res: MovieInfo) => {
      console.log(res);
    });
  }
}
