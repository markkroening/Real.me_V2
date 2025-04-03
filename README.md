# Real.me

## Project Vision

Real.me aims to be a social media platform, similar in structure to Reddit, with a core focus on **authentic human interaction**. In an online world increasingly populated by bots and AI-generated content, Real.me provides a space where users can be confident they are interacting with verified real people.

## Core Features (Planned)

* **Human Verification:** Mandatory verification process to ensure users are real humans before they can create posts, comments, or communities.
* **Community Creation:** Users can create topic-based communities.
* **Moderation:** Community creators (owners) can appoint moderators with powers to remove content.
* **Democratic Ownership:** Mechanisms for community members to vote on replacing the community owner (except for specific types).
* **Authoritarian Communities (Paid):** Businesses or individuals can opt for a paid subscription model for their community, removing the threat of being voted out as owner.
* **Personal Pages:** Every verified user owns their personal "authoritarian" community page.

## Tech Stack

* **Frontend:** Next.js, TypeScript, React, Tailwind CSS (or chosen styling)
* **Backend API:** Fastify, TypeScript, Node.js
* **Database & Auth:** Supabase
* **Validation:** Zod
* **Development Environment:** VS Code, Git

## Project Structure

This repository follows a monorepo-like structure containing the two main parts of the application:

* `/frontend`: Contains the Next.js web application (UI).
* `/backend`: Contains the Fastify API server handling business logic and data interaction via Supabase.

## Getting Started (Development)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js (Latest LTS version recommended)
* npm (or yarn/pnpm)
* Git
* Supabase Account & Project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/markkroening/Real.me_V2.git](https://github.com/markkroening/Real.me_V2.git)
    cd Real.me_V2
    ```
2.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```
3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    cd ..
    ```

### Environment Variables

You will need to set up environment variables for both the frontend and backend.

1.  **Backend:** Create a file named `.env` in the `/backend` directory (`backend/.env`). Add the following variables (get values from your Supabase project settings):
    ```env
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    # Add any other backend-specific variables (e.g., PORT)
    ```
2.  **Frontend:** Create a file named `.env.local` in the `/frontend` directory (`frontend/.env.local`). Add the following variables (get values from your Supabase project settings):
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    # Add any other frontend-specific variables
    ```
    **Important:** Never commit `.env` or `.env.local` files to Git. The `.gitignore` files should prevent this.

### Running the Development Servers

You need to run both the frontend and backend servers simultaneously.

1.  **Run Backend Server:**
    * Open a terminal in the `/backend` directory.
    * Run: `npm run dev`
    * The Fastify API server should start (check terminal for the port, usually 3000 or specified in code/env).

2.  **Run Frontend Server:**
    * Open a *separate* terminal in the `/frontend` directory.
    * Run: `npm run dev`
    * The Next.js development server should start (usually on port 3000 - **Note:** If the backend also defaults to 3000, you'll need to configure one of them to use a different port, e.g., backend on 3001).

## Contributing

*(Placeholder)*

## License

*(Placeholder)*
