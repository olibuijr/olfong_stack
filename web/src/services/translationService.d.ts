declare class TranslationService {
  getAuthHeaders(): Record<string, string>;
  getAllTranslations(language?: string | null, format?: string | null): Promise<any>;
  getTranslationsBySection(language?: string | null): Promise<any>;
  searchTranslations(query: string, language?: string | null, section?: string | null): Promise<any>;
  getTranslationStats(): Promise<any>;
  getRecentChanges(limit?: number): Promise<any>;
  getTranslation(key: string, language: string): Promise<any>;
  createTranslation(translationData: any): Promise<any>;
  updateTranslation(id: string, updateData: any): Promise<any>;
  deleteTranslation(id: string): Promise<any>;
  bulkUpdateTranslations(updates: any[]): Promise<any>;
  bulkDeleteTranslations(ids: string[]): Promise<any>;
  exportTranslations(format?: string, language?: string | null): Promise<any>;
  importTranslations(data: any, format?: string): Promise<any>;
  seedFromFiles(): Promise<any>;
  loadTranslationsForI18next(language: string): Promise<any>;
  transformToNestedObject(translations: any[]): Record<string, any>;
  loadStaticTranslations(language: string): Promise<any>;
  isCacheValid(language: string, maxAge?: number): boolean;
  getCachedTranslations(language: string): any;
  clearCache(language?: string | null): void;
  refreshTranslations(language: string, i18nextInstance?: any): Promise<any>;
}

declare const translationService: TranslationService;
export default translationService;
