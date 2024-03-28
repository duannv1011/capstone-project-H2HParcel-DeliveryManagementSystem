export enum OrderStatus {
    CREATED = 1,
    AWAIT_PICKUP = 2,
    PICKED_UP = 3,
    ARRIVED_PICKUP_WAREHOUSE = 4,
    ON_TRANSIT = 5,
    ARRIVED_DELIVER_WAREHOUSE = 6,
    ON_DELIVERY = 7,
    DELIVERED = 8,
}
