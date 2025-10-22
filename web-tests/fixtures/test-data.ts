export const testUsers = {
  customer: {
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test Customer',
  },
  admin: {
    username: 'admin',
    password: 'admin',
  },
  delivery: {
    username: 'delivery1',
    password: 'delivery123',
  },
};

export const testProducts = {
  wine: { id: 1, name: 'Test Wine', price: 2500 },
  beer: { id: 2, name: 'Test Beer', price: 800 },
};

export const testAddresses = {
  home: {
    label: 'Home',
    street: 'Test Street 123',
    city: 'Reykjavik',
    postalCode: '101',
    country: 'Iceland',
  },
};

export const testShippingData = {
  express: {
    name: 'Express Delivery',
    nameIs: 'Hraðsending',
    type: 'DELIVERY',
    fee: 500,
    estimatedDays: 1,
    sortOrder: 10,
    description: 'Fast delivery within 24 hours',
    descriptionIs: 'Hraðsending innan 24 klukkustunda',
  },
  pickup: {
    name: 'Store Pickup',
    nameIs: 'Afhending í verslun',
    type: 'PICKUP',
    fee: 0,
    estimatedDays: 0,
    sortOrder: 20,
    description: 'Pick up your order at our store',
    descriptionIs: 'Sæktu pöntunina í verslun okkar',
  },
};