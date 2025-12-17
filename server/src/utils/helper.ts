export const minAge= (value:string):boolean => {
    const selectedDate = new Date(value);
    const today = new Date();
    let age =
      today.getFullYear() - selectedDate.getFullYear();
    const m =
      today.getMonth() - selectedDate.getMonth();
    if (
      m < 0 ||
      (m === 0 &&
        today.getDate() < selectedDate.getDate())
    ) {
      age--;
    }
    if (age < 18) {
      return false;
    }
    return true;
  }