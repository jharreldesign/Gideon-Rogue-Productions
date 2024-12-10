# Gideon-Rogue-Productions

![Gideon Rogue Productions logo](public/images/Logo.png)

Welcome to **Gideon Rogue Productions** — a premier venue production company managing multiple venues across the city. We specialize in organizing and hosting events, bringing top-tier bands and artists to our stages, and ensuring smooth operations at every event. 

This README provides an overview of how we manage our venues, staff, and events. Below, you’ll find details about our system setup, database schema, and website wireframe.

## System Overview

At Gideon Rogue Productions, we leverage a custom-built system that manages key aspects of our venue operations, including:

- **Venues**: Information on all the venues we manage, including location, capacity, and event scheduling.
- **Staff**: Our team members and their roles in each venue.
- **Bands & Artists**: The bands and artists performing at our venues, their schedules, and ticketing information.
- **Event Management**: Handling ticket sales, show details, and other logistical items.

## Database Schema

![Database ERD](public/images/GRP-ERD.png)

Our system is powered by a robust relational database, and the ERD (Entity Relationship Diagram) above illustrates the connections between various tables used in our system. Key relationships include:

- **Venues** to **Shows** and **Bands**: Venues are associated with events that feature specific bands and artists.
- **Staff Assignments**: Employees are assigned to various tasks at each venue, ensuring smooth event operations.

## Website Wireframe

![Wireframe](public/images/GRP-Website-Wireframe.drawio.png)

Here is a wireframe that outlines the layout of our website. It consists of two key sections:

1. **Customer-facing Website**:
   - A modern, clean design allowing customers to browse upcoming events, view details, and purchase tickets.
   - Includes a filter dropdown for sorting events by date, genre, and venue.
   - Each event shows an image, the show title, venue name, event date and time, ticket info, and a call-to-action button for buying tickets or viewing more details.

2. **Admin Dashboard**:
   - A backend interface where our staff can manage venue information, shows, ticket sales, and artist bookings.
   - Admins can update event details, assign staff to shifts, and generate reports for the shows.

## Features

- **Event Management**: Add, edit, and schedule events for different venues.
- **User Management**: Admin tools for managing staff and their roles.
- **Responsive Design**: The site adjusts for desktop and mobile users for both customer-facing pages and admin dashboards.


## Stretch Goals
- **Ticketing System**: Integration with a ticketing platform to handle sales and provide event access.
- **Venue Billing System**: The company will implement a billing system that will keep track of the invoices that come through the production of each show.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
