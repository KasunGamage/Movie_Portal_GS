import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OmdbRoutingModule } from '../omdb/omdb-routing.module';
import { MovieListComponent } from '../omdb/movie-list/movie-list.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [MovieListComponent, SearchBarComponent],
  imports: [
    CommonModule,
    OmdbRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
})
export class OmdbModule {}
