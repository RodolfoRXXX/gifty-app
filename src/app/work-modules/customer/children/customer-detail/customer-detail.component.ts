import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { calculateDateLimit } from 'src/app/shared/functions/date.function';
import { Customer } from 'src/app/shared/interfaces/customer.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent implements OnInit {

  id_customer!: number;
  customer!: Customer;
  days: number = 180;

  load: boolean = true;
  loading: boolean = false;
  card_values: any = { total_sale: null, pending: null, open_orders: null, relative: null };
  tabs : any = [
    {name: 'Descripción', icon: 'edit', state: 'active'},
    {name: 'Detalle de compras', icon: 'list', state: ''}
  ]
  baseURL = environment.SERVER;

  constructor(
    private _api: ApiService,
    private _router: Router,
    private _conector: ConectorsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this._conector.setUpdateTitle('Detalle del cliente');
    this.route.queryParams.subscribe(params => {
      this.id_customer = parseInt(params['id_customer']);
      if (this.id_customer) {
        this.loadData(this.id_customer);
      } else {
        this._router.navigate(['init/main/customer/customer-list']);
      }
    });
  }

  //Llama a las funciones que traen la información
  loadData(id_customer: number): void {
    this.getCustomer(id_customer);
    this.getDataCard();
  }

  //Carga la información del cliente
  getCustomer(id_customer: number): void {
    this._api.postTypeRequest('profile/get-customer-id', { id_customer }).subscribe(
      (value: any) => {
        if (value.data) {
          this.customer = value.data[0];
          this.load = false;
        } else {
          this._router.navigate(['init/main/customer/customer-list']);
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  //Carga la información de las cards
  getDataCard(): void {
    if (this.id_customer) {
      let date_limit = calculateDateLimit(this.days);
      forkJoin({
        total: this._api.postTypeRequest('profile/get-customer-total-purchase', { date_limit: date_limit, customer: this.id_customer }),
        pending: this._api.postTypeRequest('profile/get-customer-pending-order', { date_limit: date_limit, customer: this.id_customer }),
        return: this._api.postTypeRequest('profile/get-customer-return-order', { date_limit: date_limit, customer: this.id_customer }),
        frecuency: this._api.postTypeRequest('profile/get-customer-frecuency-order', { date_limit: date_limit, customer: this.id_customer })
      }).subscribe({
        next: (results: any) => {
          this.card_values.total = results.total.data[0]?.response;
          this.card_values.pending = results.pending.data[0]?.response;
          this.card_values.return = results.return.data[0]?.response;
          this.card_values.frecuency = (results.frecuency.data[0]?.response/(this.days/30));
        }
      });
    }
  }

  editCustomer(id_customer: number): void {
    this._router.navigate(['init/main/customer/customer-edit'], { queryParams: { id_customer: id_customer } });
  }

  setTab(tab: number) {
    this.tabs.forEach( (element: any, index: number) => {
      element.state = '';
      (index == tab)?element.state = 'active':'';
    });
  }

}
