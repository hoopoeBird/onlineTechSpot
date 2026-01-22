import { Layout } from "@/components/layout/Layout";
import LocalizedField from "@/components/LocalizedField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor,
  Smartphone,
  Headphones,
  Award,
  Users,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { apiCall } from "@/lib/api";

const About = () => {
  const [content, setContent]: any = useState();
  const [missions, setMissions]: any = useState();
  const [values, setValues]: any = useState();

  const serverUrl = import.meta.env.VITE_SERVER;

  function putIcon(icon: String) {
    switch (icon) {
      case "award":
        return <Award className="h-6 w-6 text-primary" />;
      case "users":
        return <Users className="h-6 w-6 text-primary" />;
      case "globe":
        return <Globe className="h-6 w-6 text-primary" />;
      default:
        return <Award className="h-6 w-6 text-primary" />;
    }
  }

  useEffect(() => {
    apiCall(
      `//${serverUrl}/api/v1/content?populate=about_header&locale=${i18n.language}`,
      {
        includeAuth: false,
      }
    )
      .then((data) => setContent(data.data.about_header))
      .catch((error) => console.error("Failed to fetch content:", error));
  }, []);
  useEffect(() => {
    apiCall(
      `//${serverUrl}/api/v1/about?populate[block][on][about.our-mission][populate]=*&locale=${i18n.language}`,
      {
        includeAuth: false,
      }
    )
      .then((data) => setMissions(data.data.block[0]))
      .catch((error) => console.error("Failed to fetch missions:", error));
  }, []);
  useEffect(() => {
    apiCall(
      `//${serverUrl}/api/v1/about?populate[block][on][about.values-container][populate]=values&locale=${i18n.language}`,
      {
        includeAuth: false,
      }
    )
      .then((data) => setValues(data.data.block[0].values))
      .catch((error) => console.error("Failed to fetch values:", error));
  }, []);

  useEffect(() => {
    console.log("content:", content);
    console.log("missions:", missions);
    console.log("values:", values);
  }, [content, missions, values]);

  const { i18n, t } = useTranslation();

  useEffect(() => {
    apiCall(
      `//${serverUrl}/api/v1/content?populate=about_header&locale=${i18n.language}`,
      {
        includeAuth: false,
      }
    )
      .then((data) => setContent(data.data.about_header))
      .catch((error) => console.error("Failed to fetch content:", error));
  }, [i18n.language]);
  useEffect(() => {
    apiCall(
      `//${serverUrl}/api/v1/about?populate[block][on][about.our-mission][populate]=*&locale=${i18n.language}`,
      {
        includeAuth: false,
      }
    )
      .then((data) => setMissions(data.data.block[0]))
      .catch((error) => console.error("Failed to fetch missions:", error));
  }, [i18n.language]);
  useEffect(() => {
    apiCall(
      `//${serverUrl}/api/v1/about?populate[block][on][about.values-container][populate]=values&locale=${i18n.language}`,
      {
        includeAuth: false,
      }
    )
      .then((data) => setValues(data.data.block[0].values))
      .catch((error) => console.error("Failed to fetch values:", error));
  }, [i18n.language]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12  md:px-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            <LocalizedField originalText={content?.colored_title} />
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <LocalizedField originalText={content?.description} />
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              <LocalizedField originalText={missions?.title} />
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              <LocalizedField originalText={missions?.description} />
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 text-center">
              <Monitor className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">{t("computers")}</h3>
            </Card>
            <Card className="p-6 text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">{t("mobile")}</h3>
            </Card>
            <Card className="p-6 text-center">
              <Headphones className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">{t("audio")}</h3>
            </Card>
            <Card className="p-6 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold">{t("quality")}</h3>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values?.map((value: any) => {
            return (
              <Card key={value.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {putIcon(value?.icon)}
                    <LocalizedField originalText={value?.title} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    <LocalizedField originalText={value?.description} />
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default About;
