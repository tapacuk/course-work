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
    passanger: string
  ): Promise<void> {
    seat.isBooked = true;
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const id = await this.generateBookingID(train, wagon, seat, passanger);
    const passengerName = passanger;
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

  async removeBooking(train: Train, bookingId: string): Promise<void> {
    for (const wagon of train.wagons) {
      for (const seat of wagon.seats) {
        if (seat.booking) {
          const bookingIndex = seat.booking.findIndex(
            (b) => b.id === bookingId
          );
          if (bookingIndex !== -1) {
            seat.booking.splice(bookingIndex, 1);
            seat.isBooked = false;
            const trainUpdates = train.wagons.map((w) => {
              if (w.id === wagon.id) {
                return wagon;
              }
              return w;
            });

            train.wagons = trainUpdates;
            await this.trainService.updateTrain(this.filePath, train);
            return;
          }
        }
      }
    }
    throw new Error("Booking not found");
  }

  async findBookings(train: Train, keyword: string): Promise<Booking[]> {
    if (!keyword) throw new Error("Invalid search keyword");
    const normalized = keyword.toUpperCase().trim();
    const results: Booking[] = [];

    for (const wagon of train.wagons) {
      for (const seat of wagon.seats) {
        if (!seat.booking) continue;
        const matches = seat.booking.filter(
          (b) =>
            b.id.toUpperCase().includes(normalized) ||
            String(b.passengerName ?? "")
              .toUpperCase()
              .includes(normalized)
        );
        if (matches.length) results.push(...matches);
      }
    }

    if (results.length === 0) throw new Error("Bookings not found");
    return results;
  }

  async generateBookingID(
    train: Train,
    wagon: Wagon,
    seat: Seat,
    passanger: string
  ): Promise<string> {
    const normalizedTrainName = train.name
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "-");
    const normalizedWagonType = wagon.type.toUpperCase().trim();
    const normalizedPassangerName = passanger.toUpperCase().trim();
    return `${normalizedTrainName}-WAGON${wagon.id}-${normalizedWagonType}-SEAT${seat.id}-${normalizedPassangerName}`;
  }
}

export default BookingService;
