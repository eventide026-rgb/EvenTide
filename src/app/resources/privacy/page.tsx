
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }));
    }, []);

    const policySections = [
        {
            title: "1. Information We Collect",
            content: [
                "Personal Data: When you register, we collect information such as your name, email address, phone number, and role (e.g., Owner, Planner).",
                "Event Data: We collect all information you provide about your events, including names, dates, locations, guest lists, and vendor details.",
                "Usage Data: We automatically collect information on how you interact with our services, such as your IP address, browser type, and pages visited."
            ]
        },
        {
            title: "2. How We Use Your Information",
            content: [
                "To Provide and Manage Your Account: To create and maintain your account, and provide you with access to our services.",
                "To Manage Events: To facilitate event planning, guest management, and communication between you, your team, and your guests.",
                "To Improve Our Services: To analyze usage patterns, troubleshoot issues, and develop new features.",
                "To Communicate With You: To send you service-related announcements, updates, and promotional offers."
            ]
        },
        {
            title: "3. Disclosure of Your Information",
            content: [
                "With Your Consent: Information is shared between event participants as necessary for the functioning of the event (e.g., planners seeing guest lists).",
                "For Legal Reasons: We may disclose your information if required to do so by law or in response to valid requests by public authorities."
            ]
        },
        {
            title: "4. Security of Your Information",
            content: [
                "We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable."
            ]
        },
        {
            title: "5. Your Rights",
            content: [
                "You may at any time review or change the information in your account or terminate your account by logging into your account settings and updating your account.",
                "Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases."
            ]
        },
        {
            title: "6. Changes to This Privacy Policy",
            content: [
                "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes."
            ]
        },
        {
            title: "7. Contact Us",
            content: [
                "If you have questions or comments about this Privacy Policy, please contact us through our Contact Us page."
            ]
        }
    ];

    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto bg-background/80 backdrop-blur-sm border-border/60">
                    <CardHeader className="items-center text-center">
                        <ShieldCheck className="h-12 w-12 mb-4 text-primary" />
                        <CardTitle className="text-4xl font-headline">Privacy Policy</CardTitle>
                        <CardDescription>
                            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert max-w-none text-foreground/80 mx-auto">
                            <p>
                                EvenTide ('we', 'us', or 'our') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                            </p>
                            {policySections.map((section, index) => (
                                <div key={index}>
                                    <h2 className="text-foreground font-headline">{section.title}</h2>
                                    {section.content.map((paragraph, pIndex) => (
                                        <p key={pIndex}>{paragraph}</p>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
