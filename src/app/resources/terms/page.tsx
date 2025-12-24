
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function TermsOfServicePage() {
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
            title: "1. Accounts",
            content: [
                "When you create an account with us, you guarantee that you are above the age of 18, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on our Service.",
                "You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party."
            ]
        },
        {
            title: "2. Intellectual Property",
            content: [
                "The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of EvenTide and its licensors. The Service is protected by copyright, trademark, and other laws of both the Nigeria and foreign countries.",
                "Our trademarks may not be used in connection with any product or service without the prior written consent of EvenTide. By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service."
            ]
        },
        {
            title: "3. Prohibited Uses",
            content: [
                "You agree not to use the service in any way that violates any applicable national or international law or regulation. You also agree not to impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity."
            ]
        },
        {
            title: "4. Termination",
            content: [
                "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease."
            ]
        },
        {
            title: "5. Limitation Of Liability",
            content: [
                "In no event shall EvenTide, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service."
            ]
        },
        {
            title: "6. Governing Law",
            content: [
                "These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions."
            ]
        },
        {
            title: "7. Changes",
            content: [
                "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion."
            ]
        },
        {
            title: "8. Contact Us",
            content: [
                "If you have any questions about these Terms, please contact us through our Contact Us page."
            ]
        }
    ];

    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-4xl mx-auto bg-background/80 backdrop-blur-sm border-border/60">
                    <CardHeader className="items-center text-center">
                        <FileText className="h-12 w-12 mb-4 text-primary" />
                        <CardTitle className="text-4xl font-headline">Terms of Service</CardTitle>
                        <CardDescription>
                            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert max-w-none text-foreground/80 mx-auto">
                            <p>
                                Welcome to EvenTide. These Terms of Service ('Terms', 'Terms of Service') govern your use of our web pages located at eventide.app operated by EvenTide. Please read these Terms of Service carefully before using our Service.
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
