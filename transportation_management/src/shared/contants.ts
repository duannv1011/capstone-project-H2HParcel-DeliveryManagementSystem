export const totalpage = (total: number, pageSize: number): number => {
    return Math.ceil(total % pageSize === 0 ? total / pageSize : Math.floor(total / pageSize) + 1);
};
export const DEFAULT_PAGE_SIZE = 10;
