import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  Router,
  CanActivateChild,
} from '@angular/router';
import { map, Observable, tap } from 'rxjs';

// --- Facades ---
import { UserFacade } from '../facades/user.facades';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate, CanActivateChild {
  private readonly isAuthenticated$ = this.userFacade.authState$.pipe(
    map(({ isAuthenticated }) => isAuthenticated)
  );

  constructor(private _router: Router, private userFacade: UserFacade) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return (this.isAuthenticated$ as Observable<boolean>).pipe(
      tap((isAuthenticated) =>
{      console.log(isAuthenticated)
        isAuthenticated
          ? this._router.navigate(['/'])
          : this._router.navigate(['/auth'])}
      )
    );
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
