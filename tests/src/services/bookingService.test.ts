import * as path from "path";
import {
  BookingService,
  TrainService,
  Train,
  Wagon,
  Seat,
  Booking,
} from "course-work-bll";

const filePath = path.resolve(__dirname, "..", "..", "temp-trains-other.json");

describe("BookingService", () => {
  let service: BookingService;
  let trainService: TrainService;

  beforeEach(async () => {
    trainService = new TrainService(filePath);
    service = new BookingService(filePath);
  });

  test("should add a booking and persist it", async () => {
    await trainService.create(filePath);

    const name = "Express";
    const route = "A-B";
    const id = await trainService.generateID(name, route);

    const seat = new Seat({ id: 1, isBooked: false, booking: [] });
    const wagon = new Wagon({ id: 1, type: "coupe", seats: [seat] });
    const train = new Train({ id, name, route, wagons: [wagon] });

    await trainService.save(filePath, train);

    await service.addBooking(train, wagon, seat, "Alice");

    const loaded = await trainService.load(filePath);
    expect(loaded.length).toBe(1);
    const ltrain = loaded[0]!;
    const lwagon = ltrain.wagons[0]!;
    const lseat = lwagon.seats[0]!;

    expect(lseat.isBooked).toBe(true);
    expect(Array.isArray(lseat.booking)).toBe(true);
    expect(lseat.booking!.length).toBe(1);
    const b = lseat.booking![0]!;
    expect(b.passengerName).toBe("Alice");
    expect(b.id).toMatch(/EXPRESS-WAGON1-COUPE-SEAT1-ALICE/);
  });

  test("addBooking initializes missing booking array and preserves other wagons", async () => {
    await trainService.create(filePath);

    const name = "MultiWagon";
    const route = "M-N";
    const id = await trainService.generateID(name, route);

    const seat = new Seat({ id: 1, isBooked: false });
    const targetWagon = new Wagon({ id: 10, type: "coupe", seats: [seat] });

    const otherWagon = new Wagon({ id: 11, type: "berth", seats: [] });
    const train = new Train({
      id,
      name,
      route,
      wagons: [targetWagon, otherWagon],
    });

    await trainService.save(filePath, train);

    await service.addBooking(train, targetWagon, seat, "Zed");

    const loaded = await trainService.load(filePath);
    expect(loaded[0]!.wagons.length).toBe(2);
    const lseat = loaded[0]!.wagons.find((w) => w.id === 10)!.seats[0]!;
    expect(lseat.booking).toBeDefined();
    expect(lseat.booking!.length).toBe(1);
  });

  test("should remove a booking and update seat state", async () => {
    await trainService.create(filePath);

    const name = "BookedTrain";
    const route = "X-Y";
    const id = await trainService.generateID(name, route);

    const booking = new Booking({
      id: "BK-1",
      passengerName: "Bob",
      date: "2025-01-01",
    });
    const seat = new Seat({ id: 1, isBooked: true, booking: [booking] });
    const wagon = new Wagon({ id: 1, type: "berth", seats: [seat] });
    const train = new Train({ id, name, route, wagons: [wagon] });

    await trainService.save(filePath, train);

    const otherWagon = new Wagon({ id: 2, type: "coupe", seats: [] });
    train.wagons.push(otherWagon);

    await trainService.updateTrain(filePath, train);

    await service.removeBooking("BK-1");

    const loaded = await trainService.load(filePath);
    // other wagon should remain
    expect(loaded[0]!.wagons.some((w) => w.id === 2)).toBeTruthy();
    const lseat = loaded[0]!.wagons.find((w) => w.id === 1)!.seats[0]!;
    expect(lseat.isBooked).toBe(false);
    expect(lseat.booking).toBeDefined();
    expect(lseat.booking!.length).toBe(0);

    await expect(service.removeBooking("no-such-id")).rejects.toThrow(
      "Booking not found"
    );
  });

  test("should update an existing booking", async () => {
    await trainService.create(filePath);

    const name = "UpdTrain";
    const route = "U-V";
    const id = await trainService.generateID(name, route);

    const booking = new Booking({
      id: "B-1",
      passengerName: "Carl",
      date: "2025-02-02",
    });
    const seat = new Seat({ id: 1, isBooked: true, booking: [booking] });
    const wagon = new Wagon({ id: 1, type: "coupe", seats: [seat] });
    const train = new Train({ id, name, route, wagons: [wagon] });

    await trainService.save(filePath, train);

    const updated = new Booking({
      id: "B-1",
      passengerName: "Carl Updated",
      date: "2025-03-03",
    });
    await service.updateBooking(updated);

    const loaded = await trainService.load(filePath);
    const b = loaded[0]!.wagons[0]!.seats[0]!.booking![0]!;
    expect(b.passengerName).toBe("Carl Updated");
    expect(b.date).toBe("2025-03-03");
  });

  test("updateBooking preserves other wagons and resolves when no match found", async () => {
    await trainService.create(filePath);

    const name = "UpdMulti";
    const route = "X-Y";
    const id = await trainService.generateID(name, route);

    const booking = new Booking({
      id: "UM-1",
      passengerName: "Ori",
      date: "2025-08-08",
    });
    const seat = new Seat({ id: 1, isBooked: true, booking: [booking] });
    const wagon = new Wagon({ id: 1, type: "coupe", seats: [seat] });
    const otherWagon = new Wagon({ id: 2, type: "berth", seats: [] });
    const train = new Train({ id, name, route, wagons: [wagon, otherWagon] });

    await trainService.save(filePath, train);

    const updated = new Booking({
      id: "UM-1",
      passengerName: "Ori Upd",
      date: "2025-09-09",
    });
    await service.updateBooking(updated);

    const loaded = await trainService.load(filePath);
    expect(loaded[0]!.wagons.some((w) => w.id === 2)).toBeTruthy();
    const b = loaded[0]!.wagons.find((w) => w.id === 1)!.seats[0]!.booking![0]!;
    expect(b.passengerName).toBe("Ori Upd");

    await expect(
      service.updateBooking(
        new Booking({ id: "NOPE", passengerName: "X", date: "2025-01-01" })
      )
    ).resolves.toBeUndefined();
  });

  test("should find bookings by keyword and validate input", async () => {
    await trainService.create(filePath);

    const name = "Finder";
    const route = "A-A";
    const id = await trainService.generateID(name, route);

    const booking1 = new Booking({
      id: "F-1",
      passengerName: "Alice",
      date: "2025-04-04",
    });
    const booking2 = new Booking({
      id: "F-2",
      passengerName: "Bob",
      date: "2025-05-05",
    });

    const seat1 = new Seat({ id: 1, isBooked: true, booking: [booking1] });
    const seat2 = new Seat({ id: 2, isBooked: true, booking: [booking2] });
    const wagon = new Wagon({ id: 1, type: "coupe", seats: [seat1, seat2] });
    const train = new Train({ id, name, route, wagons: [wagon] });

    await trainService.save(filePath, train);

    const matches = await service.findBookings("alice");
    expect(matches.length).toBe(1);
    expect(matches[0]!.passengerName).toBe("Alice");

    await expect(service.findBookings("")).rejects.toThrow(
      "Invalid search keyword"
    );
    await expect(
      service.findBookings(null as unknown as string)
    ).rejects.toThrow("Invalid search keyword");
    await expect(service.findBookings("no-match-xyz")).rejects.toThrow(
      "Bookings not found"
    );
  });

  test("should load all bookings or throw when none", async () => {
    await trainService.create(filePath);

    await expect(service.loadBookings()).rejects.toThrow("No bookings found");

    const name = "Loader";
    const route = "L-R";
    const id = await trainService.generateID(name, route);

    const booking = new Booking({
      id: "LD-1",
      passengerName: "D",
      date: "2025-06-06",
    });
    const seat = new Seat({ id: 1, isBooked: true, booking: [booking] });
    const wagon = new Wagon({ id: 1, type: "coupe", seats: [seat] });
    const train = new Train({ id, name, route, wagons: [wagon] });

    await trainService.save(filePath, train);

    const all = await service.loadBookings();
    expect(all.length).toBeGreaterThan(0);
    await trainService.delete(filePath);
  });

  test("seatFindById validations", async () => {
    const wagon = new Wagon({
      id: 1,
      type: "coupe",
      seats: [new Seat({ id: 1, isBooked: false, booking: [] })],
    });

    await expect(service.seatFindById(wagon, 0)).rejects.toThrow(
      "Invalid seat ID"
    );
    await expect(service.seatFindById(wagon, NaN)).rejects.toThrow(
      "Invalid seat ID"
    );
    await expect(service.seatFindById(wagon, 2)).rejects.toThrow(
      "Seat not found"
    );

    const bookedSeat = new Seat({ id: 3, isBooked: true, booking: [] });
    wagon.seats.push(bookedSeat);
    await expect(service.seatFindById(wagon, 3)).rejects.toThrow(
      "Seat is already booked"
    );

    const valid = await service.seatFindById(wagon, 1);
    expect(valid.id).toBe(1);
  });

  test("generateDateString edge cases", async () => {
    const s = await service.generateDateString(0);
    expect(typeof s).toBe("string");
    expect(s).toMatch(/\d{2}\.\d{2}\.\d{4}/);

    const today = new Date();
    const expectedDay = String(today.getDate()).padStart(2, "0");
    const expectedMonth = String(today.getMonth() + 1).padStart(2, "0");
    const expectedYear = today.getFullYear();
    const expectedString = `${expectedDay}.${expectedMonth}.${expectedYear}`;
    await expect(service.generateDateString(NaN)).resolves.toBe(expectedString);

    await expect(service.generateDateString(-1)).rejects.toThrow(
      "Date cannot be before today"
    );
  });

  test("generateBookingID and updateBookingID behavior", async () => {
    const train = new Train({
      id: "T",
      name: "My Train",
      route: "R",
      wagons: [],
    });
    const wagon = new Wagon({ id: 2, type: "berth", seats: [] });
    const seat = new Seat({ id: 5, isBooked: false, booking: [] });

    const id = await service.generateBookingID(train, wagon, seat, "John Doe");
    expect(id).toMatch(/MY-TRAIN-WAGON2-BERTH-SEAT5-JOHN-DOE/);

    const booking = new Booking({
      id,
      passengerName: "John Doe",
      date: "2025-07-07",
    });
    const updatedId = await service.updateBookingID(booking, "Jane Roe");
    expect(updatedId.endsWith("JANE-ROE")).toBeTruthy();

    await expect(
      service.updateBookingID(booking, "" as unknown as string)
    ).rejects.toThrow("Invalid passenger name");
  });
});
