import { Train } from "src/models/train";
import { Wagon } from "src/models/wagons";
import chalk from "chalk";

export class WagonService {
  addWagon(train: Train, wagonType: string, seatsNum: number): Train {
    if (!["sleeper", "coupe", "berth"].includes(wagonType.toLowerCase())) {
      throw new Error("Invalid wagon type");
    }
    if (seatsNum <= 0) throw new Error("Invalid number of seats");

    const seats = Array.from({ length: seatsNum }, (_, i) => ({
      id: i + 1,
      isBooked: false,
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
    if (!wagon) throw new Error("Wagon not found");

    if (wagon.seats.some((s) => s.isBooked)) {
      throw new Error("Cannot delete wagon: some seats are booked");
    }

    train.wagons = train.wagons.filter((w) => w.id !== wagonId);
    return train;
  }

  getWagonInfo(train: Train, wagonId: number): string {
    const wagon = train.wagons.find((w) => w.id === wagonId);
    if (!wagon) throw new Error("Wagon not found");

    const bookedSeats = wagon.seats.filter((s) => s.isBooked).length;
    const availableSeats = wagon.seats.length - bookedSeats;
    const bookedPercent = ((bookedSeats / wagon.seats.length) * 100).toFixed(2);
    const seatsInfo = wagon.seats
      .map((s, i) =>
        (i + 1) % 6 === 0
          ? `${i + 1}. ${s.isBooked ? `${chalk.gray("■")}` : `${chalk.greenBright("□")}`}\n         `
          : `${i + 1}. ${s.isBooked ? `${chalk.gray("■")}` : `${chalk.greenBright("□")}`}`
      )
      .join("  ");

    return `\n${chalk.yellowBright("Wagon ID:")} ${wagon.id} ${chalk.gray("/")} ${chalk.yellowBright("Type:")} ${wagon.type} ${chalk.gray("/")} ${chalk.yellowBright("Fullness:")} ${bookedPercent}% 
    ${chalk.yellowBright("Total Seats:")} ${wagon.seats.length} ${chalk.gray("/")} ${chalk.yellowBright("■ Booked:")} ${bookedSeats} ${chalk.gray("/")} ${chalk.yellowBright("□ Available:")} ${availableSeats}
    ${chalk.yellowBright("Seats:")} ${seatsInfo}`;
  }
}
