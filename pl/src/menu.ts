import { question } from "./services/question";
import TrainController from "./services/trainController";

export default class Menu {
  private trainController: TrainController;

  constructor() {
    this.trainController = new TrainController();
  }

  public async show(): Promise<void> {
    while (true) {
      console.log("\n===== Menu =====");
      console.log("1) Manage Trains");
      console.log("0) Exit");
      const choice = await question("Choose an option: ");
      switch (choice) {
        case "1":
          console.clear();
          let running = true;
          while (running) {
            console.log("\n--- Train Management ---");
            console.log("1) Add Train");
            console.log("2) Remove Train");
            console.log("3) List Trains");
            console.log("0) Back to Main Menu");
            const trainChoice = await question("Choose an option: ");
            switch (trainChoice) {
              case "1":
                console.clear();
                await this.trainController.addTrain();
                break;
              case "2":
                console.clear();
                await this.trainController.deleteTrain();
                break;
              case "3":
                console.clear();
                await this.trainController.listTrains();
                break;
              case "0":
                console.clear();
                running = false;
                break;
              default:
                console.clear();
                console.log("Unknown option.");
            }
          }
          break;
        case "0":
          console.clear();
          console.log("Exiting...");
          return;
        default:
          console.clear();
          console.log("Unknown option.");
      }
    }
  }
}
