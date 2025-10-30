export interface IDataProvider<T> {
  read(filePath: string): Promise<T[]>;
  write(filePath: string, items: T[]): Promise<void>;
  create(filePath: string): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
}
