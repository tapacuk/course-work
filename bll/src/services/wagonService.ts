import { Train } from "src/models/train";
import { Wagon } from "src/models/wagons";

export class WagonService {
  addWagon(train: Train, wagonType: string, seatsNum: number): Train {
    if (!["coupe", "berth"].includes(wagonType.toLowerCase())) {
      throw new Error("Invalid wagon type");
    }
    if (seatsNum <= 0) throw new Error("Invalid number of seats");

    const seats = Array.from({ length: seatsNum }, (_, i) => ({
      id: i + 1,
      isBooked: false,
      booking: [],
    }));

    const newWagon = new Wagon({
      id: train.wagons.length + 1,
      type: wagonType as any,
      seats,
    });

    train.wagons.push(newWagon);
    return train;
  }

  deleteWagon(train: Train, wagonId: number): Train {
    const wagon = train.wagons.find((w) => w.id === wagonId);
    if (!wagon) throw new Error("Wagon with this id is not found");

    if (wagon.seats.some((s) => s.isBooked)) {
      throw new Error("Cannot delete wagon: some seats are booked");
    }

    train.wagons = train.wagons.filter((w) => w.id !== wagonId);
    return train;
  }

  getWagonInfo(train: Train, wagonId: number): string {
    const wagon = train.wagons.find((w) => w.id === wagonId);
    if (!wagon) throw new Error("Invalid wagon ID");

    const bookedSeats = wagon.seats.filter((s) => s.isBooked).length;
    const availableSeats = wagon.seats.length - bookedSeats;
    const bookedPercent = ((bookedSeats / wagon.seats.length) * 100).toFixed(2);
    const seatsInfo = wagon.seats
      .map((s, i) =>
        (i + 1) % 6 === 0
          ? `${i + 1}. ${s.isBooked ? "■" : "□"}\n         `
          : `${i + 1}. ${s.isBooked ? "■" : "□"}`
      )
      .join("  ");

    return `\nWagon ID: ${wagon.id} / Type: ${wagon.type} / Fullness: ${bookedPercent}% \n    Total Seats: ${wagon.seats.length} / ■ Booked: ${bookedSeats} / □ Available: ${availableSeats}\n    Seats: ${seatsInfo}`;
  }

  findById(train: Train, wagonId: number): Wagon {
    if (wagonId < 0 || isNaN(wagonId)) throw new Error("Invalid wagon ID");
    const wagon = train.wagons.find((w) => w.id === wagonId);
    if (!wagon) throw new Error("Wagon not found");
    return wagon;
  }
}

export default WagonService;
