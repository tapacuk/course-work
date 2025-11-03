import { BookingController } from "./services/bookingController";
import { question } from "./services/question";

const bookingController = new BookingController();

export async function menuBooking(): Promise<void> {
  console.clear();
  let running = true;
  while (running) {
    console.log("\n--- Booking Management ---");
    console.log("1) Add Booking");
    console.log("2) Remove Booking");
    console.log("3) Edit Booking");
    console.log("4) Bookings Info");
    console.log("\n0) Back to Main Menu");
    const trainChoice = await question("\nChoose an option: ");
    switch (trainChoice) {
      case "1":
        console.clear();
        await bookingController.addBooking();
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
}
