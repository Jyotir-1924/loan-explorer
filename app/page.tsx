import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Find Your Perfect Loan with AI
        </h1>
        <p className="text-xl text-gray-600">
          Explore personalized loan products, compare rates, and get instant answers 
          with our AI-powered chatbot
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Browse Loans
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Personalized Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get Top 5 loan recommendations based on your income and financial profile
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ask questions about any loan product and get instant, accurate answers
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                40+ Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compare loans from top banks across personal, home, education, and vehicle categories
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}