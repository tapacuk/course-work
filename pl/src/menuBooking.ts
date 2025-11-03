import { BookingController } from "./services/bookingController";
import BookingReader from "./services/bookingReader";
import { question } from "./services/question";

const bookingController = new BookingController();
const bookingReader = new BookingReader();

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
      case "2":
        console.clear();
        await bookingController.removeBooking();
        break;
      case "3":
        console.clear();
        await bookingController.editBooking();
        break;
      case "4":
        console.clear();
        let runningInfo = true;
        while (runningInfo) {
          console.log("\n-- Bookings Info Menu --");
          console.log("1) List All Bookings");
          console.log("2) Search Bookings");
          console.log("\n0) Back to previous menu");
          const infoChoice = await question("\nChoose an option > ");

          switch (infoChoice) {
            case "1":
              console.clear();
              await bookingReader.listBookings();
              console.clear();
              break;
            case "2":
              console.clear();
              await bookingReader.searchBookings();
              console.clear();
              break;
            case "0":
              console.clear();
              runningInfo = false;
              break;
            default:
              console.clear();
              console.log("Unknown option.");
          }
        }
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
