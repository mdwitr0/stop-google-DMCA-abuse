export enum OriginatorFieldEnum {
  FULL_NAME = '[id="full_name"]',
  YOUR_TITLE = '[id="your_title"]',
  COMPANY_NAME = '[id="companyname"]',
  CONTACT_EMAIL = '[id="contact_email_noprefill"]',
  ADDRESS = '[id="address"]',
  PHONE = '[id="phone"]',
  DMCA_CLARIFICATIONS = '[id="dmca_clarifications"]',
  SIGNATURE = '[id="signature"]',
}

export enum ButtonEnum {
  ADD_LINK = '[class="add-additional"]',
  SUBMIT = '.submit-button',
}

export enum RadioButtonEnum {
  REASON = '[data-frd-context-type="TYPE_UNSPECIFIED"] [aria-labelledby="dmca_clarifications_intro--label"] [class="material-radio__circle"]',
}

export enum FieldEnum {
  LINK = '[name="material_location"]',
}

export enum SelectorEnum {
  COUNTRY = '[name="market_residence"]',
}

export enum CheckboxEnum {
  CONSENT_1 = '[name="consent_statement1"]',
  CONSENT_2 = '[name="consent_statement1"]',
}

export enum DivEnum {
  COUNTRY = '[class="sc-select"]',
  CONFIRMATION = '.confirmation-message__text',
}
