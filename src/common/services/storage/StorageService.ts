export abstract class StorageService<T> {
  constructor(protected readonly storageKey: string) {}

  abstract getData(): Promise<T | null>;
  abstract setData(data: T): Promise<void>;
  abstract clearData(): Promise<void>;
}
