import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { GlobalSeoSetting, UpdateGlobalSeoSetting } from 'app/core/seo/global-seo-setting.model';
import { API_BASE_URL } from 'app/const';

@Injectable({ providedIn: 'root' })
export class GlobalSeoSettingService {
    private _baseUrl = API_BASE_URL + '/api/app/global-seo-setting';

    constructor(private _http: HttpClient) {}

    get(): Observable<GlobalSeoSetting> {
        return this._http.get<GlobalSeoSetting>(this._baseUrl).pipe(shareReplay(1));
    }

    update(input: UpdateGlobalSeoSetting): Observable<GlobalSeoSetting> {
        return this._http.put<GlobalSeoSetting>(this._baseUrl, input);
    }
}

