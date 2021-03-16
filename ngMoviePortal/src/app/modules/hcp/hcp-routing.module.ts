import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HcpReportListComponent } from './hcp-report-list/hcp-report-list.component';
import { HcpReconciliationReportListComponent } from './hcp-reconciliation-report-list/hcp-reconciliation-report-list.component';

const routes: Routes = [
	{
		path: '',
		component: HcpReportListComponent
	},
	{
		path: 'reconciliation-list/:TaskId',
		component: HcpReconciliationReportListComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HcpRoutingModule {}
