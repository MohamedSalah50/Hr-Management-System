export interface IOfficialHoliday {
    name: string;
    date: Date;
    year: number;
    isRecurring: boolean;
    freezedAt?: boolean;

}