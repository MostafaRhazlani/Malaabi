export type StadiumType = 'FIVE_V_FIVE' | 'SEVEN_V_SEVEN' | 'EIGHT_V_EIGHT' | 'ELEVEN_V_ELEVEN' | 'INDOOR';

export const STADIUM_TYPE_LABEL: Record<StadiumType, string> = {
  FIVE_V_FIVE: '5v5',
  SEVEN_V_SEVEN: '7v7',
  EIGHT_V_EIGHT: '8v8',
  ELEVEN_V_ELEVEN: '11v11',
  INDOOR: 'Indoor',
};

export interface Stadium {
  id: string;
  name: string;
  city: string;
  address: string;
  images: string[];
  stadiumType: StadiumType;
  latitude?: number;
  longitude?: number;
  priceFullMatch: number;
  priceHalfMatch: number;
  startTime?: string;
  endTime?: string;
}
