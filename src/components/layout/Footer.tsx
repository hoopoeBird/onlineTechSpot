import { Link } from "react-router-dom";
import {
  Monitor,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";
import "./../../digital-font.css";
import { useTranslation } from "react-i18next";
import LocalizedField from "../LocalizedField";

export const Footer = () => {
  const [information, setInformation]: any = useState();
  const [categories, setcategories]: any = useState();

  const serverUrl = import.meta.env.VITE_SERVER;

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, []);

  useEffect(() => {
    console.log("information:", information);
  }, [information]);

  useEffect(() => {
    fetch(
      `//${serverUrl}/api/v1/product-categories?populate=*&locale=${i18n.language}`
    )
      .then((res) => res.json())
      .then((data) => setcategories(data.data));
  }, []);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/v1/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, [i18n.language]);

  useEffect(() => {
    fetch(
      `//${serverUrl}/api/v1/product-categories?populate=*&locale=${i18n.language}`
    )
      .then((res) => res.json())
      .then((data) => setcategories(data.data));
  }, [i18n.language]);

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-primary" />
              <span className="text-3xl my-digital-text font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {information?.name}
              </span>
            </div>
            <p className="text-muted-foreground">
              <LocalizedField originalText={information?.description} />
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("quick_links")}</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary">
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary">
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-primary">
                  {t("cart")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("categories")}</h3>
            <ul className="space-y-2 text-muted-foreground">
              {categories?.map((category) => {
                return (
                  <li key={category.id}>
                    <Link
                      to={`/products?category=${category.title
                        .split(" ")[0]
                        .toLowerCase()}`}
                      className="hover:text-primary"
                    >
                      <LocalizedField
                        originalText={category.title.split(" ")[0]}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("contact")}</h3>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>{information?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{information?.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{information?.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {information?.name}.{" "}
            {t("all_rights_reserved")}
          </p>
          <p>
            Crafted With 💙 By{" "}
            <Link
              to="https://www.linkedin.com/in/carlo-matafyan-b9b59a281/"
              className="text-blue-600"
              target="_blank"
            >
              Carlo
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
