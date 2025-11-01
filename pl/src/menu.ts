import { menuTrain } from "./menuTrain";
import { question } from "./services/question";

export default class Menu {
  constructor() {}

  public async show(): Promise<void> {
    while (true) {
      console.clear();
      console.log("\n===== Menu =====");
      console.log("1) Manage Trains");
      console.log("2) Manage Bookings (Coming Soon)");
      console.log("\n0) Exit");
      const choice = await question("\nChoose an option: ");
      switch (choice) {
        case "1":
          await menuTrain();
          break;
        case "2":
          console.clear();
          console.log("Booking management is coming soon!");
          await question("\nPress Enter to continue...");
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
