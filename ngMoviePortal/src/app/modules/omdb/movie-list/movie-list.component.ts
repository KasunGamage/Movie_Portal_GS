import { Component, OnDestroy, OnInit } from '@angular/core';
import { OmdbService } from '../../../services/api/omdb.service';
import { Movie, MovieInfo, MovieListResponse, SearchParameters } from '../../../models/omdb.model';
import { MovieDataService } from '../../../services/data/movie-data.service';
import { ErrorStatus } from 'src/app/constants/error-status';
import { InfoMesseges } from 'src/app/constants/info-messages';
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
  totalPages = 0;
  totalItems = 0;
  tableSize = 10;
  searchVal: string;
  welcomeMsg: string = InfoMesseges.welcome;
  constructor(
    private movieDataService: MovieDataService,
    private omdbService: OmdbService
  ) {}

  ngOnInit(): void {
    this.isSearchStatusOnChange();
  }

  /**
   * listen to the search value changes
   */
  isSearchStatusOnChange(): void {
    this.movieDataService
      .getSearchAppliedStatus()
      .subscribe((searchVal: string) => {
        this.movieList = [];
        this.currentPage = 1;
        this.searchVal = searchVal;
        this.totalItems = 0;
        if (searchVal === null || searchVal === undefined) {
          this.searchVal = '';
        }
        this.isSearchApplied = true;
        this.getMovies(this.searchVal, this.currentPage);
      });
  }

  /**
   * get the list of movies
   * @param title movie name
   * @param page page number
   * @returns returns list of movies
   */
  getMovies(title: string, page: number): void {
    const req: SearchParameters = {
      title,
      page,
    };
    this.omdbService.getMovies(req).subscribe((res: MovieListResponse) => {
      if (res && res.Response === ErrorStatus.true) {
        this.movieList = this.removeDuplicates(res);
        this.isNoResult = this.movieList.length ? false : true;
        this.totalItems = +res.totalResults;
        this.movieDataService.setTotalRecords(+res.totalResults);
        const pages: any = +res.totalResults / 10;
        this.totalPages = Math.ceil(pages);
      } else if (res && res.Response === ErrorStatus.false) {
        this.movieList = [];
        this.movieDataService.setTotalRecords(0);
        this.isNoResult = true;
        this.errorMsg = res.Error;
      }
    });
  }

  /**
   * remove duplicate movie objects
   * @param res getMovies object response
   * @returns returns filtered movie list
   */
  removeDuplicates(res: any): any[] {
    const filterArray = res.Search.reduce((accumalator, current) => {
      if (!accumalator.some((item) => item.imdbID === current.imdbID)) {
        accumalator.push(current);
      }
      return accumalator;
    }, []);
    return filterArray;
  }

  /**
   * listen to pagination changes
   * @param event current page number
   */
  onTableDataChange(event: any): void {
    this.currentPage = event;
    this.getMovies(this.searchVal, this.currentPage);
  }

  /**
   * get the details of specific movie
   * @param id movie imdbID
   */
  getById(id: string): void {
    this.omdbService.getById(id).subscribe((res: MovieInfo) => {
      this.movieInfo = res;
    });
  }

  /**
   * remove the detail info of a movie
   */
  setMovieDetailsEmpty(): void {
    this.movieInfo = null;
  }

  /**
   * remove unnecessary '–' characters from the string
   * @param year year of the movie
   * @returns formatted year
   */
  formatYear(year: string): string {
    if (year.endsWith('–') || year.startsWith('–')) {
      year = year.substring(0, year.length - 1);
    }
    return year;
  }

  /**
   * make DOM changes only for the selected element.
   * @param index iteration index
   * @param item item ID
   * @returns returns as a unique identifier for each item.
   */
  trackByFn(index: any, item: any): any {
    return index; // or item.id
  }

  ngOnDestroy(): void {}
}
