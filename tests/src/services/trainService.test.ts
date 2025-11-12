import * as path from "path";
import { promises as fs } from "fs";
import { TrainService, Train, Wagon, Seat, Booking } from "course-work-bll";

// const filePath = path.resolve(
//   __dirname,
//   "..",
//   "..",
//   `train-data-${Date.now()}.json`
// );
const filePath = path.resolve(__dirname, "..", "..", "temp-trains.json");

describe("TrainService", () => {
  let service: TrainService;

  beforeEach(async () => {
    service = new TrainService(filePath);
  });

  test("should createFile a empty file", async () => {
    await service.createFile(filePath);
    const loaded = await service.loadTrains(filePath);
    expect(Array.isArray(loaded)).toBe(true);
    expect(loaded.length).toBe(0);
  });

  test("should throw an error when file path is invalid", async () => {
    await expect(service.createFile("")).rejects.toThrow("Invalid file path");
  });

  test("should saveTrain a train", async () => {
    await service.createFile(filePath);

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

    await service.saveTrain(filePath, train);

    const loaded = await service.loadTrains(filePath);
    expect(loaded.length).toBe(1);
    const l = loaded[0]!;
    expect(l.id).toBe(id);
    expect(l.name).toBe("Express");
    expect(l.wagons[0].seats[0].id).toBe(1);
  });

  test("should create a train with correct wagons and seats", async () => {
    const name = "InterCity";
    const route = "Kyiv-Lviv";
    const wagonsNum = 2;
    const wagonsType = "coupe";
    const seatsPerWagon = 3;

    const train = await service.createTrain(
      name,
      route,
      wagonsNum,
      wagonsType,
      seatsPerWagon
    );

    expect(train).toBeInstanceOf(Train);
    expect(train.name).toBe(name);
    expect(train.route).toBe(route);
    expect(train.wagons).toHaveLength(wagonsNum);

    const firstWagon = train.wagons[0];
    expect(firstWagon).toBeInstanceOf(Wagon);
    expect(firstWagon.type).toBe(wagonsType);
    expect(firstWagon.seats).toHaveLength(seatsPerWagon);

    const firstSeat = firstWagon.seats[0];
    expect(firstSeat).toBeInstanceOf(Seat);
    expect(firstSeat.id).toBe(1);
    expect(firstSeat.isBooked).toBe(false);
    expect(firstSeat.booking).toEqual([]);

    expect(train.wagons[0].seats).not.toBe(train.wagons[1].seats);
  });

  test("should handle wagonsNum or seatsPerWagon = 0", async () => {
    const train = await service.createTrain("Empty", "Nowhere", 0, "coupe", 0);

    expect(train.wagons).toHaveLength(0);
  });

  test("throw an error when deleting train with booked seats", async () => {
    await service.createFile(filePath);

    const name = "BookedTrain";
    const route = "X-Y";

    const id = await service.generateID(name, route);
    const train = new Train({
      id: id,
      name: name,
      route: route,
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

    await service.saveTrain(filePath, train);

    await expect(service.deleteTrain(filePath, id)).rejects.toThrow(
      "Cannot delete train: some seats are booked"
    );
  });

  test("should remove a train with no seats booked", async () => {
    await service.createFile(filePath);

    const name = "Removable";
    const route = "R-T";

    const id = await service.generateID(name, route);
    const train = new Train({
      id: id,
      name: name,
      route: route,
      wagons: [
        new Wagon({
          id: 1,
          type: "coupe",
          seats: [new Seat({ id: 1, isBooked: false, booking: [] })],
        }),
      ],
    });

    await service.saveTrain(filePath, train);
    expect((await service.loadTrains(filePath)).length).toBe(1);

    await service.deleteTrain(filePath, id);
    const after = await service.loadTrains(filePath);
    expect(after.length).toBe(0);
  });

  test("should return matches and throw when none found", async () => {
    await service.createFile(filePath);

    const name = "Finder";
    const route = "AA-BB";

    const id = await service.generateID(name, route);
    const train = new Train({
      id: id,
      name: name,
      route: route,
      wagons: [],
    });

    await service.saveTrain(filePath, train);

    const matches = await service.findByID("finder");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.id).toBe(id);

    await expect(service.findByID("nonexistent")).rejects.toThrow(
      "No matches found"
    );
  });

  test("should update an existing train", async () => {
    await service.createFile(filePath);

    let name = "Train";
    let route = "1-2";

    const id = await service.generateID(name, route);
    const train = new Train({
      id: id,
      name: name,
      route: route,
      wagons: [],
    });

    await service.saveTrain(filePath, train);

    name = "TrainUpdated";
    const updated = new Train({
      id: id,
      name: name,
      route: route,
      wagons: [],
    });
    await service.updateTrain(filePath, updated);

    const loaded = await service.loadTrains(filePath);
    expect(loaded.length).toBe(1);
    expect(loaded[0]!.name).toBe("TrainUpdated");
    expect(loaded[0]!.id).toBe("TRAIN-TRAINUPDATED-1-2");
  });

  test("should delete a file with a train", async () => {
    await service.createFile(filePath);

    const name = "Express";
    const route = "A-B";
    const id = await service.generateID(name, route);
    const train = new Train({
      id: id,
      name: name,
      route: route,
      wagons: [],
    });

    await service.saveTrain(filePath, train);

    let loaded = await service.loadTrains(filePath);
    expect(loaded.length).toBe(1);
    await service.deleteFile(filePath);
    expect(await service.loadTrains(filePath)).toEqual([]);
  });

  test("should throw when deleting a file that does not exist", async () => {
    await expect(service.deleteFile(filePath)).rejects.toThrow(
      "Failed to delete file"
    );
  });
});
