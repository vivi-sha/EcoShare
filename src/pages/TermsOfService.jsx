import React from 'react';

const TermsOfService = () => {
    return (
        <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '900px' }}>
            <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    Terms of <span className="text-gradient">Service</span>
                </h1>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    Last Updated: January 16, 2026
                </p>
            </header>

            <div className="card" style={{ padding: '3rem' }}>
                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Agreement to Terms</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        By accessing or using EcoShare ("the Platform"), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use our services. These terms constitute a legally
                        binding agreement between you and EcoShare.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Description of Service</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        EcoShare is a sustainable travel planning platform that provides:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li>Trip planning and collaboration tools</li>
                        <li>Carbon footprint calculation and tracking</li>
                        <li>Expense splitting and settlement features</li>
                        <li>Environmental impact visualization</li>
                        <li>Leaderboards and eco-friendly rewards</li>
                        <li>Community features for sustainable travelers</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>User Accounts</h2>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Account Creation
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        To use EcoShare, you must create an account using Google OAuth. You agree to:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem', marginBottom: '1.5rem' }}>
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account credentials</li>
                        <li>Notify us immediately of any unauthorized access</li>
                        <li>Be responsible for all activities under your account</li>
                        <li>Not share your account with others</li>
                    </ul>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Account Termination
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We reserve the right to suspend or terminate your account if you violate these terms or engage in
                        fraudulent, abusive, or illegal activities. You may delete your account at any time through your
                        profile settings.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>User Conduct</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        You agree not to:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li>Use the platform for any illegal or unauthorized purpose</li>
                        <li>Violate any laws in your jurisdiction</li>
                        <li>Infringe upon the rights of others</li>
                        <li>Upload malicious code, viruses, or harmful content</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Harass, abuse, or harm other users</li>
                        <li>Impersonate any person or entity</li>
                        <li>Scrape, crawl, or collect data without permission</li>
                        <li>Interfere with the proper functioning of the platform</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Trip Sharing and Expenses</h2>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Collaborative Trips
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        When you create or join a trip, you agree to collaborate in good faith with other participants.
                        Information shared within a trip is visible to all participants.
                    </p>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Expense Splitting
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
                        EcoShare provides tools to track and split expenses, but:
                    </p>
                    <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '2rem' }}>
                        <li>We are not responsible for disputes between users regarding payments</li>
                        <li>Users are responsible for settling their own financial obligations</li>
                        <li>We do not process payments or act as a financial intermediary</li>
                        <li>All expense calculations are estimates and should be verified by users</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Carbon Footprint Calculations</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Our carbon footprint calculations are estimates based on available data and industry-standard methodologies.
                        These calculations are provided for informational purposes only and should not be considered as precise
                        scientific measurements. We do not guarantee the accuracy of these estimates and are not liable for any
                        decisions made based on this information.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Intellectual Property</h2>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Our Content
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        All content, features, and functionality of EcoShare, including but not limited to text, graphics, logos,
                        icons, images, and software, are the exclusive property of EcoShare and are protected by copyright,
                        trademark, and other intellectual property laws.
                    </p>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Your Content
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        You retain ownership of any content you submit to EcoShare. By submitting content, you grant us a
                        worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content
                        for the purpose of operating and improving the platform.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Disclaimers and Limitations</h2>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Service Availability
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        EcoShare is provided "as is" and "as available" without warranties of any kind. We do not guarantee
                        that the platform will be uninterrupted, secure, or error-free. We reserve the right to modify,
                        suspend, or discontinue any part of the service at any time.
                    </p>

                    <h3 style={{ marginBottom: '0.75rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
                        Limitation of Liability
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        To the maximum extent permitted by law, EcoShare and its affiliates shall not be liable for any
                        indirect, incidental, special, consequential, or punitive damages, including but not limited to
                        loss of profits, data, or goodwill, arising from your use of the platform.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Indemnification</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        You agree to indemnify, defend, and hold harmless EcoShare and its officers, directors, employees,
                        and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the
                        platform, violation of these terms, or infringement of any third-party rights.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Third-Party Links and Services</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        EcoShare may contain links to third-party websites or services that are not owned or controlled by us.
                        We are not responsible for the content, privacy policies, or practices of any third-party sites.
                        You acknowledge and agree that we shall not be liable for any damage or loss caused by your use of
                        such third-party services.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Privacy</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        Your use of EcoShare is also governed by our Privacy Policy. Please review our
                        <a href="/privacy-policy" style={{ color: 'var(--primary)', marginLeft: '0.25rem' }}>Privacy Policy</a> to
                        understand how we collect, use, and protect your personal information.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Modifications to Terms</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        We reserve the right to modify these Terms of Service at any time. We will notify users of significant
                        changes by posting the updated terms on this page and updating the "Last Updated" date. Your continued
                        use of EcoShare after changes constitutes acceptance of the modified terms.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Governing Law</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        These Terms of Service shall be governed by and construed in accordance with the laws of India,
                        without regard to its conflict of law provisions. Any disputes arising from these terms shall be
                        subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Severability</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        If any provision of these terms is found to be invalid or unenforceable, the remaining provisions
                        shall continue to be valid and enforceable to the fullest extent permitted by law.
                    </p>
                </section>

                <section>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Contact Information</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                        If you have any questions about these Terms of Service, please contact us:
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

            <div style={{
                textAlign: 'center',
                marginTop: '3rem',
                padding: '2rem',
                background: 'var(--bg-secondary)',
                borderRadius: '0.75rem'
            }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    By using EcoShare, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
                <button className="btn btn-primary" onClick={() => window.history.back()}>
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default TermsOfService;
