flowchart TD
    A[Landing Page]
    B[User Sign-Up]
    C[User Dashboard]
    D[Avatar Customization]
    E[Progress Map]
    F[Real-Time Updates]
    G[Guided Speech Exercises]
    H[Speech Recording]
    I[Interactive Games]
    J[Reward System]
    K[Google Cloud TTS]
    L[Google Cloud ASR]
    M[Phonetic Analysis]
    N[Supabase Backend]
    O[Clerk Authentication]
    P[Responsive Mobile-First Design]
    Q[Optimized Performance]

    A --> B
    B --> C
    B --> O
    O --> N

    C --> D
    C --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J
    C --> P

    G --> K
    G --> L
    G --> M

    F --> K
    F --> L

    I --> Q