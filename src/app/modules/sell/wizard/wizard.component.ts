import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import {
    IdNameDto,
    SellWizardService,
} from 'app/core/services/sell-wizard.service';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';

interface WizardState {
    step: number;
    furthest: number;
    year?: number;
    brandId?: number;
    modelId?: number;
    bodyTypeId?: number;
    transmissionTypeId?: number;
    fuelTypeId?: number;
    colorId?: number;
    trimId?: number;
    plate?: string;
    kilometer?: number;
    cityId?: number;
    accident?: string;
    accidentNote?: string;
    tire?: string | number;
    maintenance?: string | number;
    spareKey?: string | number;
    saleTime?: string;
    // label'lar
    yearName?: string;
    brandName?: string;
    modelName?: string;
    bodyTypeName?: string;
    transmissionName?: string;
    fuelName?: string;
    colorName?: string;
    trimName?: string;
    cityName?: string;
    saleTimeLabel?: string;
    extras: string[];
    panels: Record<string, number>;
}

@Component({
    selector: 'app-sell-wizard',
    templateUrl: './wizard.component.html',
    styleUrls: ['./wizard.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatCheckboxModule,
        MatMenuModule,
        MatRadioModule,
        MatDialogModule,
        ReactiveFormsModule,
    ],
})
export class WizardComponent implements OnInit {
    stepTitles = [
        'Model Yılı',
        'Marka',
        'Model',
        'Gövde Tipi',
        'Şanzıman',
        'Yakıt Türü',
        'Renk',
        'Donanım',
        'Plaka',
        'Kilometre',
        'Lokasyon',
        'Tramer',
        'Ek Bilgi',
        'Satış Zamanı',
        'Ek Özellikler',
    ];

    stepIcons = [
        'event', // 1 - yıl
        'emoji_events', // 2 - marka
        'directions_car', // 3 - model
        'local_shipping', // 4 - gövde
        'settings', // 5 - şanzıman
        'local_gas_station', // 6 - yakıt
        'palette', // 7 - renk
        'view_list', // 8 - donanım
        'pin', // 9 - plaka
        'speed', //10 - km
        'place', //11 - şehir
        'fact_check', //12 - tramer
        'build', //13 - bakım
        'schedule', //14 - satış zamanı
        'done_all', //15 - özet
    ];

    // teklif listesi için basit mock

    offers = [
        {
            name: 'VavaCars',
            price: 655000,
            appointment: '31 Eki 05:58',
            location: 'Kadıköy',
            logo: '/images/apps/sell/vavacars.jpg',
        },
        {
            name: 'Otoplus',
            price: 637000,
            appointment: '30 Eki 12:58',
            location: 'Maslak',
            logo: '/images/apps/sell/otoplus.png',
        },
        {
            name: 'OtopBid',
            price: 640000,
            appointment: '30 Eki 12:58',
            location: 'Üsküdar',
            logo: '/images/apps/sell/otobid.png',
        },
        {
            name: 'OtopBid',
            price: 660000,
            appointment: '29 Eki 12:58',
            location: 'Üsküdar',
            logo: '/images/apps/sell/otobid.png',
        },
        {
            name: 'OtopBid',
            price: 660000,
            appointment: '28 Eki 12:58',
            location: 'Üsküdar',
            logo: '/images/apps/sell/otobid.png',
        },
    ];

    // 12. adım için parçalar
    panelDefs = [
        { key: 'FrontBumper', label: 'Ön tampon' },
        { key: 'Hood', label: 'Motor kaputu' },
        { key: 'Roof', label: 'Tavan' },
        { key: 'TrunkLid', label: 'Arka kaput' },
        { key: 'RearBumper', label: 'Arka tampon' },
        { key: 'LeftFrontFender', label: 'Sol ön çamurluk' },
        { key: 'LeftFrontDoor', label: 'Sol ön kapı' },
        { key: 'LeftRearDoor', label: 'Sol arka kapı' },
        { key: 'LeftRearFender', label: 'Sol arka çamurluk' },
        { key: 'RightFrontFender', label: 'Sağ ön çamurluk' },
        { key: 'RightFrontDoor', label: 'Sağ ön kapı' },
        { key: 'RightRearDoor', label: 'Sağ arka kapı' },
        { key: 'RightRearFender', label: 'Sağ arka çamurluk' },
    ];

    panelStatusDefs = [
        { value: 0, label: 'Orijinal' },
        { value: 1, label: 'Lokal Boyalı' },
        { value: 2, label: 'Boyalı' },
        { value: 3, label: 'Değişen' },
    ];

    // genel tramer dropdown’u
    accidentOptions = [
        { value: '', label: 'Seçiniz…' },
        { value: 'Yok', label: 'Orijinal ve tramer yok' },
        { value: 'Var', label: 'Tramer kaydı var' },
        { value: 'Bilinmiyor', label: 'Bilmiyorum' },
    ];

    autoSteps = new Set([1, 2, 3, 4, 5, 6, 7, 8, 11, 14]);

    // ✅ signal oluşturma
    s = signal<WizardState>({
        step: 1,
        furthest: 1,
        extras: [],
        panels: {},
    });

    years: number[] = [];
    brands: IdNameDto[] = [];
    models: IdNameDto[] = [];
    bodyTypes: IdNameDto[] = [];
    transmissions: IdNameDto[] = [];
    fuels: IdNameDto[] = [];
    colors: IdNameDto[] = [];
    cities: IdNameDto[] = [];
    trims: IdNameDto[] = [];
    extras: string[] = [];
    saleTimes: IdNameDto[] = [];
    tireStatuses: IdNameDto[] = [];
    maintenanceStatuses: IdNameDto[] = [];
    spareKeyStatuses: IdNameDto[] = [];

    plateCtrl = new FormControl<string>('');
    kmCtrl = new FormControl<number | null>(null);
    plateMatcher: ErrorStateMatcher = { isErrorState: () => !!this.plateError };
    kmMatcher: ErrorStateMatcher = { isErrorState: () => !!this.kmError };

    constructor(
        private wiz: SellWizardService,
        private dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    private buildCreatePayload() {
        const st = this.s();
        const tramerVarMi = st.accident === 'Var' ? true : false;
        const tramerHamMetin = st.accidentNote || null;
        return {
            durumId : 13, // yeni
            year: st.year ?? null,
            markaId: st.brandId ?? null,
            modelId: st.modelId ?? null,
            varyantId: st.trimId ?? null,
            govdeTipiId: st.bodyTypeId ?? null,
            sanzimanTipiId: st.transmissionTypeId ?? null,
            yakitTuruId: st.fuelTypeId ?? null,
            renkId: st.colorId ?? null,
            ilId: st.cityId ?? null,
            ilceId: null,
            lastikDurum: Number(st.tire),
            bakimDurum: Number(st.maintenance),
            satisZaman: Number(st.saleTime),
            yedekAnahtarDurum: Number(st.spareKey),
            plaka: st.plate || null,
            kilometre: st.kilometer ?? null,
            tramerVarMi: tramerVarMi,
            tramerHamMetin: tramerHamMetin,
            ozellikIdList: [],
        };
    }

    ngOnInit(): void {
        this.wiz.getYears().subscribe((y) => (this.years = y));
        this.wiz.getBrands().subscribe((b) => (this.brands = b));
        this.wiz.getColors().subscribe((c) => (this.colors = c));
        this.wiz.getCities().subscribe((c) => (this.cities = c));
        this.wiz.getExtras().subscribe((e) => (this.extras = e));
        this.wiz.getEnumLookups().subscribe((look) => {
            this.tireStatuses = look.tireStatuses ?? [];
            this.maintenanceStatuses = look.maintenanceStatuses ?? [];
            this.spareKeyStatuses = look.spareKeyStatuses ?? [];
            this.saleTimes = look.saleTimes ?? [];
        });

        this.route.queryParams.subscribe((params) => {
            const initialYear = Number(params['year']);
            const initialBrandId = Number(params['brandId']);

            if (initialYear && initialBrandId) {
                setTimeout(() => {
                    const brand = this.brands.find(
                        (b) => Number(b.id) === initialBrandId
                    );

                    if (brand) {
                        this.resetFromStep(1);

                        let newState: WizardState = {
                            ...this.s(),
                            year: initialYear,
                            yearName: String(initialYear),
                            brandId: initialBrandId,
                            brandName: brand.name,
                            step: 3, // Otomatik olarak bir sonraki adım olan Model'e geçiyoruz
                            furthest: 3,
                        };

                        this.s.set(newState);
                        this.wiz
                            .getModels(initialBrandId)
                            .subscribe((m) => (this.models = m));
                    }
                }, 500);
            }
        });
    }

    get step() {
        return this.s().step;
    }

    setStep(n: number) {
        const st = this.s();
        const max = this.getMaxReachableStep(st);
        if (n <= max) {
            this.s.set({ ...st, step: n });
        }
    }

    next() {
        const st = this.s();
        if (!this.isStepFilled(st.step, st)) {
            return;
        }

        const max = this.getMaxReachableStep(st);
        const nextStep = st.step + 1;
        if (nextStep > max + 1) {
            return;
        }

        if (st.step < this.stepTitles.length) {
            this.s.set({
                ...st,
                step: nextStep,
                furthest: Math.max(st.furthest, nextStep),
            });
        }
    }

    back() {
        const st = this.s();
        if (st.step > 1) {
            this.s.set({ ...st, step: st.step - 1 });
        }
    }

    selectYear(y: number) {
        this.resetFromStep(1);
        const st = this.s();
        this.s.set({ ...st, year: y, yearName: String(y) });
        if (this.autoSteps.has(1)) this.next();
    }

    selectBrand(b: IdNameDto) {
        this.resetFromStep(2);
        const st = this.s();
        this.s.set({
            ...st,
            brandId: Number(b.id),
            brandName: b.name,
        });
        this.wiz.getModels(Number(b.id)).subscribe((m) => (this.models = m));
        if (this.autoSteps.has(2)) this.next();
    }

    selectModel(m: IdNameDto) {
        this.resetFromStep(3);
        const st = this.s();
        const modelId = Number(m.id);

        this.s.set({
            ...st,
            modelId,
            modelName: m.name,
        });

        this.wiz.getBodyTypes().subscribe((bt) => (this.bodyTypes = bt));
        this.wiz
            .getTransmissions()
            .subscribe((tr) => (this.transmissions = tr));
        this.wiz.getFuels().subscribe((fu) => (this.fuels = fu));

        this.loadTrims(modelId);

        if (this.autoSteps.has(3)) this.next();
    }

    selectBodyType(b: IdNameDto) {
        this.resetFromStep(4);
        const st = this.s();
        this.s.set({ ...st, bodyTypeId: Number(b.id), bodyTypeName: b.name });
        if (this.autoSteps.has(4)) this.next();
    }

    selectTransmission(t: IdNameDto) {
        this.resetFromStep(5);
        const st = this.s();
        this.s.set({
            ...st,
            transmissionTypeId: Number(t.id),
            transmissionName: t.name,
        });
        if (this.autoSteps.has(5)) this.next();
    }

    selectFuel(f: IdNameDto) {
        this.resetFromStep(6);
        const st = this.s();
        this.s.set({ ...st, fuelTypeId: Number(f.id), fuelName: f.name });
        if (this.autoSteps.has(6)) this.next();
    }

    selectColor(c: IdNameDto) {
        this.resetFromStep(7);
        const st = this.s();
        this.s.set({ ...st, colorId: c.id as number, colorName: c.name });
        if (this.autoSteps.has(7)) this.next();
    }

    loadTrims(modelId: number) {
        this.wiz.getTrims(modelId).subscribe((tr) => (this.trims = tr));
    }

    selectTrim(t: IdNameDto) {
        this.resetFromStep(8);
        const st = this.s();
        this.s.set({ ...st, trimId: Number(t.id), trimName: t.name });
        if (this.autoSteps.has(8)) this.next();
    }

    plateError: string | null = null;
    onPlateInput(event: Event) {
        const input = (event.target as HTMLInputElement).value;
        let cleaned = input.replace(/\s+/g, '').toUpperCase();
        const pattern = /^([0-9]{2})([A-Z]{1,4})([0-9]{1,4})$/;
        if (cleaned && !pattern.test(cleaned)) {
            this.plateError = 'Geçersiz plaka formatı (örn: 34ABC123)';
        } else {
            this.plateError = null;
        }
        const st = this.s();
        this.s.set({
            ...st,
            plate: cleaned,
        });
    }

    kmError: string | null = null;
    onKmInput(event: Event) {
        const val = Number((event.target as HTMLInputElement).value);
        const st = this.s();
        if (isNaN(val)) {
            this.kmError = 'Geçersiz değer';
            this.s.set({ ...st, kilometer: undefined });
            return;
        }
        if (val < 6000) {
            this.kmError = "Kilometre 6.000'den büyük olmalıdır";
        } else if (val > 200000) {
            this.kmError = "Kilometre 200.000'den büyük olamaz";
        } else {
            this.kmError = null;
        }
        this.s.set({
            ...st,
            kilometer: val,
        });
    }

    selectCity(c: IdNameDto) {
        this.resetFromStep(11);
        const st = this.s();
        this.s.set({ ...st, cityId: Number(c.id), cityName: c.name });
        if (this.autoSteps.has(11)) this.next();
    }

    selectSaleTime(t: IdNameDto) {
        this.resetFromStep(14);
        const st = this.s();
        this.s.set({ ...st, saleTime: String(t.id), saleTimeLabel: t.name });
        if (this.autoSteps.has(14)) this.next();
    }

    toggleExtra(x: string, checked: boolean) {
        const st = this.s();
        let arr = [...st.extras];
        if (checked && !arr.includes(x)) arr.push(x);
        if (!checked) arr = arr.filter((e) => e !== x);
        this.s.set({ ...st, extras: arr });
    }

    selectTireStatus(id: number) {
        this.resetFromStep(14);
        const st = this.s();
        const newState = { ...st, tire: id };
        this.s.set(newState);

        // 3'ü de seçiliyse otomatik ilerle
        if (this.isStepFilled(13, newState) && this.step === 13) {
            this.next();
        }
    }

    selectMaintenanceStatus(id: number) {
        this.resetFromStep(14);
        const st = this.s();
        const newState = { ...st, maintenance: id };
        this.s.set(newState);

        if (this.isStepFilled(13, newState) && this.step === 13) {
            this.next();
        }
    }

    selectSpareKeyStatus(id: number) {
        this.resetFromStep(14);
        const st = this.s();
        const newState = { ...st, spareKey: id };
        this.s.set(newState);

        if (this.isStepFilled(13, newState) && this.step === 13) {
            this.next();
        }
    }
    breadcrumb = computed(() => {
        const st = this.s();
        const items: { label: string; step: number }[] = [];
        if (st.year)
            items.push({ label: st.yearName ?? String(st.year), step: 1 });
        if (st.brandId) items.push({ label: st.brandName!, step: 2 });
        if (st.modelId) items.push({ label: st.modelName!, step: 3 });
        if (st.bodyTypeId) items.push({ label: st.bodyTypeName!, step: 4 });
        if (st.transmissionTypeId)
            items.push({ label: st.transmissionName!, step: 5 });
        if (st.fuelTypeId) items.push({ label: st.fuelName!, step: 6 });
        if (st.colorId) items.push({ label: st.colorName!, step: 7 });
        if (st.trimId) items.push({ label: st.trimName!, step: 8 });
        if (st.plate) items.push({ label: st.plate!, step: 9 });
        if (st.kilometer) items.push({ label: `${st.kilometer} km`, step: 10 });
        if (st.cityId) items.push({ label: st.cityName!, step: 11 });
        if (st.saleTime) items.push({ label: st.saleTimeLabel!, step: 14 });
        return items;
    });

    onExtraCheckboxChange(extra: string, checked: boolean) {
        const st = this.s();
        const current = st.extras ? [...st.extras] : [];

        if (checked) {
            if (!current.includes(extra)) {
                current.push(extra);
            }
        } else {
            const idx = current.indexOf(extra);
            if (idx > -1) {
                current.splice(idx, 1);
            }
        }

        this.s.set({
            ...st,
            extras: current,
        });
    }

    maxGridItems = 30;

    getGridItems<T>(list: T[] | null | undefined): T[] {
        if (!list) return [];
        if (list.length <= this.maxGridItems) {
            return list;
        }
        return list.slice(0, this.maxGridItems - 1);
    }

    getRestItems<T>(list: T[] | null | undefined): T[] {
        if (!list) return [];
        if (list.length > this.maxGridItems - 1) {
            return list.slice(this.maxGridItems - 1);
        }
        return [];
    }

    hasMore<T>(list: T[] | null | undefined): boolean {
        return !!list && list.length > this.maxGridItems;
    }

    isStepFilled(step: number, st: WizardState): boolean {
        switch (step) {
            case 1: // yıl
                return !!st.year;
            case 2: // marka
                return !!st.brandId;
            case 3: // model
                return !!st.modelId;
            case 4: // gövde
                return !!st.bodyTypeId;
            case 5: // şanzıman
                return !!st.transmissionTypeId;
            case 6: // yakıt
                return !!st.fuelTypeId;
            case 7: // renk
                return !!st.colorId;
            case 8: // donanım/varyant
                return !!st.trimId;
            case 9: // plaka
                return !!st.plate && !this.plateError;
            case 10: // km
                return (
                    st.kilometer !== undefined &&
                    st.kilometer >= 6000 &&
                    st.kilometer <= 200000 &&
                    !this.kmError
                );
            case 11: // şehir
                return !!st.cityId;
            case 12: // tramer
                return !!st.accident && st.accident.trim().length > 0;
            case 13: // lastik/bakım/yedek anahtar
                return !!st.tire && !!st.maintenance && !!st.spareKey;
            case 14: // satış zamanı
                return !!st.saleTime;
            case 15:
                return true;
            case 16:
                return true;
            default:
                return true;
        }
    }

    // mevcut state'e göre en fazla hangi adıma kadar gidilebilir?
    getMaxReachableStep(st: WizardState): number {
        for (let i = 1; i <= this.stepTitles.length; i++) {
            if (!this.isStepFilled(i, st)) {
                return i - 1 >= 1 ? i - 1 : 1;
            }
        }
        return this.stepTitles.length;
    }

    resetFromStep(step: number) {
        const st = this.s();

        const cleared: Partial<WizardState> = {};

        // step'ten sonraki her şeyi temizle
        if (step <= 1) {
            cleared.brandId = undefined;
            cleared.brandName = undefined;
        }
        // 2'den sonrası
        if (step <= 2) {
            cleared.modelId = undefined;
            cleared.modelName = undefined;
        }
        if (step <= 3) {
            cleared.bodyTypeId = undefined;
            cleared.bodyTypeName = undefined;

            cleared.transmissionTypeId = undefined;
            cleared.transmissionName = undefined;

            cleared.fuelTypeId = undefined;
            cleared.fuelName = undefined;

            cleared.colorId = undefined;
            cleared.colorName = undefined;

            cleared.trimId = undefined;
            cleared.trimName = undefined;
        }
        if (step <= 9) {
            cleared.plate = undefined;
        }
        if (step <= 10) {
            cleared.kilometer = undefined;
        }
        if (step <= 11) {
            cleared.cityId = undefined;
            cleared.cityName = undefined;
        }
        if (step <= 12) {
            cleared.accident = undefined;
            cleared.accidentNote = undefined;
        }
        if (step <= 13) {
            cleared.tire = undefined;
            cleared.maintenance = undefined;
            cleared.spareKey = undefined;
        }
        if (step <= 14) {
            cleared.saleTime = undefined;
            cleared.saleTimeLabel = undefined;
        }

        this.s.set({
            ...st,
            ...cleared,
        });
    }

    // plakayı normalize et: boşluk, -, . at; büyük harf yap
    normalizePlate(raw: string): string {
        if (!raw) return '';
        // sadece harf ve rakam
        const cleaned = raw.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
        return cleaned;
    }

    onPanelStatusChange(panelKey: string, val: number) {
        const st = this.s();
        const panels = { ...(st.panels || {}) };
        panels[panelKey] = val;
        this.s.set({
            ...st,
            panels,
        });
        this.tryAutoNextTramer();
    }

    onAccidentChange(val: string) {
        const st = this.s();
        this.s.set({
            ...st,
            accident: val,
        });
        this.tryAutoNextTramer();
    }

    onAccidentNoteChange(val: string) {
        const st = this.s();
        this.s.set({
            ...st,
            accidentNote: val,
        });
    }

    // “Orijinal ve tramer yok →” butonu
    setNoAccidentAllOriginal() {
        const st = this.s();
        const panels: Record<string, number> = {};
        this.panelDefs.forEach((p) => (panels[p.key] = 0));

        this.s.set({
            ...st,
            panels,
            accident: 'Yok',
            accidentNote: '',
        });

        // 12. adımdayken otomatik ileri
        if (this.step === 12) {
            this.next();
        }
    }

    // 12. adım seçimi tamamlandı mı kontrolü
    tryAutoNextTramer() {
        const st = this.s();
        if (this.isStepFilled(12, st) && this.step === 12) {
            this.next();
        }
    }

    // svg'de göstermek için class üret
    getPanelStatusClass(panelKey: string): string {
        const st = this.s();
        const val = st.panels?.[panelKey] ?? 0; // yoksa 0 = Orijinal
        switch (val) {
            case 0:
                return 'status-original';
            case 1:
                return 'status-local';
            case 2:
                return 'status-painted';
            case 3:
                return 'status-changed';
            default:
                return 'status-original';
        }
    }

    onSvgPanelClick(panelKey: string) {
        const st = this.s();
        const current = st.panels?.[panelKey] ?? 0;
        const next = (current + 1) % 4; // 0,1,2,3 sonra tekrar 0
        const panels = { ...(st.panels || {}) };
        panels[panelKey] = next;

        const newState = {
            ...st,
            panels,
        };

        this.s.set(newState);
        this.tryAutoNextTramer();
    }

    onGetOfferClick() {
        if (
            !this.isStepFilled(14, this.s()) ||
            !this.isStepFilled(15, this.s())
        )
            return;

        const ref = this.dialog.open(AuthDialogComponent, {
            width: '420px',
            panelClass: 'auth-dialog',
        });

        ref.afterClosed().subscribe((res) => {
            console.log('auth dialog closed with:', res);

            // GEÇİCİ: login başarılı / başarısız fark etmeksizin, sadece iptal değilse devam et
            if (
                res !== 'cancel' &&
                res !== 'close' &&
                res !== null &&
                res !== undefined
            ) {
                const payload = this.buildCreatePayload();
                console.log('payload:', payload);

                this.wiz.createSellRequest(payload).subscribe({
                    next: ({ id }) => {
                        console.log('talep oluşturuldu, id:', id);
                        this.router.navigate(['/offers', id]);
                    },
                    error: (err) => {
                        console.error('createSellRequest hata:', err);
                    },
                });
            }
        });

        // ref.afterClosed().subscribe((res) => {
        //     if (res === 'authenticated') {
        //         const payload = this.buildCreatePayload();

        //         this.wiz.createSellRequest(payload).subscribe(({ id }) => {
        //             // offers sayfasına yönlendir
        //             this.router.navigate(['offers', id], {
        //                 relativeTo: this.route.parent ?? this.route,
        //             });
        //         });
        //     }
        // });
    }
}
