import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationMessages } from '../../helpers/notification.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  templateUrl: 'add.component.html'
})
export class AddComponent implements OnInit {
  baseUrl = environment.baseUrl;
  constructor(
    private notification: NotificationMessages,
    private ngxService: NgxUiLoaderService,
    private formBuilder: FormBuilder,
    private http: HttpClient

  ) { }
  imagePath;
  fileData: File = null;
  categoryForm: FormGroup;
  submitted = false;
  imgURL: any;
  message: string;
  isCollapsed = false;
  iconCollapse = 'icon-arrow-up';
  @ViewChild('form') form;
  ngOnInit() {
    this.categoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      image: [this.fileData, Validators.required]
  });
  }

  collapsed(event: any): void {
    // console.log(event);
  }

  expanded(event: any): void {
    // console.log(event);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.iconCollapse = this.isCollapsed ? 'icon-arrow-down' : 'icon-arrow-up';
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.';
      return;
    }
    this.f['image'].setValue(files[0].name ? files[0].name : '');
    const reader = new FileReader();
    this.imagePath = files;
    this.fileData = <File>files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    };
  }

   // convenience getter for easy access to form fields
   get f() { return this.categoryForm.controls; }
   ////// ========================== super admin login function =========================== //////
     addCategory() {
      this.submitted = true;
      if (this.categoryForm.invalid) {
        return;
      }
      this.ngxService.start();
      const formData = new FormData();
      formData.append('name', this.f.name.value);
      formData.append('image', this.fileData);
       this.http.post(this.baseUrl + 'addCategory', formData).subscribe(
        (response: any) => {
          this.ngxService.stop();
          if (response.message === 'Exists' || response.message === 'Error') {
            this.notification.errorMessage(response.body);
           }  else if (response.message === 'Added') {
            this.notification.successMessage(response.body);
            this.form.nativeElement.reset();
            this.imgURL = '';
// tslint:disable-next-line: forin
            for (const i in this.categoryForm.controls) {
              this.categoryForm.controls[i].setErrors(null);
            }
          }
      },
      (error) => {
        this.ngxService.stop();
        this.notification.errorMessage( error);
      });
    }

}
