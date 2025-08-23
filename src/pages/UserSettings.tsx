import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Package,
  Calendar,
  DollarSign,
  Cookie,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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

const UserSettings = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [profile, setProfile] = useState<any>();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: "en",
    currency: "USD",
    theme: "light",
    notifications: true,
    emailUpdates: true,
  });

  const serverUrl = import.meta.env.VITE_SERVER;

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [information, setInformation]: any = useState();

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("userOrders") || "[]");
    console.log("savedOrders: ", savedOrders);

    setOrders(savedOrders);

    const savedPreferences = JSON.parse(
      localStorage.getItem("userPreferences") || "{}"
    );
    setPreferences((prev) => ({ ...prev, ...savedPreferences }));
  }, []);

  useEffect(() => {
    fetch(`//${serverUrl}/api/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, []);

  useEffect(() => {
    fetch(`//${serverUrl}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.firstName);
        setEmail(data.email);
        setPhone(data.phone_number);
        setAddress(data.address);
      });
  }, []);

  useEffect(() => {
    console.log("profile: ", profile);
  }, [profile]);

  if (!isAuthenticated) {
    setTimeout(() => {
      return <Navigate to="/signin" replace />;
    }, 1500);
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, phone, address });
    fetch(`//${serverUrl}/api/users-permissions/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: name,
        email,
        phone_number: phone,
        address,
        profile,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      let res = await fetch(`//${serverUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: newPassword,
          passwordConfirmation: confirmPassword,
          currentPassword,
        }),
        credentials: "include",
      });
      let data = await res.json();
      if (data.error) {
        if (data.error.message == "Invalid identifier or password") {
          toast.error("Invalid Email or Password");
        } else {
          toast.error("Registration failed. Please try again.");
        }
        return null;
      }
    } catch (error) {
      console.log("passward error: ", error);
      toast.success("Password Change Failed! Try Again");
    }

    toast.success("Password Changed Successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem("userPreferences", JSON.stringify(newPreferences));
    fetch(`//${serverUrl}/api/users-permissions/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        [key]: value,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));

    toast.success("Preferences updated!");
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

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

  const { i18n, t } = useTranslation();

  useEffect(() => {
    fetch(`//${serverUrl}/api/restaurant?populate=*&locale=${i18n.language}`)
      .then((res) => res.json())
      .then((data) => setInformation(data.data));
  }, [i18n.language]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t("user_settings")}</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
            <TabsTrigger value="password">{t("password")}</TabsTrigger>
            <TabsTrigger value="preferences">{t("preferences")}</TabsTrigger>
            <TabsTrigger value="orders">{t("order_history")}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile_information")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t("full_name")}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t("phone_number")}</Label>
                    <Input
                      id="phone"
                      value={phone}
                      disabled
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">{t("address")}</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button type="submit">{t("update_profile")}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>{t("change_password")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">
                      {t("current_password")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">{t("new_password")}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">
                      {t("confirm_new_password")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit">{t("change_password")}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>{t("preferences")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language">{t("language")}</Label>
                  <Select
                    value={profile?.preferred_language ?? preferences.language}
                    onValueChange={(value) =>
                      handlePreferenceChange("preferred_language", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="russian">русский</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="armenian">Հայերեն</SelectItem>
                      <SelectItem value="arabic">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">{t("currency")}</Label>
                  <Select
                    value={profile?.currency ?? preferences.currency}
                    onValueChange={(value) =>
                      handlePreferenceChange("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="AMD">AMD (֏)</SelectItem>
                      <SelectItem value="AED">AED (د.إ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">{t("theme")}</Label>
                  <Select
                    value={profile?.theme ?? preferences.theme}
                    onValueChange={(value) =>
                      handlePreferenceChange("theme", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t("light")}</SelectItem>
                      <SelectItem value="dark">{t("dark")}</SelectItem>
                      <SelectItem value="system">{t("system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">
                    {t("push_notifications")}
                  </Label>
                  <Switch
                    id="notifications"
                    checked={preferences.notifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("notifications", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="emailUpdates">{t("email_updates")}</Label>
                  <Switch
                    id="emailUpdates"
                    checked={preferences.emailUpdates}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("emailUpdates", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{t("order_history")}</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {t("no_orders_found")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      console.log(order);
                      return (
                        <Dialog key={order.id}>
                          <DialogTrigger asChild>
                            <div className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Package className="h-5 w-5" />
                                  <span className="font-medium">
                                    {t("order")} #{order.id}
                                  </span>
                                  <Badge
                                    className={getStatusColor(
                                      order.order_status
                                    )}
                                  >
                                    {order.order_status}
                                  </Badge>
                                </div>
                                <span className="font-bold">
                                  $
                                  {order.order_items
                                    ?.map((item) => {
                                      console.log("1 item: ", item);

                                      return (
                                        +item?.product?.price * +item?.quantity
                                      );
                                    })
                                    .reduce((prev, curr) => prev + curr, 0)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {order.payment_method}
                                </div>
                                <span>
                                  {order.order_items?.length} {t("items")}
                                </span>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                {t("order_details")} - #{order.id}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-2">
                                  {t("order_status")}
                                </h4>
                                <Badge
                                  className={getStatusColor(order.order_status)}
                                >
                                  {order.order_status}
                                </Badge>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  {t("Items")}
                                </h4>
                                <div className="space-y-2">
                                  {order.order_items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between p-2 bg-muted rounded"
                                    >
                                      <span>
                                        {item?.product?.title} x{" "}
                                        {item?.quantity}
                                      </span>
                                      <span>
                                        $
                                        {(
                                          item?.product?.price * item?.quantity
                                        )?.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  {t("customer_information")}
                                </h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">
                                      {t("name")}:
                                    </span>{" "}
                                    {order.customer_name}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      {t("email")}:
                                    </span>{" "}
                                    {order.customer_email}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      {t("phone")}:
                                    </span>{" "}
                                    {order.customer_phone}
                                  </div>
                                  <div>
                                    <span className="font-medium">
                                      {t("payment")}:
                                    </span>{" "}
                                    {order?.payment_method}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span className="font-medium">
                                    {t("address")}:
                                  </span>
                                  <p className="text-sm">
                                    {order.delivery_address}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">
                                  {t("order_summary")}
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>{t("subtotal")}:</span>
                                    <span>
                                      $
                                      {order?.order_items
                                        ?.map((item) => {
                                          return (
                                            item?.product?.price * item.quantity
                                          );
                                        })
                                        ?.reduce((prev, curr) => prev + curr, 0)
                                        ?.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t("shipping")}:</span>
                                    <span>${information?.deleveryFee}</span>
                                  </div>
                                  <div className="flex justify-between font-bold">
                                    <span>{t("total")}:</span>
                                    <span>
                                      $
                                      {(
                                        order.order_items
                                          ?.map((item) => {
                                            return (
                                              item?.product?.price *
                                              item.quantity
                                            );
                                          })
                                          ?.reduce(
                                            (prev, curr) => prev + curr,
                                            0
                                          ) + information?.deleveryFee
                                      )?.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <span className="text-sm text-muted-foreground">
                                  {t("order_placed_on")}{" "}
                                  {new Date(order.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserSettings;
