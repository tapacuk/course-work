import * as path from "path";
import { promises as fs } from "fs";

import { TrainService, Train, Wagon, Seat, Booking } from "course-work-bll";

const tmpFile = path.resolve(__dirname, "..", "..", "tmp-trains.test.json");

describe("TrainService", () => {
  let service: TrainService;

  beforeEach(async () => {
    try {
      await fs.unlink(tmpFile);
    } catch {}
    service = new TrainService(tmpFile);
  });

  afterEach(async () => {
    try {
      await fs.unlink(tmpFile);
    } catch {}
  });

  test("create() creates an empty JSON file and load() returns []", async () => {
    await service.create(tmpFile);
    const loaded = await service.load(tmpFile);
    expect(Array.isArray(loaded)).toBe(true);
    expect(loaded.length).toBe(0);
  });

  test("save() persists a train and load() returns it back", async () => {
    await service.create(tmpFile);

    const id = await service.generateID("Express", "A - B");
    const train = new Train({
      id,
      name: "Express",
      route: "A - B",
      wagons: [
        new Wagon({
          id: 1,
          type: "coupe",
          seats: [new Seat({ id: 1, isBooked: false, booking: [] })],
        }),
      ],
    });

    await service.save(tmpFile, train);

    const loaded = await service.load(tmpFile);
    expect(loaded.length).toBe(1);
    const l = loaded[0]!;
    expect(l.id).toBe(id);
    expect(l.name).toBe("Express");
    expect(l.wagons[0].seats[0].id).toBe(1);
  });

  test("deleteSpecific() throws when some seats are booked", async () => {
    await service.create(tmpFile);

    const id = await service.generateID("BookedTrain", "X-Y");
    const train = new Train({
      id,
      name: "BookedTrain",
      route: "X-Y",
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

    await service.save(tmpFile, train);

    await expect(service.deleteSpecific(tmpFile, id)).rejects.toThrow(
      "Cannot delete train: some seats are booked"
    );
  });

  test("deleteSpecific() removes train when no seats are booked", async () => {
    await service.create(tmpFile);

    const id = await service.generateID("Removable", "R-T");
    const train = new Train({
      id,
      name: "Removable",
      route: "R-T",
      wagons: [
        new Wagon({
          id: 1,
          type: "coupe",
          seats: [new Seat({ id: 1, isBooked: false, booking: [] })],
        }),
      ],
    });

    await service.save(tmpFile, train);
    expect((await service.load(tmpFile)).length).toBe(1);

    await service.deleteSpecific(tmpFile, id);
    const after = await service.load(tmpFile);
    expect(after.length).toBe(0);
  });

  test("findByID() returns matches and throws when none found", async () => {
    await service.create(tmpFile);

    const id = await service.generateID("Finder", "AA-BB");
    const train = new Train({
      id,
      name: "Finder",
      route: "AA-BB",
      wagons: [],
    });

    await service.save(tmpFile, train);

    const matches = await service.findByID("finder");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.id).toBe(id);

    await expect(service.findByID("no-such-id-xyz")).rejects.toThrow(
      "No matches found"
    );
  });

  test("updateTrain() replaces an existing train", async () => {
    await service.create(tmpFile);

    const id = await service.generateID("Updater", "1-2");
    const train = new Train({
      id,
      name: "Updater",
      route: "1-2",
      wagons: [],
    });

    await service.save(tmpFile, train);

    const updated = new Train({
      id,
      name: "UpdaterX",
      route: "1-2",
      wagons: [],
    });
    await service.updateTrain(tmpFile, updated);

    const loaded = await service.load(tmpFile);
    expect(loaded.length).toBe(1);
    expect(loaded[0]!.name).toBe("UpdaterX");
  });
});
