---
name: bilingual-apps
description: Apps are bilingual English/French (EN/FR). Use whenever designing, building or modifying an application, UI, CLI, API messages, emails, error text or any user-facing string, and when writing requirements, designs or tests for such features. Ensures every user-facing string is externalised and available in both languages from the start.
---

# Bilingual EN/FR Applications

Every application is bilingual English and French. French is a first-class language, not a later add-on. Apply this whenever user-facing text is created or changed.

## Rules

1. **No hardcoded user-facing strings.** All text lives in locale resources (one per language: `en`, `fr`) and is referenced by key. This includes labels, buttons, placeholders, validation and error messages, empty states, emails, notifications, CLI output and API error messages meant for users.
2. **Both languages ship together.** A change that adds or edits a string adds or edits it in `en` and `fr` in the same change. Never leave a key in one language only, and never copy English into the French file as a placeholder without flagging it to the user.
3. **Key parity is checked.** Add (or keep) an automated check, in tests or CI, that `en` and `fr` contain exactly the same keys and the same placeholders.
4. **No string concatenation.** Use full sentences with named placeholders so word order can differ between languages.
5. **Use the platform's i18n and plural rules** (ICU MessageFormat, `Intl.PluralRules`, gettext, or the framework's equivalent). In French, 0 and 1 are singular.
6. **Format by locale, not by hand.** Dates, times, numbers, currency and lists go through locale-aware APIs (for example `Intl.*`). French uses a space as thousands separator, a comma as decimal separator, and a non-breaking space before `: ; ! ?` and inside `« »`.
7. **Language selection.** Detect the preferred language (user setting, then browser or OS locale), default to a documented fallback, let the user switch, and persist the choice. Set the document language (`<html lang>` or equivalent) and update it on switch.
8. **Design for expansion.** French text is typically 20-30% longer than English. Avoid fixed-width labels and truncation, and test layouts in both languages.
9. **Encoding and sorting.** UTF-8 throughout. Sort and compare user-visible text with locale-aware collation, and keep accents in identifiers out of keys (use ASCII keys).
10. **Content beyond the UI.** Backend-generated messages, emails, PDFs, help text and error codes visible to users are localized too. Prefer returning error codes or keys from APIs and localizing at the edge.

## Workflow

- **Requirements and design docs:** state "bilingual EN/FR" as an explicit requirement and include a language-switching and translation-parity acceptance criterion.
- **Implementation:** set up the i18n framework and both locale files before the first screen, not after.
- **Review and tests:** check for hardcoded strings, missing keys in either language, concatenated sentences, and unlocalized dates and numbers. Include a test that renders key screens in both languages.
- **Translations:** write natural French rather than literal translation. If unsure of a term or the regional variant (for example fr-CA vs fr-FR), ask the user once and record the decision in the project's docs.
