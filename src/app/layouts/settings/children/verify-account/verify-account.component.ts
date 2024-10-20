import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.scss'
})
export class VerifyAccountComponent {

  dataForm!: FormGroup;
  formMsg!: FormGroup;
  loading: boolean = false;
  load: boolean = false
  isActive!: boolean;

  constructor(
    private _auth: AuthService,
    private _api: ApiService,
    private _notify: NotificationService,
    private _conector: ConectorsService
  ) { }

  ngOnInit(): void {
    //Modifica el título de la vista principal
    this._conector.setUpdateTitle('Verificación de cuenta')

    this.createForm();
    this.createFormMsg();
    this.setDataUser();
  }

  async getDataUser(): Promise<any> {
    const data = await JSON.parse(this._auth.getDataFromLocalStorage());
    return data;
  }

  setDataUser() {
    this.getDataUser()
        .then( value => {
          this.isActive = value.status == 1;
          this.dataForm.patchValue({
            email: value.email
          });
          this.formMsg.patchValue({
            email: value.email,
            data: value.activation_code
          });
        })
  }

  createForm(): void {
    this.dataForm = new FormGroup({
        email: new FormControl(''),
        activationCode: new FormControl('', [
          Validators.required,
          Validators.minLength(10)
        ])
    }
    );
  }

  createFormMsg() {
    this.formMsg = new FormGroup({
      email: new FormControl(''),
      data: new FormControl(''),
      tipo: new FormControl('code')
  });
  }

  getCodeErrorMessage() {
    if(this.dataForm.controls['activationCode'].hasError('required')) {
      return 'Tenés que ingresar un código'}
    if(this.dataForm.controls['activationCode'].hasError('minlength')) {
      return 'El código debe tener 10 caracteres'}
    return ''
  }

  sendCode() {
    this.load = true;
    this._api.postTypeRequest('user/envio-email', this.formMsg.value).subscribe({
      next: (res: any) => {
        this.load = false;
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
        this.load = false;
        this._notify.showError('No se pudo enviar el correo con el código de verificación.');
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this._api.postTypeRequest('profile/verificate-user', this.dataForm.value).subscribe({
      next: (res: any) => {
        if(res.status == 1){
          //Accedió a la base de datos y verificó el usuario y el código de activación
          if(res.data.changedRows == 1){
            //Encontró el usuario
            this.loading =  false;
            this._notify.showSuccess('Cuenta verificada!');
            let data = JSON.parse(this._auth.getDataFromLocalStorage())
            data.status = 1;
            data.enterprise = res.name
            this._auth.setUserData(data)
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else{
            //No encontró el usuario
            this.loading =  false;
            this._notify.showError('El código es incorrecto.')
          }
        } else{
          //Problemas de conexión con la base de datos(res.status == 0)
          this.loading =  false;
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
