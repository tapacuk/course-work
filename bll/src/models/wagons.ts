import { Seat } from "./seat";

type WagonType = "coupe" | "berth";
type WagonProps = {
  id: number;
  type: WagonType;
  seats: Seat[];
};

export class Wagon {
  id: number;
  type: WagonType;
  seats: Seat[];

  constructor(props: WagonProps) {
    this.id = props.id;
    this.type = props.type;
    this.seats = props.seats;
  }
}
