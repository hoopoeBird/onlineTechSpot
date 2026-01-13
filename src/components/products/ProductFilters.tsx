import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import LocalizedField from "../LocalizedField";

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProductFilters = ({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: ProductFiltersProps) => {
  const [categories, setcategories] = useState([]);

  const serverUrl = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetch(
      `//${serverUrl}/api/v1/product-categories?populate=*&locale=${i18n.language}`
    )
      .then((res) => res.json())
      .then((data) => {
        setcategories(data.data);
      });
  }, []);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(
      `//${serverUrl}/api/v1/product-categories?populate=*&locale=${i18n.language}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data.data);
        setcategories(data.data);
      });
  }, [i18n.language]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("search")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search_products")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("categories")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories?.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.title.split(" ")[0].toLowerCase()
                  ? "default"
                  : "ghost"
              }
              className="w-full justify-start"
              onClick={() =>
                onCategoryChange(category.title.split(" ")[0].toLowerCase())
              }
            >
              <LocalizedField originalText={category.title} />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("price_range")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceChange(value as [number, number])}
            max={5000}
            min={0}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Sort By */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("sort_by")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("name_a_z")}</SelectItem>
              <SelectItem value="price-low">
                {t("price_low_to_high")}
              </SelectItem>
              <SelectItem value="price-high">
                {t("price_high_to_low")}
              </SelectItem>
              <SelectItem value="rating">{t("rating")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};
