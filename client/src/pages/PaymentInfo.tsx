import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Smartphone, Users, Shield } from "lucide-react";
import { Link } from "wouter";

export default function PaymentInfo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Information
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn about safe and easy payment options for buying books on Highdeium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* For Readers/Buyers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <span>Buying Books (No ID Required)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Cash App Pay</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay directly with your Cash App balance or linked debit card
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Debit/Credit Cards</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use any Visa, Mastercard, American Express, or Discover card
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Digital Wallets</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Apple Pay, Google Pay, and other digital payment methods
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ <strong>Perfect for under 18:</strong> No ID verification required for purchases. 
                  Buy books instantly with Cash App or any debit card.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* For Writers/Sellers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <span>Selling Books (ID Required)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Legal Requirements</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To receive payments and sell books, payment processors require:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Government-issued ID verification</li>
                    <li>• Tax information (SSN or EIN)</li>
                    <li>• Bank account details</li>
                    <li>• Age 18+ (or parent/guardian setup)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  ⚠️ <strong>Under 18?</strong> You'll need a parent or guardian to set up the 
                  seller account legally. This is required by law, not just our policy.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> You can still write and publish books for free! 
                  Just set them as free books until you're ready to monetize.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Stripe Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bank-level encryption and security
                </p>
              </div>
              
              <div className="text-center">
                <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">No Stored Cards</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We never store your payment info
                </p>
              </div>
              
              <div className="text-center">
                <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Privacy First</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your data stays private and secure
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <Button size="lg">
              Start Reading Books
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}