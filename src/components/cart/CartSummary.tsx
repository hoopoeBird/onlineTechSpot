import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  formData: { address: string; name: string; email: string; phone: string };
}

export const CartSummary = ({
  subtotal,
  shipping,
  total,
  paymentMethod,
  formData,
}: CartSummaryProps) => {
  const { isAuthenticated } = useAuth();
  const { i18n, t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("order_summary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>{t("subtotal")}</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>{t("shipping")}</span>
          <span>${shipping.toFixed(2)}</span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>{t("total")}</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {isAuthenticated ? (
          <Button className="w-full" size="lg" asChild>
            <Link
              to={`/checkout?paymentMethod=${paymentMethod}&address=${formData.address}&name=${formData.name}&email=${formData.email}&phone=${formData.phone}`}
              onClick={(e) => {
                if (!formData.name) {
                  e.preventDefault();
                  toast.error("Name is Required");
                }
                if (typeof formData.name !== "string") {
                  e.preventDefault();
                  toast.error("the name field should be text");
                }
                if (!formData.email) {
                  e.preventDefault();
                  toast.error("Email is Required");
                }
                if (
                  !formData.email.match(
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                  )
                ) {
                  e.preventDefault();
                  toast.error("the email field is invalid");
                }
                if (!formData.phone) {
                  e.preventDefault();
                  toast.error("Phone Number is Required");
                }
                if (!formData.phone.match(/^\+\d{11}$/)) {
                  e.preventDefault();
                  toast.error("the phone number field is invalid");
                }
                if (!formData.address) {
                  e.preventDefault();
                  toast.error("Address is Required");
                }
                if (typeof formData.address !== "string") {
                  e.preventDefault();
                  toast.error("the address field should be text");
                }
              }}
            >
              {t("proceed_to_checkout")}
            </Link>
          </Button>
        ) : (
          <Button className="w-full" size="lg" asChild>
            <Link to="/signin">{t("sign_in_to_checkout")}</Link>
          </Button>
        )}

        <p className="text-sm text-muted-foreground text-center">
          {t("secure_checkout")}
        </p>
      </CardContent>
    </Card>
  );
};
