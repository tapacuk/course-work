import { question } from "./question";
import { Train, TrainService, Wagon } from "course-work-bll";
import { WagonController } from "./wagonController";

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
    this.wagonController = new WagonController(this.service);
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
      console.log("Wagon type isn't valid!");
      return;
    }

    const input = await question(
      "\nWant to add custom amount of seats per wagon? (y/n): "
    );
    let seatsPerWagon = 10;

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
      seats.push({ id: j + 1, isBooked: false });
    }
    for (let i = 0; i < Number(wagonsNum); i++) {
      wagons.push(
        new Wagon({ id: i + 1, type: wagonsType as any, seats: seats })
      );
    }

    const normalizedName = name.toUpperCase().trim().replace(/\s+/g, "-");
    const normalizedRoute = route.trim().replace(/\s+/g, "-");
    const id = `TRAIN-${normalizedName}-${normalizedRoute.toUpperCase()}`;

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

    const trains = await this.service.load(this.filePath);
    const normalized = keyword.toUpperCase().trim();
    const matches = trains.filter((t: Train) =>
      t.id.toUpperCase().includes(normalized)
    );

    if (matches.length === 0) {
      console.clear();
      console.log("No matches found!");
      return;
    }

    console.clear();

    let choice: any;
    let running = true;
    while (running) {
      console.log("\nFound trains:");
      matches.forEach((t: Train, i: number) => {
        console.log(`${i + 1}. ${t.id} (${t.name}, ${t.route})`);
      });

      choice = await question(
        "\nEnter number of train to delete (or 0 to cancel): "
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
        running = false;
      }
    }

    const index = Number(choice) - 1;

    const trainToDelete = matches[index];
    console.clear();
    try {
      const deleted = await this.service.deleteSpecific(
        this.filePath,
        trainToDelete.id
      );
      if (deleted) {
        console.log(`Train "${trainToDelete.id}" deleted successfully`);
      } else {
        console.log("Failed to delete train (Train is already removed)");
      }
    } catch {
      throw new Error("Failed to delete train from file");
    }
  }

  public async editTrain(): Promise<void> {
    const keyword = await question("Search for a train to edit: ");
    if (!keyword) {
      console.log("Keyword is required");
      return;
    }

    const trains = await this.service.load(this.filePath);
    const normalized = keyword.toUpperCase().trim();
    const matches = trains.filter((t: Train) =>
      t.id.toUpperCase().includes(normalized)
    );

    if (matches.length === 0) {
      console.clear();
      console.log("No matches found!");
      return;
    }

    console.clear();

    let choice: any;
    let runningSearchResults = true;
    while (runningSearchResults) {
      console.log("\nFound trains:");
      matches.forEach((t: Train, i: number) => {
        console.log(`${i + 1}. ${t.id} (${t.name}, ${t.route})`);
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
        runningSearchResults = false;
      }
    }

    const index = Number(choice) - 1;
    const trainToEdit = matches[index];

    let editRunning = true;
    while (editRunning) {
      console.clear();
      console.log(
        `(!) Editing Train: ${trainToEdit.name} ${trainToEdit.route} (${trainToEdit.id})`
      );
      console.log("\nChoose what to edit:");
      console.log("1) Name");
      console.log("2) Route");
      console.log("3) Wagons");
      console.log("0) Cancel");
      const editChoice = await question("\nChoose an option > ");
      switch (editChoice) {
        case "1":
          const newName = await question("Enter new name: ");
          if (newName) {
            trainToEdit.name = newName;
          }
          break;
        case "2":
          const newRoute = await question("Enter new route: ");
          if (newRoute) {
            trainToEdit.route = newRoute;
          }
          break;
        case "3":
          console.clear();
          editRunning = false;
          await this.wagonController.addWagon(trainToEdit);
          break;
        case "0":
          console.clear();
          console.log("Cancelled.");
          editRunning = false;
          break;
        default:
          console.clear();
          console.log("Unknown option.");
          editRunning = false;
          break;
      }
    }
  }
}
