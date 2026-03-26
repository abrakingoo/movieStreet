import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('api.themoviedb.org')) {
    const clonedReq = req.clone({
      setHeaders: {
        accept: 'application/json',
        Authorization: `Bearer ${environment.tmdbBearerToken}`
      }
    });
    return next(clonedReq);
  }
  return next(req);
};
