export enum OrderStatus {
    CREATED = 1,
    AWAIT_PICKUP = 2,
    PICKED_UP = 3,
    ARRIVED_PICKUP_WAREHOUSE = 4,
    ON_TRANSIT = 5,
    ARRIVED_DELIVER_WAREHOUSE = 6,
    AWAIT_DELIVERY = 7,
    ON_DELIVERY = 8,
    DELIVERED = 9,
    CANCEL = 10,
}
