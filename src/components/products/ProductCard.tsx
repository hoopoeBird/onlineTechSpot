import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import LocalizedField from "../LocalizedField";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: Product;
  showBadge?: boolean;
}

export const ProductCard = ({
  product,
  showBadge = false,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { i18n, t } = useTranslation();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      documentId: product.documentId,
      name: product.title,
      price: product.price,
      image: product.default_image?.url,
      quantity: 1,
    });
  };

  const serverUrl = import.meta.env.VITE_SERVER;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <Link to={`/product/${product?.id}`}>
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={`http://${serverUrl}${product?.default_image?.formats.medium.url}`}
              alt={product?.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {showBadge && product?.best_seller && (
              <Badge className="absolute top-3 left-3 bg-orange-500">
                {t("best_seller")}
              </Badge>
            )}
            {product?.price && (
              <Badge variant="destructive" className="absolute top-3 right-3">
                {t("sale")}
              </Badge>
            )}
          </div>
        </Link>

        <div className="p-4 space-y-3">
          <Link to={`/product/${product?.id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              <LocalizedField originalText={product?.title} />
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-2">
            <LocalizedField originalText={product?.description} />
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">${product?.price}</span>
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{t("add_to_cart")}</span>
              <span className="sm:hidden">{t("add")}</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
