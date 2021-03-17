import { SortingOrder } from '../../constants/sorting-order';

export class QueryParamsModel {
  // fields
  filter: any;
  sortOrder: string; // asc || desc
  sortField: string;
  pageNumber: number;
  pageSize: number;

  // constructor overrides
  constructor(filter: any,
              sortOrder: string = SortingOrder.ASC,
              sortField: string,
              pageNumber: number = 0,
              pageSize: number = 10) {
    this.filter = filter;
    this.sortOrder = sortOrder;
    this.sortField = sortField;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
export class Paging {
  PageNo: number;
  PageSize: number;
}

export class Sorting {
  ColumnName: string;
  SortOrder: string;
}



export class PagingAndSortingInfo {
  Paging: Paging;
  Sorting: Sorting[];

  constructor(
    pageNo: number,
    pageSize: number,
    sorting: Sorting[]
  ) {
    this.Paging = new Paging();
    this.Paging.PageNo = pageNo;
    this.Paging.PageSize = pageSize;
    this.Sorting = sorting;
  }
}

export class SearchParamsModel {
  // Fields
  Filters: any;
  PagingAndSortingInfo: PagingAndSortingInfo;

  // constructor overrides
  constructor(
    filter: any,
    pageNumber: number = 0,
    pageSize: number = 10,
    sorting: Sorting[] = [{
      SortOrder: SortingOrder.ASC,
      ColumnName: '1'
    }],
    ticks?: number,
  ) {
    this.Filters = filter;
    this.PagingAndSortingInfo = new PagingAndSortingInfo(pageNumber, pageSize, sorting);
  }
}
export class SearchParamsModelListSimple {
  // Fields
  Filters: any;
  PagingAndSortingInfo: PagingAndSortingInfo;
  ticks: any;

  // constructor overrides
  constructor(
    filter: any,
    pageNumber: number = 0,
    pageSize: number = 10,
    sorting: Sorting[] = [{
      SortOrder: SortingOrder.ASC,
      ColumnName: '1'
    }],
    ticks?: number,
  ) {
    this.Filters = filter;
    this.PagingAndSortingInfo = new PagingAndSortingInfo(pageNumber, pageSize, sorting);
    this.ticks = ticks;
  }
}

export class SearchParamsModelCalendar {
  // Fields
  CalendarFilters: any;
  PagingAndSortingInfo: PagingAndSortingInfo;

  // constructor overrides
  constructor(
    filter: any,
    pageNumber: number = 0,
    pageSize: number = 10,
    sorting: Sorting[] = [{
    SortOrder: SortingOrder.ASC,
    ColumnName: '1'
    }]
  ) {
    this.CalendarFilters = filter;
    this.PagingAndSortingInfo = new PagingAndSortingInfo(pageNumber, pageSize, sorting);
  }
}



export class SearchRequest {
  orderbyColumn: number;
  pageNo: number;
  sortingType: number;
  pageSize: number;
}
