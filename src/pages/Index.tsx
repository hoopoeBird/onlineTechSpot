import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Product } from "@/types/product";
import { ArrowLeftCircle, ArrowRight, ArrowRightCircle } from "lucide-react";
import "../i18n";
import { useTranslation } from "react-i18next";
import LocalizedField from "../components/LocalizedField";
import { Button } from "@/components/ui/button";
import { clearInterval } from "timers";

const Index = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState<string>("name");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState<any>();
  const [categories, setCategories] = useState<any>();
  const [isUsingFilter, setIsUsingFilter] = useState<boolean>();

  const serverUrl = import.meta.env.VITE_SERVER;
  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/products?populate=*&locale=${i18n.language}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, []);

  useEffect(() => {
    console.log("products:", products);
  }, [products]);

  useEffect(() => {
    fetch(
      `//${serverUrl}/api/product-categories?populate[products][populate]=default_image&populate=image&locale=${i18n.language}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setCategories(data.data));
  }, []);

  useEffect(() => {
    console.log("categories:", categories);
  }, [categories]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`//${serverUrl}/api/products?populate=*&locale=${i18n.language}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, [i18n.language]);

  useEffect(() => {
    fetch(
      `//${serverUrl}/api/product-categories?populate[products][populate]=default_image&populate=image&locale=${i18n.language}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setCategories(data.data));
  }, [i18n.language]);

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

  useEffect(() => {
    if (!products) {
      let isNormal = true;
      function getdata() {
        setTimeout(() => {
          fetch(
            `//${serverUrl}/api/products?populate=*&locale=${i18n.language}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          ).then((res) => {
            if (!res.ok) {
              isNormal = false;
              getdata();
              return null;
            }
            if (!isNormal) window.location.reload();
          });
        }, 2000);
      }
      getdata();
    }
  }, []);

  return (
    <>
      {products ? (
        <Layout>
          <div className="container mx-auto px-4 py-8  md:px-12">
            {isUsingFilter && (
              <Button
                type="button"
                variant="link"
                onClick={() => setIsUsingFilter(false)}
                className="pl-0 pb-4"
              >
                {t("go_back_to_categories")}
              </Button>
            )}
            <div className="flex flex-col lg:flex-row gap-8">
              <aside
                className="lg:w-1/4"
                onClick={() => setIsUsingFilter(true)}
              >
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
              {isUsingFilter ? (
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
              ) : (
                <main className="lg:w-3/4 w-full">
                  {categories?.map((category) => {
                    if (!category.products[0]) {
                      console.log(category.products[0]);

                      return null;
                    }
                    return (
                      <div className="mb-8" key={category.id}>
                        <div className="flex justify-between items-center mb-6">
                          <h1
                            className="text-2xl font-bold hover:text-blue-500 cursor-pointer"
                            onClick={() => {
                              navigate(
                                `/products/?category=${category.title
                                  .split(" ")[0]
                                  .toLowerCase()}`
                              );
                            }}
                          >
                            <LocalizedField originalText={category.title} />
                          </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {category.products?.slice(0, 3)?.map((product) => {
                            return (
                              <ProductCard
                                key={product?.id}
                                product={product}
                              />
                            );
                          })}
                        </div>

                        {category.products?.length === 0 && (
                          <div className="text-center py-12">
                            <p className="text-xl text-muted-foreground">
                              {t("no_matching")}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </main>
              )}
            </div>
          </div>
        </Layout>
      ) : (
        <div className="text-center text-gray-500 my-60">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full"></div>
          <p className="mt-2">Loading From Server...</p>
        </div>
      )}
    </>
  );
};

export default Index;
