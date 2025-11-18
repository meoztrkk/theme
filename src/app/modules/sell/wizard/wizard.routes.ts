import { Routes } from '@angular/router';
import { WizardComponent } from 'app/modules/sell/wizard/wizard.component';
import { seoKeys } from 'app/mock-api/apps/seo-pages/seo-keys.data';

const WIZARD_SEO_KEY = seoKeys.find(k => k.value === 'wizard')?.value || 'wizard';

export default [
    {
        path: '',
        component: WizardComponent,
        data: {
            seoKey: WIZARD_SEO_KEY,
            seo: {
                title: 'Araç Değerleme Sihirbazı | Direkt Satış',
                description: 'Aracınızın değerini öğrenmek için adım adım rehberlik eden değerleme sihirbazı. Model, özellikler ve durum bilgilerinizi girerek anında fiyat teklifi alın.',
                keywords: ['araç değerleme sihirbazı', 'araç fiyat hesaplama', 'araç değer tespiti'],
                ogType: 'website',
                jsonLd: [
                    {
                        '@context': 'https://schema.org',
                        '@type': 'HowTo',
                        name: 'Aracını Değerinde Satma Sihirbazı',
                        description: 'Aracının marka, model, yıl, kilometre ve durum bilgilerini adım adım girerek sana özel fiyat tekliflerini görebileceğin yönlendirmeli satış sihirbazı.',
                        step: [
                            {
                                '@type': 'HowToStep',
                                name: 'Araç bilgilerini gir',
                                text: 'Marka, model, model yılı, motor tipi ve kilometre gibi temel araç bilgilerini sihirbazda doldur.'
                            },
                            {
                                '@type': 'HowToStep',
                                name: 'Ekspertiz ve durum bilgilerini tamamla',
                                text: 'Bakım durumu, hasar kaydı, lastik durumu ve diğer ekspertiz detaylarını belirt.'
                            },
                            {
                                '@type': 'HowToStep',
                                name: 'İletişim ve randevu bilgilerini paylaş',
                                text: 'Telefon numaranı ve sana uygun tarih/saat aralığını girerek randevu iste.'
                            },
                            {
                                '@type': 'HowToStep',
                                name: 'Teklifleri gör ve satışını tamamla',
                                text: 'Sana sunulan teklifleri incele, uygun olanı seç ve aracını güvenli şekilde sat.'
                            }
                        ]
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'Aracımın değerini nasıl hesaplıyorsunuz?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Araç marka, model, yıl, kilometre, bakım ve hasar durumu gibi bilgilerini piyasadaki güncel verilerle birlikte değerlendirerek yaklaşık piyasa değerini hesaplıyoruz.'
                                }
                            },
                            {
                                '@type': 'Question',
                                name: 'Teklif almak ücretli mi?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Hayır. Aracın için fiyat teklifi almak tamamen ücretsizdir, teklif almak için herhangi bir ücret ödemezsin.'
                                }
                            },
                            {
                                '@type': 'Question',
                                name: 'Aracımı ne kadar sürede satabilirim?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Aracının durumu ve teklif sürecine göre değişmekle birlikte, çoğu kullanıcı aracını çok kısa sürede, hatta aynı gün içerisinde satabilmektedir.'
                                }
                            }
                        ]
                    }
                ]
            },
        },
    },
] as Routes;
