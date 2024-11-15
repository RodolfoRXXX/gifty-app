import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { TransferService } from 'src/app/services/transfer.service';
import { DialogProfileEditComponent } from '../dialog-profile-edit/dialog-profile-edit.component';

@Component({
  selector: 'app-dialog-transfer-setup',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dialog-transfer-setup.component.html',
  styleUrl: './dialog-transfer-setup.component.scss'
})
export class DialogTransferSetupComponent {

  dataForm!: FormGroup;
  loading: boolean = false;
  amount: number = 0;
  payerEmail: string = '';
  receiverEmail: string = '';

  constructor(
    private transferService: TransferService,
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
      //this.getEvent(this.data.eventId);
    }
    this.dataForm.patchValue({
      eventId: this.data.eventId
    })
  }

  createForm() {
    this.dataForm = this.fb.group({
      eventId: [''],
      payerEmail: [''],
      receiverEmail: [''],
      qty: ['']
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
      goal: event.goal,
      finalized: event.finalized
    })
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

  // Errores
  getErrorName() {
    if (this.dataForm.controls['name'].hasError('required')) return 'Tenés que ingresar un valor';
    if (this.dataForm.controls['name'].hasError('minlength')) return 'Mínimo de 3 caracteres';
    if (this.dataForm.controls['name'].hasError('maxlength')) return 'Máximo de 30 caracteres';
    return '';
  }

  initiateTransfer() {
    console.log(this.dataForm.controls['payerEmail'].value)
    
    this.transferService.createTransfer(this.dataForm.controls['qty'].value, this.dataForm.controls['payerEmail'].value, this.dataForm.controls['receiverEmail'].value).subscribe(
      (response) => {
        // Redirigir al usuario al link de MercadoPago para completar el pago
        window.location.href = response.init_point;
      },
      (error) => {
        console.error('Error al iniciar la transferencia:', error);
      }
    );
  }

  closeDialog(state: boolean) {
    this.dialogRef.close(state);
  }

}
