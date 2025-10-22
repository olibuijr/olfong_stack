const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class TranslationService {
  /**
   * Get authentication headers with token
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Get all translations
   */
  async getAllTranslations(language = null, format = null) {
    try {
      console.log('TranslationService: getAllTranslations called with language:', language);
      
      // Use public endpoint for getting translations by language
      if (language) {
        const url = `${API_BASE_URL}/translations/language/${language}`;
        console.log('TranslationService: Making request to:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('TranslationService: Response status:', response.status);
        console.log('TranslationService: Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('TranslationService: Response data received, success:', data.success);
        console.log('TranslationService: Response data length:', data.data?.length);
        return data;
      }

      // Fallback to authenticated endpoint for admin operations
      const params = new URLSearchParams();
      if (format) params.append('format', format);

      const url = `${API_BASE_URL}/translations${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching translations:', error);
      throw error;
    }
  }

  /**
   * Get translations by section
   */
  async getTranslationsBySection(language = null) {
    try {
      const params = new URLSearchParams();
      if (language) params.append('language', language);
      params.append('format', 'grouped');

      const url = `${API_BASE_URL}/translations?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching translations by section:', error);
      throw error;
    }
  }

  /**
   * Search translations
   */
  async searchTranslations(query, language = null, section = null) {
    try {
      const params = new URLSearchParams();
      if (language) params.append('language', language);
      if (section) params.append('section', section);

      const url = `${API_BASE_URL}/translations/search/${encodeURIComponent(query)}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching translations:', error);
      throw error;
    }
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats() {
    try {
      const url = `${API_BASE_URL}/translations/stats`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching translation stats:', error);
      throw error;
    }
  }

  /**
   * Get recent changes
   */
  async getRecentChanges(limit = 10) {
    try {
      const url = `${API_BASE_URL}/translations/recent?limit=${limit}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching recent changes:', error);
      throw error;
    }
  }

  /**
   * Get a single translation
   */
  async getTranslation(key, language) {
    try {
      const url = `${API_BASE_URL}/translations/${encodeURIComponent(key)}/${language}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching translation:', error);
      throw error;
    }
  }

  /**
   * Create a new translation
   */
  async createTranslation(translationData) {
    try {
      const url = `${API_BASE_URL}/translations`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(translationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating translation:', error);
      throw error;
    }
  }

  /**
   * Update a translation
   */
  async updateTranslation(id, updateData) {
    try {
      const url = `${API_BASE_URL}/translations/${id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating translation:', error);
      throw error;
    }
  }

  /**
   * Delete a translation
   */
  async deleteTranslation(id) {
    try {
      const url = `${API_BASE_URL}/translations/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting translation:', error);
      throw error;
    }
  }

  /**
   * Bulk update translations
   */
  async bulkUpdateTranslations(updates) {
    try {
      const url = `${API_BASE_URL}/translations/bulk-update`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ updates })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk updating translations:', error);
      throw error;
    }
  }

  /**
   * Bulk delete translations
   */
  async bulkDeleteTranslations(ids) {
    try {
      const url = `${API_BASE_URL}/translations/bulk-delete`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ids })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk deleting translations:', error);
      throw error;
    }
  }

  /**
   * Export translations
   */
  async exportTranslations(format = 'json', language = null) {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (language) params.append('language', language);

      const url = `${API_BASE_URL}/translations/export?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle file download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `translations_${language || 'all'}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      console.error('Error exporting translations:', error);
      throw error;
    }
  }

  /**
   * Import translations
   */
  async importTranslations(data, format = 'json') {
    try {
      const url = `${API_BASE_URL}/translations/import`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ data, format })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error importing translations:', error);
      throw error;
    }
  }



  /**
   * Load translations for i18next
   */
  async loadTranslationsForI18next(language) {
    try {
      // Load from API
      const response = await this.getAllTranslations(language);
      
      if (response.success && response.data) {
        // Transform flat translations to nested object
        const nestedTranslations = this.transformToNestedObject(response.data);
        
        // Cache in localStorage
        localStorage.setItem(`translations_${language}`, JSON.stringify(nestedTranslations));
        localStorage.setItem(`translations_${language}_timestamp`, Date.now().toString());
        
        return nestedTranslations;
      }
      
      console.warn('No translations found in API response');
      return {};
    } catch (error) {
      console.error('Failed to load translations from API:', error);
      return {};
    }
  }

  /**
    * Transform flat translations array to nested object
    */
   transformToNestedObject(translations) {
     const nested = {};

     translations.forEach(translation => {
       const keys = translation.key.split('.');
       let current = nested;

       // Navigate/create the nested structure
       for (let i = 0; i < keys.length - 1; i++) {
         if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
           current[keys[i]] = {};
         }
         current = current[keys[i]];
       }

       // Set the final value
       current[keys[keys.length - 1]] = translation.value;
     });

     return nested;
   }

  /**
   * Check if cached translations are still valid
   */
  isCacheValid(language, maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const timestamp = localStorage.getItem(`translations_${language}_timestamp`);
      if (!timestamp) return false;
      
      const age = Date.now() - parseInt(timestamp);
      return age < maxAge;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cached translations
   */
  getCachedTranslations(language) {
    try {
      const cached = localStorage.getItem(`translations_${language}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting cached translations:', error);
      return null;
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(language = null) {
    try {
      if (language) {
        localStorage.removeItem(`translations_${language}`);
        localStorage.removeItem(`translations_${language}_timestamp`);
      } else {
        // Clear all translation cache
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('translations_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Refresh translations and update i18next
   */
  async refreshTranslations(language, i18nextInstance) {
    try {
      // Clear cache for this language
      this.clearCache(language);
      
      // Load fresh translations
      const translations = await this.loadTranslationsForI18next(language);
      
      // Update i18next resources
      if (i18nextInstance && translations) {
        i18nextInstance.addResourceBundle(language, 'translation', translations, true, true);
        i18nextInstance.reloadResources(language);
      }
      
      return translations;
    } catch (error) {
      console.error('Error refreshing translations:', error);
      throw error;
    }
  }
}

export default new TranslationService();