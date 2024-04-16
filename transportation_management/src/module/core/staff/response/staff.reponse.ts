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
    cityId: number;
    cityName: string;
    districtId: number;
    districtName: string;
    wardId: number;
    wardName: string;
}
