import Cart from "../components/Cart";
import { useTranslation } from "react-i18next";

export default function Checkout() {
    const { i18n } = useTranslation()

    const isRTL = i18n.language === "ar" ; //if true then arabic

    return (
    <div className="checkout-page" dir={ isRTL ? "rtl" : "ltr" }>
      <h1>{ isRTL ? "الدفع الآن" : "Checkout" }</h1>

      <Cart />
    </div>
  );
}