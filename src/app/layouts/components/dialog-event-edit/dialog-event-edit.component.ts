import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material/material/material.module';
import { DialogProfileEditComponent } from '../dialog-profile-edit/dialog-profile-edit.component';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-dialog-event-edit',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dialog-event-edit.component.html',
  styleUrls: ['./dialog-event-edit.component.scss']
})
export class DialogEventEditComponent implements OnInit {

  dataForm!: FormGroup;
  addGoal: boolean = false;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogProfileEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _api: ApiService,
    private _notify: NotificationService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    if(this.data.eventId != '') {
      //Llama a una función que trae los datos del evento seleccionado
      this.getEvent(this.data.eventId);
    }
    this.dataForm.patchValue({
      profileId: this.data.profileId
    })
  }

  createForm() {
    this.dataForm = this.fb.group({
      eventId: [''],
      profileId: [''],
      type: ['aniversario', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      date: ['', Validators.required],
      description: ['', Validators.required],
      addGoal: [false],
      goal: [0]
    });
  }

  getEvent(eventId: string) {
    // Llamar a la API para obtener los datos del evento
    this._api.postTypeRequest('profile/get-event', { eventId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.setDataForm(response.data[0]);
        } else {
          //no encontró el evento
        }
      },
      error: (err) => {
        //no encontró el evento
      }
    });
  }

  setDataForm(event: any) {
    console.log(event)
    this.dataForm.patchValue({
      eventId: event.eventId,
      type: event.type,
      name: event.name,
      date: event.date,
      description: event.description,
      addGoal: (event.goal>=0)?true:false,
      goal: event.goal
    })
  }

  // Errores
  getErrorName() {
    if (this.dataForm.controls['name'].hasError('required')) return 'Tenés que ingresar un valor';
    if (this.dataForm.controls['name'].hasError('minlength')) return 'Mínimo de 3 caracteres';
    if (this.dataForm.controls['name'].hasError('maxlength')) return 'Máximo de 30 caracteres';
    return '';
  }
  getErrorDate() {
    if (this.dataForm.controls['date'].hasError('required')) return 'Tenés que agregar una fecha';
    return '';
  }

  onSubmit() {
    console.log(this.dataForm.value);
    this._api.postTypeRequest('profile/edit-event', this.dataForm.value).subscribe({
      next: (res: any) => {
        this.loading =  false;
        if(res.status == 1){
          //Accedió a la base de datos y no hubo problemas
          if(res.data.affectedRows == 1){
            console.log(res.data)
            //Consulta con éxito
            this._notify.showSuccess('Evento actualizado!');
            setTimeout(() => {
              this.closeDialog(true);
            }, 2000);
          } else{
            //No hubo modificación
            this._notify.showError('No se detectaron cambios. Ingresá valores diferentes.');
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

  closeDialog(state: boolean) {
    this.dialogRef.close(state);
  }

}

