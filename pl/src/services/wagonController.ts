import { Train, TrainService, Wagon } from "course-work-bll";
import { question } from "./question";

export class WagonController {
  private filePath: string;
  private service: TrainService;

  constructor(service: TrainService, filePath?: string) {
    this.filePath = filePath ?? "./trains.json";

    try {
      this.service = service ?? new TrainService(this.filePath);
    } catch {
      throw new Error("Failed to initialize TrainService");
    }
  }

  public async addWagon(train: Train): Promise<Train> {
    let wagonType: string = "";
    let seatsNum: string = "";
    while (true) {
      console.log("\n-- Add Wagon --");
      wagonType = await question("Wagon type (Sleeper, Coupe or Berth): ");
      if (
        wagonType.toLowerCase() !== "sleeper" &&
        wagonType.toLowerCase() !== "coupe" &&
        wagonType.toLowerCase() !== "berth"
      ) {
        console.log("Wagon type isn't valid!");
        continue;
      }
      break;
    }

    while (true) {
      seatsNum = await question("Number of seats in the wagon: ");
      if (!seatsNum || isNaN(Number(seatsNum)) || Number(seatsNum) <= 0) {
        console.log("Valid number of seats required.");
        continue;
      }
      break;
    }

    const seats = [];
    for (let j = 0; j < Number(seatsNum); j++) {
      seats.push({ id: j + 1, isBooked: false });
    }
    train.wagons.push(
      new Wagon({ id: train.wagons.length + 1, type: wagonType as any, seats })
    );

    return train;
  }

  public async deleteWagon(train: Train): Promise<Train> {
    console.log(`\n-- Wagons from ${train.name} --`);
    train.wagons.forEach((w) => {
      console.log(`Wagon ID: ${w.id}, Type: ${w.type}`);
    });

    let wagonID = await question("\nEnter the ID of the wagon to delete: ");
    const wagonId = Number(wagonID);

    const wagonIndex = train.wagons.findIndex((w) => w.id === wagonId);
    if (wagonIndex === -1) {
      throw new Error("Wagon not found");
    }

    const wagon = train.wagons[wagonIndex];
    if (wagon.seats && wagon.seats.some((s: any) => s.isBooked === true)) {
      throw new Error("Cannot delete wagon: some seats are booked");
    }

    train.wagons.splice(wagonIndex, 1);
    return train;
  }

  public async showWagonInfo(train: Train): Promise<void> {
    console.log(`\n-- Wagons from ${train.name} --`);
    train.wagons.forEach((w) => {
      console.log(
        `Wagon ID: ${w.id}, Type: ${w.type}, Seats: ${w.seats.length}`
      );
    });

    let wagonID = await question("\nEnter the ID of the wagon to view: ");
    const wagonId = Number(wagonID);
    const wagon = train.wagons.find((w) => w.id === wagonId);
    if (!wagon) {
      throw new Error("Wagon not found");
    }

    console.clear();

    const bookedSeats = wagon.seats.filter((s) => s.isBooked).length;
    const availableSeats = wagon.seats.length - bookedSeats;
    const bookedPercent = ((bookedSeats / wagon.seats.length) * 100).toFixed(2);
    console.log(
      `\nWagon ID: ${wagon.id}, Type: ${wagon.type}, Fullness: ${bookedPercent}%`
    );
    console.log(
      `Total seats: ${wagon.seats.length} / ■ Booked: ${bookedSeats} / □ Available: ${availableSeats}`
    );
    const seatsInfo = wagon.seats
      .map((s, i) =>
        (i + 1) % 6 === 0
          ? `${i + 1}. ${s.isBooked ? "■" : "□"}\n      `
          : `${i + 1}. ${s.isBooked ? "■" : "□"}`
      )
      .join(" ");
    console.log(`Seats: ${seatsInfo}\n`);

    await question("Press Enter to continue...");
  }
}
