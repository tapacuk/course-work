import { question } from "./services/question";
import TrainController from "./services/trainController";
import TrainReader from "./services/trainReader";

const trainController = new TrainController();
const trainReader = new TrainReader();

export async function menuTrain(): Promise<void> {
  console.clear();
  let running = true;
  while (running) {
    console.log("\n--- Train Management ---");
    console.log("1) Add Train");
    console.log("2) Remove Train");
    console.log("3) Edit Train");
    console.log("4) Trains Info");
    console.log("\n0) Back to Main Menu");
    const trainChoice = await question("\nChoose an option: ");
    switch (trainChoice) {
      case "1":
        console.clear();
        await trainController.addTrain();
        break;
      case "2":
        console.clear();
        await trainController.deleteTrain();
        break;
      case "3":
        console.clear();
        await trainController.editTrain();
        break;
      case "4":
        console.clear();
        let lookRunning = true;
        while (lookRunning) {
          console.log("\n--- Look for Trains ---");
          console.log("1) List all Trains");
          console.log("2) Search Train by ID");
          console.log("\n0) Back to Train Management");

          const lookTrainsChoice = await question("\nChoose an option: ");
          switch (lookTrainsChoice) {
            case "1":
              console.clear();
              await trainReader.listTrains();
              break;
            case "2":
              console.clear();
              await trainReader.searchTrain();
              break;
            case "0":
              console.clear();
              lookRunning = false;
              break;
            default:
              console.clear();
              console.log("Unknown option.");
              break;
          }
          break;
        }
      case "0":
        console.clear();
        running = false;
        break;
      default:
        console.clear();
        console.log("Unknown option.");
    }
  }
}
