# Backend Structure Document

This document outlines the backend architecture for our interactive speech improvement web application, designed specifically for children aged 8-13. It details the overall architecture, database management, APIs, hosting, infrastructure, and all supporting components to ensure scalability, maintainability, performance, and a secure user experience.

## 1. Backend Architecture

Our backend is designed using a modular and cloud-friendly architecture that integrates several managed services. Key characteristics include:

*   **Modular Design:** We use distinct services for managing data, user authentication, and AI integrations to ensure easy maintenance and scalability.
*   **Service-Oriented Approach:** The backend leverages cloud databases (Supabase), managed authentication (Clerk Auth), and external APIs (Google Cloud for TTS and ASR), communicating with the frontend via well-defined RESTful endpoints.
*   **Real-Time Performance:** Real-time updates and feedback are provided using Supabase's capabilities, ensuring minimal latency essential for interactive exercises.
*   **Scalability and Maintainability:** By relying on cloud-based services, we can easily adjust resources in response to growing user needs while keeping the codebase modular and clean for future upgrades.
*   **Design Patterns and Frameworks:** A combination of serverless practices and microservice integration techniques support flexibility. The use of standardized communication patterns ensures consistency across various services.

## 2. Database Management

Database management is a key aspect of the application. We rely on Supabase, a cloud-based database service that uses PostgreSQL. Benefits include:

*   **Database Type:** SQL (PostgreSQL) with real-time data push capabilities.
*   **Managed Service:** Supabase provides horizontal scalability, backup routines, and efficient data querying.
*   **Data Storage:** All user information, progress tracking, exercise records, and game scores are stored in structured tables. Audio data (speech recordings) are stored either as file links on cloud storage or directly in the database with proper identifiers.
*   **Real-Time Updates:** Supabase’s real-time engine allows immediate feedback in the application, crucial for interactive features.

## 3. Database Schema

Below is a human-readable description of our SQL database schema, followed by a sample SQL representation.

### Human-Readable Format:

*   **Users Table:** Contains basic user profile data such as user ID, name, email, registration date, and anonymized tokens for audio recordings.
*   **User Progress Table:** Tracks the progress map for each user with levels unlocked, badges earned, and other milestones.
*   **Speech Exercises Table:** Holds information on various speech exercises including exercise ID, title, description, and associated metadata (such as target sounds).
*   **Game Sessions Table:** Stores records of game sessions, scores, and details of the interactive games played by the user.
*   **Audio Recordings Table:** Keeps metadata for each recording such as the file path, timestamp, and any pre-processed phonetic analysis data. Audio files themselves are stored in a secure cloud storage bucket.

### Sample SQL Schema (PostgreSQL):

/* CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(100), email VARCHAR(150) UNIQUE NOT NULL, registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, anonymized_id VARCHAR(100) );

CREATE TABLE user_progress ( id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), level_unlocked INT, badges JSONB, progress_map JSONB, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

CREATE TABLE speech_exercises ( id SERIAL PRIMARY KEY, title VARCHAR(150), description TEXT, target_sound VARCHAR(10), metadata JSONB );

CREATE TABLE game_sessions ( id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), game_type VARCHAR(50), score INT, session_details JSONB, played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );

CREATE TABLE audio_recordings ( id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id), file_path TEXT, recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, phonetic_analysis JSONB ); */

## 4. API Design and Endpoints

We implement RESTful APIs to enable communication between the frontend and backend. The APIs are documented and versioned to ensure clarity and consistency.

*   **Authentication & User Management:**

    *   Endpoint for registration and login using Clerk Auth.
    *   Endpoints to manage user profiles and update anonymized tokens.

*   **Speech Exercises API:**

    *   Endpoints to fetch and update guided exercises such as "Repeat After Me" and word/sound challenges.
    *   APIs to send real-time feedback data based on the user's performance.

*   **Game Sessions API:**

    *   Endpoints to start, update, and end game sessions.
    *   Record scores and progress in interactive games like Speech Quest Adventure.

*   **Audio Recording API:**

    *   Endpoints to record, store, and retrieve audio data.
    *   Integration with Google Cloud Speech-to-Text for transcription and TTS for speech synthesis.

*   **Progress Tracking API:**

    *   Endpoints that log user progress, update the progress map, and reward achievements such as badges and points.

## 5. Hosting Solutions

Our backend is hosted using robust cloud services to ensure reliability and scalability:

*   **Primary Hosting Environments:**

    *   **Supabase:** Hosts the PostgreSQL database and provides real-time data capabilities.
    *   **Clerk Auth:** Managed authentication service integrated for secure login sessions.
    *   **Google Cloud:** Provides text-to-speech and speech-to-text services with a focus on the Australian accent.

*   **Benefits:**

    *   High reliability and uptime with automatic scaling based on traffic.
    *   Cost-effective solutions that allow dynamic resource allocation without sacrificing performance.
    *   Managed services reduce maintenance overhead and improve security compliance.

## 6. Infrastructure Components

Several infrastructure components are in place to enhance overall performance and user experience:

*   **Load Balancers:** Distribute incoming traffic effectively across servers to prevent bottlenecks.
*   **Caching Mechanisms:** Temporary data storage using edge caching to reduce database query load and lower latency. While not explicitly mentioned, a CDN like Cloudflare can be used to cache static content.
*   **Content Delivery Networks (CDNs):** Improve data delivery speed for static assets and media files.
*   **Monitoring Tools:** Integrated logging and performance monitoring in Supabase and cloud provider dashboards (Google Cloud) to anticipate issues before they escalate.

## 7. Security Measures

Security is a top priority, especially given the sensitive nature of working with minors:

*   **Authentication & Authorization:**

    *   Clerk Auth handles user authentication with secure session management.
    *   No role-based access is implemented since all users have similar access rights.

*   **Data Encryption:**

    *   All data in transit is encrypted using HTTPS and TLS protocols.
    *   Sensitive user information and audio recordings are stored in encrypted formats.

*   **Compliance:**

    *   Ensures adherence to GDPR, COPPA, and other regional data protection standards.
    *   Audio recordings are anonymized and securely stored to protect user privacy.

*   **Secure API Communications:**

    *   Use of API keys and tokens for Google Cloud services (TTS and ASR), along with rate limiting to prevent abuse.

## 8. Monitoring and Maintenance

Regular maintenance and monitoring are vital to ensure our backend remains robust and responsive:

*   **Monitoring Tools:**

    *   Supabase dashboard and logging services monitor database performance.
    *   Cloud provider tools (Google Cloud Console) track API usage and system performance.
    *   Additional third-party monitoring services can be integrated if needed.

*   **Maintenance Strategies:**

    *   Scheduled routine backups of the database.
    *   Periodic security audits and compliance checks.
    *   Continuous integration/continuous deployment (CI/CD) pipelines ensure the system is always up-to-date with the latest fixes and improvements.

## 9. Conclusion and Overall Backend Summary

In conclusion, the backend of our interactive speech application is carefully constructed to support a highly engaging, real-time environment tailored for children. Key points include:

*   A modular and scalable architecture combining managed cloud services such as Supabase, Clerk Auth, and Google Cloud APIs.
*   Robust database management with PostgreSQL, designed for real-time updates and data security.
*   A well-structured RESTful API facilitating clear communication between the frontend and backend.
*   Flexible hosting solutions offering excellent reliability, scalability, and performance.
*   Comprehensive security measures ensuring user privacy and compliance with relevant regulations.
*   Continuous monitoring and maintenance practices that ensure longevity and effectiveness of the backend.

This comprehensive backend structure not only supports the app’s interactive and performance-intensive nature but also ensures that user data is managed safely and efficiently, ultimately providing a seamless and secure experience for its young users.
