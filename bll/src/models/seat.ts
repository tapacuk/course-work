import { Booking } from "./booking";

type SeatProps = {
  id: number;
  isBooked: boolean;
  booking?: Booking[];
};

export class Seat {
  id: number;
  isBooked: boolean;
  booking?: Booking[];

  constructor(props: SeatProps) {
    this.id = props.id;
    this.isBooked = props.isBooked;
    this.booking = props.booking;
  }
}
