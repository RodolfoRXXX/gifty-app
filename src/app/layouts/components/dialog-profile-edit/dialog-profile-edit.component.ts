import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  templateUrl: './dialog-profile-edit.component.html',
  styleUrl: './dialog-profile-edit.component.scss'
})
export class DialogProfileEditComponent {

  formGroup: FormGroup;
  showSocialForm = false;
  photo: any = null;
  availableSocialNetworks = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn'];
  addedSocials: { network: string, value: string }[] = [];

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: [''],
      location: [''],
      socialNetwork: [''],
      socialValue: ['']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.photo = e.target?.result;
      reader.readAsDataURL(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.onFileSelected({ target: { files: [file] } });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  addSocial() {
    const socialNetwork = this.formGroup.get('socialNetwork')?.value;
    const socialValue = this.formGroup.get('socialValue')?.value;

    if (socialNetwork && socialValue) {
      this.addedSocials.push({ network: socialNetwork, value: socialValue });
      this.formGroup.get('socialNetwork')?.reset();
      this.formGroup.get('socialValue')?.reset();
    }
  }

  onSubmit() {
    console.log(this.formGroup.value);
  }

}
