import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'pt';

const STORAGE_KEY = 'lang';
const DEFAULT_LANGUAGE: AppLanguage = 'en';
const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'pt'];

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translate: TranslateService) {
    this.translate.addLangs(SUPPORTED_LANGUAGES);
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);
    this.translate.use(this.getLanguage());
  }

  setLanguage(language: AppLanguage): void {
    const next = this.normalize(language);
    localStorage.setItem(STORAGE_KEY, next);
    this.translate.use(next);
  }

  getLanguage(): AppLanguage {
    return this.normalize(localStorage.getItem(STORAGE_KEY));
  }

  getSupportedLanguages(): AppLanguage[] {
    return [...SUPPORTED_LANGUAGES];
  }

  private normalize(value: string | null): AppLanguage {
    return SUPPORTED_LANGUAGES.includes(value as AppLanguage)
      ? (value as AppLanguage)
      : DEFAULT_LANGUAGE;
  }
}
