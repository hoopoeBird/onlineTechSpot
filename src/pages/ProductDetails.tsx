import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LocalizedField from "@/components/LocalizedField";
import { apiCall } from "@/lib/api";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts]: any = useState();

  const serverUrl = import.meta.env.VITE_SERVER;

  const { i18n, t } = useTranslation();

  useEffect(() => {
    apiCall(`//${serverUrl}/api/v1/products?populate=*&locale=${i18n.language}`, {
      includeAuth: false,
    })
      .then((data) => setProducts(data.data))
      .catch((error) => console.error("Failed to fetch products:", error));
  }, [i18n.language]);

  useEffect(() => {
    apiCall(`//${serverUrl}/api/v1/products?populate=*&locale=${i18n.language}`, {
      includeAuth: false,
    })
      .then((data) => setProducts(data.data))
      .catch((error) => console.error("Failed to fetch products:", error));
  }, []);

  useEffect(() => {
    console.log("products:", products);
  }, [products]);

  useEffect(() => {
    console.log("product.id: ", products ? products[0]?.id : "nul");
    console.log("id: ", id);

    const foundProduct = products?.find(
      (product) => product?.id?.toString() === id
    );
    if (foundProduct) {
      setProduct(foundProduct);
      // Mock reviews data
      setReviews([
        {
          id: "1",
          userId: "user1",
          userName: "John Doe",
          rating: 5,
          comment: "Excellent product! Highly recommended.",
          date: "2024-01-15",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Smith",
          rating: 4,
          comment: "Good quality and fast delivery.",
          date: "2024-01-10",
        },
      ]);
    }
  }, [id, products]);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>{t("product_not_found")}</p>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      documentId: product.documentId,
      name: product.title,
      price: product.price,
      image: product.default_image.url,
      quantity,
    });
    toast.success(`Added ${quantity} ${product.title} to cart`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to leave a review");
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: user!.id,
      userName: user!.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split("T")[0],
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, comment: "" });
    toast.success("Review added successfully!");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <img
              src={`${product.default_image.url}`}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <LocalizedField originalText={product.title} />
              </h1>
              <p className="text-muted-foreground">
                <LocalizedField originalText={product.description} />
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium ml-1">{product.rating}</span>
                <span className="text-muted-foreground ml-1">
                  ({product.reviews} {t("reviews")})
                </span>
              </div>
              {product.best_seller && (
                <Badge className="bg-orange-500">{t("best_seller")}</Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">{t("quantity")}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button onClick={handleAddToCart} size="lg" className="w-full">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("add_to_cart")}
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("features")}:</h3>
              <ul className="list-disc list-inside space-y-1">
                {product.features?.map((feature, index) => (
                  <li key={index} className="text-muted-foreground">
                    <LocalizedField originalText={feature} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {/* <Card>
          <CardHeader>
            <CardTitle>
              {t("reviews")} ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {isAuthenticated ? (
              <form
                onSubmit={handleReviewSubmit}
                className="space-y-4 border-b pb-6"
              >
                <h4 className="font-semibold">{t("write_a_review")}</h4>
                <div>
                  <Label htmlFor="rating">{t("rating")}</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer ${
                          star <= newReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() =>
                          setNewReview({ ...newReview, rating: star })
                        }
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="comment">{t("comment")}</Label>
                  <Textarea
                    id="comment"
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    placeholder={t("Share your thoughts about this product...")}
                    required
                  />
                </div>
                <Button type="submit">{t("submit_review")}</Button>
              </form>
            ) : (
              <p className="text-muted-foreground border-b pb-6">
                {t("please_sign_in_to_leave_a_review")}
              </p>
            )}

            
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.userName}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {review.date}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    <LocalizedField originalText={review.comment} />
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
};

export default ProductDetails;
