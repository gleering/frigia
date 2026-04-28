import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const preference = new Preference(client);
export const payment = new Payment(client);

export type MPItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: "ARS";
};
