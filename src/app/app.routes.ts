import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { WizardComponent } from './modules/sell/wizard/wizard.component';
import { OffersComponent } from './modules/sell/offers/offers.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'example'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'example'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
            {path: 'clarification-text-pdp', loadChildren: () => import('app/modules/landing/clarification-text-pdp/clarification-text-pdp.routes')},
            {path: 'kvkk-clarification-text', loadChildren: () => import('app/modules/landing/kvkk-clarification-text/kvkk-clarification-text.routes')},
        ]
    },

    // Protected user routes (require authentication)
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'user/profile', loadChildren: () => import('app/modules/user/profile/profile.routes')},
            {path: 'degerlemelerim', loadChildren: () => import('app/modules/user/degerlemelerim/degerlemelerim.routes')},
            {path: 'randevularim', loadChildren: () => import('app/modules/user/randevularim/randevularim.routes')},
            {path: 'blog/new', loadChildren: () => import('app/modules/blog/form/blog-form.routes')},
            {path: 'blog/edit/:id', loadChildren: () => import('app/modules/blog/form/blog-form.routes')},
            {path: 'offers/:id', component: OffersComponent},
        ]
    },

    // Admin routes

    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'modern'
        },
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'wizard', component: WizardComponent},
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.routes')},
            {path: 'blog', loadChildren: () => import('app/modules/blog/list/blog-list.routes')},
            {path: 'blog/:id', loadChildren: () => import('app/modules/blog/detail/blog-detail.routes')},
        ]
    }
];
