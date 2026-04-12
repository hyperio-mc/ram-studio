const fs = require('fs');

// QUORUM — Private Gathering Management
// Inspired by:
//   - Stripe Sessions 2026 (godly.website): warm off-white #F9F7F7, editorial conference layout
//   - New Genre Holdings (minimal.gallery): ALL CAPS authority, corporate-minimal gravitas
//   - Atlas Card (godly.website): luxury-utility app, full-bleed sections, editorial feel
// Theme: LIGHT (warm parchment — forge was dark)

const design = {
  version: "2.8",
  metadata: {
    name: "QUORUM",
    slug: "quorum",
    description: "Private gathering management for curated small-group events — dinners, salons, retreats",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "light",
    palette: "warm parchment / near-black / deep amber"
  },
  theme: {
    bg: "#F8F5EF",
    surface: "#FFFFFF",
    surfaceAlt: "#F0EBE1",
    text: "#0F0E0C",
    textMuted: "rgba(15,14,12,0.42)",
    accent: "#B8820F",
    accentSoft: "rgba(184,130,15,0.12)",
    accent2: "#6B5B3E",
    border: "rgba(15,14,12,0.10)",
    success: "#3D7A52",
    warn: "#C4550A"
  },
  typography: {
    heading: { family: "Playfair Display, Georgia, serif", weight: "700" },
    label: { family: "Inter, system-ui, sans-serif", weight: "600", transform: "uppercase", tracking: "0.12em" },
    body: { family: "Inter, system-ui, sans-serif", weight: "400" },
    mono: { family: "JetBrains Mono, monospace", weight: "400" }
  },
  screens: [
    // SCREEN 1: HOME — Today's gatherings, calendar strip, metrics
    {
      id: "home",
      label: "HOME",
      icon: "home",
      elements: [
        {
          type: "header-status",
          date: "FRIDAY, APRIL 3",
          greeting: "Good morning, Elliot.",
          sub: "2 gatherings today"
        },
        {
          type: "metric-band",
          items: [
            { label: "UPCOMING", value: "7", unit: "events" },
            { label: "THIS WEEK", value: "3", unit: "invitations" },
            { label: "QUORUM SIZE", value: "41", unit: "members" }
          ]
        },
        {
          type: "section-label",
          text: "TODAY'S GATHERINGS"
        },
        {
          type: "event-card-primary",
          title: "Investment Salon",
          host: "Claire Voss",
          time: "7:00 PM",
          venue: "The Parlour, SoHo",
          attendees: 9,
          capacity: 12,
          tag: "DINNER",
          status: "confirmed"
        },
        {
          type: "event-card-secondary",
          title: "Design Studio Crit",
          host: "Marco Lehn",
          time: "2:00 PM",
          venue: "Studio 4, Tribeca",
          attendees: 6,
          capacity: 8,
          tag: "WORKSHOP",
          status: "pending-rsvp"
        },
        {
          type: "section-label",
          text: "UPCOMING THIS WEEK"
        },
        {
          type: "event-list-compact",
          items: [
            { day: "SAT", title: "Founders Brunch", host: "Yael Park", tag: "SOCIAL" },
            { day: "SUN", title: "Philosophy Walk", host: "N. Adeyemi", tag: "OUTDOOR" },
            { day: "MON", title: "Book Club: Finite & Infinite", host: "E. Hartwell", tag: "CULTURE" }
          ]
        }
      ]
    },

    // SCREEN 2: GATHERINGS — Editorial card list
    {
      id: "gatherings",
      label: "GATHERINGS",
      icon: "calendar",
      elements: [
        {
          type: "page-header",
          title: "GATHERINGS",
          subtitle: "Your curated calendar",
          action: "＋ CREATE"
        },
        {
          type: "filter-tabs",
          items: ["ALL", "HOSTING", "INVITED", "PAST"]
        },
        {
          type: "editorial-event-card",
          issue: "01",
          title: "Investment Salon",
          description: "A closed dinner for eight around emerging market theses. Presented by Claire Voss, moderated.",
          date: "FRI APR 3",
          time: "7 PM",
          venue: "The Parlour",
          location: "SoHo, New York",
          attendeeCount: 9,
          capacity: 12,
          tag: "PRIVATE DINNER",
          status: "CONFIRMED"
        },
        {
          type: "editorial-event-card",
          issue: "02",
          title: "Design Studio Crit",
          description: "Portfolio review and critique session. Bring work-in-progress. Generous feedback expected.",
          date: "FRI APR 3",
          time: "2 PM",
          venue: "Studio 4",
          location: "Tribeca, New York",
          attendeeCount: 6,
          capacity: 8,
          tag: "WORKSHOP",
          status: "AWAITING RSVP"
        },
        {
          type: "editorial-event-card",
          issue: "03",
          title: "Founders Brunch",
          description: "Monthly gathering of early-stage founders. Open format — bring a question, leave with perspective.",
          date: "SAT APR 4",
          time: "10 AM",
          venue: "Dimes",
          location: "Lower East Side, New York",
          attendeeCount: 14,
          capacity: 20,
          tag: "SOCIAL",
          status: "CONFIRMED"
        }
      ]
    },

    // SCREEN 3: EVENT DETAIL — Investment Salon deep view
    {
      id: "event-detail",
      label: "EVENT",
      icon: "star",
      elements: [
        {
          type: "event-hero",
          tag: "PRIVATE DINNER",
          title: "Investment Salon",
          issue: "No. 07"
        },
        {
          type: "event-meta-row",
          items: [
            { label: "DATE", value: "Friday, April 3" },
            { label: "TIME", value: "7:00 PM" },
            { label: "VENUE", value: "The Parlour, SoHo" }
          ]
        },
        {
          type: "host-block",
          label: "HOSTED BY",
          name: "Claire Voss",
          title: "Partner, Sequoia",
          initials: "CV"
        },
        {
          type: "description-block",
          label: "ABOUT THIS GATHERING",
          text: "A closed dinner for eight around emerging market theses, current allocations, and the shift away from public markets. Moderated by Claire Voss. Dress code: business casual. Wine provided."
        },
        {
          type: "attendees-block",
          label: "ATTENDEES",
          count: "9 of 12",
          members: [
            { initials: "EH", name: "Elliot Hartwell" },
            { initials: "YP", name: "Yael Park" },
            { initials: "MA", name: "Marco A." },
            { initials: "RK", name: "R. Kang" },
            { initials: "NS", name: "N. Shah" },
            { initials: "+4", name: "4 more" }
          ]
        },
        {
          type: "action-row",
          primary: { label: "CONFIRMED", state: "active" },
          secondary: { label: "VIEW MAP" },
          tertiary: { label: "ADD TO CALENDAR" }
        }
      ]
    },

    // SCREEN 4: NETWORK — Member directory
    {
      id: "network",
      label: "NETWORK",
      icon: "user",
      elements: [
        {
          type: "page-header",
          title: "YOUR QUORUM",
          subtitle: "41 members",
          action: "INVITE"
        },
        {
          type: "search-bar",
          placeholder: "SEARCH MEMBERS..."
        },
        {
          type: "section-label",
          text: "RECENTLY ACTIVE"
        },
        {
          type: "member-list",
          members: [
            { initials: "CV", name: "Claire Voss", title: "Partner, Sequoia", shared: 4, badge: "HOST" },
            { initials: "YP", name: "Yael Park", title: "Founder, Helix", shared: 6, badge: null },
            { initials: "ML", name: "Marco Lehn", title: "Design Director, Arc", shared: 3, badge: "HOST" },
            { initials: "NA", name: "Nadia Adeyemi", title: "Writer + Curator", shared: 2, badge: null },
            { initials: "RK", name: "Raymond Kang", title: "GP, Torch Capital", shared: 5, badge: null },
            { initials: "EH", name: "Elliot Hartwell", title: "You", shared: 0, badge: "YOU" }
          ]
        },
        {
          type: "section-label",
          text: "BY GATHERING"
        },
        {
          type: "tag-cloud",
          items: ["FINANCE", "DESIGN", "CULTURE", "TECH", "FOUNDERS", "WRITERS"]
        }
      ]
    },

    // SCREEN 5: CREATE — New gathering flow
    {
      id: "create",
      label: "CREATE",
      icon: "plus",
      elements: [
        {
          type: "page-header",
          title: "NEW GATHERING",
          subtitle: "Define your quorum",
          action: "CANCEL"
        },
        {
          type: "form-field",
          label: "GATHERING NAME",
          placeholder: "e.g. The Tuesday Salon",
          value: ""
        },
        {
          type: "form-field-row",
          fields: [
            { label: "FORMAT", placeholder: "DINNER / WORKSHOP...", value: "" },
            { label: "SIZE", placeholder: "MAX ATTENDEES", value: "12" }
          ]
        },
        {
          type: "form-field",
          label: "DATE & TIME",
          placeholder: "SELECT DATE",
          value: "Friday, April 10 — 7:00 PM"
        },
        {
          type: "form-field",
          label: "VENUE",
          placeholder: "Location name",
          value: "The Parlour, SoHo"
        },
        {
          type: "form-textarea",
          label: "DESCRIPTION",
          placeholder: "What is this gathering about? What should attendees expect or bring?",
          value: ""
        },
        {
          type: "section-label",
          text: "INVITE MEMBERS"
        },
        {
          type: "invite-picker",
          suggested: ["Claire Voss", "Yael Park", "Marco Lehn", "Raymond Kang"],
          selected: ["Yael Park", "Claire Voss"]
        },
        {
          type: "cta-button",
          label: "CREATE GATHERING",
          style: "primary"
        }
      ]
    }
  ],
  nav: [
    { id: "home", label: "HOME", icon: "home" },
    { id: "gatherings", label: "EVENTS", icon: "calendar" },
    { id: "event-detail", label: "DETAIL", icon: "star" },
    { id: "network", label: "NETWORK", icon: "user" },
    { id: "create", label: "CREATE", icon: "plus" }
  ]
};

// ── Generate Pencil v2.8 .pen file ──────────────────────────────────────────

function renderElement(el, theme, typo) {
  const { bg, surface, surfaceAlt, text, textMuted, accent, accentSoft, accent2, border, success, warn } = theme;
  const t = `font-family: ${typo.label.family}; letter-spacing: ${typo.label.tracking}; text-transform: uppercase; font-size: 10px; font-weight: 600; color: ${textMuted}`;
  const h = `font-family: ${typo.heading.family}; font-weight: 700`;

  switch (el.type) {

    case 'header-status':
      return {
        type: 'group', id: `hs-${Math.random().toString(36).slice(2,7)}`,
        children: [
          { type: 'text', text: el.date, style: `${t}; margin-bottom:4px` },
          { type: 'text', text: el.greeting, style: `${h}; font-size:22px; color:${text}; line-height:1.2; margin-bottom:2px` },
          { type: 'text', text: el.sub, style: `font-family:${typo.body.family}; font-size:13px; color:${accent}; font-weight:500` }
        ]
      };

    case 'metric-band':
      return {
        type: 'group', id: `mb-${Math.random().toString(36).slice(2,7)}`,
        layout: 'horizontal',
        style: `background:${surface}; border-radius:12px; border:1px solid ${border}; padding:14px; gap:0; margin:12px 0`,
        children: el.items.map((item, i) => ({
          type: 'group',
          style: `flex:1; text-align:center; ${i > 0 ? `border-left:1px solid ${border};` : ''}`,
          children: [
            { type: 'text', text: item.value, style: `${h}; font-size:26px; color:${accent}; display:block; line-height:1` },
            { type: 'text', text: item.label, style: `${t}; display:block; margin-top:2px; font-size:9px` }
          ]
        }))
      };

    case 'section-label':
      return {
        type: 'text', text: el.text,
        style: `${t}; font-size:9px; margin: 14px 0 8px; border-bottom:1px solid ${border}; padding-bottom:6px; display:block`
      };

    case 'event-card-primary':
      return {
        type: 'group', id: `ecp-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${text}; border-radius:14px; padding:16px; margin-bottom:10px`,
        children: [
          { type: 'group', layout: 'horizontal', style: 'justify-content:space-between; margin-bottom:10px',
            children: [
              { type: 'text', text: el.tag, style: `font-family:${typo.label.family}; letter-spacing:0.1em; text-transform:uppercase; font-size:9px; font-weight:600; color:${accent}; background:${accentSoft.replace('0.12','0.2')}; padding:3px 8px; border-radius:20px` },
              { type: 'text', text: el.status === 'confirmed' ? '✓ CONFIRMED' : '⋯ PENDING', style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.08em; color:${el.status === 'confirmed' ? success : warn}; font-weight:600` }
            ]
          },
          { type: 'text', text: el.title, style: `${h}; font-size:20px; color:#F8F5EF; line-height:1.2; margin-bottom:4px` },
          { type: 'group', layout: 'horizontal', style: 'gap:12px; margin-bottom:8px',
            children: [
              { type: 'text', text: el.time, style: `font-family:${typo.body.family}; font-size:13px; color:rgba(248,245,239,0.65)` },
              { type: 'text', text: el.venue, style: `font-family:${typo.body.family}; font-size:13px; color:rgba(248,245,239,0.65)` }
            ]
          },
          { type: 'group', layout: 'horizontal', style: 'justify-content:space-between; align-items:center',
            children: [
              { type: 'text', text: `Hosted by ${el.host}`, style: `font-family:${typo.body.family}; font-size:11px; color:rgba(248,245,239,0.5)` },
              { type: 'text', text: `${el.attendees}/${el.capacity} attending`, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.08em; color:rgba(248,245,239,0.5)` }
            ]
          }
        ]
      };

    case 'event-card-secondary':
      return {
        type: 'group', id: `ecs-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border-radius:14px; border:1px solid ${border}; padding:16px; margin-bottom:10px`,
        children: [
          { type: 'group', layout: 'horizontal', style: 'justify-content:space-between; margin-bottom:10px',
            children: [
              { type: 'text', text: el.tag, style: `font-family:${typo.label.family}; letter-spacing:0.1em; text-transform:uppercase; font-size:9px; font-weight:600; color:${accent2}; background:rgba(107,91,62,0.08); padding:3px 8px; border-radius:20px` },
              { type: 'text', text: '⚠ RSVP BY 5 PM', style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.08em; color:${warn}; font-weight:600` }
            ]
          },
          { type: 'text', text: el.title, style: `${h}; font-size:18px; color:${text}; line-height:1.2; margin-bottom:4px` },
          { type: 'group', layout: 'horizontal', style: 'gap:12px; margin-bottom:6px',
            children: [
              { type: 'text', text: el.time, style: `font-family:${typo.body.family}; font-size:13px; color:${textMuted}` },
              { type: 'text', text: el.venue, style: `font-family:${typo.body.family}; font-size:13px; color:${textMuted}` }
            ]
          },
          { type: 'group', layout: 'horizontal', style: 'gap:8px',
            children: [
              { type: 'button', text: 'DECLINE', style: `flex:1; padding:9px; border:1px solid ${border}; border-radius:8px; font-family:${typo.label.family}; font-size:10px; letter-spacing:0.1em; color:${textMuted}; text-align:center; background:transparent` },
              { type: 'button', text: 'ACCEPT', style: `flex:1; padding:9px; background:${accent}; border-radius:8px; font-family:${typo.label.family}; font-size:10px; letter-spacing:0.1em; color:#FFF; text-align:center; font-weight:600` }
            ]
          }
        ]
      };

    case 'event-list-compact':
      return {
        type: 'group', id: `elc-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border-radius:12px; border:1px solid ${border}; overflow:hidden`,
        children: el.items.map((item, i) => ({
          type: 'group', layout: 'horizontal',
          style: `padding:12px 16px; ${i < el.items.length-1 ? `border-bottom:1px solid ${border};` : ''} align-items:center; gap:12px`,
          children: [
            { type: 'text', text: item.day, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.1em; color:${accent}; font-weight:600; min-width:28px` },
            { type: 'group', style: 'flex:1',
              children: [
                { type: 'text', text: item.title, style: `font-family:${typo.body.family}; font-size:14px; color:${text}; font-weight:500; display:block; line-height:1.3` },
                { type: 'text', text: item.host, style: `font-family:${typo.body.family}; font-size:11px; color:${textMuted}` }
              ]
            },
            { type: 'text', text: item.tag, style: `font-family:${typo.label.family}; font-size:8px; letter-spacing:0.08em; color:${accent2}; background:rgba(107,91,62,0.08); padding:2px 6px; border-radius:10px` }
          ]
        }))
      };

    case 'page-header':
      return {
        type: 'group', id: `ph-${Math.random().toString(36).slice(2,7)}`,
        layout: 'horizontal',
        style: 'justify-content:space-between; align-items:flex-end; margin-bottom:14px',
        children: [
          { type: 'group', children: [
            { type: 'text', text: el.title, style: `${h}; font-size:26px; color:${text}; line-height:1` },
            { type: 'text', text: el.subtitle, style: `font-family:${typo.body.family}; font-size:12px; color:${textMuted}; margin-top:2px` }
          ]},
          { type: 'button', text: el.action, style: `font-family:${typo.label.family}; font-size:10px; letter-spacing:0.1em; color:${accent}; font-weight:600; padding:8px 12px; border:1px solid ${accent}; border-radius:8px` }
        ]
      };

    case 'filter-tabs':
      return {
        type: 'group', layout: 'horizontal',
        style: `gap:4px; margin-bottom:14px; background:${surface}; padding:4px; border-radius:10px; border:1px solid ${border}`,
        children: el.items.map((item, i) => ({
          type: 'text', text: item,
          style: `flex:1; text-align:center; font-family:${typo.label.family}; font-size:9px; letter-spacing:0.1em; padding:7px 4px; border-radius:7px; font-weight:600; ${i === 0 ? `background:${text}; color:${bg}` : `color:${textMuted}`}`
        }))
      };

    case 'editorial-event-card':
      return {
        type: 'group', id: `eec-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border-radius:14px; border:1px solid ${border}; padding:18px; margin-bottom:10px`,
        children: [
          { type: 'group', layout: 'horizontal', style: 'justify-content:space-between; margin-bottom:10px',
            children: [
              { type: 'text', text: `No. ${el.issue}`, style: `font-family:${typo.mono.family}; font-size:10px; color:${textMuted}` },
              { type: 'text', text: el.tag, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.1em; color:${accent}; background:${accentSoft}; padding:3px 8px; border-radius:20px` }
            ]
          },
          { type: 'text', text: el.title, style: `${h}; font-size:20px; color:${text}; line-height:1.2; margin-bottom:6px` },
          { type: 'text', text: el.description, style: `font-family:${typo.body.family}; font-size:12px; color:${textMuted}; line-height:1.5; margin-bottom:12px` },
          { type: 'group', layout: 'horizontal', style: `border-top:1px solid ${border}; padding-top:10px; justify-content:space-between`,
            children: [
              { type: 'group', children: [
                { type: 'text', text: el.date, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.08em; color:${accent}; display:block` },
                { type: 'text', text: `${el.time} · ${el.venue}`, style: `font-family:${typo.body.family}; font-size:11px; color:${textMuted}` }
              ]},
              { type: 'group', style: 'text-align:right', children: [
                { type: 'text', text: el.status, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.08em; color:${el.status === 'CONFIRMED' ? success : warn}; display:block` },
                { type: 'text', text: `${el.attendeeCount}/${el.capacity} attending`, style: `font-family:${typo.body.family}; font-size:11px; color:${textMuted}` }
              ]}
            ]
          }
        ]
      };

    case 'event-hero':
      return {
        type: 'group', id: `eh-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${text}; border-radius:16px; padding:20px; margin-bottom:14px`,
        children: [
          { type: 'group', layout: 'horizontal', style: 'justify-content:space-between; margin-bottom:14px',
            children: [
              { type: 'text', text: el.tag, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.1em; color:${accent}; background:${accentSoft}; padding:3px 8px; border-radius:20px` },
              { type: 'text', text: el.issue, style: `font-family:${typo.mono.family}; font-size:10px; color:rgba(248,245,239,0.4)` }
            ]
          },
          { type: 'text', text: el.title, style: `${h}; font-size:28px; color:#F8F5EF; line-height:1.1` }
        ]
      };

    case 'event-meta-row':
      return {
        type: 'group', id: `emr-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border-radius:12px; border:1px solid ${border}; padding:14px; margin-bottom:12px`,
        layout: 'horizontal',
        children: el.items.map((item, i) => ({
          type: 'group',
          style: `flex:1; ${i > 0 ? `border-left:1px solid ${border}; padding-left:12px;` : ''}`,
          children: [
            { type: 'text', text: item.label, style: `${t}; font-size:8px; display:block; margin-bottom:3px` },
            { type: 'text', text: item.value, style: `font-family:${typo.body.family}; font-size:12px; color:${text}; font-weight:500` }
          ]
        }))
      };

    case 'host-block':
      return {
        type: 'group', id: `hb-${Math.random().toString(36).slice(2,7)}`,
        layout: 'horizontal',
        style: `background:${surface}; border-radius:12px; border:1px solid ${border}; padding:14px; margin-bottom:10px; align-items:center; gap:12px`,
        children: [
          { type: 'text', text: el.initials, style: `width:40px; height:40px; border-radius:50%; background:${text}; color:${bg}; font-family:${typo.label.family}; font-size:12px; letter-spacing:0.08em; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0` },
          { type: 'group', style: 'flex:1',
            children: [
              { type: 'text', text: el.label, style: `${t}; font-size:8px; display:block; margin-bottom:2px` },
              { type: 'text', text: el.name, style: `font-family:${typo.body.family}; font-size:14px; color:${text}; font-weight:600; display:block` },
              { type: 'text', text: el.title, style: `font-family:${typo.body.family}; font-size:11px; color:${textMuted}` }
            ]
          }
        ]
      };

    case 'description-block':
      return {
        type: 'group', id: `db-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surfaceAlt}; border-radius:12px; padding:14px; margin-bottom:10px`,
        children: [
          { type: 'text', text: el.label, style: `${t}; font-size:8px; display:block; margin-bottom:6px` },
          { type: 'text', text: el.text, style: `font-family:${typo.body.family}; font-size:13px; color:${text}; line-height:1.55` }
        ]
      };

    case 'attendees-block':
      return {
        type: 'group', id: `ab-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border-radius:12px; border:1px solid ${border}; padding:14px; margin-bottom:12px`,
        children: [
          { type: 'group', layout: 'horizontal', style: 'justify-content:space-between; margin-bottom:10px',
            children: [
              { type: 'text', text: el.label, style: `${t}; font-size:8px` },
              { type: 'text', text: el.count, style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.08em; color:${accent}` }
            ]
          },
          { type: 'group', layout: 'horizontal', style: 'gap:-6px',
            children: el.members.map(m => ({
              type: 'text', text: m.initials,
              style: `width:32px; height:32px; border-radius:50%; background:${m.initials.startsWith('+') ? accent : text}; color:${bg}; font-family:${typo.label.family}; font-size:10px; letter-spacing:0.05em; font-weight:700; display:flex; align-items:center; justify-content:center; border:2px solid ${bg}; margin-left:-6px`
            }))
          }
        ]
      };

    case 'action-row':
      return {
        type: 'group', id: `ar-${Math.random().toString(36).slice(2,7)}`,
        children: [
          { type: 'button', text: el.primary.label,
            style: `width:100%; padding:14px; background:${el.primary.state === 'active' ? success : accent}; border-radius:12px; font-family:${typo.label.family}; font-size:11px; letter-spacing:0.12em; color:#FFF; font-weight:700; text-align:center; margin-bottom:8px` },
          { type: 'group', layout: 'horizontal', style: 'gap:8px',
            children: [
              { type: 'button', text: el.secondary.label,
                style: `flex:1; padding:11px; border:1px solid ${border}; border-radius:10px; font-family:${typo.label.family}; font-size:10px; letter-spacing:0.1em; color:${text}; text-align:center` },
              { type: 'button', text: el.tertiary.label,
                style: `flex:1; padding:11px; border:1px solid ${border}; border-radius:10px; font-family:${typo.label.family}; font-size:10px; letter-spacing:0.1em; color:${text}; text-align:center` }
            ]
          }
        ]
      };

    case 'search-bar':
      return {
        type: 'group', id: `sb-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border:1px solid ${border}; border-radius:10px; padding:11px 14px; margin-bottom:14px`,
        children: [
          { type: 'text', text: `🔍  ${el.placeholder}`, style: `font-family:${typo.label.family}; font-size:10px; letter-spacing:0.08em; color:${textMuted}` }
        ]
      };

    case 'member-list':
      return {
        type: 'group', id: `ml-${Math.random().toString(36).slice(2,7)}`,
        style: `background:${surface}; border-radius:12px; border:1px solid ${border}; overflow:hidden`,
        children: el.members.map((m, i) => ({
          type: 'group', layout: 'horizontal',
          style: `padding:12px 16px; ${i < el.members.length-1 ? `border-bottom:1px solid ${border};` : ''} align-items:center; gap:12px`,
          children: [
            { type: 'text', text: m.initials, style: `width:36px; height:36px; border-radius:50%; background:${m.badge === 'YOU' ? accent : text}; color:${bg}; font-family:${typo.label.family}; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0` },
            { type: 'group', style: 'flex:1',
              children: [
                { type: 'text', text: m.name, style: `font-family:${typo.body.family}; font-size:14px; color:${text}; font-weight:500; display:block` },
                { type: 'text', text: m.title, style: `font-family:${typo.body.family}; font-size:11px; color:${textMuted}` }
              ]
            },
            m.badge ? { type: 'text', text: m.badge, style: `font-family:${typo.label.family}; font-size:8px; letter-spacing:0.1em; color:${m.badge === 'YOU' ? accent : accent2}; background:${m.badge === 'YOU' ? accentSoft : 'rgba(107,91,62,0.08)'}; padding:2px 6px; border-radius:10px` }
                    : { type: 'text', text: `${m.shared} shared`, style: `font-family:${typo.label.family}; font-size:9px; color:${textMuted}; letter-spacing:0.06em` }
          ]
        }))
      };

    case 'tag-cloud':
      return {
        type: 'group', layout: 'horizontal',
        style: 'flex-wrap:wrap; gap:6px; margin-top:10px',
        children: el.items.map(item => ({
          type: 'text', text: item,
          style: `font-family:${typo.label.family}; font-size:9px; letter-spacing:0.1em; color:${accent2}; background:rgba(107,91,62,0.08); padding:5px 10px; border-radius:20px; border:1px solid rgba(107,91,62,0.15)`
        }))
      };

    case 'form-field':
      return {
        type: 'group', id: `ff-${Math.random().toString(36).slice(2,7)}`,
        style: 'margin-bottom:12px',
        children: [
          { type: 'text', text: el.label, style: `${t}; font-size:8px; display:block; margin-bottom:5px` },
          { type: 'group', style: `background:${surface}; border:1px solid ${border}; border-radius:10px; padding:12px 14px`,
            children: [
              { type: 'text', text: el.value || el.placeholder, style: `font-family:${typo.body.family}; font-size:14px; color:${el.value ? text : textMuted}` }
            ]
          }
        ]
      };

    case 'form-field-row':
      return {
        type: 'group', layout: 'horizontal',
        style: 'gap:8px; margin-bottom:12px',
        children: el.fields.map(f => ({
          type: 'group', style: 'flex:1',
          children: [
            { type: 'text', text: f.label, style: `${t}; font-size:8px; display:block; margin-bottom:5px` },
            { type: 'group', style: `background:${surface}; border:1px solid ${border}; border-radius:10px; padding:12px 14px`,
              children: [
                { type: 'text', text: f.value || f.placeholder, style: `font-family:${typo.body.family}; font-size:13px; color:${f.value ? text : textMuted}` }
              ]
            }
          ]
        }))
      };

    case 'form-textarea':
      return {
        type: 'group', id: `fta-${Math.random().toString(36).slice(2,7)}`,
        style: 'margin-bottom:14px',
        children: [
          { type: 'text', text: el.label, style: `${t}; font-size:8px; display:block; margin-bottom:5px` },
          { type: 'group', style: `background:${surface}; border:1px solid ${border}; border-radius:10px; padding:12px 14px; min-height:70px`,
            children: [
              { type: 'text', text: el.value || el.placeholder, style: `font-family:${typo.body.family}; font-size:13px; color:${el.value ? text : textMuted}; line-height:1.5` }
            ]
          }
        ]
      };

    case 'invite-picker':
      return {
        type: 'group', id: `ip-${Math.random().toString(36).slice(2,7)}`,
        style: 'margin-bottom:16px',
        children: [
          { type: 'group', layout: 'horizontal', style: 'flex-wrap:wrap; gap:6px',
            children: el.suggested.map(name => ({
              type: 'text', text: `${el.selected.includes(name) ? '✓ ' : ''}${name.split(' ')[0]}`,
              style: `font-family:${typo.label.family}; font-size:10px; letter-spacing:0.06em; padding:7px 12px; border-radius:20px; font-weight:${el.selected.includes(name) ? 600 : 400}; ${el.selected.includes(name) ? `background:${text}; color:${bg}` : `background:${surface}; color:${textMuted}; border:1px solid ${border}`}`
            }))
          }
        ]
      };

    case 'cta-button':
      return {
        type: 'button', text: el.label,
        style: `width:100%; padding:16px; background:${el.style === 'primary' ? accent : 'transparent'}; border-radius:12px; font-family:${typo.label.family}; font-size:11px; letter-spacing:0.12em; color:${el.style === 'primary' ? '#FFF' : accent}; font-weight:700; text-align:center; border:${el.style === 'primary' ? 'none' : `1px solid ${accent}`}`
      };

    default:
      return { type: 'text', text: `[${el.type}]`, style: `color:${textMuted}; font-size:11px` };
  }
}

// Build .pen JSON structure
const penData = {
  version: design.version,
  metadata: design.metadata,
  screens: design.screens.map(screen => ({
    id: screen.id,
    label: screen.label,
    icon: screen.icon,
    backgroundColor: design.theme.bg,
    elements: screen.elements.map(el => renderElement(el, design.theme, design.typography))
  })),
  navigation: {
    style: "tab-bar",
    backgroundColor: design.theme.surface,
    borderColor: design.theme.border,
    tintColor: design.theme.accent,
    items: design.nav
  },
  globalStyles: {
    fontFamily: design.typography.body.family,
    backgroundColor: design.theme.bg,
    textColor: design.theme.text,
    accentColor: design.theme.accent,
    borderRadius: "12px",
    padding: "16px"
  }
};

const outPath = '/workspace/group/design-studio/quorum.pen';
fs.writeFileSync(outPath, JSON.stringify(penData, null, 2));
console.log('✓ quorum.pen written:', outPath);
console.log('  Screens:', design.screens.length);
console.log('  Theme: light / warm parchment #F8F5EF');
console.log('  Accent: deep amber #B8820F');
