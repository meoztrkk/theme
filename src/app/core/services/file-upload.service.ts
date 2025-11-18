import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from 'app/const';
import { Observable } from 'rxjs';

export interface UploadFileResult {
    fileUrl: string;
    fileName: string;
    containerName: string;
}

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    constructor(private http: HttpClient) {}
    /**
     * Generic file upload method
     * Uploads file to the specified container
     */
    uploadFile(file: File, containerName: string): Observable<UploadFileResult> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<UploadFileResult>(`${API_BASE_URL}/api/app/file-upload/${containerName}`, formData);
    }

    /**
     * Dosya seçildiğinde GUID ile dosya adı oluşturur ve dosya yolunu döndürür
     * @deprecated Use uploadFile instead. This method is kept for backward compatibility.
     */
    generateFileName(file: File, folder: string = 'default'): string {
        if (!file) {
            return '';
        }

        // Dosya uzantısını al
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        // GUID oluştur (basit bir UUID v4 benzeri)
        const guid = this.generateGuid();

        // Dosya adını oluştur: guid.extension
        const fileName = `${guid}.${extension}`;

        // Dosya yolunu döndür: /images/apps/{folder}/{fileName}
        return `/images/apps/${folder}/${fileName}`;
    }

    /**
     * GUID oluşturur (basit UUID v4 benzeri)
     */
    private generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Dosyayı theme/public/images/apps/{folder} klasörüne kaydetmek için
     * @deprecated Use uploadFile instead. This method is kept for backward compatibility.
     */
    prepareFileForSave(file: File, folder: string = 'default'): { file: File; fileName: string; filePath: string } {
        const fileName = this.generateFileName(file, folder);
        const fileNameOnly = fileName.split('/').pop() || '';

        return {
            file: file,
            fileName: fileNameOnly,
            filePath: `theme/public/images/apps/${folder}/${fileNameOnly}`
        };
    }

    /**
     * Get the full image URL for display
     * fileName /api/app/file-upload/{container}/{fileName} formatında olabilir
     * veya eski format /images/apps/{folder}/{fileName} olabilir
     * veya sadece dosya adı olabilir
     */
    getImageUrl(fileName: string, containerName: string = 'default'): string {
        if (!fileName) {
            return '';
        }

        // If it's already a full URL (http/https), return as is (backward compatibility)
        if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
            return fileName;
        }

        // Eğer zaten /api/app/file-upload/ ile başlıyorsa, API base URL ekle
        if (fileName.startsWith('/api/app/file-upload/')) {
            return `${API_BASE_URL}${fileName}`;
        }

        // Eğer zaten /images/apps/ ile başlıyorsa, direkt döndür (eski format)
        if (fileName.startsWith('/images/apps/')) {
            return fileName;
        }

        // Aksi halde, sadece dosya adı ise yeni API formatını kullan
        // Yeni format: /api/app/file-upload/{container}/{fileName}
        return `${API_BASE_URL}/api/app/file-upload/${containerName}/${fileName}`;
    }
}

