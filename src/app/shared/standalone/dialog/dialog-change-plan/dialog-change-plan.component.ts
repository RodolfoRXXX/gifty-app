import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { MaterialModule } from 'src/app/material/material/material.module';
import { CommonModule } from '@angular/common';
import { Storage } from 'src/app/shared/interfaces/storage.interface';
import { GetJsonDataService } from 'src/app/services/get-json-data.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
    private apiService: ApiService,
    private _auth: AuthService,
    private _getJson: GetJsonDataService
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
    this.id_enterprise = data.id_enterprise;
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
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(35)
      ]),
      plan: new FormControl(this.data.idPlan, [
        Validators.required
      ])
    });
  }

  onSubmit() {
    console.log(this.dataForm.value)
  }

  closeDialog(): void {
    this.dialogRef.close(true);
  }

}

