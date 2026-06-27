import { Montserrat_Alternates, Poppins } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const montserrat = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const montserratLight = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["300"],
  style: "normal",
});

export const montserratMedium = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["500"],
  style: "normal",
});
