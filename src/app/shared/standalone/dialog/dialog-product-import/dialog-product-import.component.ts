import { Component, ElementRef, Inject, ViewChild} from '@angular/core';
import { MaterialModule } from 'src/app/material/material/material.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';


@Component({
  standalone: true,
  selector: 'app-dialog-product-import',
  templateUrl: './dialog-product-import.component.html',
  styleUrls: ['./dialog-product-import.component.scss'],
  imports: [
    MaterialModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class DialogProductImportComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;

  dataForm!: FormGroup;
  products: any[] = [];
  loading = false;
  fileFormat: string | null = null;

  isDragOver = false;
  loaded_file!: boolean;
  success_file!: boolean;
  error_file!: string;

  constructor(
    public dialogRef: MatDialogRef<DialogProductImportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _api: ApiService,
    private _notify: NotificationService,
    private fb: FormBuilder,
    private _router: Router
  ) {
    this.createDataForm();
  }
  
  // Formulario edición de imagen de producto
  createDataForm(): void {
    this.dataForm = this.fb.group({
      id_enterprise: [this.data.id_enterprise],
      products: [[], Validators.required],
    });
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
    this.loading = true;
    this.error_file = '';
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.readPeterFile(file);
    }
  }
  capture_file(event: any) {
    this.loading = true;
    this.error_file = '';
    const file = event.target.files[0];
    this.readPeterFile(file);
  }

  readPeterFile(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Verificar formato de archivo
        if (file.name.endsWith('.xlsx')) {
          this.fileFormat = 'Excel';
        } else if (file.name.endsWith('.csv')) {
          this.fileFormat = 'CSV';
        } else {
          this.fileFormat = 'Desconocido';
        }

        // Obtener la primera hoja
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        this.processData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  processData(data: any[]): void {
    // Verificar si se ha cargado un archivo y si contiene datos
    if (!data || data.length === 0) {
      this.error_file = 'No se ha cargado ningún archivo o el archivo está vacío.';
      this.loading = false;
      this.loaded_file = false;
      return;
    }

    this.loading = false;
    this.loaded_file = true;
    const headers = data[0]; // Primera fila, cabeceras
    const requiredFields = ['name', 'description', 'category', 'stock_real', 'sale_price'];

    // Verificar que los campos necesarios están presentes
    if (!this.verifyHeaders(headers, requiredFields)) {
      this.error_file = 'El archivo no tiene el formato adecuado.';
      return;
    }

    const products = data.slice(1) // Saltar la fila de cabeceras
    .filter((row: any[]) => row.length > 0 && row.every(cell => cell !== undefined && cell !== null && cell !== '')) // Filtrar filas vacías
    .map((row) => ({
      name: row[0],
      description: row[1],
      category: Number(row[2]),
      sku: this.getSku(row[0], row[2], this.data.id_enterprise),
      stock_real: Number(row[3]),
      sale_price: Number(row[4])
    }));

    // Verificar que todos los productos tengan los campos necesarios
    if (this.validateProducts(products)) {
      this.products = products;
      this.dataForm.get('products')?.setValue(this.products);
      this.success_file = true;
    } else {
      this.error_file = 'Algunos productos tienen datos incompletos.';
    }
  }

  //Función que devuelve el sku
  getSku(name: string, category: number, id_enterprise: number): string {
    let sku = (((name)
    .toLowerCase())
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')).trim();
    return sku.slice(0, 3) +
            sku.slice(-3) + '-' +
            category +
            id_enterprise;
  }

  verifyHeaders(headers: string[], requiredFields: string[]): boolean {
    return requiredFields.every((field) => headers.includes(field));
  }

  validateProducts(products: any[]): boolean {
    return products.every((product) =>
      product.name && product.description && product.category && product.stock_real && product.sale_price
    );
  }

  //Elimina todo lo que el reset básico no limpia
  resetAll() {
    this.loaded_file = false;
    this.success_file = false,
    this.error_file = '';
    this.loading = false;
    // Resetea el formulario reactivo
    this.dataForm.reset();
    this.dataForm.patchValue({ id_enterprise: this.data.id_enterprise });
    // Resetea el input de archivo
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    // Limpia los productos cargados
    this.products = [];
    this.fileFormat = null;
  }

  //Submit para guardar la imagen del producto
  onSubmit() {
    if(this.dataForm.controls['id_enterprise'].value > 0) {
      this.loading = true;
      this._api.postTypeRequest('profile/import-product', this.dataForm.value).subscribe({
        next: (res: any) => {
          this.loading =  false;
          if(res.status == 1){
            //Accedió a la base de datos y no hubo problemas
            if(res.data.done){
              //Cambios OK
              this._notify.showSuccess(`Se agregaron ${res.data.add} productos y se modificaron ${res.data.updated} productos.`);
              setTimeout(() => {
                this.closeDialog(true);
              }, 2000);
            } else{
              //No hubo modificación
              this._notify.showError('No se detectaron cambios. Intentá nuevamente por favor.')
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

//cierro la ventana de diálogo
  closeDialog(state: boolean) {
    if(state) {
      this._router.navigate(['init/main/product/product-list']);
    }
    this.dialogRef.close(state);
  }

}