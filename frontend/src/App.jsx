import './App.css'
import React, { useEffect, useState } from "react";
import { api, setCsrf, whatsappUrl } from "./api";
import logo from "/lvlogo.jpeg";
import coverVideo from "./assets/covervideo.mp4";
import { Routes, Route } from "react-router-dom";


const money = (value) =>
  value == null
    ? "Ask for pricing"
    : `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const unitLabel = (unit) =>
  ({ kg: "per kg", item: "per item", pair: "per pair", set: "per set" })[
  unit
  ] || `per ${unit}`;
const offerText = (offer) =>
  offer.discountType === "percentage"
    ? `${offer.discountValue}% off`
    : `${money(offer.discountValue)} off`;

function AnnouncementMarquee({ offers }) {
  const messages = offers.length
    ? offers.map((offer) => `${offer.title} — ${offerText(offer)}`)
    : [
      "Fresh care for your everyday wardrobe",
      "Free pickup and delivery in Bidar",
      "Ask us about our laundry services",
      "Proudly serving Bidar, Karnataka",
      "Laundry care made simple",
    ];

  return (
    <div className="announcement-bar" aria-label="Laundry Vibes announcements">
      <div className="announcement-track">
        {[0, 1].map((copy) => (
          <div
            className="announcement-group"
            key={copy}
            aria-hidden={copy === 1 ? "true" : undefined}
          >
            {messages.map((message, index) => (
              <span className="announcement-item" key={index}>
                <i className="bi bi-stars" aria-hidden="true" />
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


function Header({ adminOpen, setAdminOpen }) {

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg container py-3">
        <a
          className="navbar-brand d-flex align-items-center gap-2"
          href="#home"
        >
          <img
            src={logo}
            alt="Laundry Vibes Logo"
            className="brand-logo"
          />
          <span className="fs-3">
            Laundry<span className="brand-light"> Vibes</span>
            <small>FRESH CARE, EVERY DAY</small>
          </span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <a className="nav-link" href="#services">
              Services
            </a>
            <a className="nav-link" href="#pricing">
              Pricing
            </a>
            <a className="nav-link" href="#offers">
              Offers
            </a>
            <a className="nav-link" href="#about">
              Our approach
            </a>
            <a className="nav-link" href="#faq">
              FAQs
            </a>
            <a className="btn btn-primary-soft ms-lg-2" href="#contact">
              Let’s talk <i className="bi bi-arrow-up-right ms-1" />
            </a>
            <button className="admin-link" onClick={() => setAdminOpen(true)}>
              Admin
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

function HomePage() {
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const displayServices = services;
  useEffect(() => {
    Promise.all([api("/services"), api("/offers")])
      .then(([s, o]) => {
        setServices(s.services || []);
        setOffers(o.offers || []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);
  const enquire = (message) => {
    const url = whatsappUrl(message);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else
      setNotice(
        "WhatsApp contact is not configured yet. Please add the real business number to the environment settings.",
      );
  };
  return (
    <>
      <AnnouncementMarquee offers={offers} />
      <Header setAdminOpen={setAdminOpen} />
      {notice && (
        <div className="container">
          <div className="alert alert-info mt-3" role="status">
            {notice}
            <button
              className="btn-close float-end"
              onClick={() => setNotice("")}
              aria-label="Dismiss"
            />
          </div>
        </div>
      )}
      {loadError && (
        <div className="container">
          <div className="api-note">
            Live prices and offers will appear when the database is configured.
            Sample service cards below intentionally show no invented prices.
          </div>
        </div>
      )}
      <main>
        <section className="hero-section" id="home">

          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> GARMENT CARE, REIMAGINED{" "}
                <span className="eyebrow-line" />
              </div>
              <h1>
                let us handle your <em>laundry</em>
                <br />
                you Vibe with Your day.
              </h1>
              <p className="hero-lead">
                Laundry that fits your life. Thoughtful care for your everyday
                favourites, with a fresher feeling from the very first wear.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() =>
                    enquire(
                      "Hello Laundry Vibes! I would like to enquire about your laundry services.",
                    )
                  }
                >
                  Enquire on WhatsApp{" "}
                  <i className="bi bi-arrow-up-right ms-2" />
                </button>
                <a className="btn btn-outline-dark btn-lg" href="#services">
                  Explore services <i className="bi bi-arrow-down-right ms-2" />
                </a>
              </div>
              <div className="hero-proof">
                <span className="proof-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 6h11v11H3z" />
                    <path d="M14 10h4l3 4v3h-7z" />
                    <circle cx="7.5" cy="18" r="2" />
                    <circle cx="17.5" cy="18" r="2" />
                  </svg>
                </span>

                <span className="proof-text">
                  <b>Free Pickup & Delivery</b>
                  <small>Convenient laundry care at your doorstep</small>
                </span>

                <span className="proof-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>

                <span className="proof-text">
                  <b>Namma Bidar</b>
                  <small>Local garment care, made simple</small>
                </span>

                <span className="proof-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                  </svg>
                </span>

                <span className="proof-text">
                  <b>Care in Every Detail</b>
                  <small>Ask us about your fabric</small>
                </span>
              </div>
            </div>

          </div>
          <div className="hero-bottom container">
            <span>CARE FOR YOUR EVERYDAY</span>
            <div />
            <span>LAUNDRY • FINISHING • GARMENT CARE</span>
          </div>
        </section>
        <section className="ticker">
          <div className="container ticker-inner">
            <span>
              <i className="bi bi-droplet-half" /> A fresh start for your
              wardrobe
            </span>
            <span>
              <i className="bi bi-check2-circle" /> Clear, current pricing
            </span>
            <span>
              <i className="bi bi-chat-dots" /> Easy WhatsApp enquiries
            </span>
            <span>
              <i className="bi bi-geo-alt" /> Proudly serving Bidar
            </span>
          </div>
        </section>
        <section className="section-pad container" id="services">
          <div className="section-heading">
            <div>
              <div className="eyebrow">CARE THAT MAKES SENSE</div>
              <h2>
                Good care for <em>everyday</em> wear.
              </h2>
            </div>
            <p>
              From the weekly laundry basket to pieces that need a little extra
              attention, find the service that suits your day.
            </p>
          </div>
          <div className="row g-4">
            {services.map((s, i) => (
              <div className="col-md-6 col-lg-3" key={s._id}>
                <article className="service-card h-100">
                  <div className={`service-icon tone-${i % 4}`}>
                    <i className={`bi ${s.icon || "bi-droplet"}`} />
                  </div>
                  <div className="service-category">
                    {s.category || "Garment care"}
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                  <div className="service-bottom">
                    <span>
                      {s.price == null ? (
                        "Price on request"
                      ) : (
                        <>
                          <b>{money(s.price)}</b>{" "}
                          <small>{unitLabel(s.unit)}</small>
                        </>
                      )}
                    </span>
                    <button
                      aria-label={`Enquire about ${s.name}`}
                      onClick={() => {
                        enquire(
                          `Hello Laundry Vibes! I'd like to enquire about ${s.name}${s.price == null ? "" : ` (${money(s.price)} ${unitLabel(s.unit)})`}.`,
                        );
                      }}
                    >
                      <i className="bi bi-arrow-up-right" />
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
          <div className="section-footnote">
            {loading
              ? "Loading current services…"
              : services.length
                ? "Prices and services shown reflect the latest published information."
                : "Service examples only — confirm availability and prices directly with Laundry Vibes."}
          </div>
          <div className="mt-4 d-flex flex-wrap gap-2">
            <a
              href="/laundry-service-bidar"
              className="btn btn-outline-primary"
            >
              Laundry Service in Bidar
            </a>

            <a
              href="/dry-cleaning-bidar"
              className="btn btn-outline-primary"
            >
              Dry Cleaning in Bidar
            </a>

            <a
              href="/laundry-pickup-delivery-bidar"
              className="btn btn-outline-primary"
            >
              Laundry Pickup & Delivery in Bidar
            </a>
          </div>
        </section>
        <section className="pricing-section" id="pricing">
          <div className="container section-pad">
            <div className="section-heading">
              <div>
                <div className="eyebrow">NO GUESSWORK</div>
                <h2>
                  Pricing, made <em>clear.</em>
                </h2>
              </div>
              <p>
                We believe it should be easy to understand what a service costs.
                Check the current list or message us for garment-specific
                guidance.
              </p>
            </div>
            <div className="price-panel">
              <div className="price-panel-top">
                <div>
                  <span className="tiny-label">CURRENT SERVICE LIST</span>
                  <h3>Simple. Straightforward.</h3>
                </div>
                <span className="price-badge">
                  <i className="bi bi-shield-check" /> Current published prices
                </span>
              </div>
              {services.length ? (
                <div className="table-responsive">
                  <table className="table price-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Category</th>
                        <th className="text-end">Current price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s._id}>
                          <td>
                            <span className="price-dot" />
                            {s.name}
                          </td>
                          <td>{s.category}</td>
                          <td className="text-end">
                            <strong>{money(s.price)}</strong>{" "}
                            <small>{unitLabel(s.unit)}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="price-empty">
                  <i className="bi bi-receipt-cutoff" />
                  <h4>
                    {loading
                      ? "Loading price list"
                      : "Your price list belongs here"}
                  </h4>
                  <p>
                    {loading
                      ? "Fetching current prices from the service database."
                      : "Current prices will appear here once the business configures its service list. We won’t make up a number."}
                  </p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      enquire(
                        "Hello Laundry Vibes! Could you please share your current service prices?",
                      )
                    }
                  >
                    Ask for current prices{" "}
                    <i className="bi bi-arrow-up-right ms-1" />
                  </button>
                </div>
              )}
              <div className="price-panel-foot">
                <i className="bi bi-info-circle" /> Special-care garments and
                item-specific requests may need a quick assessment. Confirm the
                final price before placing an order.
              </div>
            </div>
          </div>
        </section>
        <section className="section-pad container" id="offers">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A LITTLE SOMETHING EXTRA</div>
              <h2>
                Fresh offers, <em>when available.</em>
              </h2>
            </div>
            <p>
              Any promotion shown here is based on its active dates and the
              latest offer details shared by the business.
            </p>
          </div>
          {offers.length ? (
            <div className="row g-4">
              {offers.map((o) => (
                <div className="col-md-6 col-lg-4" key={o._id}>
                  <article className="offer-card">
                    <div className="offer-top">
                      <span className="offer-icon">
                        <i className="bi bi-ticket-perforated" />
                      </span>
                      <span className="offer-discount">{offerText(o)}</span>
                    </div>
                    <h3>{o.title}</h3>
                    <p>{o.description}</p>
                    {o.terms && (
                      <small className="offer-terms">{o.terms}</small>
                    )}
                    <div className="offer-valid">
                      Valid through{" "}
                      {new Date(o.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <button
                      className="text-link"
                      onClick={() =>
                        enquire(
                          `Hello Laundry Vibes! I'd like to know more about the "${o.title}" offer.`,
                        )
                      }
                    >
                      Ask about this offer{" "}
                      <i className="bi bi-arrow-up-right" />
                    </button>
                  </article>
                </div>
              ))}
            </div>
          ) : (
            <div className="offers-empty">
              <span className="empty-icon">
                <i className="bi bi-stars" />
              </span>
              <div>
                <h3>No active offers right now</h3>
                <p>
                  When a promotion is available, its details and validity will
                  show here.
                </p>
              </div>
            </div>
          )}
        </section>
        <section className="approach-section" id="about">
          <div className="container section-pad approach-grid">
            <div className="approach-art">
              <video src={coverVideo} controls width="640" height="360">
                Your browser does not support the video tag.
              </video>

              <div className="approach-caption">
                <i className="bi bi-water" />
                <span>
                  <b>Care starts with the details</b>
                  <small>Ask about the right care for your garment.</small>
                </span>
              </div>
            </div>
            <div className="approach-copy">
              <div className="eyebrow">OUR APPROACH</div>
              <h2>
                Less laundry on your mind. <em>More life in your day.</em>
              </h2>
              <p>
                At Laundry Vibes, we want garment care to feel straightforward.
                Whether it’s your regular weekly wash or a piece that needs a
                little more attention, our aim is to help you understand your
                options and choose the care that makes sense.
              </p>
              <p>
                Based in Bidar, Karnataka, we’re building a convenient local way
                to ask about laundry and garment-care services, check current
                prices and find out what’s right for your clothes.
              </p>
              <div className="approach-points">
                <div>
                  <i className="bi bi-check2-circle" />
                  <span>
                    <b>Careful conversations</b>
                    <small>
                      Tell us about the fabric and we’ll help clarify the
                      options.
                    </small>
                  </span>
                </div>
                <div>
                  <i className="bi bi-receipt" />
                  <span>
                    <b>Clear expectations</b>
                    <small>
                      Check current prices and terms before you confirm.
                    </small>
                  </span>
                </div>
                <div>
                  <i className="bi bi-chat-square-text" />
                  <span>
                    <b>Easy enquiries</b>
                    <small>Start with a simple WhatsApp message.</small>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="process-section">
          <div className="container section-pad">
            <div className="section-heading centered">
              <div>
                <div className="eyebrow">THREE EASY STEPS</div>
                <h2>
                  Freshness, without <em>the fuss.</em>
                </h2>
              </div>
              <p>
                Start a conversation and get the details you need before making
                arrangements.
              </p>
            </div>
            <div className="row g-4 process-row">
              <div className="col-md-4">
                <div className="process-card">
                  <span>01</span>
                  <i className="bi bi-chat-heart" />
                  <h3>Tell us what you need</h3>
                  <p>Choose a service or ask about a particular garment.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="process-card">
                  <span>02</span>
                  <i className="bi bi-clipboard-check" />
                  <h3>Confirm the details</h3>
                  <p>
                    Check current pricing, availability and any care
                    requirements.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="process-card">
                  <span>03</span>
                  <i className="bi bi-bag-check" />
                  <h3>Arrange the next step</h3>
                  <p>
                    Discuss drop-off, pickup availability and expected
                    turnaround directly.
                  </p>
                </div>
              </div>
            </div>
            <p className="process-note">
              A WhatsApp enquiry is not a confirmed booking. Timing and
              arrangements are confirmed directly with the business.
            </p>
          </div>
        </section>
        <section className="faq-section container section-pad" id="faq">
          <div className="section-heading">
            <div>
              <div className="eyebrow">GOOD TO KNOW</div>
              <h2>
                A few helpful <em>answers.</em>
              </h2>
            </div>
            <p>
              Can’t find what you’re looking for? Send us a message and we’ll
              help you with the next step.
            </p>
          </div>
          <div className="faq-list">
            {[
              [
                "What services are available?",
                "The current service list above shows services published by Laundry Vibes. If you have a specific garment or fabric in mind, ask us whether we can help.",
              ],
              [
                "How much does laundry cost?",
                "Current published prices appear in the pricing section. If a price is not listed, message us for a current quote before proceeding.",
              ],
              [
                "Can I arrange pickup and delivery?",
                "Yes. Pickup and delivery are available. Please contact the business to confirm availability for your location and arrange a convenient time.",
              ],
              [
                "How long will my order take?",
                "Turnaround depends on the service and garment. Ask us for an estimate before making arrangements.",
              ],
              [
                "How do I know if a garment needs dry cleaning?",
                "Check the care label first. If you are unsure, share the garment details with us and ask about suitable care options.",
              ],
              [
                "Are the offers always available?",
                "Yes. Offers are available during their active date range and while they are marked active by the business. Terms may apply.",
              ],
            ].map(([q, a], i) => (
              <details className="faq-item" key={q}>
                <summary>
                  <span>
                    <small>0{i + 1}</small>
                    {q}
                  </span>
                  <i className="bi bi-plus-lg" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="container contact-inner">
            <div>
              <div className="eyebrow eyebrow-light">LET’S GET YOU SORTED</div>
              <h2>
                Your next fresh start
                <br />
                is just a <em>message away.</em>
              </h2>
              <p>
                Tell us what needs care. We’ll help you find out what comes
                next.
              </p>
            </div>
            <div className="contact-actions">
              <button
                className="btn btn-white btn-lg"
                onClick={() =>
                  enquire(
                    "Hello Laundry Vibes! I would like to enquire about your services.",
                  )
                }
              >
                Start a WhatsApp chat{" "}
                <i className="bi bi-arrow-up-right ms-2" />
              </button>
              <span>
                <i className="bi bi-geo-alt me-2" />
                Bidar, Karnataka, India
              </span>
            </div>

          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <a
              className="navbar-brand d-flex align-items-center gap-2"
              href="#home"
            >
              <img
                src={logo}
                alt="Laundry Vibes Logo"
                className="brand-logo"
              />
              <span>
                Laundry<span className="brand-light"> Vibes</span>
                <small>FRESH CARE, EVERY DAY</small>
              </span>
            </a>
            <p>A fresher kind of laundry for everyday life in Bidar.</p>
          </div>
          <div className="footer-links">
            <b>Explore</b>
            <a href="#services">Services</a>
            <a href="#pricing">Pricing</a>
            <a href="#offers">Offers</a>
            <a href="#about">Our approach</a>
          </div>
          <div className="footer-links">
            <b>Get in touch</b>
            <span>Bidar, Karnataka, India</span>
            <button
              onClick={() => enquire("Hello Laundry Vibes! I have a question.")}
            >
              WhatsApp enquiry <i className="bi bi-arrow-up-right" />
            </button>
            <span className="footer-muted">
              Business contact details to be confirmed
            </span>


          </div>
        </div>
        <div className="container footer-bottom">
          <strong>© 2026 Laundry Vibes</strong>
          <strong>Thoughtful care. Clear information.</strong>
          <strong>
            <i class="bi bi-code-slash"></i>{" "}
            <a
              href="https://wa.me/918861411421"
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by Ibrahim
            </a>

          </strong>
          <button onClick={() => setAdminOpen(true)}>Admin login</button>
        </div>
      </footer>
      {adminOpen && (
        <AdminModal
          onClose={() => setAdminOpen(false)}
          onUpdated={async () => {
            try {
              const [s, o] = await Promise.all([
                api("/services"),
                api("/offers"),
              ]);
              setServices(s.services || []);
              setOffers(o.offers || []);
            } catch { }
          }}
        />
      )}
    </>
  );
}

function AdminModal({ onClose, onUpdated }) {
  const [stage, setStage] = useState("checking");
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [csrf, setCsrfLocal] = useState("");
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [tab, setTab] = useState("services");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const updateForm = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const load = async () => {
    const [s, o] = await Promise.all([
      api("/admin/services"),
      api("/admin/offers"),
    ]);
    setServices(s.services || []);
    setOffers(o.offers || []);
    setStage("dashboard");
  };
  useEffect(() => {
    api("/admin/me")
      .then(async (d) => {
        setCsrfLocal(d.csrfToken);
        setCsrf(d.csrfToken);
        await load();
      })
      .catch(() => setStage("login"));
  }, []);
  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setCsrfLocal(d.csrfToken);
      setCsrf(d.csrfToken);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    try {
      await api("/admin/logout", { method: "POST", body: JSON.stringify({}) });
    } catch { }
    setCsrf("");
    onClose();
  };
  const startService = (s) => {
    setEditing(s || null);
    setForm(
      s
        ? {
          name: s.name,
          slug: s.slug,
          description: s.description,
          category: s.category,
          price: s.price,
          unit: s.unit,
          image: s.image || "",
          icon: s.icon || "bi-droplet",
          isActive: s.isActive,
          sortOrder: s.sortOrder || 0,
        }
        : {
          name: "",
          slug: "",
          description: "",
          category: "Laundry",
          price: 0,
          unit: "kg",
          image: "",
          icon: "bi-droplet",
          isActive: true,
          sortOrder: 0,
        },
    );
    setStage("service-form");
  };
  const startOffer = (o) => {
    setEditing(o || null);
    setForm(
      o
        ? {
          title: o.title,
          description: o.description,
          discountType: o.discountType,
          discountValue: o.discountValue,
          terms: o.terms || "",
          startDate: new Date(o.startDate).toISOString().slice(0, 10),
          endDate: new Date(o.endDate).toISOString().slice(0, 10),
          isActive: o.isActive,
        }
        : {
          title: "",
          description: "",
          discountType: "percentage",
          discountValue: 10,
          terms: "",
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 7 * 86400000)
            .toISOString()
            .slice(0, 10),
          isActive: true,
        },
    );
    setStage("offer-form");
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (stage === "service-form") {
        const payload = {
          ...form,
          price: Number(form.price),
          sortOrder: Number(form.sortOrder),
        };
        await api(
          editing ? `/admin/services/${editing._id}` : "/admin/services",
          { method: editing ? "PATCH" : "POST", body: JSON.stringify(payload) },
        );
      } else {
        const payload = {
          ...form,
          discountValue: Number(form.discountValue),
          startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
          endDate: new Date(`${form.endDate}T23:59:59`).toISOString(),
        };
        await api(editing ? `/admin/offers/${editing._id}` : "/admin/offers", {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        });
      }
      await load();
      await onUpdated();
      setStage("dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const changePrice = async (s) => {
    const raw = window.prompt(
      `New current price for ${s.name} (${unitLabel(s.unit)}):`,
      String(s.price),
    );
    if (raw === null) return;
    const price = Number(raw);
    if (!Number.isFinite(price) || price < 0 || price > 100000) {
      setError("Enter a price between ₹0 and ₹100,000.");
      return;
    }
    try {
      await api(`/admin/services/${s._id}/price`, {
        method: "PATCH",
        body: JSON.stringify({ price }),
      });
      await load();
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
  };
  const toggleService = async (s) => {
    try {
      await api(`/admin/services/${s._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      await load();
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
  };
  const remove = async (type, item) => {
    if (
      !window.confirm(
        `Delete "${item.name || item.title}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await api(`/admin/${type}/${item._id}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      });
      await load();
      await onUpdated();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div
      className="admin-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Laundry Vibes admin"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal">
        <div className="admin-head">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-mark">
              <i className="bi bi-droplet-fill" />
            </span>
            <div>
              <b>Laundry Vibes</b>
              <small>BUSINESS ADMIN</small>
            </div>
          </div>
          <button
            className="admin-close"
            onClick={onClose}
            aria-label="Close admin"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        {error && (
          <div className="alert alert-danger m-3 mb-0">
            {error}
            <button
              className="btn-close float-end"
              onClick={() => setError("")}
            />
          </div>
        )}
        {stage === "checking" && (
          <div className="admin-loading">
            <div className="spinner-border text-primary" />
            <p>Checking secure session…</p>
          </div>
        )}
        {stage === "login" && (
          <form className="admin-login" onSubmit={login}>
            <div className="eyebrow">RESTRICTED ACCESS</div>
            <h2>Welcome back.</h2>
            <p>Sign in to manage service prices and offers.</p>
            <label className="form-label" htmlFor="adminUser">
              Username
            </label>
            <input
              id="adminUser"
              className="form-control"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="form-label mt-3" htmlFor="adminPass">
              Password
            </label>
            <input
              id="adminPass"
              className="form-control"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="btn btn-primary w-100 mt-4" disabled={busy}>
              {busy ? "Signing in…" : "Sign in securely"}{" "}
              <i className="bi bi-arrow-right ms-2" />
            </button>
            <small className="login-note">
              <i className="bi bi-lock me-1" /> Session-based access. No public
              registration.
            </small>
          </form>
        )}
        {stage === "dashboard" && (
          <div className="admin-body">
            <div className="admin-welcome">
              <div>
                <div className="eyebrow">CONTROL PANEL</div>
                <h2>Manage your business.</h2>
                <p>
                  Only services, current prices, and offers can be managed here.
                </p>
              </div>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={logout}
              >
                Log out <i className="bi bi-box-arrow-right ms-1" />
              </button>
            </div>
            <div className="admin-stats">
              <div>
                <small>Total services</small>
                <b>{services.length}</b>
              </div>
              <div>
                <small>Active services</small>
                <b>{services.filter((s) => s.isActive).length}</b>
              </div>
              <div>
                <small>Active offers</small>
                <b>
                  {
                    offers.filter(
                      (o) =>
                        o.isActive &&
                        new Date(o.endDate) >= new Date() &&
                        new Date(o.startDate) <= new Date(),
                    ).length
                  }
                </b>
              </div>
            </div>
            <div className="admin-tabs">
              <button
                className={tab === "services" ? "active" : ""}
                onClick={() => setTab("services")}
              >
                Services <span>{services.length}</span>
              </button>
              <button
                className={tab === "offers" ? "active" : ""}
                onClick={() => setTab("offers")}
              >
                Offers <span>{offers.length}</span>
              </button>
            </div>
            {tab === "services" ? (
              <>
                <div className="admin-table-head">
                  <div>
                    <h3>Service list</h3>
                    <p>Price edits replace the current stored value.</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startService(null)}
                  >
                    <i className="bi bi-plus-lg me-1" /> Add service
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Current price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr key={s._id}>
                          <td>
                            <b>{s.name}</b>
                            <small>{s.category}</small>
                          </td>
                          <td>
                            <b>{money(s.price)}</b>
                            <small>{unitLabel(s.unit)}</small>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${s.isActive ? "on" : "off"}`}
                            >
                              {s.isActive ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                title="Edit current price"
                                onClick={() => changePrice(s)}
                              >
                                <i className="bi bi-currency-rupee" />
                              </button>
                              <button
                                title="Edit service"
                                onClick={() => startService(s)}
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                title={s.isActive ? "Deactivate" : "Activate"}
                                onClick={() => toggleService(s)}
                              >
                                <i
                                  className={`bi ${s.isActive ? "bi-eye-slash" : "bi-eye"}`}
                                />
                              </button>
                              <button
                                title="Delete service"
                                onClick={() => remove("services", s)}
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!services.length && (
                    <p className="text-center py-4 text-secondary">
                      No services yet. Add the first service to get started.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="admin-table-head">
                  <div>
                    <h3>Offers</h3>
                    <p>Manage promotion details and validity.</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startOffer(null)}
                  >
                    <i className="bi bi-plus-lg me-1" /> Add offer
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table admin-table">
                    <thead>
                      <tr>
                        <th>Offer</th>
                        <th>Discount</th>
                        <th>Validity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((o) => (
                        <tr key={o._id}>
                          <td>
                            <b>{o.title}</b>
                            <small>{o.isActive ? "Active" : "Inactive"}</small>
                          </td>
                          <td>
                            <b>{offerText(o)}</b>
                          </td>
                          <td>
                            <small>
                              {new Date(o.startDate).toLocaleDateString(
                                "en-IN",
                              )}{" "}
                              –{" "}
                              {new Date(o.endDate).toLocaleDateString("en-IN")}
                            </small>
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                title="Edit offer"
                                onClick={() => startOffer(o)}
                              >
                                <i className="bi bi-pencil" />
                              </button>
                              <button
                                title="Delete offer"
                                onClick={() => remove("offers", o)}
                              >
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!offers.length && (
                    <p className="text-center py-4 text-secondary">
                      No offers yet. Add an offer when one is ready.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {(stage === "service-form" || stage === "offer-form") && (
          <form className="admin-form" onSubmit={save}>
            <div className="admin-form-title">
              <button
                type="button"
                className="back-link"
                onClick={() => setStage("dashboard")}
              >
                <i className="bi bi-arrow-left me-1" /> Back
              </button>
              <h2>
                {stage === "service-form"
                  ? editing
                    ? "Edit service"
                    : "Add service"
                  : editing
                    ? "Edit offer"
                    : "Add offer"}
              </h2>
              <p>Only supported business fields can be changed here.</p>
            </div>
            {stage === "service-form" ? (
              <>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Service name</label>
                    <input
                      className="form-control"
                      value={form.name || ""}
                      onChange={(e) => updateForm("name", e.target.value)}
                      maxLength="90"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">URL slug</label>
                    <input
                      className="form-control"
                      value={form.slug || ""}
                      onChange={(e) =>
                        updateForm(
                          "slug",
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        )
                      }
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      maxLength="500"
                      value={form.description || ""}
                      onChange={(e) =>
                        updateForm("description", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category</label>
                    <input
                      className="form-control"
                      value={form.category || ""}
                      onChange={(e) => updateForm("category", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Current price (₹)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      max="100000"
                      step="0.01"
                      value={form.price ?? 0}
                      onChange={(e) => updateForm("price", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Pricing unit</label>
                    <select
                      className="form-select"
                      value={form.unit || "kg"}
                      onChange={(e) => updateForm("unit", e.target.value)}
                    >
                      <option value="kg">Per kg</option>
                      <option value="item">Per item</option>
                      <option value="pair">Per pair</option>
                      <option value="set">Per set</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Icon class (Bootstrap Icons)
                    </label>
                    <input
                      className="form-control"
                      value={form.icon || ""}
                      onChange={(e) => updateForm("icon", e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Image URL (optional)</label>
                    <input
                      className="form-control"
                      type="url"
                      value={form.image || ""}
                      onChange={(e) => updateForm("image", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Display order</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      max="10000"
                      value={form.sortOrder ?? 0}
                      onChange={(e) => updateForm("sortOrder", e.target.value)}
                    />
                  </div>
                  <div className="col-md-6 d-flex align-items-end pb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!form.isActive}
                        id="serviceActive"
                        onChange={(e) =>
                          updateForm("isActive", e.target.checked)
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="serviceActive"
                      >
                        Visible on public website
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Offer title</label>
                  <input
                    className="form-control"
                    value={form.title || ""}
                    onChange={(e) => updateForm("title", e.target.value)}
                    maxLength="100"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={form.description || ""}
                    onChange={(e) => updateForm("description", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Discount type</label>
                  <select
                    className="form-select"
                    value={form.discountType || "percentage"}
                    onChange={(e) => updateForm("discountType", e.target.value)}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (₹)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Discount value</label>
                  <input
                    className="form-control"
                    type="number"
                    min="0.01"
                    max={form.discountType === "percentage" ? 100 : 100000}
                    step="0.01"
                    value={form.discountValue ?? 10}
                    onChange={(e) =>
                      updateForm("discountValue", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Terms (optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={form.terms || ""}
                    onChange={(e) => updateForm("terms", e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Start date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.startDate || ""}
                    onChange={(e) => updateForm("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">End date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.endDate || ""}
                    onChange={(e) => updateForm("endDate", e.target.value)}
                    required
                  />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={!!form.isActive}
                      id="offerActive"
                      onChange={(e) => updateForm("isActive", e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="offerActive">
                      Offer active
                    </label>
                  </div>
                </div>
              </div>
            )}
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setStage("dashboard")}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SeoPage({ title, description, heading, children }) {
  useEffect(() => {
    document.title = title;
    // Update Open Graph metadata
    const currentUrl = `https://laundryvibes.com${window.location.pathname}`;

    const updateMeta = (property, content) => {
      let meta = document.querySelector(
        `meta[property="${property}"]`
      );

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    updateMeta("og:title", title);
    updateMeta("og:description", description);
    updateMeta("og:url", currentUrl);

    // Update meta description
    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }

    metaDescription.setAttribute("content", description);

    // Update canonical URL
    const canonicalUrl = `https://laundryvibes.com${window.location.pathname}`;

    let canonical = document.querySelector(
      'link[rel="canonical"]'
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    canonical.setAttribute("href", canonicalUrl);

    return () => {
      document.title =
        "Laundry Vibes | Laundry & Dry Cleaning Services in Bidar, Karnataka";

      metaDescription.setAttribute(
        "content",
        "Laundry Vibes offers laundry, ironing, dry cleaning, and garment-care services in Bidar, Karnataka. Explore services, transparent pricing, current offers, and enquire conveniently on WhatsApp."
      );

      canonical.setAttribute(
        "href",
        "https://laundryvibes.com/"
      );
    };
  }, [title, description]);

  return (
    <main className="container py-5">
      <div className="py-4">
        <h1 className="display-5 fw-bold mb-3">
          {heading}
        </h1>

        <p className="lead text-muted mb-4">
          {description}
        </p>

        {children}
      </div>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/laundry-service-bidar"
        element={
          <SeoPage
            title="Best Laundry Service in Bidar | Laundry Vibes"
            description="Looking for a reliable laundry service in Bidar? Laundry Vibes offers laundry, garment care, ironing, and convenient pickup and delivery options in Bidar, Karnataka."
            heading="Best Laundry Service in Bidar"
          >
            <div className="seo-page-content">
              <p>
                Laundry Vibes provides convenient laundry and garment-care
                services in Bidar, Karnataka. Our service is designed to make
                everyday clothing care easier for individuals, families, and
                customers looking for a dependable laundry service.
              </p>

              <h2 className="mt-4">Laundry Services in Bidar</h2>

              <p>
                Whether you need regular laundry care, ironing, or other garment-care
                services, Laundry Vibes provides convenient options for customers
                in Bidar.
              </p>

              <h2 className="mt-4">Why Choose Laundry Vibes?</h2>

              <ul>
                <li>Convenient laundry service in Bidar</li>
                <li>Professional garment-care services</li>
                <li>Ironing and clothing-care options</li>
                <li>Pickup and delivery options</li>
                <li>Easy enquiry and booking through WhatsApp or phone</li>
              </ul>

              <h2 className="mt-4">Laundry Pickup and Delivery in Bidar</h2>

              <p>
                Pickup and delivery are available. Please contact Laundry Vibes
                to confirm availability for your location and arrange a convenient
                time.
              </p>

              <h2 className="mt-4">Contact Laundry Vibes</h2>

              <p>
                Looking for laundry service in Bidar? Explore our available
                services and contact Laundry Vibes to enquire about your
                requirements.
              </p>

              <div className="mt-4 d-flex flex-wrap gap-2">
                <a href="/" className="btn btn-primary">
                  Explore Laundry Vibes
                </a>

                <a href="/dry-cleaning-bidar" className="btn btn-outline-primary">
                  Dry Cleaning in Bidar
                </a>

                <a
                  href="/laundry-pickup-delivery-bidar"
                  className="btn btn-outline-primary"
                >
                  Pickup & Delivery
                </a>
              </div>
            </div>
          </SeoPage>
        }
      />

      <Route
        path="/dry-cleaning-bidar"
        element={
          <SeoPage
            title="Dry Cleaning Service in Bidar | Laundry Vibes"
            description="Looking for dry cleaning in Bidar? Laundry Vibes provides dry cleaning and garment-care services in Bidar, Karnataka with convenient enquiry and pickup options."
            heading="Dry Cleaning Service in Bidar"
          >
            <div className="seo-page-content">
              <p>
                Laundry Vibes provides dry cleaning and garment-care services
                for customers in Bidar, Karnataka. Our service is designed to
                make clothing care convenient for customers looking for
                professional garment-care options.
              </p>

              <h2 className="mt-4">Dry Cleaning in Bidar</h2>

              <p>
                If you are looking for dry cleaning services in Bidar, you can
                contact Laundry Vibes to enquire about available services and
                suitable garment-care options.
              </p>

              <h2 className="mt-4">Garment Care Services</h2>

              <ul>
                <li>Dry cleaning services</li>
                <li>Garment-care options</li>
                <li>Ironing and clothing care</li>
                <li>Convenient service enquiry</li>
                <li>Pickup and delivery options</li>
              </ul>

              <h2 className="mt-4">Dry Cleaning Pickup and Delivery</h2>

              <p>
                Pickup and delivery are available. Please contact Laundry Vibes
                to confirm availability for your location and arrange a
                convenient time.
              </p>

              <h2 className="mt-4">Contact Laundry Vibes</h2>

              <p>
                Looking for dry cleaning near you in Bidar? Explore Laundry Vibes
                and contact us to enquire about your garment-care requirements.
              </p>

              <div className="mt-4 d-flex flex-wrap gap-2">
                <a href="/" className="btn btn-primary">
                  Explore Laundry Vibes
                </a>

                <a href="/laundry-service-bidar" className="btn btn-outline-primary">
                  Laundry Service in Bidar
                </a>

                <a
                  href="/laundry-pickup-delivery-bidar"
                  className="btn btn-outline-primary"
                >
                  Pickup & Delivery
                </a>
              </div>
            </div>
          </SeoPage>
        }
      />

      <Route
        path="/laundry-pickup-delivery-bidar"
        element={
          <SeoPage
            title="Laundry Pickup & Delivery in Bidar | Laundry Vibes"
            description="Laundry Vibes provides convenient laundry pickup and delivery services in Bidar, Karnataka. Contact us to confirm availability for your location."
            heading="Laundry Pickup & Delivery in Bidar"
          >
            <div className="seo-page-content">
              <p>
                Laundry Vibes provides convenient laundry pickup and delivery
                options for customers in Bidar, Karnataka. Our goal is to make
                regular laundry care easier and more convenient.
              </p>

              <h2 className="mt-4">Laundry Pickup in Bidar</h2>

              <p>
                Instead of making a separate trip for your laundry, you can
                contact Laundry Vibes to enquire about pickup availability for
                your location in Bidar.
              </p>

              <h2 className="mt-4">Laundry Delivery in Bidar</h2>

              <p>
                After your laundry service is completed, delivery can be
                arranged according to the availability and service options
                confirmed by Laundry Vibes.
              </p>

              <h2 className="mt-4">Why Use Laundry Pickup & Delivery?</h2>

              <ul>
                <li>Convenient laundry service</li>
                <li>Pickup and delivery options</li>
                <li>Suitable for regular clothing care</li>
                <li>Easy enquiry through WhatsApp or phone</li>
                <li>Service availability can be confirmed for your location</li>
              </ul>

              <h2 className="mt-4">Laundry Service in Bidar</h2>

              <p>
                Looking for a laundry service in Bidar with convenient pickup
                and delivery options? Explore Laundry Vibes and contact us to
                discuss your laundry requirements.
              </p>

              <div className="mt-4 d-flex flex-wrap gap-2">
                <a href="/" className="btn btn-primary">
                  Explore Laundry Vibes
                </a>

                <a href="/laundry-service-bidar" className="btn btn-outline-primary">
                  Laundry Service in Bidar
                </a>

                <a href="/dry-cleaning-bidar" className="btn btn-outline-primary">
                  Dry Cleaning in Bidar
                </a>
              </div>
            </div>
          </SeoPage>
        }
      />
    </Routes>
  );
}

export default App;







