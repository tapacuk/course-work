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
    const keyword = await question("Search for a train for booking:' ");
    let trainMatches = [];
    try {
      trainMatches = await this.trainService.findByID(keyword);
    } catch (error) {
      console.clear();
      console.log(error);
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
        `Enter number of train you want to book a seat in (Enter 0 to cancel): `
      );

      if (Number(trainChoice) === 0) return;
      if (
        await this.searchHelper.validateSearchInput(
          trainChoice,
          trainMatches.length
        )
      ) {
        console.clear();
        console.log("Invalid choice.");
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
        `"Selected Train:" ${train.name}, ${train.route} ${chalk.gray(`${train.id}`)}`
      );
      train.wagons.forEach((w) => {
        console.log(
          `${chalk.yellowBright("Wagon ID:")} ${w.id}, ${chalk.yellowBright("Type:")} ${w.type}, ${chalk.yellowBright("Seats:")} ${w.seats.length}`
        );
      });

      const wagonChoice = Number(
        await question("Enter wagon ID to book a seat in: ")
      );

      if (wagonChoice === 0) return;
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
        `"Selected Train:" ${train.name}, ${train.route} ${chalk.gray(`${train.id}`)}`
      );
      console.log(this.wagonService.getWagonInfo(train, wagon.id));
      const seatChoice = Number(await question("Enter seat ID to book: "));
      if (seatChoice === 0) return;

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
      passanger = await question("Enter passenger name: ");
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
}
