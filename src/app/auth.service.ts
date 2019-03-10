import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.baseUrl;
  constructor(
    private http: HttpClient
    ) { }
 ////// ================================ Admin Login service ======================================== //////
     login(email: string, password: string) {
      return this.http.post(this.baseUrl + 'login', {email: email, password: password});
      }

      ////// ================================ Admin Logout service ======================================== //////
     logout() {
      localStorage.removeItem('authToken');
      }

      public get currentUserValue() {
        return localStorage.getItem('authToken');
    }
}
