import { StorageService } from './StorageService';

const DEFAULT_STORAGE_KEY = 'linkHubData';

export class ChromeStorageService<T> extends StorageService<T> {
  constructor(storageKey = DEFAULT_STORAGE_KEY) {
    super(storageKey);
  }

  private get chromeStorage() {
    return (globalThis as any).chrome?.storage?.local;
  }

  async getData(): Promise<T | null> {
    return new Promise((resolve) => {
      const storageArea = this.chromeStorage;
      if (!storageArea) {
        resolve(null);
        return;
      }

      storageArea.get(this.storageKey, (items: any) => {
        const chromeRuntime = (globalThis as any).chrome?.runtime;
        if (chromeRuntime?.lastError) {
          resolve(null);
          return;
        }

        resolve(items?.[this.storageKey] ?? null);
      });
    });
  }

  async setData(data: T): Promise<void> {
    return new Promise((resolve) => {
      const storageArea = this.chromeStorage;
      if (!storageArea) {
        resolve();
        return;
      }

      storageArea.set({ [this.storageKey]: data }, () => {
        resolve();
      });
    });
  }

  async clearData(): Promise<void> {
    return new Promise((resolve) => {
      const storageArea = this.chromeStorage;
      if (!storageArea) {
        resolve();
        return;
      }

      storageArea.remove(this.storageKey, () => {
        resolve();
      });
    });
  }
}
