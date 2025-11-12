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

    const id = train.id ?? (await this.generateID(train.name, train.route));

    const item = {
      id,
      name: train.name,
      route: train.route,
      wagons: train.wagons.map((w) => ({
        id: w.id,
        type: w.type,
        seats: w.seats.map((s) => ({
          id: s.id,
          isBooked: s.isBooked,
          ...(s.booking
            ? {
                booking: s.booking.map((b) => ({
                  id: b.id,
                  passengerName: b.passengerName,
                  date: b.date,
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
    if (!filePath || typeof filePath !== "string") {
      throw new Error("Invalid file path");
    }
    await this.provider.create(filePath);
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
    trains[index].id = await this.generateID(
      trains[index].name,
      trains[index].route
    );
    await this.provider.write(filePath, trains);
  }

  async createTrain(
    name: string,
    route: string,
    wagonsNum: number,
    wagonsType: string,
    seatsPerWagon: number
  ): Promise<Train> {
    const wagons = [];
    const seats = [];
    wagonsType.toLowerCase().trim();

    for (let j = 0; j < seatsPerWagon; j++) {
      seats.push({ id: j + 1, isBooked: false, booking: [] as any });
    }
    for (let i = 0; i < Number(wagonsNum); i++) {
      wagons.push(
        new Wagon({ id: i + 1, type: wagonsType as any, seats: seats })
      );
    }

    const id = await this.generateID(name, route);
    const normalizedRoute = route.trim().replace(/\s+/g, "-");

    const train = new Train({
      id,
      name,
      route: normalizedRoute,
      wagons: wagons,
    });

    return train;
  }
}

export default TrainService;
