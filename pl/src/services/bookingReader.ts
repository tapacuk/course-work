import chalk from "chalk";
import {
  BookingService,
  SearchHelper,
  TrainService,
  WagonService,
} from "course-work-bll";
import { question } from "./question";

export default class BookingReader {
  private filePath: string;
  private service: BookingService;
  private trainService: TrainService;
  private wagonService: WagonService;
  private searchHelper: SearchHelper;

  constructor(filePath = "./trains.json") {
    this.filePath = filePath;

    try {
      this.service = new BookingService(this.filePath);
    } catch {
      throw new Error("Failed to initialize TrainService");
    }
    this.trainService = new TrainService();
    this.wagonService = new WagonService();
    this.searchHelper = new SearchHelper();
  }

  async listBookings(): Promise<void> {
    let bookings = [];
    try {
      bookings = await this.service.loadBookings();
    } catch (error: any) {
      console.clear();
      console.error(`${error.message}`);
      return;
    }

    console.clear();
    bookings.forEach((b, i) => {
      console.log(
        `${i + 1}) Booking for ${chalk.yellowBright(`${b.passengerName}`)} for ${chalk.yellowBright(`${b.date}`)} ${chalk.gray(`${b.id}`)}`
      );
    });
    await question("\nPress Enter to return to the menu...");
  }
  async searchBookings(): Promise<void> {
    const bookingKeyword = await question(
      "Search for a booking (Enter id, Passanger Name or Date / 0 for return): "
    );
    if (bookingKeyword === "0") return;

    console.clear();

    let bookingMatches = [];
    try {
      bookingMatches = await this.service.findBookings(bookingKeyword);
    } catch (error: any) {
      console.clear();
      console.error(`${error.message}`);
      return;
    }

    bookingMatches.forEach((b, i) => {
      console.log(
        `${i + 1}) Booking for ${chalk.yellowBright(`${b.passengerName}`)} for ${chalk.yellowBright(`${b.date}`)} ${chalk.gray(`${b.id}`)}`
      );
    });

    await question("\nPress Enter to return to the menu...");
  }
}
