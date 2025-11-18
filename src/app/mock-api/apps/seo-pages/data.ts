/* eslint-disable */
/**
 * JSON-LD Schema Templates
 * 
 * Pre-defined JSON-LD templates for common Schema.org types.
 * These templates can be used in the SEO page editor to quickly add structured data.
 */
export const jsonLdTemplates: { [key: string]: any } = {
    faqpage: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'İade süresi kaç gündür?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ürün teslim tarihinden itibaren 30 gündür.'
                }
            },
            {
                '@type': 'Question',
                name: 'Hangi kargo şirketleriyle çalışıyorsunuz?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yurtiçi ve MNG kargo ile çalışmaktayız.'
                }
            }
        ]
    },
    howto: {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Yeni Lastik Takma Rehberi',
        step: [
            {
                '@type': 'HowToStep',
                name: 'Aracı kriko ile kaldırın',
                text: 'El frenini çekin ve kriko ile aracı güvenli bir şekilde yükseltin.'
            },
            {
                '@type': 'HowToStep',
                name: 'Bijonları sökün ve tekeri çıkarın',
                text: 'Bijon anahtarı kullanarak tekerlek somunlarını gevşetin ve tekerleği çıkarın.'
            }
        ],
        totalTime: 'PT1H'
    },
    product: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: 'Ultra Hızlı SSD Disk 1TB',
        image: 'https://example.com/disk.jpg',
        description: '550 MB/s okuma hızına sahip harici SSD.',
        sku: 'SSD-UH1000',
        brand: {
            '@type': 'Brand',
            name: 'HızTech'
        },
        offers: {
            '@type': 'Offer',
            url: 'https://example.com/ssd-satin-al',
            priceCurrency: 'TRY',
            price: '2450.00',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '150'
        }
    },
    recipe: {
        '@context': 'https://schema.org/',
        '@type': 'Recipe',
        name: 'Hızlı Domates Çorbası',
        image: 'https://example.com/corba.jpg',
        author: {
            '@type': 'Person',
            name: 'Şef Mehmet'
        },
        datePublished: '2025-11-18',
        prepTime: 'PT5M',
        cookTime: 'PT15M',
        recipeIngredient: ['4 adet domates', '1 yemek kaşığı tereyağı', 'Tuz, karabiber'],
        recipeInstructions: 'Domatesleri doğrayın, tereyağında kavurun, su ekleyip kaynatın.',
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '90'
        }
    },
    localbusiness: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Kitaplık Cafe',
        image: 'https://example.com/kitaplik-cafe.jpg',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Okuyucu Sokak No: 7',
            addressLocality: 'Ankara',
            postalCode: '06000',
            addressCountry: 'TR'
        },
        telephone: '+903121234567',
        priceRange: '$$'
    },
    jobposting: {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: 'Kıdemli Yazılım Geliştirici',
        description: 'Angular ve .NET Core deneyimi olan kıdemli yazılım geliştirici aranıyor.',
        datePosted: '2025-11-18',
        validThrough: '2025-12-31',
        employmentType: 'FULL_TIME',
        hiringOrganization: {
            '@type': 'Organization',
            name: 'Yazılım Çözümleri A.Ş.'
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressRegion: 'İstanbul'
            }
        }
    },
    event: {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: 'Büyük Müzik Festivali 2026',
        startDate: '2026-06-15T18:00:00+03:00',
        endDate: '2026-06-18T00:00:00+03:00',
        location: {
            '@type': 'Place',
            name: 'Sahil Açık Hava Alanı',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'İzmir'
            }
        }
    },
    movie: {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: 'Uzay Yolculuğu',
        director: {
            '@type': 'Person',
            name: 'Cem Yılmaz'
        },
        review: {
            '@type': 'Review',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: '4.0',
                bestRating: '5'
            },
            author: {
                '@type': 'Person',
                name: 'Sinema Eleştirmeni'
            },
            reviewBody: 'Görsel efektler etkileyici, senaryo biraz zayıf.'
        }
    },
    video: {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: 'SQL Temelleri: 1. Bölüm',
        description: 'Yeni başlayanlar için temel SQL komutları.',
        uploadDate: '2025-10-01T08:00:00+08:00',
        duration: 'PT15M30S',
        thumbnailUrl: 'https://example.com/videolar/sql-intro.jpg',
        contentUrl: 'https://example.com/videolar/sql-intro.mp4',
        embedUrl: 'https://www.youtube.com/embed/sql-intro-video'
    },
    article: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': 'https://example.com/blog/makale-basligi'
        },
        headline: 'Yapay Zeka Etiği Üzerine Son Tartışmalar',
        image: 'https://example.com/ai-etik.jpg',
        datePublished: '2025-11-18T10:00:00+03:00',
        author: {
            '@type': 'Person',
            name: 'Ege Akıncı'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Dijital Dünya Dergisi',
            logo: {
                '@type': 'ImageObject',
                url: 'https://example.com/logo/dd-logo.png'
            }
        }
    }
};

