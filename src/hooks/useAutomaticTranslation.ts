import { useState, useEffect, useCallback } from "react";

const useAutomaticTranslation = (textToTranslate, targetLanguage) => {
  const [translatedText, setTranslatedText] = useState(textToTranslate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const DEFAULT_SITE_LANGUAGE = "en";

  const translate = useCallback(async () => {
    if (!textToTranslate || targetLanguage === DEFAULT_SITE_LANGUAGE) {
      setTranslatedText(textToTranslate);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let chatHistory = [];
      chatHistory.push({
        role: "user",
        parts: [
          {
            text: `Translate the following text without anything else from ${DEFAULT_SITE_LANGUAGE} to ${targetLanguage}: "${textToTranslate}"`,
          },
        ],
      });

      const payload = { contents: chatHistory };
      const apiKey = "AIzaSyBMnlxhnXLaOvPE7fW1D0gAxmTz2g_zSAk";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const text = result.candidates[0].content.parts[0].text;
        setTranslatedText(text);
      } else {
        console.error("Gemini API response structure unexpected:", result);
        setError("Automatic translation service error: Unexpected response.");
        setTranslatedText(textToTranslate);
      }
    } catch (err) {
      console.error("Error during automatic translation API call:", err);
      setError("Failed to connect to automatic translation service.");
      setTranslatedText(textToTranslate);
    } finally {
      setIsLoading(false);
    }
  }, [textToTranslate, targetLanguage, DEFAULT_SITE_LANGUAGE]);

  useEffect(() => {
    translate();
  }, [translate]);

  return { translatedText, isLoading, error };
};

export default useAutomaticTranslation;
