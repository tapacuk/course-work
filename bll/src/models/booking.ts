type BookingProps = {
  id: string;
  passengerName: string;
  date: string;
};

export class Booking {
  id: string;
  passengerName: string;
  date: string;

  constructor(props: BookingProps) {
    this.id = props.id;
    this.passengerName = props.passengerName;
    this.date = props.date;
  }
}
