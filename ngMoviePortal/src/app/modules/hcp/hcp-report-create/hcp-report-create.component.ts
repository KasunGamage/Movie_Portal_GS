import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	ValidatorFn,
	ValidationErrors,
	AbstractControl
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable, Subscription } from 'rxjs';
import moment from 'moment';

import { LayoutUtilsService } from '../../../../services/theme/layout-utils.service';
import { ReportHcpService } from '../../../../services/api/report/report-hcp.service';

import { ActionType } from '../../../../constants/action-type';

import { ReportTaskHCPAdd, IReportTaskHCPData } from '../../../../models/report/report-hcp.model';
import { QueryResultsModel } from '../../../../models/request/query-results-model';
import { MessageType } from '../../../../constants/MessageType';

@Component({
	selector: 'kt-hcp-report-create',
	templateUrl: './hcp-report-create.component.html',
	styleUrls: ['./hcp-report-create.component.scss']
})
export class HcpReportCreateComponent implements OnInit, OnDestroy {
	hcpTaskEditForm: FormGroup;
	title: string;
	saveButtonText: string;
	reportStatus: string;

	loadingSubject: BehaviorSubject<boolean>;
	loading$: Observable<boolean>;
	private subscriptions: Subscription[] = [];

	constructor(
		private fb: FormBuilder,
		@Inject(MAT_DIALOG_DATA) private data: IReportTaskHCPData,
		private reportHcpService: ReportHcpService,
		private dialogRef: MatDialogRef<HcpReportCreateComponent>,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit(): void {
		this.reportStatus = this.data.status;
		this.loadingSubject = new BehaviorSubject<boolean>(false);
		this.loading$ = this.loadingSubject.asObservable();
		this.setTitle();
		this.setSaveButtonText();
		this.createForm();
	}

	setTitle(): void {
		if (this.data.actionType === ActionType.Add) {
			this.title = 'New Report Task';
			return;
		}
		this.title = `HCP Report Task - ${this.data.taskCode}`;
	}

	setSaveButtonText(): void {
		if (this.data.actionType === ActionType.Add) {
			this.saveButtonText = 'Create Task';
			return;
		}
		this.saveButtonText = 'Retry Task';
	}

	createForm(): void {
		this.hcpTaskEditForm = this.fb.group(
			{
				fromDate: [this.data.fromDate, [Validators.required]],
				toDate: [this.data.toDate, [Validators.required]]
			},
			{ validators: this.compareDateValidator }
		);
	}

	save(): void {
		this.loadingSubject.next(true);
		if (this.hcpTaskEditForm.invalid) {
			Object.keys(this.hcpTaskEditForm.controls).forEach(
				(field: string) => {
					const control: AbstractControl = this.hcpTaskEditForm.get(
						field
					);
					control.markAsDirty({ onlySelf: true });
					control.markAsTouched({ onlySelf: true });
				}
			);
			this.loadingSubject.next(false);
		} else {
			const reportAdd: ReportTaskHCPAdd = {
				FromDate: moment(this.hcpTaskEditForm.value.fromDate).format(
					'DD/MM/YYYY HH:mm:ss'
				),
				ToDate: moment(this.hcpTaskEditForm.value.toDate).format(
					'DD/MM/YYYY HH:mm:ss'
				)
			};

			if (this.data.actionType === ActionType.Add) {
				this.add(reportAdd);
			} else {
				this.edit(this.data.taskId, reportAdd);
			}
		}
	}

	add(reportTask: ReportTaskHCPAdd): void {
		const subscription: Subscription = this.reportHcpService
			.add(reportTask)
			.subscribe(
				(res: QueryResultsModel) => {
					if (res.IsSuccessful) {
						this.loadingSubject.next(false);
						this.dialogRef.close({ res });
					}
				},
				(err: Error) => {
					this.loadingSubject.next(false);
					this.layoutUtilsService.showActionNotification(
						'Error in adding report task',
						MessageType.Error
					);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
	}

	edit(taskId: number, reportTask: ReportTaskHCPAdd): void {
		const subscription: Subscription = this.reportHcpService
			.update(taskId, reportTask)
			.subscribe(
				(res: QueryResultsModel) => {
					if (res.IsSuccessful) {
						this.loadingSubject.next(false);
						this.dialogRef.close({ res });
					}
				},
				(err: Error) => {
					this.loadingSubject.next(false);
					this.layoutUtilsService.showActionNotification(
						'Error in updating report task',
						MessageType.Error
					);
					throw err;
				}
			);
		this.subscriptions.push(subscription);
	}
	/** from date should be less than to date */
	compareDateValidator: ValidatorFn = (
		formGroup: FormGroup
	): ValidationErrors | null => {
		const toDateControl: AbstractControl = formGroup.controls.toDate;
		const fromDateControl: AbstractControl = formGroup.controls.fromDate;
		const toDateValue: moment.Moment = moment(toDateControl.value);
		const fromDateValue: moment.Moment = moment(fromDateControl.value);

		if (toDateControl.errors && !toDateControl.errors.dateUnmatched) {
			// return if another validator has already found an error on the control2
			return;
		}

		if (toDateValue <= fromDateValue) {
			toDateControl.setErrors({ dateUnmatched: true });
		} else {
			toDateControl.setErrors(null);
		}
		return;
	}

	ngOnDestroy(): void {
		this.loadingSubject.complete();
		this.subscriptions.forEach((element: Subscription) =>
			element.unsubscribe()
		);
	}
}
