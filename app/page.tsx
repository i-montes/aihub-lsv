"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Check, Edit3, FileText, Layers, MessageSquare, Zap } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-full bg-white">
      {/* Navigation */}
      <nav className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold">P</span>
          </div>
          <span className="font-bold text-xl">PressAI</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-700 hover:text-primary-600">
            Features
          </Link>
          <Link href="#how-it-works" className="text-gray-700 hover:text-primary-600">
            How It Works
          </Link>
          <Link href="#testimonials" className="text-gray-700 hover:text-primary-600">
            Testimonials
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="outline" className="rounded-md">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary-600 text-white hover:bg-primary-700 rounded-md">Start Free Trial</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              AI-Powered Tools for
              <br />
              Modern <span className="bg-primary-50 px-2 py-1 inline-block transform -rotate-1">Journalism</span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg">
              Streamline your workflow with our suite of AI tools designed specifically for journalists and content
              creators. Write better, faster, and with more impact.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Input type="email" placeholder="Enter your email" className="w-full sm:w-64 rounded-md" />
              <Button className="bg-primary-600 text-white hover:bg-primary-700 rounded-md">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 flex items-center text-sm text-gray-500">
              <Check className="mr-2 h-4 w-4 text-green-500" />
              No credit card required
              <span className="mx-2">•</span>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              14-day free trial
            </div>
          </div>

          <div className="relative">
            {/* Editor mockup */}
            <div className="bg-white rounded-xl shadow-xl p-4 border border-gray-200">
              <div className="bg-gray-100 rounded-lg p-2 mb-4 flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-sm text-gray-500 flex-1 text-center">PressAI Editor</div>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-bold mb-2">Climate Change Report Shows Alarming Trends</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="bg-primary-50 text-primary-800 px-2 py-0.5 rounded text-xs mr-2">ANALYSIS</span>
                    <span>By John Smith • 5 min read</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    A new report released today by climate scientists indicates that global temperatures are rising
                    faster than previously predicted...
                  </p>
                </div>

                <div className="flex items-center text-sm">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-2">
                    Style Guide: AP ✓
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">Readability: Good</div>
                  <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">AI Suggestions: 3</div>
                </div>

                <div className="bg-primary-50 border border-primary-50 rounded-lg p-3 text-sm">
                  <div className="flex items-center text-primary-800 font-medium mb-1">
                    <Zap className="h-4 w-4 mr-1" /> AI Suggestion
                  </div>
                  <p className="text-gray-700">
                    Consider adding context about previous climate reports for comparison.
                  </p>
                  <div className="flex justify-end mt-2">
                    <button className="text-xs text-primary-600 hover:text-primary-800">Apply</button>
                    <button className="text-xs text-gray-500 hover:text-gray-700 ml-3">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-10 -right-10 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-48">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-medium">Thread Generator</span>
              </div>
              <p className="text-xs text-gray-600">
                Transform your article into an engaging social media thread with one click
              </p>
            </div>

            <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-48">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-primary-600 mr-2" />
                <span className="font-medium">Newsletter Ready</span>
              </div>
              <p className="text-xs text-gray-600">Format your content for newsletters with proper sections and CTAs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-4">Powerful Tools for Modern Journalists</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Our AI-powered platform helps you create better content faster, with tools designed specifically for
          journalism workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-bl-full opacity-50"></div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Thread Generator</h3>
            <p className="text-gray-600 mb-4">
              Transform long-form articles into engaging social media threads optimized for Twitter, LinkedIn, and other
              platforms.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Maintains key points and narrative
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Optimizes for engagement
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Includes suggested hashtags
              </li>
            </ul>
          </div>

          <div className="bg-primary-600 text-white rounded-xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500 rounded-bl-full opacity-50"></div>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <Edit3 className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Text Editor</h3>
            <p className="text-white/90 mb-4">
              Write with confidence using our AI-powered editor with built-in style guide integration and real-time
              suggestions.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary-50 mr-2" />
                AP, Chicago, and custom style guides
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary-50 mr-2" />
                Readability analysis
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-primary-50 mr-2" />
                Fact-checking assistance
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-bl-full opacity-50"></div>
            <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Newsletter Generator</h3>
            <p className="text-gray-600 mb-4">
              Convert articles into newsletter-ready formats with proper sections, CTAs, and engagement elements.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Multiple template options
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Automatic section creation
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Optimized for email clients
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">How PressAI Works</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Our platform seamlessly integrates into your workflow, helping you create better content with less effort.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Create Content</h3>
            <p className="text-gray-600">
              Write your article in our AI-powered editor or import existing content from your CMS.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Enhance with AI</h3>
            <p className="text-gray-600">Get real-time suggestions for style, clarity, and engagement as you write.</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-600 font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Transform & Publish</h3>
            <p className="text-gray-600">
              Convert your content into threads, newsletters, or other formats with one click.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-gray-50 rounded-xl p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2">
              <Image
                src="/placeholder-irelj.png"
                alt="Journalist using PressAI"
                width={400}
                height={300}
                className="rounded-lg"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl font-bold mb-4">Designed for Journalists</h3>
              <p className="text-gray-600 mb-4">
                PressAI was built by journalists for journalists. We understand the unique challenges of modern
                newsrooms and content creation.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Integrates with popular CMS platforms</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Respects journalistic ethics and standards</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Helps maintain your unique voice and style</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-4 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-4">Trusted by Journalists Worldwide</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          See what professional journalists and content creators are saying about PressAI.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                <span className="font-bold">S</span>
              </div>
              <div>
                <p className="font-bold">Sarah Johnson</p>
                <p className="text-sm text-gray-500">Senior Editor, The Daily Chronicle</p>
              </div>
            </div>
            <p className="text-gray-700">
              "PressAI has transformed our newsroom workflow. The style guide integration alone has saved us countless
              hours of editing time, and the thread generator helps us reach new audiences on social media."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                <span className="font-bold">M</span>
              </div>
              <div>
                <p className="font-bold">Michael Chen</p>
                <p className="text-sm text-gray-500">Freelance Tech Journalist</p>
              </div>
            </div>
            <p className="text-gray-700">
              "As a freelancer, I need to be efficient with my time. PressAI helps me write faster and better, and the
              newsletter generator has helped me grow my subscriber base by 40% in just three months."
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                <span className="font-bold">L</span>
              </div>
              <div>
                <p className="font-bold">Lisa Rodriguez</p>
                <p className="text-sm text-gray-500">Content Director, NewsNow</p>
              </div>
            </div>
            <p className="text-gray-700">
              "The AI suggestions are surprisingly insightful. PressAI doesn't just check grammar—it helps improve the
              substance of our reporting with relevant context and fact-checking assistance."
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Journalism?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of journalists who are using PressAI to create better content, faster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white"
            />
            <Link href="/register">
              <Button className="bg-white text-primary-600 hover:bg-gray-100">Start Free Trial</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-primary-200">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="font-bold text-xl">PressAI</span>
              </div>
              <p className="text-gray-600">AI-powered tools for modern journalism and content creation.</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-primary-600">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600">© 2023 PressAI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-primary-600">
                Terms
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary-600">
                Privacy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-primary-600">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
