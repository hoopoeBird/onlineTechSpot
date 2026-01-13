import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CreditCard, Banknote, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import LocalizedField from "@/components/LocalizedField";
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import Cookies from "js-cookie";

console.log(
  "VITE_STRIPE_PUBLISHABLE_KEY: ",
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [information, setInformation] = useState<any>();
  const [shipping, setShipping] = useState<any>(0);
  const subtotal = getTotalPrice();
  const [profile, setProfile] = useState<any>();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    phone: searchParams.get("phone") || "",
    address: searchParams.get("address") || "",
    paymentMethod: searchParams.get("paymentMethod") || "",
  });

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

  useEffect(() => {}, []);

  useEffect(() => {
    console.log("profile: ", profile);
  }, [profile]);

  if (!isAuthenticated) {
    setTimeout(() => {
      return <Navigate to="/signin" replace />;
    }, 1500);
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  useEffect(() => {
    setIsLoading(true);

    setFormData({
      name: searchParams.get("name"),
      email: searchParams.get("email"),
      phone: searchParams.get("phone"),
      address: searchParams.get("address"),
      paymentMethod: searchParams.get("paymentMethod"),
    });
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.paymentMethod === "cash") {
      try {
        const makeOrder = async () => {
          let orderItems = [];
          const createOrderItemsPromises = items.map(async (item) => {
            let res = await fetch(`//${serverUrl}/api/v1/order-items-plural`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                data: {
                  quantity: item.quantity,
                  product: item.documentId ?? +item.id,
                },
              }),
            });

            let { data } = await res.json();
            return data.documentId;
          });

          orderItems = await Promise.all(createOrderItemsPromises);

          await fetch(`//${serverUrl}/api/v1/orders-plural`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
            credentials: "include",
            body: JSON.stringify({
              data: {
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: "+" + searchParams.get("phone").trim(),
                delivery_address: formData.address,
                order_items: orderItems,
                payment_method: formData.paymentMethod,
                order_status: "pending",
              },
            }),
          });
          const localOrder = {
            id: Date.now().toString(),
            items: items,
            payment_method: formData.paymentMethod,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            delivery_address: formData.address,
            createdAt: new Date().toISOString(),
            order_status: "pending",
          };
          const existingOrders = JSON.parse(
            localStorage.getItem("userOrders") || "[]"
          );
          existingOrders.push(localOrder);
          localStorage.setItem("userOrders", JSON.stringify(existingOrders));
          toast.success(
            "You Ordered Successfully We Will Call You to Confirm the Order"
          );
          clearCart();
          navigate("/");
          return;
        };
        makeOrder();
      } catch (error) {
        toast.error("Something Went Wrong!");
      } finally {
        setIsLoading(false);
      }
    }

    if (formData.paymentMethod === "googlepay") {
      toast.success(
        "You Ordered Successfully We Will Call You to Confirm the Order"
      );
      clearCart();
      navigate("/");
      return;
    }

    if (formData.paymentMethod === "card") {
      try {
        const fetchClientSecret = async () => {
          try {
            const response = await fetch(
              `//${serverUrl}/api/v1/orders-plural/create-session`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Cookies.get("accessToken")}`,
                },
                credentials: "include",
                body: JSON.stringify({
                  products: JSON.stringify(
                    items.reduce((item, currentItem) => {
                      item.push({
                        id: currentItem.documentId,
                        quantity: currentItem.quantity,
                      });
                      return item;
                    }, [])
                  ),
                  email: formData.email,
                  name: formData.name,
                  phone: "+" + searchParams.get("phone").trim(),
                  address: formData.address,
                }),
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log(
              "data.stripeSession: ",
              data.stripeSession.client_secret
            );

            const secret = data.stripeSession.client_secret;

            if (secret) {
              setClientSecret(secret);
            } else {
              throw new Error("Client secret not found in the response.");
            }
            const localOrder = {
              id: Date.now().toString(),
              items: items,
              payment_method: formData.paymentMethod,
              customer_name: formData.name,
              customer_email: formData.email,
              customer_phone: formData.phone,
              delivery_address: formData.address,
              createdAt: new Date().toISOString(),
              order_status: "pending",
            };

            const existingOrders = JSON.parse(
              localStorage.getItem("userOrders") || "[]"
            );
            existingOrders.push(localOrder);
            localStorage.setItem("userOrders", JSON.stringify(existingOrders));
          } catch (err: any) {
            console.error("Error fetching client secret:", err);
            setError(err.message);
          }
        };

        fetchClientSecret();
      } catch (error) {
        toast.error("Failed to place order. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, [i18n.language]);

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center text-gray-500 my-40">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full"></div>
          <p className="mt-2">Loading checkout...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 my-40">
          <p>Error: {error}</p>
          <p>Please check your network and try again.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="my-8">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </Layout>
  );
};

export default Checkout;
