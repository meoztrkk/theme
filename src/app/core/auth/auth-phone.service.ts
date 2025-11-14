import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from 'app/const';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthPhoneService {
  constructor(private http: HttpClient) {}

  // login olmuş mu?
  me(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/api/account/my-profile`);
  }

  // TELEFONLA KAYIT
  registerByPhone(input: {
    phoneNumber: string;
    password: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
  }): Observable<any> {
    return this.http.post(`${API_BASE_URL}/api/app/app-account/register-by-phone`, input);
  }

  // TELEFONLA GİRİŞ
  loginByPhone(input: {
    phoneNumber: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${API_BASE_URL}/api/app/app-account/login-by-phone`, input);
  }

  // SMS GÖNDER
  sendSms(phone: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/api/app/app-account/send-phone-code`, {
      phoneNumber: phone,
    });
  }

  // SMS DOĞRULA
  verifySms(phone: string, code: string): Observable<any> {
    return this.http.post(`${API_BASE_URL}/api/app/app-account/verify-phone-code`, {
      phoneNumber: phone,
      code,
    });
  }
}
