import * as path from "path";
import { promises as fs } from "fs";
import { TrainService, Train, Wagon, Seat, Booking } from "course-work-bll";

const filePath = path.resolve(__dirname, "..", "..", "temp-trains.json");

describe("TrainService", () => {
  let service: TrainService;

  beforeEach(async () => {
    try {
      await fs.unlink(filePath);
    } catch {}
    service = new TrainService(filePath);
  });

  afterEach(async () => {
    try {
      await fs.unlink(filePath);
    } catch {}
  });

  test("should create a empty file", async () => {
    await service.create(filePath);
    const loaded = await service.load(filePath);
    expect(Array.isArray(loaded)).toBe(true);
    expect(loaded.length).toBe(0);
  });

  test("should throw an error when file path is invalid", async () => {
    await expect(service.create("")).rejects.toThrow("Invalid file path");
  });

  test("should save a train", async () => {
    await service.create(filePath);

    const name = "Express";
    const route = "A-B";

    const id = await service.generateID(name, route);
    const train = new Train({
      id,
      name,
      route,
      wagons: [
        new Wagon({
          id: 1,
          type: "coupe",
          seats: [new Seat({ id: 1, isBooked: false, booking: [] })],
        }),
      ],
    });

    await service.save(filePath, train);

    const loaded = await service.load(filePath);
    expect(loaded.length).toBe(1);
    const l = loaded[0]!;
    expect(l.id).toBe(id);
    expect(l.name).toBe("Express");
    expect(l.wagons[0].seats[0].id).toBe(1);
  });

  test("throw an error when deleting train with booked seats", async () => {
    await service.create(filePath);

    const name = "BookedTrain";
    const route = "X-Y";

    const id = await service.generateID(name, route);
    const train = new Train({
      id,
      name,
      route,
      wagons: [
        new Wagon({
          id: 1,
          type: "berth",
          seats: [
            new Seat({
              id: 1,
              isBooked: true,
              booking: [
                new Booking({
                  id: "b1",
                  passengerName: "Bob",
                  date: "2025-01-01",
                }),
              ],
            }),
          ],
        }),
      ],
    });

    await service.save(filePath, train);

    await expect(service.deleteSpecific(filePath, id)).rejects.toThrow(
      "Cannot delete train: some seats are booked"
    );
  });

  test("should remove a train with no seats booked", async () => {
    await service.create(filePath);

    const name = "Removable";
    const route = "R-T";

    const id = await service.generateID(name, route);
    const train = new Train({
      id,
      name,
      route,
      wagons: [
        new Wagon({
          id: 1,
          type: "coupe",
          seats: [new Seat({ id: 1, isBooked: false, booking: [] })],
        }),
      ],
    });

    await service.save(filePath, train);
    expect((await service.load(filePath)).length).toBe(1);

    await service.deleteSpecific(filePath, id);
    const after = await service.load(filePath);
    expect(after.length).toBe(0);
  });

  test("should return matches and throw when none found", async () => {
    await service.create(filePath);

    const name = "Finder";
    const route = "AA-BB";

    const id = await service.generateID(name, route);
    const train = new Train({
      id,
      name,
      route,
      wagons: [],
    });

    await service.save(filePath, train);

    const matches = await service.findByID("finder");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.id).toBe(id);

    await expect(service.findByID("no-such-id-xyz")).rejects.toThrow(
      "No matches found"
    );
  });

  test("should update an existing train", async () => {
    await service.create(filePath);

    let name = "Train";
    let route = "1-2";

    const id = await service.generateID(name, route);
    const train = new Train({
      id,
      name,
      route,
      wagons: [],
    });

    await service.save(filePath, train);

    name = "TrainUpdated";
    const updated = new Train({
      id,
      name,
      route,
      wagons: [],
    });
    await service.updateTrain(filePath, updated);

    const loaded = await service.load(filePath);
    expect(loaded.length).toBe(1);
    expect(loaded[0]!.name).toBe("TrainUpdated");
    expect(loaded[0]!.id).toBe("TRAIN-TRAINUPDATED-1-2");
  });

  test("should delete a file with a train", async () => {
    await service.create(filePath);

    const name = "Express";
    const route = "A-B";
    const id = await service.generateID(name, route);
    const train = new Train({
      id,
      name,
      route,
      wagons: [],
    });

    await service.save(filePath, train);

    let loaded = await service.load(filePath);
    expect(loaded.length).toBe(1);
    await service.delete(filePath);
    expect(await service.load(filePath)).toEqual([]);
  });
});
