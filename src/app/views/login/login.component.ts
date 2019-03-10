import { Component , OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { NotificationMessages } from '../../helpers/notification.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html',

})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationMessages,
    private ngxService: NgxUiLoaderService,
    private formBuilder: FormBuilder
    ) {
      const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.router.navigate(['/dashboard']);
        }
    }

    ngOnInit() {
      this.loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }
 ////// ========================== super admin login function =========================== //////
   login() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.ngxService.start();
     this.authService.login(this.f.email.value, this.f.password.value).subscribe(
      (response: any) => {
        this.ngxService.stop();
      if (response.message === 'Invalid User') {
        this.notification.errorMessage('Invalid User');
       } else if (response.message === 'Invalid Password') {
        this.notification.errorMessage( 'Invalid Password');
      } else if (response.message === 'User Detail') {
       this.router.navigate(['/dashboard']);
       localStorage.setItem('authToken', response.body.token);
      }
    },
    (error) => {
      this.ngxService.stop();
      this.notification.errorMessage( error);
    });
  }
}
