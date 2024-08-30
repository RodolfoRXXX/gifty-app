import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConectorsService } from 'src/app/services/conectors.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Enterprise } from 'src/app/shared/interfaces/enterprise.interface';

@Component({
  selector: 'app-enterprise-edit',
  templateUrl: './enterprise-edit.component.html'
})
export class EnterpriseEditComponent implements OnInit {

  enterprise!: Enterprise;

  constructor(
    private _conector: ConectorsService,
    private _actRoute: ActivatedRoute,
    private _notify: NotificationService,
    private _router: Router
  ) {

  }

  ngOnInit(): void {
    this._conector.setUpdateTitle('Editar mi empresa');
    this.fetchEnterprise();
  }

  fetchEnterprise(): void {
    this._actRoute.data.subscribe(data => {
      const resolverData = data['enterprise'];
      if (resolverData && resolverData.data && resolverData.data.length > 0) {
        this.enterprise = resolverData.data[0];
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

}
