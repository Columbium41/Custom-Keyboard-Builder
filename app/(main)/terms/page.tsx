import type {Metadata} from "next";
import LegalPage, {LegalLink, LegalList, LegalSection} from "@/components/LegalPage/LegalPage";
import {getLegalContactEmail, LEGAL_GOVERNING_PROVINCE, LEGAL_MINIMUM_AGE} from "@/lib/legal";

export const metadata: Metadata = {
    title: "Terms of Service | MechForum",
};

// public page, linked from the footer, sign up and the google oauth consent screen
export default function TermsOfServicePage() {
    const contactEmail = getLegalContactEmail();
    const contact = <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>;

    return (
        <LegalPage title="Terms of Service">
            <LegalSection title="Agreement">
                <p>
                    These terms are an agreement between you and MechForum (&quot;we&quot;, &quot;us&quot;). By
                    creating an account or using MechForum, you agree to these terms and to
                    our <LegalLink href="/privacy">Privacy Policy</LegalLink>. If you don&apos;t agree,
                    please don&apos;t use MechForum.
                </p>
            </LegalSection>

            <LegalSection title="Who can use MechForum">
                <p>
                    You must be at least {LEGAL_MINIMUM_AGE} years old to use MechForum. If you&apos;re under the age of
                    majority where you live, you need permission from a parent or guardian, and they agree to these
                    terms on your behalf.
                </p>
            </LegalSection>

            <LegalSection title="Your account">
                <LegalList>
                    <li>Give accurate information when you sign up, and keep your email address up to date.</li>
                    <li>Keep your password secure. You&apos;re responsible for everything that happens under your account.</li>
                    <li>Accounts are for one person. Don&apos;t share your account, sell it, or sign in as someone else.</li>
                    <li>Usernames that impersonate other people or brands, or that are offensive, may be removed.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Your content">
                <p>
                    You keep ownership of everything you post, including build details, photos, descriptions, and
                    comments. By posting, you give us a worldwide, non-exclusive, royalty-free license to host, store,
                    copy, resize, and display your content, only so we can run and show it on MechForum. This license
                    ends when you delete the content or your account, except for copies that remain in backups for a
                    limited time.
                </p>
                <p>
                    You promise that you have the right to post your content. For example, the photos are yours or
                    you have permission to use them, and your content doesn&apos;t break these terms or the law.
                </p>
            </LegalSection>

            <LegalSection title="Rules">
                <p>When using MechForum, don&apos;t:</p>
                <LegalList>
                    <li>post anything illegal, or anything that infringes someone else&apos;s copyright, trademark, or privacy;</li>
                    <li>harass, threaten, or bully anyone, or post hateful content;</li>
                    <li>post sexually explicit or graphically violent content;</li>
                    <li>post spam, scams, or misleading content, or use MechForum to advertise without permission;</li>
                    <li>upload viruses or malicious code, or try to break into, overload, or disrupt the site;</li>
                    <li>get around security features, including reCAPTCHA and rate limits, or access accounts that aren&apos;t yours;</li>
                    <li>scrape or collect data from MechForum with automated tools, or collect other users&apos; information.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="Removing content and ending accounts">
                <p>
                    We may remove content or suspend or delete accounts that break these terms, or when we need to
                    protect users or MechForum. You can delete your account at any time from your profile page.
                    Sections of these terms that by their nature should continue, such as disclaimers and limits on
                    liability, continue to apply after your account ends.
                </p>
            </LegalSection>

            <LegalSection title="Copyright complaints">
                <p>
                    If you believe content on MechForum infringes your copyright, email {contact} with: your contact
                    details, a description of the work, a link to the content, a statement that you believe in good
                    faith the use isn&apos;t authorized, and a statement that your notice is accurate and that you&apos;re
                    the owner or authorized to act for the owner. We&apos;ll review it and remove the content if
                    appropriate.
                </p>
            </LegalSection>

            <LegalSection title="Other services and trademarks">
                <p>
                    Embedded YouTube videos are provided by YouTube and are subject to the
                    {" "}<LegalLink href="https://www.youtube.com/t/terms">YouTube Terms of Service</LegalLink>. Signing in
                    with Google is subject to Google&apos;s terms. Keyboard, switch, and keycap names belong to their
                    owners. MechForum isn&apos;t affiliated with or endorsed by them.
                </p>
            </LegalSection>

            <LegalSection title="Changes to MechForum">
                <p>
                    MechForum is free. We may change, pause, or stop any part of it at any time. It&apos;s an
                    independent project, so we can&apos;t promise it will always be available.
                </p>
            </LegalSection>

            <LegalSection title="Disclaimers">
                <p>
                    MechForum is provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any
                    kind, including warranties of merchantability, fitness for a particular purpose, and
                    non-infringement. Content is posted by users, and we don&apos;t check it for accuracy. Building or
                    modifying a keyboard based on something you read here is at your own risk.
                </p>
            </LegalSection>

            <LegalSection title="Limitation of liability">
                <p>
                    To the fullest extent the law allows, we aren&apos;t liable for any indirect, incidental, special,
                    consequential, or punitive damages, or for any loss of data, profits, or goodwill, arising from your
                    use of MechForum. Our total liability for any claim related to MechForum is limited to CA$50. Some
                    places don&apos;t allow these limits, so they may not all apply to you.
                </p>
            </LegalSection>

            <LegalSection title="Indemnity">
                <p>
                    If you break these terms or the law, or post content that causes a claim against us, you agree to
                    cover our reasonable losses and costs from that claim, including legal fees.
                </p>
            </LegalSection>

            <LegalSection title="Governing law">
                <p>
                    These terms are governed by the laws of the Province of {LEGAL_GOVERNING_PROVINCE} and the federal
                    laws of Canada that apply there, without regard to conflict of law rules. Any dispute about these
                    terms or MechForum will be decided in the courts of {LEGAL_GOVERNING_PROVINCE}, and you and we agree
                    to those courts&apos; jurisdiction. This doesn&apos;t take away any rights you have under the
                    consumer protection laws where you live.
                </p>
            </LegalSection>

            <LegalSection title="Changes to these terms">
                <p>
                    If we change these terms, we&apos;ll update the effective date at the top of this page. If the
                    change is significant, we&apos;ll also let you know by email or with a notice on the site before
                    it takes effect. If you keep using MechForum after a change takes effect, you accept the new terms.
                </p>
            </LegalSection>

            <LegalSection title="General">
                <p>
                    If any part of these terms can&apos;t be enforced, the rest still applies. If we don&apos;t enforce
                    part of these terms, that doesn&apos;t mean we give up the right to enforce it later. These terms
                    and the Privacy Policy are the whole agreement between you and us about MechForum.
                </p>
            </LegalSection>

            <LegalSection title="Contact">
                <p>Questions about these terms: {contact}.</p>
            </LegalSection>
        </LegalPage>
    );
}
