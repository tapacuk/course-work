import { Wagon } from "./wagons";

type TrainProps = {
  id: string;
  name: string;
  route: string;
  wagons: Wagon[];
};

export class Train {
  id: string;
  name: string;
  route: string;
  wagons: Wagon[];

  constructor(props: TrainProps) {
    this.id = props.id ?? this.generateID();
    this.name = props.name;
    this.route = props.route;
    this.wagons = props.wagons;
  }

  generateID(): string {
    return `TRAIN-${this.name.toUpperCase().trim}-${this.route.toUpperCase().trim()}`;
  }
}
