import type { IDataProvider } from "./dataProvider.interface.js";
import { promises as fs } from "fs";

export class JSONProvider<T extends object> implements IDataProvider<T> {
  private constructor(private entityClass: new () => T) {}

  static for<U extends object>(entityClass: new () => U): JSONProvider<U> {
    return new JSONProvider<U>(entityClass);
  }

  async read(filePath: string = "./trains.json"): Promise<T[]> {
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      const parsed: Partial<T>[] = JSON.parse(fileContent);

      return parsed.map((obj) => Object.assign(new this.entityClass(), obj));
    } catch {
      return [];
    }
  }

  async write(filePath: string = "./trains.json", items: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf-8");
  }

  async create(filePath: string = "./trains.json"): Promise<void> {
    await fs.writeFile(filePath, "[]", "utf-8");
  }

  async delete(filePath: string = "./trains.json"): Promise<void> {
    if (!(await fs.stat(filePath)).isFile()) {
      return
    }
    await fs.unlink(filePath);
  }
}

export default JSONProvider;
