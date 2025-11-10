// src/app/core/services/sell-wizard.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { API_BASE_URL } from 'app/const';

export interface IdNameDto {
  id: number | string;
  name: string;
  hex?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellWizardService {
  private http = inject(HttpClient);
  private base = API_BASE_URL;


  getYears(): Observable<number[]> {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let i = 0; i <= 30; i++) {
      years.push(current - i);
    }
    return of(years);
  }

  getBrands(): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-markalar`, {
        params: new HttpParams().set('MaxResultCount', 1000)
      })
      .pipe(
        map(res => (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ad })))
      );
  }

  getModels(brandId: number): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-modeller`, {
        params: new HttpParams()
          .set('MarkaId', brandId)
          .set('MaxResultCount', 1000)
      })
      .pipe(
        map(res => (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ad })))
      );
  }

  getBodyTypes(): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-govde-tipleri`)
      .pipe(map((res: any) => (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ad }))));
  }

  getTransmissions(): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-sanziman-tipleri`)
      .pipe(map((res: any) => (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ad }))));
  }

  getFuels(): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-yakit-turleri`)
      .pipe(map((res: any) => (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ad }))));
  }

  getColors(): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-renkler`, {
        params: new HttpParams().set('MaxResultCount', 1000)
      })
      .pipe(
        map((res: any) =>
          (res.items ?? res).map((x: any) => ({
            id: x.id,
            name: x.ad,
            hex: x.hex ?? '#ddd'
          }))
        )
      );
  }

  getCities(): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-iller`, {
        params: new HttpParams().set('MaxResultCount', 1000)
      })
      .pipe(
        map((res: any) =>
          (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ilAdi }))
        )
      );
  }

  getExtras(): Observable<string[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-ozellikler`, {
        params: new HttpParams().set('MaxResultCount', 1000)
      })
      .pipe(map((res: any) => (res.items ?? res).map((x: any) => x.ad)));
  }

  // varyant/donanım
  getTrims(modelId: number): Observable<IdNameDto[]> {
    return this.http
      .get<any>(`${this.base}/api/app/app-model-varyantlar`, {
        params: new HttpParams().set('ModelId', modelId).set('MaxResultCount', 1000)
      })
      .pipe(
        map((res: any) => (res.items ?? res).map((x: any) => ({ id: x.id, name: x.ad })))
      );
  }

  getEnumLookups() {
     return this.http.get<any>(`${this.base}/api/app/sell-wizard-lookup`);
  }

}
