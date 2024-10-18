import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recharge',
  templateUrl: './recharge.component.html'
})
export class RechargeComponent {

  email!: string;
  pic!: string;
  dataForm!: FormGroup;
  hide: boolean = true;
  loading: boolean = false;
  
  constructor(
    private _auth: AuthService,
    private _api: ApiService,
    private _router: Router,
    private _notify: NotificationService
  ) {
    this.createForm();
    this.setDataUser();
  }

  createForm(): void {
    this.dataForm = new FormGroup({
      email : new FormControl(''),
      profileId : new FormControl(''),
      remember_me : new FormControl(true)
    });
  }

  async getDataUser(): Promise<any> {
    const data = await JSON.parse(this._auth.getDataFromLocalStorage());
    return data;
  }

  setDataUser() {
    this.getDataUser()
        .then( value => {
          this.pic = environment.SERVER + value.thumbnail;
          this.email = value.email;
          this.dataForm.patchValue({
            email: value.email,
            profileId: value.profileId
          })
        })
  }

  onSubmit() {
    this.loading = true;
    this._api.postTypeRequest('user/recharge', this.dataForm.value).subscribe({
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
            //No se pudo loguear
            this._notify.showError('No ha sido posible acceder. Intentá nuevamente')
          }
        } else{
          //Problemas de conexión con la base de datos(res.status == 0)
          this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
        }
      },
      error: (error) => {
        //Error de conexión, no pudo consultar con la base de datos
        this.loading =  false;
        this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
      }
    }) 
  }

  logOffAll(): void {
    this._auth.setRememberOption(false);
    this._router.navigate(['../logoff']);
  }

}
