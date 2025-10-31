import { question } from "./question";
import { Train, TrainService, Wagon } from "course-work-bll";

export default class TrainController {
  private filePath: string;
  private service: any;

  constructor(filePath = "./trains.json", trainService?: any) {
    this.filePath = filePath;

    try {
      this.service = trainService ?? new TrainService(this.filePath);
    } catch {
      throw new Error("Failed to initialize TrainService");
    }
  }

  public async addTrainFlow(): Promise<void> {
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

    await this.service.save(this.filePath, train);

    console.log("Train added successfully.");
  }
}
