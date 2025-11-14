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

export interface AppointmentDialogData {
    offerId?: number;
    offerName: string;
    location: string;
    price: number;
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
        @Inject(MAT_DIALOG_DATA) public data: AppointmentDialogData
    ) {
        // Saat slotlarını oluştur (09:00 - 18:00, 30 dakikalık aralıklarla)
        this.generateTimeSlots();

        this.appointmentForm = this.fb.group({
            date: [null, [Validators.required]],
            time: ['', [Validators.required]],
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

    submitAppointment(): void {
        if (this.appointmentForm.invalid) {
            this.appointmentForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const formValue = this.appointmentForm.getRawValue();
        const appointmentData = {
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

