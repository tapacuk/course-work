import { Train } from "../models/train";
import { Wagon } from "../models/wagons";
import { Seat } from "../models/seat";
import { JSONProvider } from "course-work-dal";

export class TrainService {
  filePath: string;

  private provider = JSONProvider.for(Object as any);

  constructor(filePath: string = "./trains.json") {
    this.filePath = filePath;
  }

  async load(filePath: string): Promise<Train[]> {
    const raw = (await this.provider.read(filePath)) as any[];

    return raw.map((r) => {
      const wagons: Wagon[] = (r.wagons || []).map((w: any) => {
        const seats: Seat[] = (w.seats || []).map(
          (s: any) => new Seat({ id: s.id, isBooked: s.isBooked })
        );
        return new Wagon({ id: w.id, type: w.type, seats });
      });

      return new Train({ id: r.id, name: r.name, route: r.route, wagons });
    });
  }

  async save(filePath: string, train: Train): Promise<void> {
    const existing = ((await this.provider.read(filePath)) as any[]) || [];

    const item = {
      id: train.id,
      name: train.name,
      route: train.route,
      wagons: train.wagons.map((w) => ({
        id: w.id,
        type: w.type,
        seats: w.seats.map((s) => ({ id: s.id, isBooked: s.isBooked })),
      })),
    };
    const toSave = Array.isArray(existing) ? [...existing, item] : [item];
    await this.provider.write(filePath, toSave as any);
  }

  async create(filePath: string): Promise<void> {
    try {
      await this.provider.create(filePath);
    } catch {
      throw new Error("Failed to create storage file");
    }
  }

  async delete(filePath: string): Promise<void> {
    await this.provider.deleteFile(filePath);
  }

  async deleteSpecific(filePath: string, id: string): Promise<boolean> {
    const trains = await this.load(filePath);
    const remaining = trains.filter((t) => t.id !== id);

    if (remaining.length === trains.length) {
      return false;
    }

    await this.provider.write(filePath, remaining);
    return true;
  }
}

export default TrainService;
