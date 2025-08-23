import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@radix-ui/react-popover";
import { Alert } from "@/components/ui/alert";
import { MessageSquareWarning } from "lucide-react";

const PhoneValidation = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const serverUrl = import.meta.env.VITE_SERVER;

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
        console.log(data);

        setPhoneNumber(data.phone_number);
      });
  }, []);

  useEffect(() => {
    const phone = localStorage.getItem("pendingPhoneVerification");
    console.log("this phone: ", phone);

    if (phone && !phoneNumber) {
      setPhoneNumber(phone);
    } else {
      navigate("/signup");
    }
  }, [navigate]);

  useEffect(() => {
    fetch(`//${serverUrl}/api/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ phoneNumber }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, [phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`//${serverUrl}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phoneNumber, code: verificationCode }),
      });

      setTimeout(async () => {
        const res = await fetch(`//${serverUrl}/api/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await res.json();
        console.log("user/me: ", data);

        if (data.phone_number_verified) {
          toast.success("Phone number verified successfully!");
          localStorage.removeItem("pendingPhoneVerification");
          navigate("/");
        } else {
          toast.error("Invalid verification code.");
        }
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.log("an error occured: ", error);
    }
  };

  const handleResendCode = () => {
    fetch(`//${serverUrl}/api/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ phoneNumber }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          return toast.success("Verification code sent!");
        }
        toast.error("Verification code not sent!");
      });
  };

  const { i18n, t } = useTranslation();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {t("verify_your_phone_number")}
              </CardTitle>
              <p className="text-center text-muted-foreground">
                {t("weve_sent_a_verification_code")} {phoneNumber}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">{t("Verification Code")}</Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("verifying") : t("verify_phone_number")}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                  >
                    {t("didnt_receive_the_code")}
                  </Button>
                </div>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      localStorage.removeItem("pendingPhoneVerification");
                      navigate("/");
                    }}
                  >
                    {t("skip_for_now")}
                  </Button>
                </div>
                <div className="py-4 px-3 border-2 border-orange-400 rounded-xl text-orange-600 bg-orange-400/10 flex items-center">
                  <MessageSquareWarning className="w-8" />
                  <span className="mx-2 font-medium text-xs">
                    {t("in_test_mode_the_developer_only_can_recive")}
                  </span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PhoneValidation;
