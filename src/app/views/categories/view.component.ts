import { Component, OnInit} from '@angular/core';
import { NotificationMessages } from '../../helpers/notification.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  templateUrl: 'view.component.html'
})
export class ViewComponent implements OnInit {
  baseUrl = environment.baseUrl;
  imagesUrl = environment.imagesUrl;
  constructor(
    private notification: NotificationMessages,
    private ngxService: NgxUiLoaderService,
    private http: HttpClient

  ) {
    this.ngxService.start();
   }
  categories: Array<string>;
  ngOnInit() {
 ////// ==================== get list of all categories ==================== //////
    this.http.get(this.baseUrl + 'viewCategory').subscribe(
      (response: any) => {
        this.ngxService.stop();
        this.categories = response.body;
    },
    (error) => {
      this.ngxService.stop();
      this.notification.errorMessage( error);
    });
  }
}
