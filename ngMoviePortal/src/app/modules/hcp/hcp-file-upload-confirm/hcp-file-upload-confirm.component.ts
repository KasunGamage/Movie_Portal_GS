import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

import { ReportNdisService } from '../../../../services/api/report/report-ndis.service';
import { LayoutUtilsService } from '../../../../services/theme/layout-utils.service';
import { IReportTaskNDISReconciliationData } from '../../../../models/report/report-ndis.model';
import { MessageType } from '../../../../constants/MessageType';

@Component({
  selector: 'kt-hcp-file-upload-confirm',
  templateUrl: './hcp-file-upload-confirm.component.html',
  styleUrls: ['./hcp-file-upload-confirm.component.scss']
})
export class HcpFileUploadConfirmComponent implements OnInit {

	file: any;
	title: string;
	btnStatus: string;
	private formData: FormData;

	loadingSubject: BehaviorSubject<boolean>;
	loading$: Observable<boolean>;
	private subscriptions: Subscription[] = [];

	constructor(
		private dialogRef: MatDialogRef<HcpFileUploadConfirmComponent>,
		@Inject(MAT_DIALOG_DATA) private data: IReportTaskNDISReconciliationData,
		private reportNdisService: ReportNdisService,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit(): void {
		this.btnStatus = 'Upload';
		this.title = 'Upload File';
		this.loadingSubject = new BehaviorSubject<boolean>(false);
		this.loading$ = this.loadingSubject.asObservable();
	}

	onSelectFile(event: any): void {
		if (event.target.files && event.target.files[0]) {
			this.file = event.target.files[0];
			this.formData = new FormData();
			this.formData.append('testDoc', this.file);
		}
	}

	upload(): void {
		if (this.file) {
			this.loadingSubject.next(true);
			const subscription: Subscription = this.reportNdisService
				.uploadReconciliationFile(this.data.taskId, this.formData)
				.subscribe(
					(res: any) => {
						if (res.type === HttpEventType.DownloadProgress) {
						}
						if (res.type === HttpEventType.Response) {
							this.layoutUtilsService.showActionNotification(
								'Upload completed, task queued successfully',
								MessageType.Success
							);
							this.loadingSubject.next(false);
							this.dialogRef.close({ res });
						}
					},
					(err: Error) => {
						this.loadingSubject.next(false);
						this.layoutUtilsService.showActionNotification(
							'Error in uploading file',
							MessageType.Error
						);
						throw err;
					}
				);
			this.subscriptions.push(subscription);
		}
	}

	ngOnDestroy(): void {
		this.loadingSubject.complete();
		this.subscriptions.forEach((element: Subscription) =>
			element.unsubscribe()
		);
	}
}

