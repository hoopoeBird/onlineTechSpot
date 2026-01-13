import { Layout } from "@/components/layout/Layout";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, ShoppingCart, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import LocalizedField from "@/components/LocalizedField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Cookies from "js-cookie";

const Cart = () => {
  const { items, getTotalPrice } = useCart();
  const [information, setInformation]: any = useState();
  const [shipping, setShipping]: any = useState(0);
  const subtotal = getTotalPrice();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const total = subtotal + shipping;

  useEffect(() => {
    setShipping(information?.deleveryFee > 0 ? +information.deleveryFee : 0);
  }, [information]);

  const serverUrl = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, []);

  useEffect(() => {
    console.log("information:", information);
  }, [information]);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, [i18n.language]);

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          name: data?.firstName,
          email: data?.email,
          phone: data?.phone_number,
          address: data?.address,
          paymentMethod: "card",
        });
      });
  }, []);

  const paymentMethods = [
    { id: "card", label: "Credit/Debit Card", icon: CreditCard },
    { id: "cash", label: "Cash on Delivery", icon: Banknote },
  ];

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    paymentMethod: "card",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("shopping_cart")}</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-4">
              {t("your_cart_is_empty")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("add_some_amazing_tech_products")}
            </p>
            <Button asChild>
              <Link to="/products">{t("browse_products")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items?.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="lg:col-span-1">
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                paymentMethod={formData.paymentMethod}
                formData={{
                  address: formData.address,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                }}
              />
              <Card className="mt-3">
                <CardHeader>
                  <CardTitle>{t("payment_method")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      handleInputChange("paymentMethod", value)
                    }
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />

                        <method.icon className="h-5 w-5" />
                        <Label
                          htmlFor={method.id}
                          className="flex-1 cursor-pointer"
                        >
                          <LocalizedField originalText={method.label} />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {/* Card Details */}
                  {formData.paymentMethod === "card" && (
                    <div className="mt-6 space-y-4 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        {t("you_will_be_redirected_to_card_payment_page")}
                      </p>
                    </div>
                  )}

                  {/* Cash on Delivery Info */}
                  {formData.paymentMethod === "cash" && (
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        {t("pay_with_cash_when_your_order_is_delivered")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="mt-3">
                <CardHeader>
                  <CardTitle>{t("customer_information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("full_name")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("email")} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">{t("phone_number")} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">{t("address")} *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
