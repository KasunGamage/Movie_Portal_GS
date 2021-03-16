import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { Subscription, merge, BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
	IReportHcp,
	IReportTaskHCPListAdvancedFilters
} from '../../../../models/report/report-hcp.model';
import { SearchParamsModel } from '../../../../models/request/query-params-model';
import { QueryResultsModel } from '../../../../models/request/query-results-model';

import { SortingOrder } from '../../../../constants/sorting-order';
import { ActionType } from '../../../../constants/action-type';
import { PaginationType } from '../../../../constants/pagination-type';

import {
	LayoutUtilsService
} from '../../../../services/theme/layout-utils.service';
import { ReportHcpService } from '../../../../services/api/report/report-hcp.service';
import { SubheaderService } from '../../../../services/theme/subheader.service';

import { HcpReportCreateComponent } from '../hcp-report-create/hcp-report-create.component';
import { DeleteEntityDialogComponent } from '../../../../shared/components/theme/partials/crud';
import { MessageType } from '../../../../constants/MessageType';

@Component({
	selector: 'kt-hcp-report-list',
	templateUrl: './hcp-report-list.component.html',
	styleUrls: ['./hcp-report-list.component.scss']
})
export class HcpReportListComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort_hcp_task', { static: true }) sort: MatSort;

	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	loadingSubject: BehaviorSubject<boolean>;
	loading$: Observable<boolean>;
	dataSource: MatTableDataSource<IReportHcp>;
	displayedColumns: string[] = [
		'TaskCode',
		'Status',
		'FromDate',
		'ToDate',
		'CreatedBy',
		'CreatedOn',
		'Actions',
		'Report'
	];
	private subscriptions: Subscription[] = [];
	private lastTaskItem: IReportHcp;
	isTableEmpty: boolean = false;
	pageSizeOptions: number[];
	pageSize: number;
	isFilter: boolean;

	constructor(
		private reportHcpService: ReportHcpService,
		private layoutUtilsService: LayoutUtilsService,
		private dialog: MatDialog,
		private subheaderService: SubheaderService,
		private render: Renderer2,
	) {}

	ngOnInit(): void {
		this.paginator.pageSize = PaginationType.dashboardPageSize;
		this.pageSize = PaginationType.dashboardPageSize;
		this.pageSizeOptions = PaginationType.pageSizeOption;
		this.loadingSubject = new BehaviorSubject<boolean>(true);
		this.dataSource = new MatTableDataSource<IReportHcp>();
		this.loading$ = this.loadingSubject.asObservable();
		this.subheaderService.hideClientBanner();
		this.loadData();
		this.sortingAndPaging();
	}

	ngAfterViewInit(): void {
		this.render.listen(this.searchInput.nativeElement, 'keyup', () => {
			this.loadData();
		});
	}

	loadData(): void {
		this.loadingSubject.next(true);
		const searchQuery: SearchParamsModel = new SearchParamsModel(
			this.filter(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			[
				{
					SortOrder: this.sort.direction
						? this.sort.direction
						: SortingOrder.DESC,
					ColumnName:
						this.sort.active && this.sort.active.length > 0
							? this.sort.active
							: 'TaskCode'
				}
			]
		);
		const subscription: Subscription = this.reportHcpService
			.getAdvancedList(searchQuery)
			.subscribe(
				(res: QueryResultsModel) => {
					this.setData(res);
					this.loadingSubject.next(false);
					if (this.searchInput.nativeElement.value && this.searchInput.nativeElement.value != '') {
						this.isFilter = true;
					} else {
						this.isFilter = false;
					}
				},
				(err: Error) => {
					this.layoutUtilsService.showActionNotification(
						'Error In loading data',
						MessageType.Error
					);
					this.loadingSubject.next(false);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
		this.getTheLatestTaskCreated();
	}

	filter(): IReportTaskHCPListAdvancedFilters {
		return {
			//TaskCode: null,
			TaskId: null,
			Status: null,
			CreatedBy: null,
			QueryString: this.searchInput.nativeElement.value
		};
	}

	setData(data: QueryResultsModel): void {
		if (!data) {
			return;
		}
		this.dataSource.data = data.Content.Entities;
		this.paginator.length = data.Content.Pagination.TotalRowCount;
		if (this.dataSource.data.length === 0) {
			this.isTableEmpty = true;
		} else {
			this.isTableEmpty = false;
		}
	}

	getTheLatestTaskCreated(): void {
		const searchQuery: SearchParamsModel = new SearchParamsModel(
			this.filter(),
			this.paginator.pageIndex + 1,
			this.paginator.pageSize,
			[
				{
					SortOrder: SortingOrder.DESC,
					ColumnName: 'ToDate'
				}
			]
		);
		const subscription: Subscription = this.reportHcpService
			.getAdvancedList(searchQuery)
			.subscribe(
				(res: QueryResultsModel) => {
					this.lastTaskItem = res.Content.Entities[0];
				},
				(err: Error) => {
					this.layoutUtilsService.showActionNotification(
						'Error In getting last created report details',
						MessageType.Error
					);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
	}

	sortingAndPaging(): void {
		const sortSubscription: Subscription = this.sort.sortChange.subscribe(
			() => (this.paginator.pageIndex = 0)
		);
		this.subscriptions.push(sortSubscription);
		const paginatorSubscription: Subscription = merge(
			this.sort.sortChange,
			this.paginator.page
		)
			.pipe(
				tap(() => {
					this.loadData();
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscription);
	}

	add(): void {
		const reportTask: IReportHcp = {} as IReportHcp;
		if (this.lastTaskItem) {
			reportTask.FromDate = moment(this.lastTaskItem.ToDate)
				.hours(24)
				.format();
			reportTask.ToDate = moment(reportTask.FromDate)
				.add(1, 'months')
				.date(0)
				.format();
		}
		this.openDialog(reportTask, ActionType.Add);
	}

	edit(reportTask: IReportHcp): void {
		this.openDialog(reportTask, ActionType.Edit);
	}

	delete(element: IReportHcp): void {
		let deleteMessage: string;
		deleteMessage = `Do you want to permanently delete this Report?`;
		const deleteDialogRef: MatDialogRef<
			DeleteEntityDialogComponent
		> = this.layoutUtilsService.deleteElement(
			'Delete Report',
			deleteMessage
		);

		const subscriptionDialog: Subscription = deleteDialogRef
			.afterClosed()
			.subscribe((result: boolean) => {
				if (result === true) {
					const subscription: Subscription = this.reportHcpService
						.delete(element.TaskId)
						.subscribe(
							(res: QueryResultsModel) => {
								if (res.IsSuccessful) {
									this.layoutUtilsService.showActionNotification(
										'Report has been deleted successfully!',
										MessageType.Success
									);
									this.loadData();
								}
							},
							(err: Error) => {
								this.layoutUtilsService.showActionNotification(
									'Error In deleting report',
									MessageType.Error
								);
								throw err;
							}
						);
					this.subscriptions.push(subscription);
				}
			});
		this.subscriptions.push(subscriptionDialog);
	}

	downloadReport(reportTask: IReportHcp): void {
		this.layoutUtilsService.showActionNotification(
			'Report is downloading',
			MessageType.Info
		);
		const subscription: Subscription = this.reportHcpService
			.downloadReport(reportTask.TaskId)
			.subscribe(
				(res: QueryResultsModel) => {
					if (res.IsSuccessful) {
						window.open(res.Content.Path, '_self');
					}
				},
				(err: Error) => {
					this.layoutUtilsService.showActionNotification(
						'Error in downloading report',
						MessageType.Error
					);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
	}

	downloadErrorReport(reportTask: IReportHcp): void {
		this.layoutUtilsService.showActionNotification(
			'Report in downloading',
			MessageType.Info
		);
		const subscription: Subscription = this.reportHcpService
			.downloadErrorReport(reportTask.TaskId)
			.subscribe(
				(res: QueryResultsModel) => {
					if (res.IsSuccessful) {
						window.open(res.Content.Path, '_self');
					}
				},
				(err: Error) => {
					this.layoutUtilsService.showActionNotification(
						'Error in downloading report',
						MessageType.Error
					);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
	}

	openDialog(reportTask: IReportHcp, actionType: ActionType): void {
		const dialogRef: MatDialogRef<
			HcpReportCreateComponent
		> = this.dialog.open(HcpReportCreateComponent, {
			width: '440px',
			data: {
				taskId: reportTask.TaskId,
				taskCode: reportTask.TaskCode,
				status: reportTask.Status,
				fromDate: reportTask.FromDate,
				toDate: reportTask.ToDate,
				actionType
			},
			autoFocus: false,
			restoreFocus: false,
			disableClose: true
		});

		let saveMessage: string;
		saveMessage = `Report task has been queued Successfully`;
		let messageType: MessageType = MessageType.Success;

		if (actionType === ActionType.Edit) {
			saveMessage = `Report task has been updated Successfully`;
			messageType = MessageType.Success;
		}

		const subscription: Subscription = dialogRef.afterClosed().subscribe(
			(res: QueryResultsModel) => {
				if (!res) {
					return;
				}

				this.layoutUtilsService.showActionNotification(
					saveMessage,
					messageType
				);
				this.loadData();
			},
			(err: Error) => {
				throw err;
			}
		);
		this.subscriptions.push(subscription);
	}
	// kt pill badge css class
	setPillClass(reportTask: IReportHcp): string {
		let pillCssClasses: string;
		pillCssClasses =
			'kt-badge kt-badge--pill kt-badge--inline kt-badge--wide kt-badge--';
		switch (reportTask.StatusId) {
			case 1: {
				return pillCssClasses + 'primary';
			}
			case 2: {
				return pillCssClasses + 'warning';
			}
			case 3: {
				return pillCssClasses + 'success';
			}
			case 4: {
				return pillCssClasses + 'danger';
			}
			case 5: {
				return pillCssClasses + 'custom';
			}
			default: {
				return pillCssClasses + 'secondary';
			}
		}
	}

	ngOnDestroy(): void {
		this.loadingSubject.complete();
		this.subscriptions.forEach((element: Subscription) =>
			element.unsubscribe()
		);
	}
}
