import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Product } from "@/types/product";
import { useTranslation } from "react-i18next";

const Products = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts]: any = useState();

  const serverUrl = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/products?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, []);

  useEffect(() => {
    console.log("products:", products);
  }, [products]);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered = products?.filter((product: Product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.product_category.title.split(" ")[0].toLowerCase() ===
          selectedCategory;
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesPrice && matchesSearch;
    });

    filtered?.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [selectedCategory, priceRange, sortBy, searchQuery, products]);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/products?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, [i18n.language]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8  md:px-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <ProductFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </aside>

          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">{t("products")}</h1>
              <p className="text-muted-foreground">
                {filteredProducts?.length} {t("products_found")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">
                  {t("no_products_found_matching_your_criteria")}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
