import { Wagon } from "src/models/wagons";
import TrainService from "./trainService";
import { Seat } from "src/models/seat";
import { Train } from "src/models/train";
import { Booking } from "src/models/booking";

export class BookingService {
  filePath: string;
  private trainService: TrainService;

  constructor(filePath: string = "./trains.json") {
    this.filePath = filePath;
    this.trainService = new TrainService(this.filePath);
  }

  async addBooking(
    train: Train,
    wagon: Wagon,
    seat: Seat,
    name: string
  ): Promise<void> {
    seat.isBooked = true;
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const id = await this.generateBookingID(train, wagon, seat);
    const passengerName = name;
    const stringDate = `${day}.${month}.${year}`;
    const booking: Booking = { id, passengerName, date: stringDate };

    if (!seat.booking) {
      seat.booking = [];
    }
    seat.booking.push(booking);
    const trainUpdates = train.wagons.map((w) => {
      if (w.id === wagon.id) {
        return wagon;
      }
      return w;
    });
    train.wagons = trainUpdates;
    await this.trainService.updateTrain(this.filePath, train);
  }

  async seatFindById(wagon: Wagon, seatId: number): Promise<Seat> {
    if (seatId <= 0 || isNaN(seatId)) throw new Error("Invalid seat ID");
    const seat = wagon.seats.find((s: Seat) => s.id === Number(seatId));
    if (!seat) throw new Error("Seat not found");
    if (seat.isBooked) throw new Error("Seat is already booked");

    return seat;
  }

  async generateBookingID(
    train: Train,
    wagon: Wagon,
    seat: Seat
  ): Promise<string> {
    const normalizedName = train.name.toUpperCase().trim().replace(/\s+/g, "-");
    const normalizedWagonType = wagon.type.toUpperCase().trim();
    return `${normalizedName}-${wagon.id}-${normalizedWagonType}-${seat.id}`;
  }
}

export default BookingService;
