type SeatProps = {
  id: number;
  isBooked: boolean;
};

export class Seat {
  id: number;
  isBooked: boolean;

  constructor(props: SeatProps) {
    this.id = props.id;
    this.isBooked = props.isBooked;
  }
}
