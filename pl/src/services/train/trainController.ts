import { question } from "../question";
import { Train, TrainService, Wagon } from "course-work-bll";

export default class TrainController {
  private filePath: string;
  private service: any;

  constructor(filePath = "./trains.json", trainService?: TrainService) {
    this.filePath = filePath;

    try {
      this.service = trainService ?? new TrainService(this.filePath);
    } catch (error) {
      console.error("Failed to initialize TrainService", error);
    }
  }

  public async addTrain(): Promise<void> {
    console.log("\n-- Add Train --");
    const name = await question("Train name: ");
    if (!name) {
      console.log("Name required.");
      return;
    }
    const route = await question("Train route (eg. Kyiv-Dnipro): ");
    const wagonsNum = await question("Number of wagons: ");

    const wagons = [];
    const seats = [];
    for (let j = 0; j < 3; j++) {
      seats.push({ id: j + 1, isBooked: false });
    }
    for (let i = 0; i < Number(wagonsNum); i++) {
      wagons.push(new Wagon({ id: i + 1, type: "coupe", seats: seats }));
    }

    const normalizedName = name.toUpperCase().trim();
    const normalizedRoute = route.toUpperCase().trim();
    const id = `TRAIN-${normalizedName}-${normalizedRoute}`;

    const train = new Train({ id, name, route, wagons: wagons });

    console.clear();
    try {
      await this.service.save(this.filePath, train);
      console.log("Train added successfully.");
    } catch (error) {
      console.error("Failed to add train.", error);
    }
  }

  public async deleteTrain(): Promise<void> {
    const keyword = await question("Search for a train to delete: ");
    if (!keyword) {
      console.log("keyword is required.");
      return;
    }

    const trains = await this.service.load(this.filePath);
    const normalized = keyword.toUpperCase().trim();
    const matches = trains.filter((t: Train) =>
      t.id.toUpperCase().includes(normalized)
    );

    if (matches.length === 0) {
      console.clear();
      console.log("No matching trains found.");
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
        console.log("Invalid choice.");
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
        console.log(`Train "${trainToDelete.id}" deleted successfully.`);
      } else {
        console.log("Failed to delete train (maybe already removed).");
      }
    } catch (error) {
      console.error("Failed to delete train:", error);
    }
  }
}
