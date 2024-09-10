import { formatDate } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { calculateDateLimit } from 'src/app/shared/functions/date.function';
import { Employee } from 'src/app/shared/interfaces/employee.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-detail-purchase',
  templateUrl: './customer-detail-purchase.component.html',
  styleUrl: './customer-detail-purchase.component.scss'
})
export class CustomerDetailPurchaseComponent implements OnInit, AfterViewInit {

  @Input() id_customer!: number;
  @ViewChild('dateTime') dateTime!: ElementRef;
  @ViewChild('sellerF') sellerF!: ElementRef;
  @ViewChild('state') state!: ElementRef;

  employee!: Employee;
  sellers!: any;
  displayedColumns: string[] = ['id', 'date', 'total', 'seller', 'status'];
  dataSource = new MatTableDataSource();
  empty_orders = false;
  resultsLength!: number;
  loadCards: boolean = true;
  load = true;
  recharge = false;
  chips: any = {};
  chips_arr: any = {};
  permissions: string[] = [];
  edit_enterprise_control = environment.EDIT_ENTERPRISE_CONTROL;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  seller!: number | null;

  constructor(
    private _api: ApiService,
    private _conector: ConectorsService,
    private _paginatorIntl: MatPaginatorIntl,
    private _router: Router
  ) {
    this.initPaginatorLabels();
  }

  ngOnInit(): void {
    this._conector.setUpdateTitle('Lista de pedidos');
    this.getDataLocal();
  }

  private initPaginatorLabels(): void {
    this._paginatorIntl.itemsPerPageLabel = "Registros por página";
    this._paginatorIntl.firstPageLabel = "Primera página";
    this._paginatorIntl.lastPageLabel = "Última página";
    this._paginatorIntl.nextPageLabel = "Próxima página";
    this._paginatorIntl.previousPageLabel = "Anterior página";
  }

  //Getters
  private getDataLocal(): void {
    this._conector.getEmployee().subscribe( (item:Employee) => {
      this.employee = item
      this.permissions = item.list_of_permissions.split(',')
      if(!item.list_of_permissions.includes(this.edit_enterprise_control)) {
        this.seller = item.id;
      } else {
        this.seller = null;
        this.getSellers(item.id_enterprise)
      }
      this.loadData()
    })
  }
  private getSellers(id_enterprise: number) {
    this._api.postTypeRequest('profile/get-enterprise-users', { id_enterprise }).subscribe((value: any) => {
      if((value.status ===1) && (value.data.length)) {
        this.sellers = value.data;
      }
    });
  }
  
  //Función que trae los valores desde la DB
  loadData(): void {
    if (this.employee.id_enterprise && this.id_customer) {
      this.empty_orders = false;
      this.load = true;
      forkJoin({
        count: this._api.postTypeRequest('profile/get-count-orders', 
          { id_enterprise: this.employee.id_enterprise, dateTime: this.chips_arr.dateTime, sellerF: this.chips_arr.sellerF, state: this.chips_arr.state, seller: this.seller, customer: this.id_customer }),
        orders: this._api.postTypeRequest('profile/get-orders', 
          { id_enterprise: this.employee.id_enterprise, dateTime: this.chips_arr.dateTime, sellerF: this.chips_arr.sellerF, state: this.chips_arr.state, seller: this.seller, customer: this.id_customer })
      }).subscribe({
        next: (results: any) => {
          if(results.count.data[0].total > 0) {
            results.orders.data.forEach((element: any) => {
              if(element.status == 1) {
                element.status = 'Pendiente'
              } else {
                element.status = 'Finalizado'
              }
              //sumar el total de cada compra
              element.total = 0;
              JSON.parse(element.detail).forEach((item: any) => {
                element.total += item.price
              });
            });
            this.resultsLength = results.count.data.total
            this.dataSource.data = results.orders.data
            this.dataSource.paginator = this.paginator;
          } else {
            this.empty_orders = true;
          }
          this.load = false;
        },
        error: () => {
          this.load = false;
        }
      });
    }
  }

  getEmployeeDisplayName(item: any): string {
    return item.name_employee || item.email.split("@")[0];
  }

  //Funciones que manejan la visulización de chips y los filtros
  add(value: any, key: string) {
    switch (key) {
      case 'dateTime':
        this.chips.dateTime = formatDate(value, 'dd-MM-yyyy', 'en');
        this.chips_arr.dateTime = formatDate(value, 'yyyy-MM-dd', 'en');;
        break;
      case 'sellerF':
        this.chips.sellerF = value.name
        this.chips_arr.sellerF = value.id
        break;
      case 'state':
        this.chips.state = value.name
        this.chips_arr.state = value.id
        break;
    }
    this.loadData()
  }
  delete(key: any) {
    delete this.chips[key];
    delete this.chips_arr[key];

    if (this[key as keyof this]) {
        const element = this[key as keyof this];

        // Verifica si el elemento es un MatSelect
        if (element instanceof MatSelect) {
            element.value = null;
        }
        // Verifica si el elemento es un MatDatepickerInput
        else if (element instanceof MatDatepickerInput) {
            element.value = null;
        }
        // Verifica si el elemento tiene la propiedad `nativeElement`
        else if ((element as any).nativeElement) {
            (element as any).nativeElement.value = '';
        }
    }

    this.loadData();
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //Función que toma la fila clickeada del table eligiendo esa opción
  onRowClicked(row: any) {
    if(row) {
      this._router.navigate(['init/main/order/order-detail'], { queryParams: { id_order: row.id } });
    }
  }

  //Recarga la información
  rechargeData() {
    this.loadData();
  }

}
