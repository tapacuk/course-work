import chalk from "chalk";
import { question } from "./question";
import { Train, WagonService } from "course-work-bll";

export class WagonController {
  private wagonService: WagonService;

  constructor() {
    this.wagonService = new WagonService();
  }

  public async addWagon(train: Train): Promise<Train> {
    console.log(`\n${chalk.gray("-- Add Wagon --")}`);

    const wagonType = await question("Wagon type (Coupe, Berth): ");
    if (!["coupe", "berth"].includes(wagonType.toLowerCase())) {
      throw new Error("Invalid wagon type");
    }

    const seatsNum = Number(await question("Number of seats: "));
    if (seatsNum <= 0) throw new Error("Invalid number of seats");

    try {
      const updatedTrain = this.wagonService.addWagon(
        train,
        wagonType,
        seatsNum
      );
      return updatedTrain;
    } catch (error: any) {
      throw error;
    }
  }

  public async deleteWagon(train: Train): Promise<Train> {
    console.log(`\n${chalk.gray(`-- Wagons from ${train.name} --`)}`);
    train.wagons.forEach((w) =>
      console.log(
        `${chalk.yellowBright("ID:")} ${w.id}, ${chalk.yellowBright("Type:")} ${w.type}, ${chalk.yellowBright("Seats:")} ${w.seats.length}`
      )
    );

    const wagonId = Number(await question("Enter wagon ID to delete: "));
    try {
      const updatedTrain = this.wagonService.deleteWagon(train, wagonId);
      return updatedTrain;
    } catch (error: any) {
      throw error;
    }
  }

  public async showWagonInfo(train: Train): Promise<void> {
    console.log(`\n${chalk.gray(`-- Wagons from ${train.name} --`)}`);

    train.wagons.forEach((w) =>
      console.log(
        `${chalk.yellowBright("ID:")} ${w.id}, ${chalk.yellowBright("Type:")} ${w.type}, ${chalk.yellowBright("Seats:")} ${w.seats.length}`
      )
    );

    const wagonId = Number(await question("\nEnter wagon ID to view: "));

    console.clear();
    try {
      const info = this.wagonService.getWagonInfo(train, wagonId);
      console.log(info);
    } catch (error: any) {
      console.error(error.message);
      return;
    }

    await question("\nPress Enter to continue...");
  }
}
