import { Component } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-blocked',
  templateUrl: './blocked.component.html'
})
export class BlockedComponent {

  id_enterprise!: number;
  loading: boolean = true;
  status!: string;

  constructor(
    private _auth: AuthService,
    private _api: ApiService
  ) {}

  ngOnInit(): void {
    this.getDataLocal();
  }

  getDataLocal(): void {
    const data = JSON.parse(this._auth.getDataFromLocalStorage());
    this.loadData(data.id, data.id_enterprise)
  }

  loadData(id_user: number, id_enterprise: number): void {
    if (id_user && id_enterprise) {
      forkJoin({
        enterprise: this._api.postTypeRequest('profile/get-enterprise', { id: id_enterprise }),
        employee: this._api.postTypeRequest('profile/get-employee', { id_user: id_user })
      }).subscribe({
        next: (results: any) => {
          this.loading = false;
          if (results.enterprise?.data && results.enterprise.data[0].id > 1) {
            // Verificar si la empresa está habilitada
            if (results.enterprise.data[0].status === 0) {
              this.status = 'not_available';
            } else if (results.employee?.data && results.employee.data[0].status === 0) {
              // Verificar si el empleado está inhabilitado
              this.status = 'no_employee';
            }
          } else {
            // No hay empresa
            this.status = 'no_enterprise';
          }
        },
        error: () => {
          this.loading = false; // Ensure load is set to false even if there's an error
        }
      });
    }
  }

}