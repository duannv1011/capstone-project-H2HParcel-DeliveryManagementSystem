export interface StaffResponse {
    staff: Staff;
}

export interface Staff {
    staffId: number;
    fullname: string;
    email: string;
    phone: string;
    statusName: string;
    warehouseId: number;
    warehouseName: string;
    address: Address;
}

export interface Address {
    addressId: number;
    house: string;
    cityName: string;
    districtName: string;
    wardName: string;
}
