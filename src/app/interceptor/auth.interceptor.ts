import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError} from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { NotificationMessages } from '../helpers/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router,
        private notification: NotificationMessages
        ) { }
 ////// ================== if auth token is expired redirect to login page ================= //////
    private handleAuthError(err: HttpErrorResponse): Observable<HttpEvent<any>> {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
          this.notification.errorMessage( 'Session Expired!!! Please Login to Continue');
        }
        return throwError(err);
    }

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        const token = localStorage.getItem('authToken');

        if (token) {
            const cloned = req.clone({
                headers: req.headers.set('Authorization',
                    'Bearer ' + token)
            });
            return next.handle(cloned)
            .pipe(
                map((res) => {}),
                catchError(this.handleAuthError.bind(this))
              );
        } else {
            return next.handle(req);
        }
    }
}
