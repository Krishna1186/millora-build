
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LuxurySupportSection = () => {
  return (
    <section className="py-20 bg-gray-50 section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Expert Support
          </h2>
          <div className="w-24 h-px bg-gray-300 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-light">
            Professional assistance at every step
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="luxury-card">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 21l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-light">Live Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 font-light">
                Connect instantly with our technical experts for real-time assistance with your projects.
              </p>
              <Button className="luxury-button luxury-button-primary w-full" asChild>
                <Link to="/support">START CONVERSATION</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="luxury-card">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-light">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6 font-light">
                Access comprehensive guides, tutorials, and best practices for successful manufacturing.
              </p>
              <Button className="luxury-button w-full" variant="outline" asChild>
                <a href="/#faq">BROWSE RESOURCES</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LuxurySupportSection;
