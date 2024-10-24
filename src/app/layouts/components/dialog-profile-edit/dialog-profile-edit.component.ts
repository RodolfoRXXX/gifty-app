import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { ImageService } from 'src/app/services/image.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';

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

  dataForm!: FormGroup;
  profileData!: any;
  loading: boolean = true;

  isDragOver = false;
  imageSrc: string | ArrayBuffer | null = null;
  load_image!: boolean;
  error_image!: string;
  uriImg = environment.SERVER;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogProfileEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _api: ApiService,
    private _image: ImageService,
    private _notify: NotificationService,
    private _auth: AuthService
  ) {
    this.createDataForm()
    this.getUserData(this.data.profileId);
  }

  createDataForm() {
    this.dataForm = this.fb.group({
      profileId: ['', Validators.required],
      name: ['', 
        [
          Validators.minLength(3),
          Validators.maxLength(30)
        ]],
      location: ['', 
        [
          Validators.minLength(3),
          Validators.maxLength(50)
        ]
      ],
      thumbnail: [''],
      prev_thumb: ['', 
        [
          Validators.required,
          Validators.maxLength(250)
        ]
      ]
    });
  }
  setDataForm(profileData: any) {
    this.dataForm.patchValue({
      profileId: (profileData.profileId != '')?profileData.profileId:'',
      name: (profileData.name != '')?profileData.name:'',
      location: (profileData.location != '')?profileData.location:'',
      prev_thumb: (profileData.thumbnail != '')?profileData.thumbnail:''
    })

    if (profileData.thumbnail) {
      this.imageSrc = this.uriImg + profileData.thumbnail;
    } else {
      this.imageSrc = ''; // Limpia la imagen si no hay una disponible
    }
  }

  getUserData(profileId: string) {
    // Llamar a la API para obtener los datos del perfil
    this._api.postTypeRequest('profile/get-profile', { profileId }).subscribe({
      next: (response: any) => {
        if(response.status == 1 && response.data.length) {
          this.profileData = response.data[0];
          this.setDataForm(response.data[0]);
        } else {
          this.closeDialog(false);
        }
        this.loading = false;
      },
      error: (err) => {
        this.closeDialog(false);
        this.loading = false;
      }
    });
  }

  //manejar la imagen
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  onDrop(event: DragEvent) {
    this.load_image = true;
    this.imageSrc = '';
    this.error_image = '';
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.readImageFile(file);
    }
  }
  readImageFile(file: File) {
    const reader = new FileReader();
    setTimeout(() => {
      if (file && ((file.type == 'image/jpg') || (file.type == 'image/jpeg') || (file.type == 'image/png'))){
        if ((file.size > 10240) && (file.size < 10485760)) {
          this._image.extraerBase64(file).then( (imagen:any) => {
            try {
              if(imagen.base){
                this.dataForm.patchValue({
                  thumbnail: imagen.base
                })
              } else {
                this.error_image = 'Ha ocurrido un error con la imagen';
                this.dataForm.patchValue({
                  thumbnail: ''
                })
              }
            } catch (error) {
              this.error_image = 'Ha ocurrido un error con la imagen';
              this.dataForm.patchValue({
                thumbnail: ''
              })
            }
          });
        } else if(file.size > 10485760) {
          //error de peso mayor
          this.error_image = 'La imagen no debe superar los 10MB';
          this.dataForm.patchValue({
            thumbnail: ''
          })
        } else {
          //error de peso menor
          this.error_image = 'La imagen debe superar los 50KB';
          this.dataForm.patchValue({
            thumbnail: ''
          })
        }
      } else{
        //error de formato
        this.error_image = 'La imagen tiene un formato incompatible';
        this.dataForm.patchValue({
          thumbnail: ''
        })
      }
      this.load_image = false;
      reader.onload = (e) => {
        if(this.error_image.length == 0) {
          this.imageSrc = (e.target?.result)?(e.target?.result):'';
        } else {
          this.imageSrc = '';
        }
      };
      reader.readAsDataURL(file);
    }, 2000);
  }
  capture_img(event: any) {
    this.load_image = true;
    this.imageSrc = '';
    this.error_image = '';
    const file = event.target.files[0];
    if(file) {
      this.readImageFile(file);
    } else {
      this.load_image = false;
      if (this.profileData.thumbnail) {
        this.imageSrc = this.uriImg + this.profileData.thumbnail;
      } else {
        this.imageSrc = ''; // Limpia la imagen si no hay una disponible
      }
    }
  }

  //Elimina todo lo que el reset básico no limpia
  resetAll() {
    this.dataForm.reset();
    this.setDataForm(this.profileData);
    this.error_image = '';
    this.dataForm.markAsPristine();
  }

  //Errores
  getErrorName() {
    //name
    if(this.dataForm.controls['name'].hasError('minlength')) return 'Mínimo de 3 caracteres';
    if(this.dataForm.controls['name'].hasError('maxlength')) return 'Máximo de 30 caracteres';
    return ''
  }
  getErrorLocation() {
    //location
    if(this.dataForm.controls['location'].hasError('minlength')) return 'Mínimo de 3 caracteres';
    if(this.dataForm.controls['location'].hasError('maxlength')) return 'Máximo de 50 caracteres';
    return ''
  }

  onSubmit() {
    this._api.postTypeRequest('profile/edit-profile', this.dataForm.value).subscribe({
      next: (res: any) => {
        this.loading =  false;
        if(res.status == 1){
          //Accedió a la base de datos y no hubo problemas
          if(res.data.affectedRows == 1){
            //Modificó la info
            this._notify.showSuccess('Perfíl actualizado!');
            let data = JSON.parse(this._auth.getDataFromLocalStorage())
            data.name = res.UpdatedValues.name;
            data.location = res.UpdatedValues.location;
            (res.UpdatedValues.thumbnail)?(data.thumbnail = res.UpdatedValues.thumbnail):'';
            this._auth.setUserData(data)
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
