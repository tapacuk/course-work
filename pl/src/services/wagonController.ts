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

  public async addWagon(train: Train): Promise<void> {
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

    try {
      try {
        await this.service.deleteSpecific(this.filePath, train.id);
      } catch {
        throw new Error(
          "Failed to delete existing train before saving updated one"
        );
      }
      await this.service.save(this.filePath, train);
      console.log("Wagon added successfully!");
    } catch {
      throw new Error("Failed to save train with new wagon");
    }
  }
}
