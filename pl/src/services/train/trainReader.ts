import { question } from "../question";
import { Seat, Train, TrainService, Wagon } from "course-work-bll";

export default class TrainShower {
  private filePath: string;
  private service: any;

  constructor(filePath = "./trains.json", trainService?: TrainService) {
    this.filePath = filePath;

    try {
      this.service = trainService ?? new TrainService(this.filePath);
    } catch (error) {
      console.error("Failed to initialize TrainService", error);
    }
  }

  public async listTrains(): Promise<void> {
    console.clear();
    console.log("\n-- List of Trains --");
    try {
      const trains = await this.service.load(this.filePath);

      if (trains.length === 0) {
        console.log("No trains available");
      } else {
        trains.forEach((t: Train) => {
          console.log(`Name: ${t.name}, Route: ${t.route}, ID: ${t.id}`);
        });

        console.log(`> Total trains: ${trains.length}`);
        await question("\nPress any key to continue...");
        console.clear();
      }
    } catch (error) {
      console.error("Failed to load trains:", error);
    }
  }

  public async searchTrain(): Promise<void> {
    const keyword = await question("Search for a train: ");
    if (!keyword) {
      console.log("Keyword is required.");
      return;
    }

    const trains = await this.service.load(this.filePath);
    const normalized = keyword.toUpperCase().trim();
    const matches = trains.filter((t: Train) =>
      t.id.toUpperCase().includes(normalized)
    );

    if (matches.length === 0) {
      console.clear();
      console.log("No matching trains found.");
      await question("\nPress any key to continue...");
      return;
    }

    const matchesResult = () => {
      matches.forEach((t: Train, i: number) => {
        console.log(`${i + 1}. ${t.id} (${t.name}, ${t.route})`);
      });
    };

    console.clear();
    console.log("\nFound trains:");
    matchesResult();

    const lookForDetails = await question("\nLook for details? (y/n): ");
    if (lookForDetails.toLowerCase() !== "y") {
      return;
    }

    let choice: any;
    let running = true;
    while (running) {
      console.clear();
      console.log("\nTrains:");
      matchesResult();

      choice = await question(
        "\nEnter number of train for details (or 0 to cancel): "
      );

      if (Number(choice) === 0) {
        console.clear();
        console.log("Cancelled.");
        return;
      }
      if (
        Number(choice) < 0 ||
        Number(choice) - 1 >= matches.length ||
        isNaN(Number(choice))
      ) {
        console.clear();
        console.log("Invalid choice.");
        continue;
      } else {
        running = false;
      }
    }

    const index = Number(choice) - 1;
    const trainToShowDetail = matches[index];

    const totalWagons = trainToShowDetail.wagons.length;
    const totalSeats = trainToShowDetail.wagons.reduce(
      (acc: number, w: Wagon) => acc + w.seats.length,
      0
    );
    const totalBooked = trainToShowDetail.wagons.reduce(
      (acc: number, w: Wagon) => acc + w.seats.filter((s) => s.isBooked).length,
      0
    );
    const totalBookedPrecent = ((totalBooked / totalSeats) * 100).toFixed(2);

    console.clear();
    console.log(`\n-- Details for ${trainToShowDetail.id} --`);
    console.log(`Name: ${trainToShowDetail.name}`);
    console.log(`Route: ${trainToShowDetail.route}`);
    console.log("Wagon Details:");
    trainToShowDetail.wagons.forEach((w: Wagon) => {
      const bookedSeats = w.seats.filter((s) => s.isBooked).length;
      const availableSeats = w.seats.length - bookedSeats;
      const bookedPercent = ((bookedSeats / w.seats.length) * 100).toFixed(2);

      console.log(`\n  - Wagon ID: ${w.id}, Type: ${w.type}`);
      console.log(
        `    Total seats: ${w.seats.length}, Booked: ${bookedSeats}, Available: ${availableSeats} (${bookedPercent}%)`
      );
      const seatsInfo = w.seats
        .map((s, i) =>
          (i + 1) % 6 === 0
            ? `${i + 1}. ${s.isBooked ? "+" : "-"}\n        `
            : `${i + 1}. ${s.isBooked ? "+" : "-"}`
        )
        .join("   ");

      console.log(`    Seats: ${seatsInfo}`);
    });

    console.log("\n> Total ");
    console.log(
      `  Wagons: ${totalWagons} | Seats: ${totalSeats} | Booked: ${totalBooked} seats / ${totalBookedPrecent}%`
    );
    await question("\nPress any key to continue...");
    console.clear();
  }
}
