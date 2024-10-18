import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { generateUniqueId } from 'src/app/shared/functions/operation.function';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {

  emailReg = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$"
  );
  hide_1: boolean = true;
  hide_2: boolean = true;
  dataForm!: FormGroup;
  formMsg!: FormGroup;
  passwordFirst!: FormControl;
  loading: boolean = false;

  constructor(
    private _auth: AuthService,
    private _api: ApiService,
    private _router: Router,
    private _notify: NotificationService
  ) {
    this.passwordFirst = new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(10)
    ]);
   }

  ngOnInit(): void {
    this.createForm();
    this.createFormMsg();
    this.passwordFirst.valueChanges.subscribe( value => {
      if( ((this.dataForm.value.password.length > 3) && (this.dataForm.value.password.length < 11) ) && (value !== this.dataForm.value.password)) {
        this.dataForm.controls['password'].setErrors({ no_equal: true });
      }
    })
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
          (control: AbstractControl):ValidationErrors|null => {
          return (control.value !== this.passwordFirst.value) ? {no_equal: {value: control.value}} : null;}
        ]),
        thumbnail: new FormControl('no-image-user.png'),
        activationCode: new FormControl('')
    }
    );
  }

  createFormMsg() {
    this.formMsg = new FormGroup({
      email: new FormControl(''),
      data: new FormControl(''),
      tipo: new FormControl('register')
    });
  }

  hidePassword_1(ev: any): void {
    ev.preventDefault();
    this.hide_1 = !this.hide_1;
  }

  hidePassword_2(ev: any): void {
    ev.preventDefault();
    this.hide_2 = !this.hide_2;
  }

  //Error message section

  getEmailErrorMessage() {
    if(this.dataForm.controls['email'].hasError('required')) {
      return 'Tenés que ingresar un valor'}
    if(this.dataForm.controls['email'].hasError('error_format')) {
      return 'No es un correo válido'}
    return ''
  }
  getPasswordErrorMessageFirst() {
    if(this.passwordFirst.hasError('required')) {
      return 'Tenés que ingresar un valor'}
    if(this.passwordFirst.hasError('minlength')) {
      return 'Min. 4 caracteres'}
    if(this.passwordFirst.hasError('maxlength')) {
      return 'Max. 10 caracteres'}
    return ''
  }
  getPasswordErrorMessage() {
    if(this.dataForm.controls['password'].hasError('required')) {
      return 'Tenés que ingresar un valor'}
    if(this.dataForm.controls['password'].hasError('no_equal')) {
      return 'Las contraseñas no coinciden'}
    return ''
  }

  onSubmit() {
    this.loading =  true;
    const hash_code = generateUniqueId(10);
    this.formMsg.patchValue({
      email: this.dataForm.get('email')?.value,
      data: hash_code
    });
    this.dataForm.controls['activationCode'].patchValue(hash_code);
    this._api.postTypeRequest('user/register', this.dataForm.value).subscribe({
      next: (res: any) => {
        this.loading =  false;
        if(res.status == 1){
          if(res.data == 'existente') {
            this._notify.showError('El correo ya pertenece a un usuario registrado.');
          } else {
            //Creó el usuario
            this._notify.showSuccess('Usuario nuevo creado!');
            this._auth.setDataInLocalStorage(res.data[0], res.token, res.data[0].status, false);
            setTimeout(() => {
              this._router.navigate(['profile', res.data[0].profileId]);
            }, 2000);
            this._api.postTypeRequest('user/envio-email', this.formMsg.value).subscribe({
              next: (res: any) => {
                if(res.status == 1){
                  if(res.data == 'ok') {
                    //envío de email exitoso!
                    this._notify.showSuccess('Se envió un correo a tu cuenta con el código de verificación.');
                  } else {
                    //no se envío el email
                    this._notify.showError('No se pudo enviar el correo con el código de verificación.');
                  }
                } else{
                  //no se envío el email
                  this._notify.showError('No se pudo enviar el correo con el código de verificación.');
                }
              },
              error: (error) => {
                //Error de conexión, no pudo consultar con la base de datos
                this._notify.showError('No se pudo enviar el correo con el código de verificación.');
              }
            });
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

