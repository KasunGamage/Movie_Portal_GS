export class QueryResultsModel {
	// fields
	Description: any[];
	Content: any;
	IsSuccessful: boolean;

	constructor(
		_description: any[] = [],
		_totalCount: number = 0,
		_errorMessage: string = ''
	) {
		this.Description = _description;
	}
}
