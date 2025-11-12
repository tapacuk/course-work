import { Wagon } from "src/models/wagons";
import TrainService from "./trainService";
import { Seat } from "src/models/seat";
import { Train } from "src/models/train";
import { Booking } from "src/models/booking";
import { file } from "bun";

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
    const stringDate = await this.generateDateString(4);
    const id = await this.generateBookingID(train, wagon, seat, passanger);
    const passengerName = passanger;

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

  async removeBooking(bookingId: string): Promise<void> {
    const trains = await this.trainService.loadTrains(this.filePath);
    for (const train of trains) {
      for (const wagon of train.wagons) {
        for (const seat of wagon.seats) {
          if (seat.booking) {
            const bookingIndex = seat.booking.findIndex(
              (b: Booking) => b.id === bookingId
            );
            if (bookingIndex !== -1) {
              seat.booking.splice(bookingIndex, 1);
              seat.isBooked = false;
              const trainUpdates = train.wagons.map((w: Wagon) => {
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
    }
    throw new Error("Booking not found");
  }

  async updateBooking(Booking: Booking): Promise<void> {
    const trains = await this.trainService.loadTrains(this.filePath);

    for (const train of trains) {
      for (const wagon of train.wagons) {
        for (const seat of wagon.seats) {
          if (seat.booking) {
            const bookingIndex = seat.booking.findIndex(
              (b: Booking) => b.id === Booking.id
            );
            if (bookingIndex !== -1) {
              seat.booking[bookingIndex] = Booking;
              const trainUpdates = train.wagons.map((w: Wagon) => {
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
    }
  }

  async findBookings(keyword: string): Promise<Booking[]> {
    const trains = await this.trainService.loadTrains(this.filePath);
    if (!keyword || typeof keyword !== "string")
      throw new Error("Invalid search keyword");
    const normalized = keyword.toUpperCase().trim();
    const results: Booking[] = [];

    for (const train of trains) {
      for (const wagon of train.wagons) {
        for (const seat of wagon.seats) {
          if (!seat.booking || seat.booking.length === 0) continue;
          const matches = seat.booking.filter((b: Booking) => {
            const combined =
              `${b.id || ""} ${b.passengerName || ""} ${b.date || ""}`.toUpperCase();
            return combined.includes(normalized);
          });
          if (matches.length) results.push(...matches);
        }
      }
    }

    if (results.length === 0) throw new Error("Bookings not found");
    return results;
  }

  async loadBookings(): Promise<Booking[]> {
    const trains = await this.trainService.loadTrains(this.filePath);
    const bookings: Booking[] = [];
    for (const train of trains) {
      for (const wagon of train.wagons) {
        for (const seat of wagon.seats) {
          if (seat.booking && seat.booking.length > 0) {
            bookings.push(...seat.booking);
          }
        }
      }
    }
    if (bookings.length === 0) throw new Error("No bookings found");
    return bookings;
  }

  async seatFindById(wagon: Wagon, seatId: number): Promise<Seat> {
    if (seatId <= 0 || isNaN(seatId)) throw new Error("Invalid seat ID");
    const seat = wagon.seats.find((s: Seat) => s.id === Number(seatId));
    if (!seat) throw new Error("Seat not found");
    if (seat.isBooked) throw new Error("Seat is already booked");

    return seat;
  }

  async generateDateString(shift: number): Promise<string> {
    if (!shift) shift = 0;
    if (isNaN(shift)) throw new Error("Invalid date shift: should be a number");

    const date = new Date();
    date.setDate(date.getDate() + shift);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date < today) throw new Error("Date cannot be before today");

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const stringDate = `${day}.${month}.${year}`;
    return stringDate;
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
    const normalizedPassangerName = passanger
      .toUpperCase()
      .trim()
      .replace(/\s+/g, "-");
    return `${normalizedTrainName}-WAGON${wagon.id}-${normalizedWagonType}-SEAT${seat.id}-${normalizedPassangerName}`;
  }

  async updateBookingID(
    booking: Booking,
    newPassengerName: string
  ): Promise<string> {
    if (!newPassengerName || typeof newPassengerName !== "string")
      throw new Error("Invalid passenger name");

    const namePart = newPassengerName.toUpperCase().trim().replace(/\s+/g, "-");
    const idParts = booking.id.split("-");
    idParts[idParts.length - 1] = namePart;
    return idParts.join("-");
  }
}

export default BookingService;
