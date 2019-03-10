import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class NotificationMessages {
    constructor(
        private toastr: ToastrService,
        ) {}

     errorMessage(message: string) {
        this.toastr.error('', message, {
            positionClass: 'toast-bottom-center',
            progressBar: true
          });
     }
}
