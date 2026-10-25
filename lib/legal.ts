// shared details for the privacy policy and terms of service pages
// bump LEGAL_EFFECTIVE_DATE whenever either policy changes in a way users should know about
export const LEGAL_EFFECTIVE_DATE = "October 24, 2026";
export const LEGAL_GOVERNING_PROVINCE = "Ontario";
export const LEGAL_MINIMUM_AGE = 13;

// the gmail account the app sends from, read at render time so dev and prod show their own
export const getLegalContactEmail = () => process.env.EMAIL_USER as string;
