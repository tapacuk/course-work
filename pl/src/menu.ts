import { question } from "./services/question";
import TrainController from "./services/trainController";

export default class Menu {
  private trainController: TrainController;

  constructor() {
    this.trainController = new TrainController();
  }

  public async show(): Promise<void> {
    let running = true;
    while (running) {
      console.log("\n=== Train Menu ===");
      console.log("1) Add train to database");
      console.log("0) Exit");
      const choice = await question("Choose an option: ");
      switch (choice) {
        case "1":
          await this.trainController.addTrainFlow();
          break;
        case "0":
          running = false;
          break;
        default:
          console.log("Unknown option.");
      }
    }
  }
}
