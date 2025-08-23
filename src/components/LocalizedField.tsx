import React from "react";
import "../i18n";
import { useTranslation } from "react-i18next";
import useAutomaticTranslation from "../hooks/useAutomaticTranslation";

const DEFAULT_SITE_LANGUAGE = "en";

const LocalizedField = ({ originalText }) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const shouldTranslateAutomatically = !originalText;

  const {
    translatedText: autoTranslatedText,
    isLoading: isLoadingAutoTranslate,
    error: autoTranslateError,
  } = useAutomaticTranslation(originalText, currentLanguage);

  if (shouldTranslateAutomatically && isLoadingAutoTranslate) {
    return <span className="text-gray-500 italic">Translating...</span>;
  }
  if (shouldTranslateAutomatically && autoTranslateError) {
    return (
      <span className="text-red-600 font-semibold">
        {originalText} (Auto-translation failed)
      </span>
    );
  }

  return (
    <span>
      {shouldTranslateAutomatically ? autoTranslatedText : originalText}
    </span>
  );
};

export default LocalizedField;
