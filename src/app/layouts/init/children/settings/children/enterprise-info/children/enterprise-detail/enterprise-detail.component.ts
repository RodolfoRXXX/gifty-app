import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ConectorsService } from 'src/app/services/conectors.service';
import { NotificationService } from 'src/app/services/notification.service';
import { calcularDiasRestantes, calculateDateLimit } from 'src/app/shared/functions/date.function';
import { Enterprise } from 'src/app/shared/interfaces/enterprise.interface';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-enterprise-detail',
  templateUrl: './enterprise-detail.component.html'
})
export class EnterpriseDetailComponent implements OnInit {

  enterprise!: Enterprise;
  load: boolean = true;
  loading: boolean = false;
  date_limit!: string;
  activeAccount!: boolean;
  card_values: any = { total_employees: null, total_stock: null, pending: null, total_sale: null };
  tabs : any = [
    {name: 'Descripción', icon: 'edit', state: 'active'}
  ]
  baseURL = environment.SERVER;

  constructor(
    private _api: ApiService,
    private _actRoute: ActivatedRoute,
    private _notify: NotificationService,
    private _conector: ConectorsService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._conector.setUpdateTitle('Detalles de mi empresa');
    this.fetchEnterprise();
    this.date_limit = calculateDateLimit(30);
    this.getDataCard();
  }

  fetchEnterprise(): void {
    this._actRoute.data.subscribe(data => {
      const resolverData = data['enterprise'];
      if (resolverData && resolverData.data && resolverData.data.length > 0) {
        this.enterprise = resolverData.data[0];
        this.activeAccount = (calcularDiasRestantes(30, this.enterprise.updatedPayment) >= -10)
        this.load = false;
      } else {
        this.handleNoEnterprise();
      }
    }, error => {
      this.handleNoEnterprise();
    });
  }

  handleNoEnterprise(): void {
    this._notify.showWarn('No ha sido posible obtener la información. Intentá nuevamente por favor.');
    setTimeout(() => {
      this._router.navigate(['init/settings/index']);
    }, 1500);
  }

  setTab(tab: number) {
    this.tabs.forEach( (element: any, index: number) => {
      element.state = '';
      (index == tab)?element.state = 'active':'';
    });
  }

  getDataCard(): void {
    if (this.date_limit) {
      forkJoin({
        total_sale: this._api.postTypeRequest('profile/get-data-total-sale', { id_enterprise: this.enterprise.id, date_limit: this.date_limit, seller: null }),
        pending: this._api.postTypeRequest('profile/get-user-pending', { id_enterprise: this.enterprise.id, date_limit: this.date_limit, seller: null }),
        total_stock: this._api.postTypeRequest('profile/get-total-stock', { id_enterprise: this.enterprise.id }),
        total_employees: this._api.postTypeRequest('profile/get-count-users', { id: this.enterprise.id })
      }).subscribe({
        next: (results: any) => {
          this.card_values.total_sale = results.total_sale.data[0]?.response;
          this.card_values.pending = results.pending.data[0]?.response;
          this.card_values.total_stock = results.total_stock.data[0]?.response;
          this.card_values.total_employees = results.total_employees.data[0]?.total;
        }
      });
    }
  }

  editEnterprise(): void {
    this._router.navigate(['init/settings/enterprise-info/enterprise-edit']);
  }

  //Navegar a la misma ruta para recargar el componente
  rechargeComponent() {
    window.location.reload();
  }

  activateEnterprise(id_enterprise: number, status: number) {
    if(id_enterprise > 0) {
      this.loading = true;
      setTimeout(() => {
        this._api.postTypeRequest('profile/change-enterprise-state', {id_enterprise: id_enterprise, status: +!status}).subscribe({
          next: (res: any) => {
            this.loading =  false;
            if(res.status == 1){
              //Accedió a la base de datos y no hubo problemas
              if(res.data.affectedRows == 1){
                //Modificó la imagen
                this._notify.showSuccess(`La empresa se ${(status == 0)?'activó':'suspendió'}!`);
                setTimeout(() => {
                  this.rechargeComponent();
                }, 2000);
              } else{
                //No hubo modificación
                this._notify.showError('No se detectaron cambios. Volvé a realizar la operación.')
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
      }, 2000);
    }
  }

}
