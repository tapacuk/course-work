import {
  BookingService,
  Seat,
  TrainService,
  WagonService,
  SearchHelper,
  Booking,
} from "course-work-bll";
import { question } from "./question";
import chalk from "chalk";

export class BookingController {
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

  public async addBooking(): Promise<void> {
    const keyword = await question("\nSearch for a train for booking: ");
    let trainMatches = [];
    try {
      trainMatches = await this.trainService.findByID(keyword);
    } catch (error: any) {
      console.clear();
      console.error(`${error.message}`);
      return;
    }

    console.clear();
    let trainChoice;
    while (true) {
      trainMatches.forEach((t, i) => {
        console.log(
          `${i + 1}) ${chalk.yellowBright("Name:")} ${t.name}, ${chalk.yellowBright("Route:")} ${t.route} ${chalk.gray(`(${t.id})`)}`
        );
      });

      trainChoice = await question(
        `\nEnter number of train you want to book a seat in (Enter 0 to cancel): `
      );

      if (Number(trainChoice) === 0) {
        console.clear();
        return;
      }

      if (
        await this.searchHelper.validateSearchInput(
          trainChoice,
          trainMatches.length
        )
      ) {
        console.clear();
        console.error("Invalid choice.\n");
        continue;
      } else {
        break;
      }
    }

    const index = Number(trainChoice) - 1;
    const train = trainMatches[index];
    let wagon;

    console.clear();
    while (true) {
      console.log(
        `\n${chalk.yellowBright("Selected Train")}: ${train.name}, ${train.route} ${chalk.gray(`${train.id}`)}`
      );
      train.wagons.forEach((w) => {
        console.log(
          `${chalk.yellowBright("Wagon ID:")} ${w.id}, ${chalk.yellowBright("Type:")} ${w.type}, ${chalk.yellowBright("Seats:")} ${w.seats.length}`
        );
      });

      const wagonChoice = Number(
        await question("\nEnter wagon ID to book a seat in: ")
      );

      if (wagonChoice === 0) {
        console.clear();
        return;
      }

      let wagonMatches;

      try {
        wagonMatches = this.wagonService.findById(train, wagonChoice);
      } catch (error: any) {
        console.clear();
        console.error(`${error.message}`);
        continue;
      }
      wagon = wagonMatches;
      break;
    }
    console.clear();

    let seat: Seat;

    while (true) {
      console.log(
        `"\nSelected Train:" ${train.name}, ${train.route} ${chalk.gray(`${train.id}`)}`
      );
      console.log(this.wagonService.getWagonInfo(train, wagon.id));
      const seatChoice = Number(await question("\nEnter seat ID to book: "));
      if (seatChoice === 0) {
        console.clear();
        return;
      }

      try {
        seat = await this.service.seatFindById(wagon, seatChoice);
      } catch (error: any) {
        console.clear();
        console.error(`${error.message}`);
        continue;
      }
      break;
    }

    console.clear();
    let passanger: string;
    while (true) {
      passanger = await question("\nEnter passenger name: ");
      if (!passanger.trim()) {
        console.clear();
        console.log("Passenger name cannot be empty.");
        continue;
      }
      break;
    }

    console.clear();
    try {
      this.service.addBooking(train, wagon, seat, passanger.trim());
      console.log("Booking successful!");
    } catch (error: any) {
      console.clear();
      console.log(`${error.message}`);
      return;
    }
  }

  public async removeBooking(): Promise<void> {
    const bookingKeyword = await question(
      "\nSearch for booking to remove (or 0 to cancel): "
    );

    if (bookingKeyword.trim() === "0") {
      console.clear();
      console.log("Cancelled.");
      return;
    }

    let bookingMatches: Booking[] = [];
    try {
      bookingMatches = await this.service.findBookings(bookingKeyword);
    } catch (error: any) {
      console.clear();
      console.error(`${error.message}`);
      return;
    }

    let choiceBooking;

    console.clear();
    while (true) {
      console.log("\nFound bookings:");
      bookingMatches.forEach((b: Booking, i) => {
        console.log(
          `${i + 1}) Booking for ${chalk.yellowBright(`${b.passengerName}`)} for ${chalk.yellowBright(`${b.date}`)} ${chalk.gray(`${b.id}`)}`
        );
      });

      choiceBooking = await question(
        "\nSelect index of booking to remove (enter 0 to cancel): "
      );

      if (Number(choiceBooking) === 0) {
        console.clear();
        return;
      }

      if (
        await this.searchHelper.validateSearchInput(
          choiceBooking,
          bookingMatches.length
        )
      ) {
        console.clear();
        console.log("Invalid choice.");
        continue;
      } else {
        break;
      }
    }

    const indexBooking = Number(choiceBooking) - 1;
    const booking = bookingMatches[indexBooking];

    try {
      await this.service.removeBooking(booking.id);
      console.clear();
      console.log("Booking removed successfully.");
    } catch (error: any) {
      console.clear();
      console.error(`${error.message}`);
      return;
    }
  }

  public async editBooking(): Promise<void> {
    const keyword = await question(
      "\nSearch for a booking to edit (Enter id, Passanger Name or Date / 0 for return): "
    );
    if (keyword === "0") {
      console.clear();
      return;
    }

    console.clear();

    let bookingMatches = [];
    try {
      bookingMatches = await this.service.findBookings(keyword);
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

    const choice = await question(
      "\nEnter id of booking to edit (or 0 to cancel): "
    );
    if (choice === "0") {
      console.clear();
      return;
    }

    try {
      this.searchHelper.validateSearchInput(choice, bookingMatches.length);
    } catch (error: any) {
      console.clear();
      console.error(`${error.message}`);
      return;
    }
    console.clear();

    const index = Number(choice) - 1;
    let bookingToEdit = bookingMatches[index];

    let editRunning = true;
    while (editRunning) {
      console.log(
        `\nEditing booking for ${chalk.yellowBright(`${bookingToEdit.passengerName}`)} for ${chalk.yellowBright(`${bookingToEdit.date}`)} ${chalk.gray(`${bookingToEdit.id}`)}`
      );
      console.log("\n1) Edit Passenger Name");
      console.log("2) Edit Date");
      console.log("0) Cancel");
      const input = await question("\nChoose an option to edit: ");
      switch (input) {
        case "1":
          console.clear();
          console.log(
            "Current Passenger Name: " +
              chalk.yellowBright(bookingToEdit.passengerName)
          );

          const newName = await question("\nEnter new passenger name: ");
          try {
            const newID = await this.service.updateBookingID(
              bookingToEdit,
              newName
            );
            bookingToEdit.passengerName = newName.trim();
            bookingToEdit.id = newID;
          } catch (error: any) {
            console.clear();
            console.error(`${error.message}`);
            continue;
          }
          console.clear();
          console.log("Passenger name updated successfully");
          break;
        case "2":
          console.clear();
          console.log(
            "\nCurrent date: " +
              chalk.yellowBright(await this.service.generateDateString(0))
          );
          console.log(
            chalk.gray("For date shift use numbers: 4 for 4 days later")
          );
          const newDate = await question("\nEnter date shift: ");
          try {
            const newDateShift = await this.service.generateDateString(
              Number(newDate)
            );
            bookingToEdit.date = newDateShift;
          } catch (error: any) {
            console.clear();
            console.error(`${error.message}`);
            continue;
          }
          console.clear();
          console.log("Date updated successfully");
          break;
        case "0":
          console.clear();
          console.log("Cancelled");
          editRunning = false;
          return;
        default:
          console.clear();
          console.log("Unknown option");
      }
    }

    try {
      await this.service.updateBooking(bookingToEdit);
      console.clear();
      console.log("Booking updated successfully.");
    } catch (error: any) {
      console.clear();
      console.error(error);
      return;
    }
  }
}
