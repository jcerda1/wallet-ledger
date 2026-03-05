export const ITEMS = [
  { id: 'a3f9c1b6-8d4e-4f6a-9b2a-111111111111', name: 'Bike', price: 19900 },
  { id: 'b4e8d2c7-7a3f-4c2b-8d1d-222222222222', name: 'TV', price: 49900 },
  { id: 'c5d7e3f8-6b2a-4e3c-9f0e-333333333333', name: 'Car', price: 1500000 },
  { id: 'd6c6f4a9-5c1b-4d4d-a0f1-444444444444', name: 'Laptop', price: 99900 },
  { id: 'e7b5e5ba-4d0a-4e5e-b1f2-555555555555', name: 'Phone', price: 79900 },
  {
    id: 'f8a4d6cb-3e9b-4f6f-c2e3-666666666666',
    name: 'Headphones',
    price: 29900,
  },
  { id: 'a9b3c7dc-2f8c-4a7a-d3f4-777777777777', name: 'Tablet', price: 59900 },
  { id: 'b0c2b8ed-1a7d-4b8b-e4a5-888888888888', name: 'Camera', price: 89900 },
  {
    id: 'c1d1a9fe-0b6e-4c9c-f5b6-999999999999',
    name: 'Smartwatch',
    price: 39900,
  },
  { id: 'd2e0b0af-9c5f-4dad-a6c7-aaaaaaaaaaaa', name: 'Monitor', price: 69900 },
] as const;

export type Item = (typeof ITEMS)[number];
