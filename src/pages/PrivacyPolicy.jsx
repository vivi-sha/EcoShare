import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    Privacy <span className="text-gradient">Policy</span>
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    Last Updated: January 16, 2026
                </p>
            </header>

            <div className="card" style={{ padding: '3rem' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Introduction</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        At EcoShare, we are committed to protecting your privacy and ensuring the security of your personal information.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Information We Collect</h2>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Personal Information
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        When you create an account or use our services, we may collect:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                        <li>Name and email address (via Google OAuth)</li>
                        <li>Profile picture and basic account information</li>
                        <li>Trip details, expenses, and travel preferences</li>
                        <li>Payment and settlement information</li>
                        <li>Communication preferences and feedback</li>
                    </ul>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Automatically Collected Information
                    </h3>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li>Device information and browser type</li>
                        <li>IP address and location data</li>
                        <li>Usage patterns and interaction data</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>How We Use Your Information</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        We use the collected information for the following purposes:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li>To provide and maintain our services</li>
                        <li>To calculate carbon footprints and environmental impact</li>
                        <li>To facilitate expense splitting and settlements</li>
                        <li>To personalize your experience and provide recommendations</li>
                        <li>To communicate with you about updates, features, and support</li>
                        <li>To improve our platform and develop new features</li>
                        <li>To ensure security and prevent fraud</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Data Sharing and Disclosure</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        We do not sell your personal information. We may share your data in the following circumstances:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li><strong>With Trip Participants:</strong> Information you share within a trip is visible to other participants</li>
                        <li><strong>Service Providers:</strong> Third-party services that help us operate our platform (e.g., Google OAuth, EmailJS)</li>
                        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                        <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Data Security</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We implement industry-standard security measures to protect your personal information, including:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li>Secure OAuth 2.0 authentication via Google</li>
                        <li>Encrypted data transmission using HTTPS</li>
                        <li>Regular security audits and updates</li>
                        <li>Access controls and authentication mechanisms</li>
                    </ul>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
                        However, no method of transmission over the internet is 100% secure. While we strive to protect your data,
                        we cannot guarantee absolute security.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Your Rights and Choices</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        You have the following rights regarding your personal information:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li><strong>Access:</strong> Request a copy of your personal data</li>
                        <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                        <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                        <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                    </ul>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
                        To exercise these rights, please contact us at <a href="mailto:ecosharetbyu@gmail.com" style={{ color: 'var(--primary)' }}>ecosharetbyu@gmail.com</a>
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Cookies and Tracking</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We use cookies and similar technologies to enhance your experience, analyze usage patterns, and maintain
                        your session. You can control cookie settings through your browser preferences, but disabling cookies may
                        affect the functionality of our platform.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Third-Party Services</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        Our platform integrates with third-party services, including:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li><strong>Google OAuth:</strong> For secure authentication</li>
                        <li><strong>EmailJS:</strong> For email communications</li>
                        <li><strong>Vercel:</strong> For hosting and deployment</li>
                    </ul>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
                        These services have their own privacy policies, and we encourage you to review them.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Children's Privacy</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        EcoShare is not intended for users under the age of 13. We do not knowingly collect personal information
                        from children. If you believe we have collected information from a child, please contact us immediately.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>International Data Transfers</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Your information may be transferred to and processed in countries other than your own. We ensure that
                        appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Changes to This Policy</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We may update this Privacy Policy from time to time. We will notify you of any significant changes by
                        posting the new policy on this page and updating the "Last Updated" date. Your continued use of EcoShare
                        after changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Contact Us</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1.5rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '0.5rem',
                        borderLeft: '4px solid var(--primary)'
                    }}>
                        <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> ecosharetbyu@gmail.com</p>
                        <p style={{ marginBottom: '0.5rem' }}><strong>Location:</strong> B.M.S College Of Engineering</p>
                        <p><strong>Phone:</strong> +91 9606343561</p>
                    </div>
                </section>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button className="btn btn-primary" onClick={() => window.history.back()}>
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
