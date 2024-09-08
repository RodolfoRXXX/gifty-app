import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { Employee } from 'src/app/shared/interfaces/employee.interface';
import { DialogConfirmOperationComponent } from 'src/app/shared/standalone/dialog/dialog-confirm-operation/dialog-confirm-operation.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit, AfterViewInit {

  employee!: Employee;
  resultsLength!: number;
  displayedColumns: string[] = ['id', 'Customer', 'phone', 'whatsapp', 'address', 'city', 'state', 'country', 'edit'];
  dataSource = new MatTableDataSource<any>();
  load = true;
  empty: boolean = false;
  recharge = false;
  uriImg = environment.SERVER;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _api: ApiService,
    private _conector: ConectorsService,
    private _paginator: MatPaginatorIntl,
    private _router: Router,
    private _dialog: MatDialog
  ) {
    this.initPaginatorLabels();
  }

  ngOnInit(): void {
    this._conector.setUpdateTitle('Lista de clientes');
    this.getDataLocal();
  }

  private initPaginatorLabels(): void {
    this._paginator.itemsPerPageLabel = "Registros por página";
    this._paginator.firstPageLabel = "Primera página";
    this._paginator.lastPageLabel = "Última página";
    this._paginator.nextPageLabel = "Próxima página";
    this._paginator.previousPageLabel = "Anterior página";
  }

  private getDataLocal(): void {
    this._conector.getEmployee().subscribe((item: Employee) => {
      this.employee = item;
      this.loadData();
    });
  }

  loadData(): void {
    if (this.employee.id_enterprise) {
      this.empty = false;
      this.load = true;
      forkJoin({
        count: this._api.postTypeRequest('profile/get-count-Customers', { id_enterprise: this.employee.id_enterprise }),
        customers: this._api.postTypeRequest('profile/get-Customers', { id_enterprise: this.employee.id_enterprise })
      }).subscribe({
        next: (results: any) => {
          if(results.count.data[0].total > 0) {
            this.resultsLength = results.count.data.total
            this.dataSource.data = results.customers.data
            this.dataSource.paginator = this.paginator;
          } else {
            this.empty = true;
          }
          this.load = false;
        },
        error: () => {
          this.load = false;
        }
      });
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  rechargeData() {
    this.loadData();
  }

  //Función que toma la fila clickeada del table eligiendo esa opción
  onRowClicked(row: any) {
    if(row) {
      this._router.navigate(['init/main/Customer/Customer-detail'], { queryParams: { id_Customer: row.id } });
    }
  }

  editCustomer(id_Customer: number) {
    this._router.navigate(['init/main/Customer/Customer-edit'], { queryParams: { id_Customer: id_Customer } });
  }

  openDialogWhatsapp(e: Event,whatsapp: String): void {
    e.stopPropagation();
    const dialogRef = this._dialog.open(DialogConfirmOperationComponent,
      { data: { 
                text: `Estás por entrar a una conversación con ${whatsapp}`,
                icon_name: 'info_outline',
                icon_color: 'rgb(231, 234, 33)'
              }
      }
    );
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        //Aquí abre una conversación de whatsapp con la aplicación original
        //en un futuro abrirá uina conversación por whatsapp desde esta aplicación, cuando esté integrada
        window.open(`https://wa.me/${whatsapp}`, '_blank');
      }
    });
  }

}
