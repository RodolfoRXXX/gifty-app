import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Customer } from 'src/app/shared/interfaces/customer.interface';

@Component({
  selector: 'app-customer-edit-info',
  templateUrl: './customer-edit-info.component.html',
  styleUrls: ['./customer-edit-info.component.scss']
})
export class CustomerEditInfoComponent implements OnInit {

  @Input() customer!: Customer;
  @Output() changeDetected = new EventEmitter<boolean>();

  emailReg = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$"
  );
  dataForm!: FormGroup;
  id_enterprise!: number;
  loading: boolean = false;

  constructor(
    private _api: ApiService,
    private _notify: NotificationService,
    private _router: Router,
    private _conector: ConectorsService
  ) {
    this.createDataForm();
  }

  ngOnInit(): void {
    this.setInitial()
  }
  async getData(): Promise<any> {
    const data = await firstValueFrom(this._conector.getEmployee());
    return data;
  }
  async setInitial(): Promise<void> {
    try {
      const value = await this.getData();
      this.id_enterprise = value.id_enterprise;
      this.dataForm.patchValue({id_enterprise : value.id_enterprise})
    } catch (error) {
      console.error('Error executing functions', error);
    }
  }

  //Toma los cambios del Input de entrada y actualiza el formulario
  ngOnChanges(changes: SimpleChanges) {
    if (changes['customer']) {
      this.setDataForm(changes['customer'].currentValue)
    }
  }

  //Función que crea el formulario para editar los datos básicos del empleado
  createDataForm() {
    this.dataForm = new FormGroup({
      id: new FormControl(''),
      id_enterprise: new FormControl('', [
        Validators.required
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      cuit: new FormControl('', [
        Validators.minLength(11),
        Validators.maxLength(12)
      ]),
      email: new FormControl('', [
        (control: AbstractControl):ValidationErrors|null => {
          return (!this.emailReg.test(control.value)&&(control.value.length)) ? {error_format: {value: control.value}} : null;},
        Validators.maxLength(100)
      ]),
      phone: new FormControl('', [
        Validators.minLength(4),
        Validators.maxLength(25)
      ]),
      mobile: new FormControl('', [
        Validators.minLength(4),
        Validators.maxLength(25)
      ]),
      address: new FormControl('', [
        Validators.minLength(5),
        Validators.maxLength(100)
      ]),
      city: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50)
      ]),
      state: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50)
      ]),
      country: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50)
      ]),
      status: new FormControl(1),
    })
  }

  //Setea los valores del formulario si tuviera que cargarse un empleado
  setDataForm(customer: Customer) {
    if(customer) {
      this.dataForm.setValue({
        id: (customer.id > 0)?customer.id:0,
        id_enterprise: (customer.id_enterprise > 0)?customer.id_enterprise:0,
        name: (customer.name != '')?customer.name:'',
        cuit: (customer.cuit != '')?customer.cuit:'',
        email: (customer.email != '')?customer.email:'',
        phone: (customer.phone != '')?customer.phone:'',
        mobile: (customer.mobile != '')?customer.mobile:'',
        address: (customer.address != '')?customer.address:'',
        city: (customer.city != '')?customer.city:'',
        state: (customer.state != '')?customer.state:'',
        country: (customer.country != '')?customer.country:'',
        status: (customer.status)?customer.status:0
      })
    }
  }

  //Mensajes de error
  getErrorName() {
    //name
    if(this.dataForm.controls['name'].hasError('required')) return 'Tenés que ingresar un valor';
    if(this.dataForm.controls['name'].hasError('minlength')) return 'Este valor debe tener más de 2 caracteres';
    if(this.dataForm.controls['name'].hasError('maxlength')) return 'Este valor debe tener menos de 50 caracteres';
    return ''
  }
  getErrorEmail() {
    //email
    if(this.dataForm.controls['email'].hasError('error_format')) return 'No es un correo válido';
    if(this.dataForm.controls['email'].hasError('maxlength')) return 'Este valor debe tener menos de 100 caracteres';
    return ''
  }
  getErrorPhone() {
    //phone
    if(this.dataForm.controls['phone'].hasError('minlength')) return 'Este valor debe tener más de 4 caracteres';
    if(this.dataForm.controls['phone'].hasError('maxlength')) return 'Este valor debe tener menos de 25 caracteres';
    return ''
  }
  getErrorMobile() {
    //mobile
    if(this.dataForm.controls['mobile'].hasError('required')) return 'Tenés que ingresar un valor';
    if(this.dataForm.controls['mobile'].hasError('minlength')) return 'Este valor debe tener más de 4 caracteres';
    if(this.dataForm.controls['mobile'].hasError('maxlength')) return 'Este valor debe tener menos de 25 caracteres';
    return ''
  }
  getErrorAddress() {
    //address
    if(this.dataForm.controls['address'].hasError('minlength')) return 'Este valor debe tener más de 5 caracteres';
    if(this.dataForm.controls['address'].hasError('maxlength')) return 'Este valor debe tener menos de 100 caracteres';
    return ''
  }
  getErrorCity() {
    //city
    if(this.dataForm.controls['city'].hasError('required')) return 'Tenés que ingresar un valor';
    if(this.dataForm.controls['city'].hasError('minlength')) return 'Mínimo de 4 caracteres';
    if(this.dataForm.controls['city'].hasError('maxlength')) return 'Máximo de 50 caracteres';
    return ''
  }
  getErrorState() {
    //state
    if(this.dataForm.controls['state'].hasError('required')) return 'Tenés que ingresar un valor';
    if(this.dataForm.controls['state'].hasError('minlength')) return 'Mínimo de 4 caracteres';
    if(this.dataForm.controls['state'].hasError('maxlength')) return 'Máximo de 50 caracteres';
    return ''
  }
  getErrorCountry() {
    //country
    if(this.dataForm.controls['country'].hasError('required')) return 'Tenés que ingresar un valor';
    if(this.dataForm.controls['country'].hasError('minlength')) return 'Mínimo de 4 caracteres';
    if(this.dataForm.controls['country'].hasError('maxlength')) return 'Máximo de 50 caracteres';
    return ''
  }

  //Elimina todo lo que el reset básico no limpia
  resetAll() {
    if(this.customer) {
      this.setDataForm(this.customer)
    } else {
      this.dataForm.reset()
      this.dataForm.patchValue({id_enterprise: this.id_enterprise})
    }
    this.dataForm.markAsPristine();
  }

  //Navegar a la misma ruta para recargar el componente
  rechargeComponent(id_customer: number = 0) {
    if(id_customer > 0) {
      this._router.navigate(['init/main/customer/customer-edit'], { queryParams: { id_customer: id_customer } });
      this.dataForm.markAsPristine();
    }
  }

  //Submit del formulario
  onSubmit() {
    this.loading = true;
      if(this.dataForm.controls['id'].value > 0) {
        //Modifica el cliente
        this._api.postTypeRequest('profile/edit-customer-information', this.dataForm.value).subscribe({
          next: (res: any) => {
            this.loading =  false;
            if(res.status == 1){
              //Accedió a la base de datos y no hubo problemas
              if(res.data.affectedRows == 1){
                //Modificó datos cliente
                this._notify.showSuccess('Cliente actualizado con éxito!');
                this.changeDetected.emit(true);
                this.resetAll();
              } else{
                //No hubo modificación
                this._notify.showError('No se detectaron cambios. Ingresá valores diferentes a los actuales.')
              }
            } else{
              //Problemas de conexión con la base de datos(res.status == 0)
              this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
            }
          },
          error: (error: any) => {
            //Error de conexión, no pudo consultar con la base de datos
            this.loading =  false;
            this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
          }
        })
      } else {
        //Crea un cliente nuevo
        this._api.postTypeRequest('profile/create-customer', this.dataForm.value).subscribe({
          next: (res: any) => {
            this.loading =  false;
            if(res.status == 1){
              //Accedió a la base de datos y no hubo problemas
              if(res.data != 'existente') {
                if(res.data.affectedRows == 1){
                  //Modificó datos empresa
                  this._notify.showSuccess('Nuevo cliente creado con éxito!');
                  this.rechargeComponent(res.data.insertId);
                } else{
                  //No hubo modificación
                  this._notify.showError('No se detectaron cambios. Ingresá valores diferentes a los actuales.')
                }
              } else {
                //cliente existente
                this._notify.showWarn('Este cliente ya existe.')
              }
            } else{
              //Problemas de conexión con la base de datos(res.status == 0)
              this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
            }
          },
          error: (error: any) => {
            //Error de conexión, no pudo consultar con la base de datos
            this.loading =  false;
            this._notify.showWarn('No ha sido posible conectarse a la base de datos. Intentá nuevamente por favor.');
          }
        })
      }
  }

}
