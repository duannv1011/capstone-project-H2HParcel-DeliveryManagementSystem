import { Paging } from '../../../response/Paging';

export interface OrderResponse {
    orders: Order[];
    paging: Paging;
}

export interface OrderDetailResponse {
    order: Order;
}

export interface Order {
    orderId: number;
    statusId: number;
    status: string;
    senderName: string;
    receiverName: string;
    pickupPhoneNumber: string;
    deliverPhoneNumber: string;
    pickupAddress: string;
    deliverAddress: string;
    pickupStaffName: string;
    deliverStaffName: string;
    pickUpdateWarehouseId: number;
    deliverUpdateWarehouseId: number;
    price: number;
    packageTypeId: number;
    packageTypeName: string;
    paymentMethod: number;
    payment: string;
    imgUrl: string;
}
