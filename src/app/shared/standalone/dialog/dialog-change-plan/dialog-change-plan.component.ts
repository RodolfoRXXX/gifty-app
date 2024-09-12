import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { MaterialModule } from 'src/app/material/material/material.module';
import { CommonModule } from '@angular/common';
import { Storage } from 'src/app/shared/interfaces/storage.interface';
import { GetJsonDataService } from 'src/app/services/get-json-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-dialog-change-plan',
  templateUrl: './dialog-change-plan.component.html',
  styleUrls: ['./dialog-change-plan.component.scss'],
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class DialogChangePlanComponent implements OnInit {

  storage!: Storage;
  load = true;
  loading: boolean = false;
  id_enterprise!: number;
  selectedPlan!: any;
  dataForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DialogChangePlanComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _api: ApiService,
    private _auth: AuthService,
    private _getJson: GetJsonDataService,
    private _notify: NotificationService
  ) {
    this._getJson.getData('plan_detail.json').subscribe((data: any[]) => {
      if(data) {
        this.selectedPlan = data.find( (item: any) => item.id == this.data.idPlan)
      }
    });
    this.createDataForm();
  }

  ngOnInit(): void {
    this.getDataLocal();
  }

  getDataLocal(): void {
    const data = JSON.parse(this._auth.getDataFromLocalStorage());
    console.log(data)
    this.id_enterprise = data.id_enterprise;
    this.dataForm.patchValue({
      id_user: data.id,
      plan: this.data.idPlan
    })
    console.log(data)
  }

  getNameError() {
    //name
    if(this.dataForm.controls['name'].hasError('required')) return 'Tenés que ingresar un nombre';
    if(this.dataForm.controls['name'].hasError('minlength')) return 'El nombre debe tener más de 2 caracteres';
    if(this.dataForm.controls['name'].hasError('maxlength')) return 'El nombre debe tener menos de 35 caracteres'
    return ''
  }

  createDataForm() {
    this.dataForm = new FormGroup({
      id_user: new FormControl(0, [
        Validators.required
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(35)
      ]),
      plan: new FormControl(0, [
        Validators.required
      ])
    });
  }

  onSubmit() {
    this.loading =  true;
      this._api.postTypeRequest('profile/create-new-enterprise', this.dataForm.value).subscribe({
        next: (res: any) => {
          console.log(res)
          this.loading =  false;
          if(res.status == 1){
            //Accedió a la base de datos y no hubo problemas
            if(res.data != 'existente'){
              //Modificó la imagen
              this._notify.showSuccess(`¡Felicitaciones! Creaste a ${this.dataForm.get('name')?.value}!`);
              //Modificar el localstorage
              let data = JSON.parse(this._auth.getDataFromLocalStorage())
              data.enterprise = this.dataForm.get('name')?.value
              data.id_enterprise = res.data.id_enterprise
              this._auth.setUserData(data)
              setTimeout(() => {
                this.closeDialog();
                window.location.reload();
              }, 2000);
            } else{
              //No hubo modificación
              this._notify.showError('La empresa que intentas crear ya existe.')
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

  redirect() {
    setTimeout(() => {
      this.closeDialog();
      window.location.reload();
    }, 2000);
  }

  closeDialog(): void {
    this.dialogRef.close(true);
  }

}

