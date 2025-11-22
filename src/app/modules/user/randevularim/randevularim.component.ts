import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppointmentDialogComponent, AppointmentDialogData } from 'app/modules/sell/appointment-dialog/appointment-dialog.component';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

interface Appointment {
    id: number;
    offerId?: number;
    offerName: string;
    location: string;
    price: number;
    date: Date;
    time: string;
    datetime: string;
    status?: string;
}

@Component({
    selector: 'app-randevularim',
    templateUrl: './randevularim.component.html',
    styleUrls: ['./randevularim.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatMenuModule,
        MatSnackBarModule,
    ],
})
export class RandevularimComponent implements OnInit {
    appointments: Appointment[] = [];
    loading = true;

    constructor(
        private http: HttpClient,
        public router: Router,
        private dialog: MatDialog,
        private _fuseConfirmationService: FuseConfirmationService,
        private _snackBar: MatSnackBar,
        private _authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loadAppointments();
    }

    private getAppointmentsStorageKey(): string {
        const token = this._authService.accessToken;
        if (!token) {
            return 'appointments_anonymous';
        }
        const userId = AuthUtils.getUserIdFromToken(token);
        return userId ? `appointments_${userId}` : 'appointments_anonymous';
    }

    loadAppointments(): void {
        this.loading = true;

        // TODO: Backend API endpoint'i hazır olduğunda buraya eklenmeli
        // Şimdilik localStorage'dan mock data okuyoruz
        const storageKey = this.getAppointmentsStorageKey();
        const savedAppointments = localStorage.getItem(storageKey);
        if (savedAppointments) {
            try {
                const parsed = JSON.parse(savedAppointments);
                let nextId = Date.now();
                this.appointments = parsed.map((apt: any, index: number) => {
                    // ID yoksa veya boşsa, benzersiz bir ID oluştur
                    if (!apt.id || apt.id === '' || apt.id === null || apt.id === undefined) {
                        apt.id = nextId + index;
                    }

                    let date: Date;
                    if (apt.datetime) {
                        date = new Date(apt.datetime);
                    } else if (apt.date) {
                        date = typeof apt.date === 'string' ? new Date(apt.date) : apt.date;
                    } else {
                        date = new Date();
                    }
                    return {
                        ...apt,
                        id: Number(apt.id), // ID'yi number'a çevir
                        date: date,
                    };
                }).sort((a: Appointment, b: Appointment) => {
                    // Tarihe göre sırala (en yeni önce)
                    return b.date.getTime() - a.date.getTime();
                });

                // ID'leri düzeltilmiş randevuları localStorage'a geri kaydet
                const appointmentsToSave = this.appointments.map(apt => ({
                    ...apt,
                    date: apt.date instanceof Date ? apt.date.toISOString() : apt.date,
                }));
                localStorage.setItem(storageKey, JSON.stringify(appointmentsToSave));
            } catch (e) {
                console.error('Error parsing appointments:', e);
                this.appointments = [];
            }
        } else {
            this.appointments = [];
        }

        this.loading = false;
    }

    formatDate(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }

    formatTime(time: string): string {
        if (!time) return '';
        return time;
    }

    navigateToWizard(): void {
        this.router.navigate(['/wizard']);
    }

    editAppointment(appointment: Appointment): void {
        const dialogData: AppointmentDialogData = {
            offerId: appointment.offerId,
            offerName: appointment.offerName,
            location: appointment.location,
            price: appointment.price,
            appointmentId: appointment.id,
            existingDate: appointment.date,
            existingTime: appointment.time,
            isEditMode: true,
        };

        const dialogRef = this.dialog.open(AppointmentDialogComponent, {
            width: '500px',
            maxWidth: '90vw',
            data: dialogData,
            panelClass: 'appointment-dialog',
            disableClose: false,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result?.success) {
                // Randevuyu güncelle
                const updatedAppointment = {
                    ...appointment,
                    date: result.data.date,
                    time: result.data.time,
                    datetime: result.data.datetime,
                };
                this.updateAppointment(updatedAppointment);
            }
        });
    }

    updateAppointment(updatedAppointment: Appointment): void {
        const storageKey = this.getAppointmentsStorageKey();
        const savedAppointments = localStorage.getItem(storageKey);
        if (savedAppointments) {
            try {
                const appointments = JSON.parse(savedAppointments);
                const appointmentId = Number(updatedAppointment.id);
                const index = appointments.findIndex((apt: any) => Number(apt.id) === appointmentId);
                if (index !== -1) {
                    appointments[index] = {
                        ...updatedAppointment,
                        date: updatedAppointment.date instanceof Date
                            ? updatedAppointment.date.toISOString()
                            : updatedAppointment.date,
                    };
                    localStorage.setItem(storageKey, JSON.stringify(appointments));
                    this.loadAppointments();
                    this._snackBar.open('Randevu başarıyla güncellendi', 'Kapat', {
                        duration: 3000,
                        horizontalPosition: 'end',
                        verticalPosition: 'top',
                    });
                }
            } catch (e) {
                console.error('Error updating appointment:', e);
                this._snackBar.open('Randevu güncellenirken bir hata oluştu', 'Kapat', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                });
            }
        }
    }

    deleteAppointment(appointment: Appointment): void {
        const confirmation = this._fuseConfirmationService.open({
            title: 'Randevuyu Sil',
            message: `${appointment.offerName} firmasına ait randevuyu silmek istediğinizden emin misiniz?`,
            icon: {
                show: true,
                name: 'heroicons_outline:exclamation-triangle',
                color: 'warn',
            },
            actions: {
                confirm: {
                    show: true,
                    label: 'Sil',
                    color: 'warn',
                },
                cancel: {
                    show: true,
                    label: 'İptal',
                },
            },
            dismissible: false,
        });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                const storageKey = this.getAppointmentsStorageKey();
                const savedAppointments = localStorage.getItem(storageKey);
                if (savedAppointments) {
                    try {
                        const appointments = JSON.parse(savedAppointments);
                        const appointmentId = Number(appointment.id);
                        const filtered = appointments.filter((apt: any) => Number(apt.id) !== appointmentId);
                        localStorage.setItem(storageKey, JSON.stringify(filtered));
                        this.loadAppointments();
                        this._snackBar.open('Randevu başarıyla silindi', 'Kapat', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top',
                        });
                    } catch (e) {
                        console.error('Error deleting appointment:', e);
                        this._snackBar.open('Randevu silinirken bir hata oluştu', 'Kapat', {
                            duration: 3000,
                            horizontalPosition: 'end',
                            verticalPosition: 'top',
                        });
                    }
                }
            }
        });
    }

    getStatusIcon(status?: string): string {
        switch (status) {
            case 'confirmed':
                return 'check_circle';
            case 'cancelled':
                return 'cancel';
            case 'pending':
            default:
                return 'schedule';
        }
    }

    getStatusText(status?: string): string {
        switch (status) {
            case 'confirmed':
                return 'Onaylandı';
            case 'cancelled':
                return 'İptal Edildi';
            case 'pending':
            default:
                return 'Beklemede';
        }
    }

    isPastAppointment(date: Date): boolean {
        return new Date(date) < new Date();
    }
}

