import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Calendar, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import LocalizedField from "../LocalizedField";

interface Order {
  id: string;
  documentId: string;
  order_items: Array<{
    id: string;
    name: string;
    product: {
      best_seller: boolean;
      createdAt: string;
      description: string;
      documentId: string;
      id: number;
      locale: string;
      price: number;
      publishedAt: null;
      tag: null;
      title: string;
    };
    quantity: number;
  }>;
  payment_method: string;

  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;

  createdAt: string;
  order_status: string;
}

const serverUrl = import.meta.env.VITE_SERVER;

const OrderStatus = (props) => {
  const [processingOrders, setProcessingOrders] = useState<Order[]>([]);

  async function fetchOrders() {
    const response = await fetch(
      `//${serverUrl}/api/orders-plural`,

      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const orders = await response.json();
    console.log("orders: ", orders);
    return orders;
  }

  useEffect(() => {
    async function getOrders() {
      const savedOrders: Order[] =
        (await fetchOrders()) ||
        JSON.parse(localStorage.getItem("userOrders") || "[]");
      console.log("savedOrders: ", savedOrders);

      const processing = savedOrders.filter(
        (order) => order.order_status === "pending"
      );
      setProcessingOrders(processing);
    }
    getOrders();
  }, []);

  useEffect(() => {
    localStorage.setItem("userOrders", JSON.stringify(processingOrders));
  }, [processingOrders]);

  if (processingOrders.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "shipped":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Package className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {processingOrders.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {props?.processing_orders ?? "Processing Orders"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {processingOrders.map((order, i) => (
            <div key={order.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <span className="font-medium">
                    {props?.order ?? "Order"} #{order.id}
                  </span>
                  <Badge className={getStatusColor(order.order_status)}>
                    <LocalizedField originalText={order.order_status} />
                  </Badge>
                </div>
                <span className="font-bold">
                  $
                  {order?.order_items
                    ?.map((item) => {
                      return +item?.product?.price * +item?.quantity;
                    })
                    ?.reduce((prev, curr) => prev + curr, 0)
                    ?.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                {order.order_items?.map((item) => {
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item?.product?.title} x {item.quantity}
                      </span>
                      <span>
                        ${(item?.product?.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {order.payment_method}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatus;
