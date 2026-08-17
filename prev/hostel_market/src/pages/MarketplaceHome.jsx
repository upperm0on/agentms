import React, { useState } from 'react'
import { Sparkles, ShoppingBag, Plus, ShieldCheck, Clock4, Users, ArrowRight, CheckCircle2, Wand2, GraduationCap, Rocket, HandCoins, HeartHandshake, Lightbulb, LineChart, LogIn, Store, Megaphone, Settings } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Button } from '../components/ui/Button'
import CreateStoreModal from '../components/marketplace/CreateStoreModal'
import { useNavigate } from 'react-router-dom'
import './MarketplaceHome.css'
import '../index.css'

function MarketplaceHome() {
  const navigate = useNavigate()
  const { isAuthenticated, entrepreneur } = useSelector(state => state.auth)
  const [showCreateStore, setShowCreateStore] = useState(false)
  
  // Check if user has a store
  const hasStore = !!(entrepreneur?.store || entrepreneur?.store_id)

  const metricHighlights = [
    { icon: Rocket, number: '500+', label: 'student-led ventures warming up' },
    { icon: Sparkles, number: '92%', label: 'say the tools feel effortless' },
    { icon: Clock4, number: '10 min', label: 'to launch a storefront' },
  ]

  const howSteps = [
    {
      step: '01',
      icon: LogIn,
      title: 'Sign in',
      description: 'Create an account with your campus email and set your intent.',
      badge: 'Quick and simple',
    },
    {
      step: '02',
      icon: Store,
      title: 'Open a storefront',
      description: 'Name it, highlight what you sell or the services you provide, and publish.',
      badge: 'Free to launch',
    },
    {
      step: '03',
      icon: Megaphone,
      title: 'Share and grow',
      description: 'Invite classmates, take orders, track payouts, and iterate as you learn.',
      badge: 'Built for campus',
    },
  ]

  return (
    <div className="marketplace-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-badge">Built for campus founders</div>
              <h1 className="hero-title">
                Launch your campus venture with confidence
              </h1>
              <p className="hero-subtitle">
                sitysns keeps student entrepreneurship intentional. Sell what you create, hire your peers, and show up like a brand that means business.
              </p>
              <div className="hero-actions">
                <Button size="lg" variant="default" onClick={() => navigate('/browse')} aria-label="Explore the market" title="Explore the market">
                  <ShoppingBag size={20} />
                  <span className="button-text">Explore the market</span>
                </Button>
                {isAuthenticated ? (
                  hasStore ? (
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate('/my-store')}
                      aria-label="My Store"
                      title="My Store"
                    >
                      <Store size={20} />
                      <span className="button-text">My Store</span>
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => setShowCreateStore(true)}
                      aria-label="Open your store"
                      title="Open your store"
                    >
                      <Plus size={20} />
                      <span className="button-text">Open your store</span>
                    </Button>
                  )
                ) : (
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')} aria-label="Join as a seller" title="Join as a seller">
                    <Plus size={20} />
                    <span className="button-text">Join as a seller</span>
                  </Button>
                )}
              </div>
              <div className="hero-stats">
                <span className="stat-chip"><ShieldCheck size={16} /> Peer-verified community</span>
                <span className="stat-chip"><Clock4 size={16} /> 10-minute setup</span>
                <span className="stat-chip"><Users size={16} /> Built for students</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-glow" />
              <div className="hero-card hero-card--primary">
                <div className="hero-card-badge">
                  <Sparkles size={16} /> Campus storefront
                </div>
                <p>Create a polished store page, showcase services, and handle requests in one clean space.</p>
                <div className="hero-card-footer">
                  <div>
                    <span className="hero-card-stat">Guided setup</span>
                    <small>No fluff, no noise.</small>
                  </div>
                  <ArrowRight size={20} />
                </div>
              </div>
              <div className="hero-card hero-card--secondary">
                <div className="hero-card-icon">
                  <Wand2 size={24} />
                </div>
                <h4>Tools that stay out of the way</h4>
                <p>Requests, delivery, and payouts tailored for campus life.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About the Market */}
      <section className="section section-about">
        <div className="container">
          <div className="section-heading">
            <span className="section-subtitle">Why this exists</span>
            <h2 className="section-title">Designed to elevate student entrepreneurship</h2>
            <p className="section-lead">
              We built sitysns for students who want to take control of their ideas—without losing the polish or trust of a real marketplace.
            </p>
          </div>
          <div className="about-grid">
            <div className="about-card">
              <Rocket size={22} />
              <h3>Built for launch, not overwhelm</h3>
              <p>Show up like a professional brand in minutes. Clean storefronts, simple order flows, and clarity from the first click.</p>
            </div>
            <div className="about-card">
              <HandCoins size={22} />
              <h3>Earn and collaborate</h3>
              <p>Sell products, offer services, or hire others to help you execute. Money and ideas move faster when the campus is your network.</p>
            </div>
            <div className="about-card">
              <ShieldCheck size={22} />
              <h3>Trust at the core</h3>
              <p>Verified profiles, transparent reviews, and a code of conduct make every interaction intentional and safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section section-audience">
        <div className="container">
          <div className="audience-split">
            <div className="audience-copy">
              <div className="section-subtitle">Who it’s for</div>
              <h2>Students who want more than a side hustle</h2>
              <p>sitysns is where campus creators, doers, and collaborators come together to test ideas, earn money, and deliver value.</p>
              <ul className="audience-points">
                <li><Lightbulb size={18} /> Dreamers validating their first venture.</li>
                <li><LineChart size={18} /> Builders scaling what already works.</li>
                <li><HeartHandshake size={18} /> Students ready to pay trusted peers for help.</li>
              </ul>
            </div>
            <div className="audience-grid">
              <div className="audience-card">
                <div className="pill"><GraduationCap size={16} /> Just getting started</div>
                <h3>Start entrepreneurship</h3>
                <p>Publish your offering, get your first customers, and learn fast.</p>
              </div>
              <div className="audience-card">
                <div className="pill"><Rocket size={16} /> Ready to scale</div>
                <h3>Level up your hustle</h3>
                <p>Showcase new drops, manage demand, and keep repeat buyers engaged.</p>
              </div>
              <div className="audience-card">
                <div className="pill"><Users size={16} /> Need support</div>
                <h3>Hire on campus</h3>
                <p>Find vetted students for design, tutoring, errands, tech, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="section section-metrics">
        <div className="container">
          <div className="metrics">
            {metricHighlights.map(({ icon: Icon, number, label }) => (
              <div className="metric" key={number}>
                <span className="metric-icon"><Icon size={20} /></span>
                <div className="metric-content">
                  <span className="metric-number">{number}</span>
                  <span className="metric-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Get Started (concise) */}
      <section className="section section-how">
        <div className="container">
          <div className="section-heading">
            <span className="section-subtitle">Three simple moves</span>
            <h2 className="section-title">Get started in minutes</h2>
            <p className="section-lead">You don’t need a full business plan—just clarity on what you offer and who needs it.</p>
          </div>
          <div className="how-grid">
            {howSteps.map(({ step, icon: Icon, title, description, badge }) => (
              <div className="how-card" key={step}>
                <span className="how-icon"><Icon size={22} /></span>
                <div className="how-step">{step}</div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="how-check"><CheckCircle2 size={18} /> {badge}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA Banner */}
      <section className="section section-sell-cta">
        <div className="container">
          <div className="sell-cta">
            <div className="sell-cta-text">
              <span className="sell-cta-badge"><Sparkles size={18} /> Launch-ready</span>
              <h3>Start selling today</h3>
              <p>Turn your skills and ideas into income. Open your store in minutes.</p>
            </div>
            <div className="sell-cta-actions">
              {isAuthenticated ? (
                hasStore ? (
                  <Button size="lg" onClick={() => navigate('/my-store')}>
                    <Settings size={20} /> Manage Store
                  </Button>
                ) : (
                  <Button size="lg" onClick={() => setShowCreateStore(true)}>
                    <Plus size={20} /> Open a store
                  </Button>
                )
              ) : (
                <Button size="lg" onClick={() => navigate('/login')}>
                  <Plus size={20} /> Open a store
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={() => navigate('/browse')}>
                Explore first <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Create Store Modal */}
      <CreateStoreModal
        isOpen={showCreateStore}
        onClose={() => setShowCreateStore(false)}
        onSubmit={(data) => {
          console.log('Create store:', data)
          setShowCreateStore(false)
          navigate('/my-store')
        }}
      />
    </div>
  )
}

export default MarketplaceHome

