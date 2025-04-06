
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { usePlan } from "@/hooks/usePlan";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTheme } from "@/hooks/useTheme";

export default function Upgrade() {
  const { isPro, subscription, createCheckoutSession, isLoading } = usePlan();
  const { resolvedTheme } = useTheme();

  // Use theme-based highlight colors
  const highlightColor = resolvedTheme === 'dark' ? 'purple-400' : 'primary';
  const buttonColor = resolvedTheme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-primary/90';

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight">Choose your plan</h1>
          <p className="mt-3 text-xl text-muted-foreground">
            Unlock the full potential of Notepad with a Pro subscription
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`h-full ${subscription?.plan === 'free' ? `border-2 border-${highlightColor}` : "border-2 border-muted"}`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Free</CardTitle>
                    <p className="text-muted-foreground mt-1">Basic note-taking</p>
                  </div>
                  {subscription?.plan === 'free' && (
                    <Badge variant="outline" className="ml-2">Current Plan</Badge>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-1">/ forever</span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>Up to 20 notes</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>Up to 5 folders</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>Basic formatting</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>Tags and organization</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  {subscription?.plan === 'free' ? "Current Plan" : "Free Plan"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`h-full relative ${isPro ? `border-2 border-${highlightColor}` : `border-2 border-${highlightColor}`}`}>
              {!isPro && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                  <Badge className={`bg-${highlightColor} text-white px-3 py-1 text-xs rounded-full`}>
                    Recommended
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Pro</CardTitle>
                    <p className="text-muted-foreground mt-1">Unlimited features</p>
                  </div>
                  {isPro && (
                    <Badge className={`bg-${highlightColor} text-primary-foreground ml-2`}>Current Plan</Badge>
                  )}
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$10</span>
                  <span className="text-muted-foreground ml-1">/ one-time</span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Unlimited notes</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span className="font-medium">Unlimited folders</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check size={20} className="mr-2 text-green-600 shrink-0 mt-0.5" />
                    <span>Future premium features</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                {isPro ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${buttonColor}`}
                    onClick={createCheckoutSession}
                    disabled={isLoading}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {isLoading ? "Processing..." : "Upgrade Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What's included in the Pro plan?</AccordionTrigger>
              <AccordionContent>
                The Pro plan includes unlimited notes and folders, priority support, and access to all future premium features as they're released.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is the payment really one-time?</AccordionTrigger>
              <AccordionContent>
                Yes! The Pro plan is a one-time payment of $10, not a subscription. You'll have lifetime access to all Pro features.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I cancel or get a refund?</AccordionTrigger>
              <AccordionContent>
                Due to the one-time payment nature of our Pro plan, we generally don't offer refunds. However, if you're experiencing issues, please contact our support team and we'll do our best to help.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How do I change my payment method?</AccordionTrigger>
              <AccordionContent>
                Since this is a one-time payment, there's no need to update payment methods for future billing. Your purchase is complete once the payment is processed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards including Visa, Mastercard, American Express, and Discover through our secure payment processor, Stripe.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
}
