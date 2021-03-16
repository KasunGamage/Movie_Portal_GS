import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, Subscription, merge } from 'rxjs';
import { tap, debounceTime } from 'rxjs/operators';

import { ReportNdisService } from '../../../../services/api/report/report-ndis.service';
import { LayoutUtilsService } from '../../../../services/theme/layout-utils.service';
import { SubheaderService } from '../../../../services/theme/subheader.service';

import { QueryResultsModel } from '../../../../models/request/query-results-model';
import { SearchParamsModel } from '../../../../models/request/query-params-model';

import { SortingOrder } from '../../../../constants/sorting-order';
import { PaginationType } from '../../../../constants/pagination-type';

import { HcpFileUploadConfirmComponent } from '../hcp-file-upload-confirm/hcp-file-upload-confirm.component';
import { IReportHcpExport, IReportTaskHCPListAdvancedFilters, IReportTaskHCPReconciliationFile, } from '../../../../models/report/report-hcp.model';
import { ReportHcpService } from '../../../../services/api/report/report-hcp.service';
import { CurrencyPipe } from '@angular/common';
import { RecordStatusTypeName, RecordStatusType } from '../../../../constants/report/record-status-type';
import { MessageType } from '../../../../constants/MessageType';

@Component({
  selector: 'kt-hcp-reconciliation-report-list',
  templateUrl: './hcp-reconciliation-report-list.component.html',
  styleUrls: ['./hcp-reconciliation-report-list.component.scss']
})
export class HcpReconciliationReportListComponent implements OnInit, AfterViewInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort_ndis_task', { static: true }) sort: MatSort;
	private subscriptions: Subscription[] = [];

	@ViewChild('searchInput', { static: true }) searchInput: ElementRef;

	loadingSubject: BehaviorSubject<boolean>;
	downloadBtnStatusSubject: BehaviorSubject<boolean>; // disable || enable
	downloadProgressStatusSubject: BehaviorSubject<boolean>; // spinner show || hide

	loading$: Observable<boolean>;
	downloadBtnStatus$: Observable<boolean>;
	downloadProgressStatus$: Observable<boolean>;

	dataSource: MatTableDataSource<IReportHcpExport>;
	downloadBtnTxt: string;
	taskId: number;
	displayedColumns: string[] = [
		'ClientCode',
		'FirstName',
		'LastName',
		'CRINumber',
		'ClaimReference',
		'ClaimFrom',
		'ClaimTo',
		'IncomeCategory',
		// 'SupportNumber',
		// 'Quantity', // getting null
		// 'Hours',
		// 'UnitPrice',
		'ClaimableAmount',
		'ClaimedAmount',
		'difference', //
		'status' //
	];
	uploadedReconciliationReports: IReportTaskHCPReconciliationFile;
	isTableEmpty: boolean = false;
	pageSizeOptions: number[];
	pageSize: number;
	isFilter: boolean;

	constructor(
		private activatedRoute: ActivatedRoute,
		private reportHcpService: ReportHcpService,
		private dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private subheaderService: SubheaderService,
		public currencyPipe: CurrencyPipe,
		private render: Renderer2,
	) {}

	ngOnInit(): void {
		this.paginator.pageSize = PaginationType.dashboardPageSize;
		this.pageSize = PaginationType.dashboardPageSize;
		this.pageSizeOptions = PaginationType.pageSizeOption;
		this.downloadBtnTxt = 'Download';
		this.dataSource = new MatTableDataSource<IReportHcpExport>();
		this.loadingSubject = new BehaviorSubject<boolean>(true);
		this.downloadBtnStatusSubject = new BehaviorSubject<boolean>(true);
		this.downloadProgressStatusSubject = new BehaviorSubject<boolean>(
			false
		);
		this.loading$ = this.loadingSubject.asObservable();
		this.downloadBtnStatus$ = this.downloadBtnStatusSubject.asObservable();
		this.downloadProgressStatus$ = this.downloadProgressStatusSubject.asObservable();
		this.subheaderService.hideClientBanner();
		this.getRoutedParameters();
		this.sortingAndPaging();
	}

	ngAfterViewInit(): void {
		this.render.listen(this.searchInput.nativeElement, 'keyup', () => {
			this.loadData(this.taskId);
		});
	}

	// get routing data && load data from api
	getRoutedParameters(): void {
		const subscription: Subscription = this.activatedRoute.params.subscribe(
			(params: Params) => {
				this.taskId = params.TaskId;
				if (this.taskId) {
					this.loadData(this.taskId);
				}
			},
			(err: Error) => {
				throw err;
			}
		);
		this.subscriptions.push(subscription);
	}

	loadData(taskId: number): void {
		this.loadingSubject.next(true);
		const searchQuery: SearchParamsModel = new SearchParamsModel(
			this.filter(taskId),
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
							: 'TaskId'
				}
			]
		);

		const subscription: Subscription = this.reportHcpService
			.getExportList('export', searchQuery)
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
					this.loadingSubject.next(false);
					this.layoutUtilsService.showActionNotification(
						'Error in loading data',
						MessageType.Error
					);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
	}

	setData(data: QueryResultsModel): void {
		if (!data) {
			return;
		}
		this.dataSource.data = data.Content.Entities.ExportReports.Entities;
		this.uploadedReconciliationReports =
			data.Content.Entities.UploadedReconciliationReports;
		// enable download btn
		if (this.uploadedReconciliationReports) {
			this.downloadBtnStatusSubject.next(false);
		}
		this.paginator.length =
			data.Content.Entities.ExportReports.Pagination.TotalRowCount;

		if (this.dataSource.data.length === 0) {
			this.isTableEmpty = true;
		} else {
			this.isTableEmpty = false;
		}
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
					if (this.taskId) {
						this.loadData(this.taskId);
					}
				})
			)
			.subscribe();
		this.subscriptions.push(paginatorSubscription);
	}

	filter(taskId: number): IReportTaskHCPListAdvancedFilters {
		return {
			TaskId: taskId,
			Status: null,
			CreatedBy: null,
			QueryString: this.searchInput.nativeElement.value
		};
	}

	openUploadDialog(): void {
		const dialogRef: MatDialogRef<HcpFileUploadConfirmComponent> = this.dialog.open(
			HcpFileUploadConfirmComponent,
			{
				autoFocus: false,
				restoreFocus: false,
				data: { taskId: this.taskId },
				disableClose: true
			}
		);

		const subscription: Subscription = dialogRef
			.afterClosed()
			.subscribe(() => {
				this.loadData(this.taskId);
			});
		this.subscriptions.push(subscription);
	}
	// download latest upload file
	downloadReports(): void {
		// this.layoutUtilsService.showActionNotification(
		// 	'Report is downloading',
		// 	MessageType.Info
		// );
		// this.downloadProgressStatusSubject.next(true);
		// const subscription: Subscription = this.reportHcpService
		// 	.downloadReconciliationFiles(this.taskId)
		// 	.subscribe(
		// 		(res: QueryResultsModel) => {
		// 			if (res.Content.Entity.length) {
		// 				window.open(
		// 					res.Content.Entity[res.Content.Entity.length - 1]
		// 						.ReportUrl,
		// 					'_self'
		// 				);
		// 				this.downloadProgressStatusSubject.next(false);
		// 			}
		// 		},
		// 		(err: Error) => {
		// 			this.layoutUtilsService.showActionNotification(
		// 				'Error in downloading report',
		// 				MessageType.Error
		// 			);
		// 			this.downloadProgressStatusSubject.next(false);
		// 			throw err;
		// 		}
		// 	);
		// this.subscriptions.push(subscription);
	}
	// kt pill badge css class // status === Matched || Not Matched
	setPillClass(status: any): string {
		let pillCssClasses: string;
		pillCssClasses =
			'kt-badge kt-badge--pill kt-badge--inline kt-badge--wide kt-badge--';
       if (status== 'Matched' ||status==1 ){
		return pillCssClasses + 'success';
	   }
	   else{
		return pillCssClasses + 'secondary';
	   }

	}

	ngOnDestroy(): void {
		this.loadingSubject.complete();
		this.downloadProgressStatusSubject.complete();
		this.downloadBtnStatusSubject.complete();
		this.subscriptions.forEach((element: Subscription) =>
			element.unsubscribe()
		);
	}

	numberOnly(event: any): boolean {
        const charCode: any = event.which ? event.which : event.keyCode;
        if ((charCode >= 48 && charCode <= 57) || charCode === 46) {
            if (event.target.value.length === 0 && charCode === 46) {
                return false;
            } else if (charCode === 46) {
                const valArray: string[] = Array.from(event.target.value.toString());
                const dots: string[] = valArray.filter((e: any) => {
                    return (e === '.');
                });
                if (dots.length > 0) {
                    return false;
                } else {
                    return true;
                }
            }
            return true;
        }
        return false;
    }

    convertToCurrency(event: any, row:any): void {
        let str: string = event.target.value;
        if (str.includes('.')) {
            const slug: any = str.substring(str.indexOf('.') + 1);
            if (slug.length === 0) {
                str = str.replace('.', '');
            }
		}
		row.ClaimedAmount =  event.target.value;
		this.calDiffrece(row.ClaimedAmount,row)
		this.saveRowData(row)
        const coverted: string = this.currencyPipe.transform(event.target.value);
        event.target.value = coverted;
    }

    changeCurToNum(event: any): void {
        let cur: string = (event.target.value).toString();
        cur = cur.replace('$', '');
        cur = cur.replace(/,/g, '');
        event.target.value = cur;
    }

    changeCurToNumValue(val: string): string {
        if (val) {
            let cur: string = (val).toString();
            cur = cur.replace('$', '');
            cur = cur.replace(/,/g, '');
            return parseFloat(cur).toFixed(2);
        } else {
            return null;
        }

	}

	calDiffrece (value:number ,row:any ){
		row.Difference = row.ClaimableAmount - value ;
	    row.Status = row.Difference ===0? RecordStatusType.Matched:RecordStatusType.NotMatched
	}

	saveRowData(element:any){

		if(element.Difference == null  ){
			return
		}

		this.reportHcpService
		.AddRowData(  {TaskId:element.TaskId,
			ExportRecordId:element.ExportRecordId,
			ClaimReference: element.ClaimReference,
			ClaimedAmount:element.ClaimedAmount,
			Difference:element.Difference,
			Status:element.Status,
			IsDeleted:element.IsDeleted
			 }

		)
		.pipe(debounceTime(500))
		.subscribe(
			(res: QueryResultsModel) => {
				this.loadingSubject.next(false);
				this.layoutUtilsService.showActionNotification('Item Updated Successfully', MessageType.Success);
			},

		);

	}

	setStaus(Status:number){
		if(Status != null){
			return Status == 1?RecordStatusTypeName.Matched:RecordStatusTypeName.NotMatched
		}


	}

}

