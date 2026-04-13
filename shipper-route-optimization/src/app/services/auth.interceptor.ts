import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const raw = localStorage.getItem('routeflow.auth');
  if (!raw) {
    return next(req);
  }

  try {
    const session = JSON.parse(raw) as { accessToken?: string };
    if (!session.accessToken) {
      return next(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });

    return next(authReq);
  } catch {
    return next(req);
  }
};
