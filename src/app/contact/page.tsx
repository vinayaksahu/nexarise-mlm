import { PublicNav } from '@/components/layout/public-nav';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Clock, MapPin, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | NexaRise',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground">Our support team is here to help you 24/7.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">Drop us an email anytime.</p>
                <a href="mailto:support@nexarise.com" className="text-primary font-medium hover:underline">
                  support@nexarise.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Working Hours</h3>
                <p className="text-muted-foreground mb-4">Our systems run 24/7.</p>
                <p className="font-medium">Support: Mon-Sun, 9AM - 9PM EST</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Support Tickets</h3>
                <p className="text-muted-foreground mb-4">For active members.</p>
                <p className="font-medium">Use the dashboard ticket system.</p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Send us a Message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                <Button type="button" className="w-full" size="lg">Send Message</Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
