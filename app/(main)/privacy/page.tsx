import type {Metadata} from "next";
import LegalPage, {LegalLink, LegalList, LegalSection} from "@/components/LegalPage/LegalPage";
import {getLegalContactEmail, LEGAL_MINIMUM_AGE} from "@/lib/legal";

export const metadata: Metadata = {
    title: "Privacy Policy | MechForum",
};

// public page, linked from the footer and the google oauth consent screen
// keep it in sync with what the app collects (see AGENTS.md, "Legal pages")
export default function PrivacyPolicyPage() {
    const contactEmail = getLegalContactEmail();
    const contact = <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>;

    return (
        <LegalPage title="Privacy Policy">
            <LegalSection title="Who we are">
                <p>
                    MechForum (&quot;we&quot;, &quot;us&quot;) is a website where people share custom mechanical
                    keyboard builds. This policy explains what information we collect, how we use it, and the choices
                    you have. If you have questions, email {contact}.
                </p>
            </LegalSection>

            <LegalSection title="Information we collect">
                <p>Information you give us:</p>
                <LegalList>
                    <li><strong>Account details:</strong> your email address, username, and password. Passwords are stored only as a one-way bcrypt hash, so we never see them.</li>
                    <li><strong>Google sign-in:</strong> if you sign in with Google, we receive your Google account ID, email address, and whether Google has verified that email. Google also sends your name and profile picture, but we don&apos;t store or show them.</li>
                    <li><strong>Profile:</strong> the description and avatar photo you add.</li>
                    <li><strong>Builds:</strong> the parts list, photos (with their file type and size), and YouTube video link you post.</li>
                    <li><strong>Activity:</strong> the builds you like and any comments you post.</li>
                </LegalList>
                <p>Information collected automatically:</p>
                <LegalList>
                    <li><strong>Sign-in time:</strong> we record when you last signed in.</li>
                    <li><strong>IP address:</strong> used briefly, in memory, to limit how many requests one address can make. We don&apos;t store it in our database. Our hosting provider keeps standard server logs, which include IP addresses.</li>
                    <li><strong>Cookies:</strong> we only use the cookies needed to keep you signed in and to protect forms (a session cookie, a CSRF token cookie, and a cookie that remembers where to send you after signing in). We don&apos;t use advertising, analytics, or tracking cookies.</li>
                    <li><strong>Do Not Track:</strong> we don&apos;t track you across other websites, so MechForum works the same whether or not your browser sends a Do Not Track signal.</li>
                    <li><strong>reCAPTCHA:</strong> the sign-up, password reset, and verification email forms use Google reCAPTCHA to block bots. reCAPTCHA collects hardware and software information, such as device and application data, and sends it to Google. Its use is subject to Google&apos;s <LegalLink href="https://policies.google.com/privacy">Privacy Policy</LegalLink> and <LegalLink href="https://policies.google.com/terms">Terms of Service</LegalLink>.</li>
                </LegalList>
            </LegalSection>

            <LegalSection title="How we use your information">
                <LegalList>
                    <li>To create and run your account, including signing you in and showing your profile and builds.</li>
                    <li>To send emails you need, such as account verification, password reset, and password change confirmation. We don&apos;t send marketing emails.</li>
                    <li>To check that YouTube links point to real videos, by sending the video ID to the YouTube Data API.</li>
                    <li>To keep the site secure and stop spam and abuse.</li>
                </LegalList>
                <p>We don&apos;t sell your personal information, use it for advertising, or share it with data brokers.</p>
            </LegalSection>

            <LegalSection title="Google user data">
                <p>
                    When you sign in with Google, we only ask for the basic <code>openid</code>, <code>email</code>,
                    and <code>profile</code> permissions. We use your Google account ID and email only to sign you in
                    and to link Google to an existing MechForum account with the same verified email. We don&apos;t
                    use Google user data for advertising, we don&apos;t sell it, and we don&apos;t transfer it to anyone
                    except as needed to run MechForum, for security, or to comply with the law.
                </p>
                <p>
                    MechForum&apos;s use and transfer of information received from Google APIs will adhere to the
                    {" "}<LegalLink href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</LegalLink>,
                    including the Limited Use requirements.
                </p>
                <p>
                    You can remove MechForum&apos;s access to your Google account at any time
                    from <LegalLink href="https://myaccount.google.com/permissions">your Google account permissions</LegalLink>.
                </p>
            </LegalSection>

            <LegalSection title="What other people can see">
                <p>
                    Your username, avatar, profile description, account creation date, builds, and build photos are
                    visible to other MechForum users, and the list of builds is visible to anyone. Your likes count
                    toward the like totals shown on builds. Your email address is never shown to other users.
                </p>
            </LegalSection>

            <LegalSection title="Service providers">
                <p>We use these providers to run MechForum. They process data on our behalf:</p>
                <LegalList>
                    <li><strong>Vercel</strong> hosts the website and its server logs.</li>
                    <li><strong>Supabase</strong> hosts our database.</li>
                    <li><strong>Amazon Web Services (S3)</strong> stores avatars and build photos.</li>
                    <li><strong>Google</strong> provides Google sign-in, reCAPTCHA, the YouTube Data API, and Gmail, which we use to send account emails.</li>
                </LegalList>
                <p>
                    We may also disclose information if the law requires it, or to protect the rights, safety, or
                    property of our users or the public.
                </p>
            </LegalSection>

            <LegalSection title="How long we keep your information">
                <p>
                    We keep your information for as long as your account exists. When you delete your account, we
                    delete your account details, builds, photos, likes, and comments right away. Copies may remain in
                    our providers&apos; backups and logs for a limited time until they expire. If a photo file can&apos;t
                    be removed from storage when you delete your account, it stays unlinked and you can email us to
                    have it removed.
                </p>
            </LegalSection>

            <LegalSection title="Your choices and rights">
                <LegalList>
                    <li><strong>Update:</strong> you can change your profile description and avatar on your profile page. To change anything else, email us.</li>
                    <li><strong>Delete:</strong> you can delete your account from the Delete Account section of your profile page. This permanently deletes your account and everything you&apos;ve posted. You can also ask us to delete it by emailing {contact}, and we&apos;ll do so within 30 days.</li>
                    <li><strong>Access:</strong> email us to request a copy of the personal information we hold about you.</li>
                </LegalList>
                <p>
                    These rights apply to everyone, wherever you live. We&apos;ll respond to requests within 30 days,
                    and we won&apos;t treat you differently for making one. Deleting your account also withdraws your
                    consent for us to keep using your information.
                </p>
                <p>
                    If you aren&apos;t satisfied with how we handle a privacy request or concern, you can contact
                    the <LegalLink href="https://www.priv.gc.ca/">Office of the Privacy Commissioner of Canada</LegalLink>,
                    or the privacy authority where you live.
                </p>
            </LegalSection>

            <LegalSection title="Security">
                <p>
                    We use HTTPS, hash passwords with bcrypt, and use signed, expiring links for email verification
                    and password resets. No online service is completely secure, so we can&apos;t guarantee your
                    information will never be accessed without permission.
                </p>
            </LegalSection>

            <LegalSection title="Children">
                <p>
                    MechForum isn&apos;t for children under {LEGAL_MINIMUM_AGE}, and we don&apos;t knowingly collect
                    information from them. If you believe a child under {LEGAL_MINIMUM_AGE} has an account, email us
                    and we&apos;ll delete it.
                </p>
            </LegalSection>

            <LegalSection title="Where your data is stored">
                <p>
                    MechForum is run from Canada. Our service providers store and process your information in the
                    United States and may do so in other countries. While it&apos;s there, it&apos;s subject to the laws
                    of those countries, and courts, law enforcement, and government authorities there may be able to
                    access it.
                </p>
            </LegalSection>

            <LegalSection title="Changes to this policy">
                <p>
                    If we change this policy, we&apos;ll update the effective date at the top of this page. If the
                    change is significant, we&apos;ll also let you know by email or with a notice on the site before
                    it takes effect.
                </p>
            </LegalSection>

            <LegalSection title="Contact">
                <p>Questions or requests about your privacy: {contact}.</p>
                <p>See also our <LegalLink href="/terms">Terms of Service</LegalLink>.</p>
            </LegalSection>
        </LegalPage>
    );
}
