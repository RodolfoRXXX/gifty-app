import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  
  emailReg = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$"
  );
  hide = true;
  dataForm!: FormGroup;
  loading: boolean = false;

  constructor(
    private _router: Router,
    private _api: ApiService,
    private _auth: AuthService,
    private _notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.dataForm = new FormGroup({
        email : new FormControl('', [
          Validators.required,
          (control: AbstractControl):ValidationErrors|null => {
          return !this.emailReg.test(control.value) ? {error_format: {value: control.value}} : null;}
        ]),
        password : new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10)
        ]),
        remember_me : new FormControl(false)
    });
  }

  hidePassword(ev: any): void {
    ev.preventDefault();
    this.hide = !this.hide;
  }
  getEmailErrorMessage() {
    if(this.dataForm.controls['email'].hasError('required')) {
      return 'Tenés que ingresar un valor'}
    if(this.dataForm.controls['email'].hasError('error_format')) {
      return 'No es un correo válido'}
    return ''
  }
  getPasswordErrorMessage() {
    if(this.dataForm.controls['password'].hasError('required')) {
      return 'Tenés que ingresar un valor'}
    if(this.dataForm.controls['password'].hasError('minlength')) {
      return 'Min. 4 caracteres'}
    if(this.dataForm.controls['password'].hasError('maxlength')) {
      return 'Max. 10 caracteres'}
    return ''
  }

  onSubmit(): void {
    this.loading = true;
    this._api.postTypeRequest('user/login', this.dataForm.value).subscribe({
      next: (res: any) => {
        this.loading =  false;
        if(res.status == 1){
          //Accedió a la base de datos y encontró o no el usuario
          if(res.data.length){
            //Encontró el usuario
            this._notify.showSuccess('Acceso autorizado!');
            this._auth.setDataInLocalStorage(res.data[0], res.token, res.data[0].status, this.dataForm.value.remember_me);
            setTimeout(() => {
              this._router.navigate(['profile', res.data[0].profileId]);
            }, 2000);
          } else{
            //No encontró el usuario
            this._notify.showError('Usuario o contraseña incorrecta')
          }
        } else{
          //Problemas de conexión con la base de datos(res.status == 0)
          this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intente nuevamente por favor.');
        }
      },
      error: (error) => {
        //Error de conexión, no pudo consultar con la base de datos
        this.loading =  false;
        this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intente nuevamente por favor.');
      }
    }) 
  }

}
