import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { DateTime } from 'luxon';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';

export interface AppointmentDialogData {
    offerId?: number;
    offerName: string;
    location: string;
    price: number;
    appointmentId?: number;
    existingDate?: Date;
    existingTime?: string;
    isEditMode?: boolean;
}

@Component({
    selector: 'app-appointment-dialog',
    templateUrl: './appointment-dialog.component.html',
    styleUrls: ['./appointment-dialog.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatSelectModule,
        MatButtonModule,
        MatNativeDateModule,
    ],
})
export class AppointmentDialogComponent {
    appointmentForm: FormGroup;
    timeSlots: string[] = [];
    isSubmitting = false;

    constructor(
        private dialogRef: MatDialogRef<AppointmentDialogComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: AppointmentDialogData,
        private _authService: AuthService
    ) {
        // Saat slotlarını oluştur (09:00 - 18:00, 30 dakikalık aralıklarla)
        this.generateTimeSlots();

        // Güncelleme modunda mevcut değerleri yükle
        const initialDate = data.isEditMode && data.existingDate ? data.existingDate : null;
        const initialTime = data.isEditMode && data.existingTime ? data.existingTime : '';

        this.appointmentForm = this.fb.group({
            date: [initialDate, [Validators.required]],
            time: [initialTime, [Validators.required]],
        });
    }

    private generateTimeSlots(): void {
        const slots: string[] = [];
        for (let hour = 9; hour < 18; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
            slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        this.timeSlots = slots;
    }

    get minDate(): Date {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    private getAppointmentsStorageKey(): string {
        const token = this._authService.accessToken;
        if (!token) {
            return 'appointments_anonymous';
        }
        const userId = AuthUtils.getUserIdFromToken(token);
        return userId ? `appointments_${userId}` : 'appointments_anonymous';
    }

    submitAppointment(): void {
        if (this.appointmentForm.invalid) {
            this.appointmentForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const formValue = this.appointmentForm.getRawValue();
        const appointmentData = {
            id: this.data.appointmentId,
            offerId: this.data.offerId,
            offerName: this.data.offerName,
            location: this.data.location,
            price: this.data.price,
            date: formValue.date,
            time: formValue.time,
            datetime: this.combineDateTime(formValue.date, formValue.time),
        };

        // TODO: Backend API çağrısı burada yapılacak
        // Şimdilik mock olarak başarılı kabul ediyoruz
        setTimeout(() => {
            this.isSubmitting = false;

            const storageKey = this.getAppointmentsStorageKey();
            if (this.data.isEditMode && this.data.appointmentId) {
                // Güncelleme modu
                const savedAppointments = localStorage.getItem(storageKey);
                if (savedAppointments) {
                    const appointments = JSON.parse(savedAppointments);
                    const index = appointments.findIndex((apt: any) => apt.id === this.data.appointmentId);
                    if (index !== -1) {
                        appointments[index] = {
                            ...appointments[index],
                            ...appointmentData,
                            date: appointmentData.date instanceof Date
                                ? appointmentData.date.toISOString()
                                : appointmentData.date,
                        };
                        localStorage.setItem(storageKey, JSON.stringify(appointments));
                    }
                }
            } else {
                // Yeni randevu oluşturma
                const savedAppointments = localStorage.getItem(storageKey);
                const appointments = savedAppointments ? JSON.parse(savedAppointments) : [];
                const newAppointment = {
                    id: Date.now(), // Geçici ID
                    ...appointmentData,
                    status: 'pending', // Varsayılan durum
                };
                appointments.push(newAppointment);
                localStorage.setItem(storageKey, JSON.stringify(appointments));
            }

            this.dialogRef.close({ success: true, data: appointmentData });
        }, 1000);
    }

    private combineDateTime(date: Date, time: string): string {
        if (!date || !time) return '';
        const [hours, minutes] = time.split(':');
        const dt = DateTime.fromJSDate(date)
            .set({ hour: parseInt(hours), minute: parseInt(minutes) });
        return dt.toISO() || '';
    }

    close(): void {
        this.dialogRef.close({ success: false });
    }
}

