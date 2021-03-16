import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HcpRoutingModule } from './hcp-routing.module';
import { HcpReportCreateComponent } from './hcp-report-create/hcp-report-create.component';
import { HcpReportListComponent } from './hcp-report-list/hcp-report-list.component';
import { PagesModule } from '../../../shared/modules/theme/pages.module';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateFormat } from '../../../constants/date-format';
import { MaterialModule } from '../../../shared/modules/material/material.module';
import { HcpReconciliationReportListComponent } from './hcp-reconciliation-report-list/hcp-reconciliation-report-list.component';
import { HcpFileUploadConfirmComponent } from './hcp-file-upload-confirm/hcp-file-upload-confirm.component';
@NgModule({
	declarations: [HcpReportCreateComponent, HcpReportListComponent, HcpReconciliationReportListComponent, HcpFileUploadConfirmComponent],
	imports: [
		CommonModule,
		HcpRoutingModule,
		PagesModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule
	],
	entryComponents: [HcpReportCreateComponent],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE]
		},
		{ provide: MAT_DATE_FORMATS, useValue: DateFormat }
	]
})
export class HcpModule {}
