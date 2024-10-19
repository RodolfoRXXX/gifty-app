import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

  setPasswordDataForm!: FormGroup;
  passwordFirst!: FormControl;
  setEmailDataForm!: FormGroup;
  emailFirst!: FormControl;
  formMsg!: FormGroup;
  id_user!: number;

  hide_1: boolean = true;
  hide_2: boolean = true;
  emailReg = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$"
  );

  loading_set_password: boolean = false;
  loading_set_email: boolean = false;

  constructor(
    private _auth: AuthService,
    private _api: ApiService,
    private _notify: NotificationService,
    private _conector: ConectorsService,
    private _router: Router
  ) {
    this.passwordFirst = new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(10)
    ]);
    this.emailFirst = new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(35),
      (control: AbstractControl):ValidationErrors|null => {
      return !this.emailReg.test(control.value) ? {error_format: {value: control.value}} : null;}
    ]);
    this.createSetPasswordForm();
    this.createSetEmailForm();
    this.createFormMsg();
    this.getDataUser();
  }

  ngOnInit(): void {
    //Modifica el título de la vista principal
    this._conector.setUpdateTitle('Seguridad')

    this.passwordFirst.valueChanges.subscribe( value => {
      if( ((this.setPasswordDataForm.value.password?.length > 3) && (this.setPasswordDataForm.value.password?.length < 11) ) && (value !== this.setPasswordDataForm.value.password)) {
        this.setPasswordDataForm.controls['password'].setErrors({ no_equal: true });
      }
    })
    this.setPasswordDataForm.controls['password'].valueChanges.subscribe( value => {
      if(value !== this.passwordFirst.value) {
        this.setPasswordDataForm.controls['password'].setErrors({ no_equal: true });
      }
    })
    this.emailFirst.valueChanges.subscribe( value => {
      if(value !== this.setEmailDataForm.value.email) {
        this.setEmailDataForm.controls['email'].setErrors({ no_equal: true });
      }
    })
    this.setEmailDataForm.controls['email'].valueChanges.subscribe( value => {
      if(value !== this.emailFirst.value) {
        this.setEmailDataForm.controls['email'].setErrors({ no_equal: true });
      }
    })
  }

  getDataUser() {
    const data = JSON.parse(this._auth.getDataFromLocalStorage());
      this.formMsg.patchValue({
        email: data.email
      })
      //Setea los valores de la card de cambio de contraseña
      this.setPasswordDataForm.patchValue({
        id: data.id
      })
      this.setEmailDataForm.patchValue({
        id: data.id
      })
      this.formMsg.patchValue({
        email: data.email
      })
      this.id_user = data.id;
  }

  hide1Password(ev: any): void {
    ev.preventDefault();
    this.hide_1 = !this.hide_1;
  }
  hide2Password(ev: any): void {
    ev.preventDefault();
    this.hide_2 = !this.hide_2;
  }

  createSetPasswordForm(): void {
    this.setPasswordDataForm = new FormGroup({
        id: new FormControl('', [
          Validators.required
        ]),
        password : new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10)
        ]),
    });
  }

  createSetEmailForm(): void {
    this.setEmailDataForm = new FormGroup({
        id: new FormControl('', [
          Validators.required
        ]),
        email : new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(35),
          (control: AbstractControl):ValidationErrors|null => {
          return !this.emailReg.test(control.value) ? {error_format: {value: control.value}} : null;}
        ]),
        status: new FormControl(0)
    });
  }

  createFormMsg() {
    this.formMsg = new FormGroup({
      email: new FormControl(''),
      data: new FormControl(''),
      tipo: new FormControl('')
    });
  }

  //Botones de reset
  resetPassword() {
    this.setPasswordDataForm.patchValue({id: this.id_user})
  }
  resetEmail() {
    this.setEmailDataForm.patchValue({id: this.id_user})
    this.emailFirst.reset
  }

  //Mensajes de error
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
      if(this.setPasswordDataForm.controls['password'].hasError('no_equal')) {
        return 'Las contraseñas no coinciden'}
      return ''
    }
    getEmailFirstErrorMessage() {
      if(this.emailFirst.hasError('required')) {
        return 'Tenés que ingresar un valor'}
      if(this.emailFirst.hasError('minlength')) {
        return 'Min. 4 caracteres'}
      if(this.emailFirst.hasError('maxlength')) {
        return 'Max. 35 caracteres'}
      if(this.emailFirst.hasError('error_format')) {
        return 'No es un correo válido'}
      return ''
    }
    getEmailErrorMessage() {
      if(this.setEmailDataForm.controls['email'].hasError('required')) {
        return 'Tenés que ingresar un valor'}
      if(this.setEmailDataForm.controls['email'].hasError('no_equal')) {
        return 'Los correos electrónicos no coinciden'}
      if(this.setEmailDataForm.controls['email'].hasError('error_format')) {
        return 'No es un correo válido'}
      return ''
    }

  onSubmitSetPassword() {
    this.loading_set_password =  true;
    this.formMsg.patchValue({
      tipo: 'change_pass'
    })
    this._api.postTypeRequest('profile/update-password', this.setPasswordDataForm.value).subscribe({
      next: (res: any) => {
        if(res.status == 1){
          //Accedió a la base de datos y no hubo problemas
          if(res.data.changedRows == 1){
            //Modificó la contraseña
            this.loading_set_password =  false;
            this._notify.showSuccess('Contraseña actualizada!');
            this._auth.setRememberOption(false);
            setTimeout(() => {
              this._router.navigate(['../logoff']);
            }, 2000);
            this._api.postTypeRequest('user/envio-email', this.formMsg.value).subscribe();
          } else{
            //No hubo modificación
            this.loading_set_password =  false;
            this._notify.showError('No se detectaron cambios. Ingresá una contraseña diferente al actual.')
          }
        } else{
          //Problemas de conexión con la base de datos(res.status == 0)
          this.loading_set_password =  false;
          this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
        }
      },
      error: (error) => {
        //Error de conexión, no pudo consultar con la base de datos
        this.loading_set_password =  false;
        this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
      }
    })
  }

  onSubmitSetEmail() {
    this.loading_set_email =  true;
    this._api.postTypeRequest('profile/update-email', this.setEmailDataForm.value).subscribe({
      next: (res: any) => {
        this.loading_set_email =  false;
        if(res.status == 1){
          //Accedió a la base de datos y no hubo problemas
          if(res.data.changedRows == 1){
            //Modificó el correo electrónico
            this._notify.showSuccess('Correo electrónico actualizado!');
            this._auth.setRememberOption(false);
            setTimeout(() => {
              this._router.navigate(['../logoff']);
            }, 2000);
          } else{
            //No hubo modificación
            this._notify.showError('No se detectaron cambios. Ingresá un correo diferente al actual.')
          }
        } else{
          //Problemas de conexión con la base de datos(res.status == 0)
          this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
        }
      },
      error: (error) => {
        //Error de conexión, no pudo consultar con la base de datos
        this.loading_set_email =  false;
        this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
      }
    })
  }

}
