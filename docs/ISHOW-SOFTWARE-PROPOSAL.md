# iShow Software Proposal

**Prepared on:** 2026-04-23  
**Project Type:** Web-based fitness management platform  
**Estimated Delivery Window:** 3 to 4 weeks  
**Estimated Build Effort:** 40 hours

---

## 1. Project Overview

This proposal covers the design, development, setup, and launch support for the **iShow** software platform.

The platform is planned as a modern web application for:

- Customers
- Trainers
- Admin/management team

The goal is to provide a complete system for onboarding clients, managing assessments, assigning training plans, scheduling sessions, tracking payments, and handling communication through one centralized dashboard.

---

## 2. Project Scope

The proposed software includes the following core modules and features.

### A. Public Website

- Home page / landing page
- About page
- Services page
- Contact page
- Lead/contact enquiry form

### B. User Authentication

- User registration
- Secure login/logout
- Forgot password flow
- Reset password flow
- Role-based access control
- Separate access for customer, trainer, and admin users

### C. Customer Panel

- Customer dashboard
- Assessment submission form
- View assigned plan
- View training programs
- View session schedule
- View payment history
- Profile management
- Progress tracking
- Notifications and email updates

### D. Trainer Panel

- Trainer dashboard
- Client listing and profile view
- Session management
- Program management
- Payment visibility
- Settings/profile page

### E. Admin Panel

- Admin dashboard
- Lead management
- Assessment review and conversion workflow
- Client management
- Trainer management
- Master data management
- Payment management
- Reports and analytics
- CMS/content controls

### F. System Integrations

- Supabase database and authentication setup
- Email sending integration with Resend
- Domain connection and deployment setup
- Form notifications and transactional email workflow

---

## 3. Services Included

The following services are included in the proposed work:

- Project planning and scope breakdown
- UI implementation for required screens
- Frontend development
- Backend/API integration
- Supabase database configuration
- Authentication and role permissions setup
- Email workflow setup
- Admin, trainer, and customer dashboard setup
- Core testing and bug fixing
- Deployment and launch assistance
- 1 year support and maintenance

---

## 4. Detailed Feature List

### Customer Features

- Sign up and login
- Submit fitness assessment
- View dashboard summary
- View personal training plan
- View workout programs
- View upcoming and completed sessions
- View payment history
- Update personal profile
- Track progress updates
- Receive email notifications

### Trainer Features

- Login to trainer dashboard
- View assigned clients
- Review client details
- Manage sessions
- Manage workout programs
- Track client payment status
- Update trainer profile/settings
- View training activity and daily workflow

### Admin Features

- Full admin dashboard access
- Manage enquiries/leads
- Review and approve assessments
- Convert leads into active clients
- Assign trainers
- Manage trainers and clients
- Manage exercises, locations, goals, and plan templates
- Manage payments and reporting
- Manage website content/CMS areas

### Operations and Platform Features

- Role-based permissions
- Secure same-origin APIs
- Email integration
- Notifications workflow
- Dashboard reporting
- Responsive design for desktop and mobile
- Deployment-ready production configuration

---

## 5. Delivery Timeline

Total estimated implementation effort is **40 hours** across **3 to 4 weeks**.

### Week 1 - Planning, Setup, and Core Foundation (10 hours)

- Finalize scope and workflow mapping
- Confirm pages and required modules
- Configure project baseline
- Connect Supabase environment
- Configure authentication and permissions
- Prepare initial dashboard/application structure

### Week 2 - Core Module Development (12 hours)

- Build customer-side features
- Build trainer-side features
- Build admin-side management flows
- Connect database-driven forms and records

### Week 3 - Integrations, Payments, and QA (10 hours)

- Complete email workflow integration
- Connect payment-related features
- Validate role-based flows
- Perform functional testing
- Fix bugs and polish user experience

### Week 4 - Launch and Final Adjustments (8 hours)

- Deployment setup
- Domain connection
- Final system checks
- Client review updates
- Support readiness

---

## 6. Commercial Summary

- Estimated total effort: **40 hours**
- Delivery window: **3 to 4 weeks**
- Development billing: **40 hours x hourly rate**
- Third-party subscriptions and platform charges are **not included** in the development fee unless specifically agreed

---

## 7. Third-Party Costs / Extras

These items are billed separately from development work.

### A. Supabase

**Recommended for production:** Supabase Pro

| Item | Plan | Estimated Cost | Notes |
|---|---|---:|---|
| Supabase | Free | $0/month | Good for testing, demo, or early-stage trial use |
| Supabase | Pro | $25/month baseline | Recommended for live production use |

**Notes:**

- Supabase Pro has a $25/month subscription fee.
- Supabase documentation also shows Pro organizations receive **$10 compute credits**, which cover one default-size project in their billing examples.
- For a typical single-project production setup, the baseline usually works out to about **$25/month before overages**, assuming the default included compute pattern.
- Overage charges may apply depending on usage such as storage, active users, realtime, egress, and extra compute.

### B. Domain

| Item | Estimated Cost | Notes |
|---|---:|---|
| Domain registration/renewal | Approx. $10 to $20/year | Depends on TLD and registrar |

**Notes:**

- Domain price depends on the final domain name and extension such as `.com`, `.ae`, `.fitness`, etc.
- Cloudflare Registrar advertises **at-cost registration and renewal with no markup**, so the final cost depends on registry pricing.

### C. Business Email Accounts

| Item | Estimated Cost | Notes |
|---|---:|---|
| Business email inboxes | From $7/user/month | Example: Google Workspace Business Starter standard pricing |

**Notes:**

- Business email is separate from transactional email sending.
- Final email cost depends on the provider and number of inboxes needed, such as `info@yourdomain.com`, `support@yourdomain.com`, or staff mailboxes.

### D. Resend Transactional Email

| Item | Plan | Estimated Cost | Notes |
|---|---|---:|---|
| Resend | Free | $0/month | Up to 3,000 emails/month, 100 emails/day, 1 domain |
| Resend | Pro | $20/month | Up to 50,000 emails/month, no daily limit, 10 domains |

**Notes:**

- Resend Pro overage pricing is listed at **$0.90 per 1,000 extra emails**.
- Free plan is suitable for light usage or early launch.
- Pro plan is recommended when sending regular assessments, notifications, reminders, and system emails at scale.

---

## 8. Support and Maintenance

This proposal includes **1 year support and maintenance** after launch.

Support and maintenance includes:

- Bug fixes related to delivered features
- Small technical adjustments
- Basic uptime/deployment assistance
- Dependency and routine maintenance checks
- Email/configuration support
- Minor content/text update assistance

Support and maintenance does **not** include:

- New feature development
- Major UI redesign
- New integrations not listed in this scope
- Additional dashboards/modules
- Third-party subscription fees
- High-volume data migration or restructuring

---

## 9. Add-On Features

Any extra add-on feature or new requirement requested after scope confirmation will be:

- scoped separately
- estimated separately
- invoiced separately
- billed based on actual work hours

Examples of add-ons:

- extra reports
- custom payment gateway integration
- WhatsApp integration
- advanced analytics
- automation workflows
- multilingual support
- mobile app extension

---

## 10. Recommended Setup

For a practical launch setup, the recommended stack is:

- **Supabase Pro** for production database/auth hosting
- **Resend Free** for low initial email volume, or **Resend Pro** if regular transactional volume is expected
- **1 custom domain**
- **Business email inboxes** for brand communication

---

## 11. Closing Note

This proposal is intended to provide a clear implementation scope, delivery timeline, and cost structure for the iShow platform.

The final commercial amount for development should be calculated from the estimated **40 hours**, while platform subscriptions and add-ons remain separate.
