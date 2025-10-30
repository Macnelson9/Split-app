export interface Bank {
  code: string;
  name: string;
}

export interface Token {
  symbol: string;
  name: string;
  icon: string;
  price?: string;
  usdPrice: number;
}
