import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ImageService } from 'src/app/services/image.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Customer } from 'src/app/shared/interfaces/customer.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-edit-image',
  templateUrl: './customer-edit-image.component.html',
  styleUrls: ['./customer-edit-image.component.scss']
})
export class CustomerEditImageComponent {

  @Input() customer!: Customer;
  @Output() changeDetected = new EventEmitter<boolean>();

  isDragOver = false;
  imageSrc: string | ArrayBuffer | null = null;
  dataForm!: FormGroup;
  loading: boolean = false;
  load_image!: boolean;
  error_image!: string;
  uriImg = environment.SERVER;

  constructor(
    private _image: ImageService,
    private _api: ApiService,
    private _notify: NotificationService
  ) {
    this.createDataForm();
  }
  
  // Toma los cambios del Input de entrada y actualiza la data
  ngOnChanges(changes: SimpleChanges) {
    if (changes['customer']) {
      this.setDataForm(changes['customer'].currentValue)
    }
  }
  
  // Formulario edición de imagen de producto
  createDataForm(): void {
    this.dataForm = new FormGroup({
      id: new FormControl('', [
        Validators.required
      ]),
      id_enterprise: new FormControl('', [
        Validators.required
      ]),
      thumbnail: new FormControl('', [
        Validators.required
      ]),
      prev_thumb: new FormControl('', [
        Validators.required
      ])
    });
  }

  // Setea los valores del formulario
  setDataForm(customer: Customer): void {
    if (customer) {
      this.dataForm.patchValue({
        id: (customer.id > 0)?customer.id:'',
        id_enterprise: (customer.id_enterprise > 0)?customer.id_enterprise:'',
        thumbnail: '',
        prev_thumb: (customer.thumbnail != '')?customer.thumbnail:''
      });
  
      if (customer.thumbnail) {
        this.imageSrc = this.uriImg + customer.thumbnail;
      } else {
        this.imageSrc = ''; // Limpia la imagen si no hay una disponible
      }
    }
  }

  //Eventos que toman una imagen
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
      if ((file.type == 'image/jpg') || (file.type == 'image/jpeg') || (file.type == 'image/png')){
        if (file.size < 10485760) {
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
    this.readImageFile(file);
  }

  //Elimina todo lo que el reset básico no limpia
  resetAll() {
    this.setDataForm(this.customer)
    this.error_image = '';
  }

  //Submit para guardar la imagen
  onSubmit() {
    if(this.dataForm.controls['id'].value > 0) {
      this.loading = true;
      this._api.postTypeRequest('profile/edit-customer-image', this.dataForm.value).subscribe({
        next: (res: any) => {
          this.loading =  false;
          if(res.status == 1){
            //Accedió a la base de datos y no hubo problemas
            if(res.changedRows == 1){
              //Modificó la imagen
              this._notify.showSuccess('La imagen del cliente se ha modificado con éxito!');
              this.changeDetected.emit(true);
              this.dataForm.markAsPristine();
            } else{
              //No hubo modificación
              this._notify.showError('No se detectaron cambios. Ingresá una imagen diferente a la actual.')
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
