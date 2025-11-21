import { inject } from '@angular/core';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { MessagesService } from 'app/layout/common/messages/messages.service';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const initialDataResolver = () => {
    const messagesService = inject(MessagesService);
    const navigationService = inject(NavigationService);
    const notificationsService = inject(NotificationsService);
    const quickChatService = inject(QuickChatService);
    const shortcutsService = inject(ShortcutsService);

    // Fork join multiple API endpoint calls to wait all of them to finish
    // Use catchError to prevent resolver failure if any service fails
    return forkJoin([
        navigationService.get().pipe(
            catchError((error) => {
                console.warn('Navigation service failed:', error);
                return of({ compact: [], default: [], futuristic: [], horizontal: [] });
            })
        ),
        messagesService.getAll().pipe(
            catchError((error) => {
                console.warn('Messages service failed:', error);
                return of([]);
            })
        ),
        notificationsService.getAll().pipe(
            catchError((error) => {
                console.warn('Notifications service failed:', error);
                return of([]);
            })
        ),
        quickChatService.getChats().pipe(
            catchError((error) => {
                console.warn('Quick chat service failed:', error);
                return of([]);
            })
        ),
        shortcutsService.getAll().pipe(
            catchError((error) => {
                console.warn('Shortcuts service failed:', error);
                return of([]);
            })
        ),
    ]);
};
