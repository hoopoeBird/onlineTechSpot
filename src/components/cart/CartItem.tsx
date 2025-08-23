import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import LocalizedField from "../LocalizedField";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value) || 1;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const serverUrl = import.meta.env.VITE_SERVER;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <img
            src={`${item.image}`}
            alt={item.name}
            className="w-full md:w-24 h-24 object-cover rounded-lg"
          />

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">
              <LocalizedField originalText={item.name} />
            </h3>
            <p className="text-2xl font-bold">${item.price}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleDecrement}>
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="w-20 text-center"
              min={1}
            />
            <Button variant="outline" size="icon" onClick={handleIncrement}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col items-end justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <p className="font-bold text-lg">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
