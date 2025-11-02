import { question } from "./question";
import { Train, TrainService, WagonService } from "course-work-bll";

export class WagonController {
  private wagonService: WagonService;

  constructor(
    private service: TrainService,
    private filePath = "./trains.json"
  ) {
    this.wagonService = new WagonService();
  }

  public async addWagon(train: Train): Promise<Train> {
    console.log("\n-- Add Wagon --");

    const wagonType = await question("Wagon type (Sleeper, Coupe, Berth): ");
    const seatsNum = Number(await question("Number of seats: "));

    try {
      const updatedTrain = this.wagonService.addWagon(
        train,
        wagonType,
        seatsNum
      );
      return updatedTrain;
    } catch (error: any) {
      console.log(error.message);
      return train;
    }
  }

  public async deleteWagon(train: Train): Promise<Train> {
    console.log(`\n-- Wagons from ${train.name} --`);
    train.wagons.forEach((w) => console.log(`ID: ${w.id}, Type: ${w.type}`));

    const wagonId = Number(await question("Enter wagon ID to delete: "));
    try {
      const updatedTrain = this.wagonService.deleteWagon(train, wagonId);
      return updatedTrain;
    } catch (error: any) {
      console.log(error.message);
      return train;
    }
  }

  public async showWagonInfo(train: Train): Promise<void> {
    console.log(`\n-- Wagons from ${train.name} --`);
    train.wagons.forEach((w) =>
      console.log(`ID: ${w.id}, Type: ${w.type}, Seats: ${w.seats.length}`)
    );

    const wagonId = Number(await question("\nEnter wagon ID to view: "));

    console.clear();
    try {
      const info = this.wagonService.getWagonInfo(train, wagonId);
      console.log(info);
    } catch (error: any) {
      console.log(error.message);
    }

    await question("\nPress Enter to continue...");
  }
}
