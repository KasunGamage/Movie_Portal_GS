import { Component, OnDestroy, OnInit } from '@angular/core';
import { OmdbService } from '../../../services/api/omdb.service';
import { Movie, MovieInfo, SearchParameters } from '../../../models/omdb.model';
import { MovieDataService } from '../../../services/data/movie-data.service';
@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit, OnDestroy {
  isSearchApplied: boolean;
  movieList: Movie[] = [];
  movieInfo: MovieInfo;
  isNoResult = false;
  errorMsg: string;
  currentPage = 1;
  totalPages: number;
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
          this.getMovies(searchVal, this.currentPage);
        } else {
          this.movieList = [];
        }
      });
  }

  getMovies(title: string, page: number): void {
    const req: SearchParameters = {
      title,
      page,
    };
    this.omdbService.getMovies(req).subscribe((res: any) => {
      if (res && res.Response === 'True') {
        this.movieList = res.Search;
        this.isNoResult = this.movieList.length ? false : true;
        this.movieDataService.setTotalRecords(res.totalResults);
        const pages: any = res.totalResults / 10;
        this.totalPages = Math.ceil(pages);
        console.log(this.totalPages);
      } else if (
        res &&
        res.Response === 'False' &&
        res.Error === 'Movie not found!'
      ) {
        this.movieList = [];
        this.movieDataService.setTotalRecords(0);
        this.isNoResult = true;
        this.errorMsg = res.Error;
      } else if (
        res &&
        res.Response === 'False' &&
        res.Error === 'Too many results.'
      ) {
        this.movieList = [];
        this.movieDataService.setTotalRecords(0);
        this.isNoResult = true;
        this.errorMsg = res.Error;
      }
    });
  }

  moreDetails(id: string): void {
    this.getById(id);
  }

  getById(id: string): void {
    this.omdbService.getById(id).subscribe((res: MovieInfo) => {
      this.movieInfo = res;
    });
  }

  setMovieDetailsEmpty(): void {
    this.movieInfo = null;
  }

  ngOnDestroy(): void {}
}
