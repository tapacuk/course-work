import { WagonService, Train, Wagon, Seat } from "course-work-bll";

describe("WagonService", () => {
  let service: WagonService;

  beforeEach(() => {
    service = new WagonService();
  });

  test("should add a wagon with correct seats", () => {
    const train = new Train({ id: "T1", name: "T1", route: "R", wagons: [] });
    service.addWagon(train, "coupe", 4);

    expect(train.wagons.length).toBe(1);
    const w = train.wagons[0];
    expect(w.id).toBe(1);
    expect(w.seats.length).toBe(4);
    expect(w.seats[0].id).toBe(1);
    expect(w.seats.every((s: Seat) => s.isBooked === false)).toBeTruthy();
  });

  test("should throw on invalid wagon type", () => {
    const train = new Train({ id: "T2", name: "T2", route: "R", wagons: [] });
    expect(() => service.addWagon(train, "invalid-type", 2)).toThrow(
      "Invalid wagon type"
    );
  });

  test("should throw on non-positive seats number", () => {
    const train = new Train({ id: "T3", name: "T3", route: "R", wagons: [] });
    expect(() => service.addWagon(train, "coupe", 0)).toThrow(
      "Invalid number of seats"
    );
  });

  test("should throws when wagon missing or booked seats exist and deletes otherwise", () => {
    const train = new Train({ id: "T4", name: "T4", route: "R", wagons: [] });

    expect(() => service.deleteWagon(train, 1)).toThrow(
      "Wagon with this id is not found"
    );

    const bookedWagon = new Wagon({
      id: 1,
      type: "berth",
      seats: [new Seat({ id: 1, isBooked: true, booking: [] })],
    });
    train.wagons.push(bookedWagon);
    expect(() => service.deleteWagon(train, 1)).toThrow(
      "Cannot delete wagon: some seats are booked"
    );

    bookedWagon.seats[0].isBooked = false;
    service.deleteWagon(train, 1);
    expect(train.wagons.length).toBe(0);
  });

  test("should return a formatted string containing summary", () => {
    const seats = [
      new Seat({ id: 1, isBooked: true, booking: [] }),
      new Seat({ id: 2, isBooked: false, booking: [] }),
    ];
    const wagon = new Wagon({ id: 1, type: "coupe", seats });
    const train = new Train({
      id: "T5",
      name: "T5",
      route: "R",
      wagons: [wagon],
    });

    const info = service.getWagonInfo(train, 1);
    expect(typeof info).toBe("string");
    expect(info).toMatch(/Wagon ID:\s*1/);
    expect(info).toMatch(/Total Seats:\s*2/);
    expect(info).toMatch(/■|□/);
  });

  test("should validate input and returns wagon when found", () => {
    const wagon = new Wagon({ id: 2, type: "coupe", seats: [] });
    const train = new Train({
      id: "T6",
      name: "T6",
      route: "R",
      wagons: [wagon],
    });

    expect(() => service.findById(train, -1)).toThrow("Invalid wagon ID");
    expect(() => service.findById(train, 999)).toThrow("Wagon not found");

    const found = service.findById(train, 2);
    expect(found).toBe(wagon);
  });
});
