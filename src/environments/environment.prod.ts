import { GLOBAL } from "./globals";

export const environment = {
  production: false,
  ...GLOBAL,
  //URL : 'http://localhost:4000/',
  //SERVER : 'http://localhost:4000/uploads/',
  URL : 'https://api.nothuman.com.ar/',
  SERVER : 'https://api.nothuman.com.ar/uploads/',
};
