import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material/material/material.module';

@Component({
  selector: 'app-dialog-event-edit',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  templateUrl: './dialog-event-edit.component.html',
  styleUrl: './dialog-event-edit.component.scss'
})
export class DialogEventEditComponent {

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      eventType: ['aniversario'],
      eventName: [''],
      eventDate: [''],
      eventDescription: [''],
      addGoal: [false],
      goalAmount: ['']
    })
  }

}
