import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { calcularDiasRestantes } from '../shared/functions/date.function';

  //Guard para cuidar rutas de usuarios no logueados
  export const is_logged: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isLogged();
    };

  const isLogged = () : | boolean | UrlTree | Observable< boolean | UrlTree > | Promise< boolean | UrlTree > => {
    const _authSvc = inject(AuthService);
    const _router  = inject(Router);
    return _authSvc.isLogged$.pipe(
      tap( (isLogged : boolean) => {
        if(!isLogged) {
          _router.navigate(['login']);
        }
      } )
    )
  }

  //Guard para cuidar rutas de usuarios no autenticados
  export const is_authenticated: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isAuthenticated();
    };

  const isAuthenticated = () : | boolean | UrlTree | Observable< boolean | UrlTree > | Promise< boolean | UrlTree > => {
    const _authSvc = inject(AuthService);
    const _router  = inject(Router);
    return _authSvc.isAuthenticated$.pipe(
      tap( (isAuthenticated : boolean) => {
        if(!isAuthenticated) {
          _router.navigate(['recharge']);
        }
      } )
    )
  }

  //Guard para cuidar rutas de login-register-forgot-recover
  export const isNot_logged: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isNotLogged();
    };

  const isNotLogged = () : | boolean | UrlTree | Observable< boolean | UrlTree > | Promise< boolean | UrlTree > => {
    const _authSvc = inject(AuthService);
    const _router  = inject(Router);
    const state = _authSvc.isLogged$;
    const change_sign = pipe(
      map( (value:boolean) => value = (value !== true)),
      tap( (value:boolean) => (!value)?_router.navigate(['recharge']):'' )
    );
    const fx = change_sign(state);
    return fx;
  }

  //Guard para cuidar rutas de recharge
  export const isNot_authenticated: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isNotAuthenticated();
    };

  const isNotAuthenticated = () : | boolean | UrlTree | Observable< boolean | UrlTree > | Promise< boolean | UrlTree > => {
    const _authSvc = inject(AuthService);
    const _router  = inject(Router);
    const state = _authSvc.isAuthenticated$;
    const change_sign = pipe(
      map( (value:boolean) => value = (value !== true)),
      tap( (value:boolean) => (!value)?_router.navigate(['init']):'' )
    );
    const fx = change_sign(state);
    return fx;
  }

  //Guard para cuidar ruta de usuarios no verificados
    const checkActive = (): Observable<boolean> => {
      const _authSvc = inject(AuthService);
      return _authSvc.isActive$;
    };
    
    export const is_active: CanActivateFn = (route, state) => {
      const _router = inject(Router);
      return checkActive().pipe(
        map(isActive => isActive ? true : _router.createUrlTree(['init/verify']))
      );
    };
    
    export const isNot_active: CanActivateFn = (route, state) => {
      const _router = inject(Router);
      return checkActive().pipe(
        map(isActive => !isActive ? true : _router.createUrlTree(['init']))
      );
    };

  //Guard para confirmar si el usuario es un empleado
  export const is_employee: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isEmployee();
    };

  const isEmployee = (): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
    const _apiSvc = inject(ApiService);
    const _authSvc = inject(AuthService);
    const _router = inject(Router);

    const id = _authSvc.getUserId();

    if (!id) return _router.parseUrl('init/blocked');

    return _apiSvc.postTypeRequest('profile/get-employee', { id_user: id }).pipe(
        switchMap((response: any) => {
            const employee = response.data?.[0];
            if (employee && employee.status === 1) {
                return of(true);
            } else {
                _router.navigate(['init/blocked']);
                return of(false);
            }
        })
    );
  };


  //Guard para evitar que un empleado acceda al componente de "empleado bloqueado"
  export const isNot_employee: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isNotEmployee();
    };

  const isNotEmployee = () : | boolean | UrlTree | Observable< boolean | UrlTree > | Promise< boolean | UrlTree > => {
    const _apiSvc = inject(ApiService);
    const _authSvc = inject(AuthService);
    const _router  = inject(Router);

    const id = _authSvc.getUserId();

    if(!id) return _router.navigate(['init/blocked']);

    return _apiSvc.postTypeRequest('profile/get-employee', { id_user: id }).pipe(
      switchMap((response: any) => {
          const employee = response.data?.[0];
          if (!employee || employee.status === 0) {
              return of(true);
          } else {
              _router.navigate(['init']);
              return of(false);
          }
      })
    );
  }


  //Guard para confirmar si la empresa está activa
  export const is_active_enterprise: CanActivateFn = (route, state) => {
    return isActiveEnterprise();
  };
  
  const isActiveEnterprise = (): Observable<boolean | UrlTree> => {
    const _apiSvc = inject(ApiService);
    const _authSvc = inject(AuthService);
    const _router = inject(Router);
  
    const id_enterprise = JSON.parse(_authSvc.getDataFromLocalStorage())?.id_enterprise;
  
    if (!id_enterprise) return of(_router.parseUrl('init/blocked'));
  
    return _apiSvc.postTypeRequest('profile/get-enterprise', { id: id_enterprise }).pipe(
      switchMap((response: any) => {
        const enterprise = response.data?.[0];
  
        if (enterprise) {
          if (enterprise.status === 1) {
            const diasRestantes = calcularDiasRestantes(30, enterprise.updatedPayment);
            if (diasRestantes < -10) {
              return _apiSvc.postTypeRequest('profile/change-enterprise-state', {
                id_enterprise: enterprise.id,
                status: 0
              }).pipe(
                switchMap(() => of(_router.parseUrl('init/blocked'))),
                catchError(() => {
                  console.error('Error updating enterprise status');
                  return of(_router.parseUrl('init/blocked')); // Redirigir a la página bloqueada en caso de error
                })
              );
            }
            return of(true); // La empresa está activa y no necesita actualizarse
          } else if (enterprise.status === 0) {
            return of(_router.parseUrl('init/blocked')); // Empresa inactiva, redirigir a bloqueado
          }
        }
  
        // Redirigir si la empresa no está encontrada o hay algún problema
        return of(_router.parseUrl('init/blocked'));
      }),
      catchError(() => {
        console.error('Error fetching enterprise data');
        return of(_router.parseUrl('init/blocked')); // Redirigir a la página bloqueada en caso de error al obtener datos
      })
    );
  };


  //Guard para confirmar si la empresa está activa
  export const isNot_active_enterprise: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return isNotActiveEnterprise();
    };

  const isNotActiveEnterprise = (): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
    const _apiSvc = inject(ApiService);
    const _authSvc = inject(AuthService);
    const _router = inject(Router);

    const id_enterprise = JSON.parse(_authSvc.getDataFromLocalStorage()).id_enterprise;

    if (!id_enterprise) return _router.parseUrl('init/blocked');

    return _apiSvc.postTypeRequest('profile/get-enterprise', { id: id_enterprise }).pipe(
        switchMap((response: any) => {
            const enterprise = response.data?.[0];
            if (!enterprise || enterprise.status === 0) {
                return of(true);
            } else {
                _router.navigate(['init']);
                return of(false);
            }
        })
    );
  };