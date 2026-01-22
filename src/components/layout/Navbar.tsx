import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  DoorOpenIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import OrderStatus from "./OrderStatus";
import "./../../digital-font.css";
import "../../i18n";
import { useTranslation } from "react-i18next";
import * as Popover from "@radix-ui/react-popover";
import Cookies from "js-cookie";

export const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { items } = useCart();
  const { user, updateProfile, register, logout, isAuthenticated } = useAuth();
  const [information, setInformation]: any = useState();

  const serverUrl = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetch(`//${serverUrl}/api/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
    fetch(`//${serverUrl}/api/orders-plural`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("accessToken")}`,
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const existingOrders = JSON.parse(
          localStorage.getItem("userOrders") || "[]"
        );
        existingOrders.push(data);
        localStorage.setItem("userOrders", JSON.stringify(data));
        console.log("my beautiful data: ", data);
      });
  }, []);

  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleProductsClick = () => {
    navigate("/products?category=all");
  };

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, [i18n.language]);

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    setIsOpen(false);
    setSelectedLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    console.log("i18n: ", i18n);
  }, [i18n]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {}, []);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-3xl font-bold text-primary my-digital-text"
          >
            {information?.name}
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={handleProductsClick}
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("products")}
            </button>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              {t("about")}
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t("search_products")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto">
                <form onSubmit={handleSearch} className="mt-4">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              </SheetContent>
            </Sheet>

            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
              <Popover.Trigger asChild>
                <button aria-label="Select language">
                  {/* Display current language or a globe icon */}
                  <span>{selectedLanguage?.toUpperCase()}</span>{" "}
                  {/* Or a flag icon */}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  side="bottom"
                  align="end"
                  sideOffset={5}
                  className="language-selector-content z-20 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 mt-4"
                >
                  <ul>
                    {i18n?.options?.supported?.map((lang) => {
                      return (
                        <li key={lang.code}>
                          <button
                            value={lang.code}
                            onClick={(e) => handleLanguageChange(e)}
                          >
                            {lang.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <Popover.Arrow className="PopoverArrow" />{" "}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Order Status - only show for authenticated users */}
            {isAuthenticated && (
              <OrderStatus
                processing_orders={t("processing_orders")}
                order={t("order")}
              />
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {user?.name || user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      {t("settings")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("signout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <div className="flex items-center space-x-2 max-md:hidden">
                  <Button variant="ghost" asChild>
                    <Link to="/signin">{t("signin")}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">{t("signup")}</Link>
                  </Button>
                </div>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link to="/about" className="text-lg">
                    {t("about")}
                  </Link>
                  <button
                    onClick={handleProductsClick}
                    className="text-lg text-left"
                  >
                    {t("products")}
                  </button>
                  <Link to="/signin" className="text-lg">
                    {t("signin")}
                  </Link>
                  <Link to="/signup" className="text-lg">
                    {t("signup")}
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
