import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment.dev';

import { HttpService } from '../../utilities/http.service';

import { SearchParamsModel } from '../../../models/request/query-params-model';
import { QueryResultsModel } from '../../../models/request/query-results-model';
import { ICkEditorConfig } from '../../../constants/ckeditor-config';

@Injectable({
  providedIn: 'root',
})
export class LetterTemplateService {
  constructor(private httpService: HttpService) {}

  getCkeditorConfig(): ICkEditorConfig {
    const config: ICkEditorConfig = {
      uiColor: '#F0F3F4',
      toolbar: [
        { name: 'document', items: ['Print'] },
        { name: 'undo', items: ['Undo', 'Redo'] },
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        '/',
        {
          name: 'basicstyles',
          items: [
            'Bold',
            'Italic',
            'Underline',
            'Strike',
            'Subscript',
            'Superscript',
          ],
        },
        {
          name: 'paragraph',
          items: [
            'NumberedList',
            'BulletedList',
            '-',
            'Outdent',
            'Indent',
            '-',
            'Blockquote',
            '-',
            'JustifyLeft',
            'JustifyCenter',
            'JustifyRight',
            'JustifyBlock',
          ],
        },
        {
          name: 'insert',
          items: ['Table', 'HorizontalRule', 'SpecialChar', 'PageBreak'],
        },
        { name: 'editing', items: ['Find', 'Replace'] },
      ],
      extraPlugins: 'wordcount, notification, autogrow',
      wordcount: {
        showCharCount: true,
        countSpacesAsChars: true,
        countHTML: true,
        countLineBreaks: true,
        maxCharCount: 10000,
        pasteWarningDuration: 3000,
      },
      autoGrow_onStartup: true,
      autoGrow_minHeight: 300,
      autoGrow_maxHeight: 500,
    };

    return config;
  }

  add(template: any): Observable<QueryResultsModel> {
    return this.httpService.post(
      `${environment.apiUrl}LetterTemplate/add`,
      template
    );
  }

  update(
    id: number, // id => LetterTemplateId
    template: any
  ): Observable<QueryResultsModel> {
    return this.httpService.post(
      `${environment.apiUrl}LetterTemplate/edit?idValue=${id}`,
      template
    );
  }

  delete(id: number): Observable<QueryResultsModel> {
    return this.httpService.get(
      `${environment.apiUrl}LetterTemplate/delete?idValue=${id}`
    );
  }

  getById(id: number): Observable<QueryResultsModel> {
    return this.httpService.get(
      `${environment.apiUrl}LetterTemplate/fetchById?idValue=${id}`
    );
  }

  getSimpleList(
    searchParams: SearchParamsModel
  ): Observable<QueryResultsModel> {
    return this.httpService.post(
      `${environment.apiUrl}LetterTemplate/listSimple`,
      searchParams
    );
  }

  getAdvancedList(
    searchParams: SearchParamsModel
  ): Observable<QueryResultsModel> {
    return this.httpService.post(
      `${environment.apiUrl}LetterTemplate/listAdvanced`,
      searchParams
    );
  }

  generateLetterPDF(letter: any): Observable<QueryResultsModel> {
    return this.httpService.post(
      `${environment.apiUrl}LetterTemplate/generateLetterPdf`,
      letter
    );
  }
}
