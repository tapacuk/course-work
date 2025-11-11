import { Train } from "../models/train";
import { Wagon } from "../models/wagons";
import { Seat } from "../models/seat";
import { Booking } from "../models/booking";
import { JSONProvider } from "course-work-dal";

export class TrainService {
  filePath: string;

  private provider = JSONProvider.for(Object as any);

  constructor(filePath: string = "./trains.json") {
    this.filePath = filePath;
  }

  async load(filePath: string): Promise<Train[]> {
    const raw = (await this.provider.read(filePath)) as any[];

    return raw.map((r: any) => {
      const wagons: Wagon[] = (r.wagons || []).map((w: any) => {
        const seats: Seat[] = (w.seats || []).map(
          (s: any) =>
            new Seat({
              id: s.id,
              isBooked: s.isBooked,
              ...(s.booking
                ? {
                    booking: (s.booking as any[]).map(
                      (b: any) =>
                        new Booking({
                          id: b.id,
                          passengerName: b.passengerName,
                          date: b.date,
                        })
                    ),
                  }
                : { booking: [] }),
            })
        );
        return new Wagon({ id: w.id, type: w.type, seats });
      });

      return new Train({ id: r.id, name: r.name, route: r.route, wagons });
    });
  }

  async save(filePath: string, train: Train): Promise<void> {
    const existing = ((await this.provider.read(filePath)) as any[]) || [];

    const item = {
      id: train.id, // string
      name: train.name, // string
      route: train.route, // string
      wagons: train.wagons.map((w) => ({
        id: w.id, // number
        type: w.type, // coupe or berth
        seats: w.seats.map((s) => ({
          id: s.id, // number
          isBooked: s.isBooked, // boolean
          ...(s.booking
            ? {
                booking: s.booking.map((b) => ({
                  id: b.id, // string
                  passengerName: b.passengerName, // string
                  date: b.date, // string
                })),
              }
            : { booking: [] }),
        })),
      })),
    };
    const toSave = Array.isArray(existing) ? [...existing, item] : [item];
    await this.provider.write(filePath, toSave as any);
  }

  async create(filePath: string): Promise<void> {
    try {
      await this.provider.create(filePath);
    } catch {
      throw new Error("Failed to create file");
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      await this.provider.deleteFile(filePath);
    } catch {
      throw new Error("Failed to delete file");
    }
  }

  async deleteSpecific(filePath: string, id: string): Promise<void> {
    const trains = await this.load(filePath);
    const train = trains.find((t) => t.id === id);
    if (!train) throw new Error("Train not found");

    const hasBookedSeats = train.wagons.some((w) =>
      w.seats.some((s) => s.isBooked === true)
    );
    if (hasBookedSeats)
      throw new Error("Cannot delete train: some seats are booked");

    const remaining = trains.filter((t) => t.id !== id);
    if (remaining.length === trains.length)
      throw new Error("Failed to delete train (Train is already removed)");

    await this.provider.write(filePath, remaining);
    return;
  }

  async generateID(name: string, route: string): Promise<string> {
    const normalizedName = name.toUpperCase().trim().replace(/\s+/g, "-");
    const normalizedRoute = route.trim().replace(/\s+/g, "-");
    const id = `TRAIN-${normalizedName}-${normalizedRoute.toUpperCase()}`;
    return id;
  }

  async findByID(keyword: string): Promise<Train[]> {
    const trains = ((await this.provider.read(this.filePath)) as Train[]) || [];
    const normalized = keyword.toUpperCase().trim();
    const matches = trains.filter((t: Train) =>
      t.id.toUpperCase().includes(normalized)
    );

    if (matches.length === 0) {
      throw new Error("No matches found");
    }
    return matches;
  }

  async updateTrain(filePath: string, updatedTrain: Train): Promise<void> {
    const trains = await this.load(filePath);
    const index = trains.findIndex((t) => t.id === updatedTrain.id);
    if (index === -1) throw new Error("Train not found");
    trains[index] = updatedTrain;
    await this.provider.write(filePath, trains);
  }
}

export default TrainService;
