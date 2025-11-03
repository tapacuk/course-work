import { question } from "./question";
import { Booking, Train, TrainService, Wagon } from "course-work-bll";
import { WagonController } from "./wagonController";
import chalk from "chalk";

export default class TrainController {
  private filePath: string;
  private service: TrainService;
  private wagonController: WagonController;

  constructor(filePath = "./trains.json") {
    this.filePath = filePath;

    try {
      this.service = new TrainService(this.filePath);
    } catch {
      throw new Error("Failed to initialize TrainService");
    }
    this.wagonController = new WagonController();
  }

  public async addTrain(): Promise<void> {
    const name = await question("Train name: ");
    if (!name) {
      console.log("Name required.");
      return;
    }

    const route = await question("Train route (eg. Kyiv-Dnipro): ");
    if (!route) {
      console.log("Route required.");
      return;
    }

    const wagonsNum = await question("Number of wagons: ");
    if (!wagonsNum || isNaN(Number(wagonsNum)) || Number(wagonsNum) <= 0) {
      console.clear();
      console.log("Valid number of wagons required.");
      return;
    }

    const wagonsType = await question(
      "Wagons type (Sleeper, Coupe or Berth): "
    );
    if (
      wagonsType.toLowerCase() !== "sleeper" &&
      wagonsType.toLowerCase() !== "coupe" &&
      wagonsType.toLowerCase() !== "berth"
    ) {
      console.clear();
      console.log("Wagon type isn't valid!");
      return;
    }

    const input = await question(
      "\nWant to add custom amount of seats per wagon? (y/n): "
    );
    let seatsPerWagon = 10;

    console.clear();

    if (input.toLowerCase() === "y") {
      while (true) {
        const seatsInput = await question("Seats per wagon: ");
        const validInput =
          !seatsInput || isNaN(Number(seatsInput)) || Number(seatsInput) < 0;

        if (validInput) {
          console.clear();
          console.log("Valid number of seats required.");
          continue;
        } else {
          seatsPerWagon = Number(seatsInput);
          break;
        }
      }
    } else {
      console.clear();
      console.log("Using default seats per wagon (10)");
    }

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

    const id = await this.service.generateID(name, route);
    const normalizedRoute = route.trim().replace(/\s+/g, "-");

    const train = new Train({
      id,
      name,
      route: normalizedRoute,
      wagons: wagons,
    });

    try {
      await this.service.save(this.filePath, train);
      console.log("Train added successfully.");
    } catch {
      throw new Error("Failed to save train in file");
    }
  }

  public async deleteTrain(): Promise<void> {
    const keyword = await question("Search for a train to delete: ");
    if (!keyword) {
      console.log("Keyword is required");
      return;
    }

    let matches: Train[] = [];
    try {
      matches = await this.service.findByID(keyword);
    } catch (error: any) {
      console.clear();
      console.log(`${error.message}`);
      return;
    }

    console.clear();

    let choice: number;
    while (true) {
      console.log("\nFound trains:");
      matches.forEach((t: Train, i: number) => {
        console.log(
          `${i + 1}) ${chalk.yellowBright("Name:")} ${t.name}, ${chalk.yellowBright("Route:")} ${t.route},  ${chalk.gray(`(${t.id})`)}`
        );
      });

      choice = Number(
        await question("\nEnter number of train to delete (or 0 to cancel): ")
      );

      if (choice === 0) {
        console.clear();
        console.log("Cancelled");
        return;
      }
      if (choice < 0 || choice - 1 >= matches.length || isNaN(choice)) {
        console.clear();
        console.log("Invalid choice");
        continue;
      } else {
        break;
      }
    }

    const index = choice - 1;
    const trainToDelete = matches[index];

    console.clear();
    try {
      await this.service.deleteSpecific(this.filePath, trainToDelete.id);
    } catch (error: any) {
      console.log(`${error.message}`);
      return;
    }
    console.log(`Train "${trainToDelete.id}" deleted successfully`);
  }

  public async editTrain(): Promise<void> {
    const keyword = await question("Search for a train to edit: ");
    if (!keyword) {
      console.log("Keyword is required");
      return;
    }

    let matches: Train[] = [];
    try {
      matches = await this.service.findByID(keyword);
    } catch (error: any) {
      console.clear();
      console.log(`${error.message}`);
      return;
    }

    console.clear();

    let choice: any;
    while (true) {
      console.log("\nFound trains:");
      matches.forEach((t: Train, i: number) => {
        console.log(
          `${i + 1}) ${chalk.yellowBright("Name:")} ${t.name}, ${chalk.yellowBright("Route:")} ${t.route} ${chalk.gray(`(${t.id})`)}`
        );
      });

      choice = await question(
        "\nEnter number of train to edit (or 0 to cancel): "
      );

      if (Number(choice) === 0) {
        console.clear();
        console.log("Cancelled.");
        return;
      }
      if (
        Number(choice) < 0 ||
        Number(choice) - 1 >= matches.length ||
        isNaN(Number(choice))
      ) {
        console.clear();
        console.log("Invalid choice ");
        continue;
      } else {
        break;
      }
    }

    const index = Number(choice) - 1;
    let trainToEdit = matches[index];

    console.clear();
    let editRunning = true;
    while (editRunning) {
      console.log(
        `\n(!) Editing Train: ${trainToEdit.name} | ${trainToEdit.route}`
      );
      console.log("\nChoose what to edit:");
      console.log("1) Name");
      console.log("2) Route");
      console.log("3) Wagons");
      console.log("\n0) Cancel");

      const editChoice = await question("\nChoose an option > ");
      switch (editChoice) {
        case "1":
          console.clear();
          const newName = await question("Enter new name: ");
          if (newName) {
            trainToEdit.name = newName.trim();
            console.clear();
            console.log("Name updated");
          } else {
            console.clear();
            console.log("Returned");
          }
          break;
        case "2":
          console.clear();
          const newRoute = await question("Enter new route: ");
          if (newRoute) {
            trainToEdit.route = newRoute.trim().replace(/\s+/g, "-");
            console.clear();
            console.log("Route updated");
          } else {
            console.clear();
            console.log("Returned");
          }
          break;
        case "3":
          console.clear();
          trainToEdit = await this.editWagons(trainToEdit);
          break;
        case "0":
          console.clear();
          editRunning = false;
          break;
        default:
          console.clear();
          console.log("Unknown option.");
          break;
      }
    }

    try {
      await this.service.updateTrain(this.filePath, trainToEdit);
    } catch {
      throw new Error("Failed to save train with new wagon");
    }
  }

  async editWagons(train: Train): Promise<Train> {
    let running = true;
    while (running) {
      console.log("\n-- Wagons Edit Menu --");
      console.log("1) Add Wagon");
      console.log("2) Delete Wagon");
      console.log("3) Show Wagon Info");
      console.log("\n0) Back to previous menu");
      const wagonChoice = await question("\nChoose an option > ");
      console.clear();
      switch (wagonChoice) {
        case "1":
          try {
            train = await this.wagonController.addWagon(train);
            console.log("Wagon added successfully!");
          } catch {
            throw new Error("Failed to add wagon to train");
          }
          break;
        case "2":
          try {
            train = await this.wagonController.deleteWagon(train);
            console.clear();
            console.log("Wagon deleted successfully!");
          } catch (error: any) {
            console.clear();
            console.log(`${error.message}`);
          }
          break;
        case "3":
          await this.wagonController.showWagonInfo(train);
          break;
        case "0":
          console.clear();
          running = false;
          break;
        default:
          console.log("Unknown option.");
          break;
      }
    }
    return train;
  }
}
