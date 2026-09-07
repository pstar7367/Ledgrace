import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { translations } from "./translation.js";

const ATTRIBUTES = ["aria-label", "placeholder", "title"];
const EXCLUDED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CODE", "PRE"]);

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function createLookup() {
  const lookup = new Map();

  Object.values(translations).forEach((dictionary) => {
    Object.entries(dictionary).forEach(([key, value]) => {
      if (typeof value !== "string") return;
      const source = normalize(value);
      if (source) lookup.set(source, key);
    });
  });

  return lookup;
}

const textLookup = createLookup();

function translatedValue(value, translate) {
  const source = normalize(value);
  const key = textLookup.get(source);
  if (!key) return null;

  const translation = translate(key, { defaultValue: value });
  return translation === key ? value : translation;
}

function translateTree(root, translate) {
  if (!root) return;

  const textSources = translateTree.textSources || (translateTree.textSources = new WeakMap());
  const attributeSources = translateTree.attributeSources || (translateTree.attributeSources = new WeakMap());

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    if (!parent || EXCLUDED_TAGS.has(parent.tagName) || parent.closest("[data-i18n-skip]")) return;

    const current = textNode.nodeValue;
    const previous = textSources.get(textNode);
    const source = previous && current === previous.lastRendered ? previous.source : current;
    const next = translatedValue(source, translate);
    const rendered = next || source;
    textSources.set(textNode, { source, lastRendered: rendered });
    if (rendered !== current) textNode.nodeValue = rendered;
  });

  root.querySelectorAll("*").forEach((element) => {
    if (EXCLUDED_TAGS.has(element.tagName) || element.closest("[data-i18n-skip]")) return;
    ATTRIBUTES.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (!current) return;
      const sources = attributeSources.get(element) || new Map();
      const previous = sources.get(attribute);
      const source = previous && current === previous.lastRendered ? previous.source : current;
      attributeSources.set(element, sources);

      const next = translatedValue(source, translate);
      const rendered = next || source;
      sources.set(attribute, { source, lastRendered: rendered });
      if (rendered !== current) element.setAttribute(attribute, rendered);
    });
  });
}

/**
 * Translates shared static UI that predates i18next conversion. It uses a
 * layout effect, so a saved language is applied before the browser paints.
 * New or re-rendered nodes are covered by the observer as well.
 */
export default function I18nDomBridge({ children }) {
  const { t, i18n } = useTranslation();

  useLayoutEffect(() => {
    const root = document.getElementById("root");
    if (!root) return undefined;

    let translating = false;
    const apply = () => {
      if (translating) return;
      translating = true;
      translateTree(root, t);
      translating = false;
    };

    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    i18n.on("languageChanged", apply);

    return () => {
      observer.disconnect();
      i18n.off("languageChanged", apply);
    };
  }, [i18n, t]);

  return children;
}
