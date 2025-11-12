import { question } from "./question";
import { Train, TrainService, Wagon, SearchHelper } from "course-work-bll";
import { WagonController } from "./wagonController";
import chalk from "chalk";

export default class TrainReader {
  private filePath: string;
  private service: TrainService;
  private wagonController: WagonController;
  private searchHelper: SearchHelper;

  constructor(filePath = "./trains.json", trainService?: TrainService) {
    this.filePath = filePath;

    this.service = trainService ?? new TrainService(this.filePath);
    this.wagonController = new WagonController();
    this.searchHelper = new SearchHelper();
  }

  public async listTrains(): Promise<void> {
    console.clear();
    console.log("\n-- List of Trains --");
    try {
      const trains = await this.service.loadTrains(this.filePath);

      if (trains.length === 0) {
        console.log("No trains available");
      } else {
        trains.forEach((t: Train) => {
          console.log(
            `${chalk.yellowBright("Name:")} ${t.name}, ${chalk.yellowBright("Route:")} ${t.route} ${chalk.gray(`(${t.id})`)}`
          );
        });

        console.log(
          `${chalk.yellowBright("> Total trains:")} ${trains.length}`
        );
        await question("\nPress Enter to continue...");
        console.clear();
      }
    } catch {
      throw new Error("Failed to load trains:");
    }
  }

  public async searchTrain(): Promise<void> {
    const keyword = await question("Search for a train: ");
    if (!keyword) {
      console.log("Keyword is required.");
      return;
    }

    let matches: Train[] = [];
    try {
      matches = await this.service.findByID(keyword);
    } catch (error) {
      console.clear();
      console.log(error);
      return;
    }

    console.clear();

    let choice: any;
    let running = true;
    while (true) {
      console.log("\nFound trains:");
      matches.forEach((t: Train, i: number) => {
        console.log(
          `${i + 1}) ${chalk.yellowBright("Name:")} ${t.name}, ${chalk.yellowBright("Route:")} ${t.route} ${chalk.gray(`(${t.id})`)}`
        );
      });

      choice = await question(
        "\nEnter number of train for details (or 0 to exit): "
      );

      if (Number(choice) === 0) return;
      if (await this.searchHelper.validateSearchInput(choice, matches.length)) {
        console.clear();
        console.log("Invalid choice.");
        continue;
      } else {
        break;
      }
    }

    const index = Number(choice) - 1;
    const trainToShowDetail = matches[index];

    const totalWagons = trainToShowDetail.wagons.length;
    const totalSeats = trainToShowDetail.wagons.reduce(
      (acc: number, w: Wagon) => acc + w.seats.length,
      0
    );
    const totalBooked = trainToShowDetail.wagons.reduce(
      (acc: number, w: Wagon) => acc + w.seats.filter((s) => s.isBooked).length,
      0
    );
    const totalBookedPrecent = ((totalBooked / totalSeats) * 100).toFixed(2);

    console.clear();
    console.log(`\n-- Details for ${trainToShowDetail.id} --`);
    console.log(`${chalk.yellowBright("Name:")} ${trainToShowDetail.name}`);
    console.log(`${chalk.yellowBright("Route:")} ${trainToShowDetail.route}`);
    console.log("Wagon Details:");
    trainToShowDetail.wagons.forEach((w: Wagon) => {
      const bookedSeats = w.seats.filter((s) => s.isBooked).length;
      const bookedPercent = ((bookedSeats / w.seats.length) * 100).toFixed(2);

      console.log(
        `  — ${chalk.yellowBright("Wagon ID:")} ${w.id}, ${chalk.yellowBright("Type:")} ${w.type}, ${chalk.yellowBright("Total seats:")}, ${w.seats.length} ${chalk.yellowBright("Fullness:")} ${bookedPercent}% `
      );
    });

    console.log("> Total ");
    console.log(
      `  ${chalk.yellowBright("Wagons:")} ${totalWagons} | ${chalk.yellowBright("Seats:")} ${totalSeats} | ${chalk.yellowBright("Booked:")} ${totalBooked} seats / ${totalBookedPrecent}%`
    );
    const inputWagonDetails = await question("\n Look wagon details? (y/n): ");

    console.clear();
    if (inputWagonDetails.toLowerCase() === "y") {
      await this.wagonController.showWagonInfo(trainToShowDetail);
    }
    // await question("\nPress Enter to continue...");
  }
}
