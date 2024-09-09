import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Customer } from 'src/app/shared/interfaces/customer.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html'
})
export class CustomerEditComponent implements OnInit {
  
  id_customer!: number;
  dataForm!: FormGroup;
  customer!: Customer;
  permissions: string[] = [];
  sens_info_admin = environment.EDIT_PROVIDER_CONTROL;
  activeState: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _conector: ConectorsService,
    private _api: ApiService,
    private _router: Router,
    private _notify: NotificationService
  ) {
    this.createDataForm();
  }

  ngOnInit(): void {
    //Modifica el título de la vista principal
    this._conector.setUpdateTitle('Edición de cliente')
    this.route.queryParams.subscribe(params => {
      this.id_customer = params['id_customer'];
      if(this.id_customer) this.getCustomer(this.id_customer)
        this.dataForm.patchValue({id: this.id_customer})
    });
    this._conector.getEmployee().subscribe( value => {
      //la lista de permisos se almacena como un string y luego se lo separa en un array
      //aunque el string de la DB esté vacío, el split devuelve un array con al menos un valor,
      //que es el valor vacío, por eso la desigualdad es mayor a 1
      this.permissions = value.list_of_permissions.split(',')
    })
  }

  getCustomer(id_customer: number): void {
    this._api.postTypeRequest('profile/get-customer-id', { id_customer: id_customer }).subscribe( (value:any) => {
      if(value.data) {
        //Se encontró el cliente y lo paso al componente hijo
        this.customer = value.data[0];
        this.activeState = (this.customer.status === 1)?true:false;
      } else {
        this._router.navigate(['init/settings/index']);
      }
    })
  }

  createDataForm(): void {
    this.dataForm = this.fb.group({
      id: ['', Validators.required],
      status: ['', Validators.required]
    });
  }

  // Maneja el cambio detectado por los hijos
  handleChange(event: boolean) {
    if(event) {
      this.getCustomer(this.id_customer)
    }
  }

  //Cambia el estado del cliente(activo/inactivo)
  changeState(status: number) {
    this.dataForm.patchValue({status: status})
    if(this.dataForm.controls['id'].value > 0) {
      this.loading = true;
      this._api.postTypeRequest('profile/edit-customer-activation', this.dataForm.value).subscribe({
        next: (res: any) => {
          this.loading =  false;
          if(res.status == 1){
            //Accedió a la base de datos y no hubo problemas
            if(res.data.affectedRows == 1){
              //Modificó la imagen
              this._notify.showSuccess(`El cliente está ${(status == 1)?'activo':'inactivo'}!`);
              this.getCustomer(this.id_customer);
            } else{
              //No hubo modificación
              this._notify.showError('No se detectaron cambios. Volvé a realizar la operación.')
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
  }

}
