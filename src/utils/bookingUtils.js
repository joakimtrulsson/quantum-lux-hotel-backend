module.exports = {
  calculateTotalCost: function (rooms, totalDays) {
    let price = 0;
    for (let index = 0; index < rooms.length; index++) {
      price += rooms[index].price;
    }

    return price * totalDays;
  },
  calculateTotalDays: function (checkIn, checkOut) {
    return new Date(checkOut).getDate() - new Date(checkIn).getDate();
  },
  validateGuestCountForRooms: function (rooms, totalGuests) {
    let total = 0;
    for (let index = 0; index < rooms.length; index++) {
      total += rooms[index].maxGuests;
    }

    return totalGuests <= total;
  },
};
